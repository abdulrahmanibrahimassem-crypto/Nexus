import { 
  SpotifyLivePlayback, 
  SpotifyUserProfile, 
  SpotifyTrack, 
  SpotifyDevice,
  OAuthLogEntry, 
  OAuthStage, 
  SpotifyTokenExpirationInfo 
} from '../types';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: any;
  }
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'aesthetic_study_spotify_access_token',
  REFRESH_TOKEN: 'aesthetic_study_spotify_refresh_token',
  EXPIRES_AT: 'aesthetic_study_spotify_expires_at',
  USER_PROFILE: 'aesthetic_study_spotify_user_profile',
  CUSTOM_CLIENT_ID: 'aesthetic_study_spotify_custom_client_id',
  AUTO_SYNC: 'aesthetic_study_spotify_auto_sync_enabled',
  DEBUG_LOGS: 'aesthetic_study_spotify_debug_logs',
  CODE_VERIFIER: 'aesthetic_study_spotify_code_verifier',
};

// ==================== PKCE Helper Functions ====================
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values).reduce((acc, x) => acc + possible[x % possible.length], '');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64UrlEncode(input: ArrayBuffer): string {
  const bytes = new Uint8Array(input);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const hashed = await sha256(codeVerifier);
  return base64UrlEncode(hashed);
}

export interface SpotifyTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  expiresAt: number;
}

class SpotifyAuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number = 0;
  private userProfile: SpotifyUserProfile | null = null;
  private logs: OAuthLogEntry[] = [];
  private listeners: Set<(state: { isConnected: boolean; user: SpotifyUserProfile | null }) => void> = new Set();
  private playbackListeners: Set<(playback: SpotifyLivePlayback | null) => void> = new Set();
  private logListeners: Set<(logs: OAuthLogEntry[]) => void> = new Set();
  private deviceListeners: Set<(devices: SpotifyDevice[]) => void> = new Set();
  private pollingIntervalId: any = null;
  private devicePollingIntervalId: any = null;
  private lastLivePlayback: SpotifyLivePlayback | null = null;
  private webPlayer: any = null;
  private webDeviceId: string | null = null;
  private cachedDevices: SpotifyDevice[] = [];

  constructor() {
    this.loadPersistedLogs();
    this.loadPersistedTokens();
    this.addLog('info', 'INIT', 'Spotify Auth Service initialized', {
      hasStoredToken: !!this.accessToken,
      hasRefreshToken: !!this.refreshToken,
      expiresAt: this.expiresAt ? new Date(this.expiresAt).toISOString() : null,
      isConnected: this.isConnected(),
    });

    if (this.isConnected()) {
      setTimeout(() => {
        this.initWebPlaybackSDK();
        this.startPlaybackPolling(1800);
      }, 500);
    }
    this.setupWindowListeners();
  }

  private setupWindowListeners() {
    if (typeof window === 'undefined') return;
    window.addEventListener('focus', () => {
      if (this.isConnected()) {
        this.fetchLivePlayback();
        this.fetchDevices();
      }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isConnected()) {
        this.fetchLivePlayback();
        this.fetchDevices();
      }
    });
  }

  private loadPersistedLogs() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEBUG_LOGS);
      if (saved) {
        this.logs = JSON.parse(saved);
      }
    } catch {
      this.logs = [];
    }
  }

  private loadPersistedTokens() {
    try {
      this.accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      this.refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const exp = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
      this.expiresAt = exp ? parseInt(exp, 10) : 0;
      const profile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      this.userProfile = profile ? JSON.parse(profile) : null;
    } catch (e) {
      console.warn('Could not load Spotify tokens from storage:', e);
    }
  }

  // ==================== Logging & Diagnostics ====================

  public addLog(
    type: 'info' | 'success' | 'warn' | 'error' | 'step',
    stage: OAuthStage,
    message: string,
    details?: any
  ) {
    const entry: OAuthLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      timeStr: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      stage,
      message,
      details: details ? (typeof details === 'object' ? JSON.parse(JSON.stringify(details)) : String(details)) : null,
    };

    this.logs.unshift(entry);
    if (this.logs.length > 150) {
      this.logs = this.logs.slice(0, 150);
    }

    try {
      localStorage.setItem(STORAGE_KEYS.DEBUG_LOGS, JSON.stringify(this.logs.slice(0, 50)));
    } catch {}

    this.logListeners.forEach((l) => l([...this.logs]));
  }

  public getLogs(): OAuthLogEntry[] {
    return [...this.logs];
  }

  public subscribeLogs(listener: (logs: OAuthLogEntry[]) => void) {
    this.logListeners.add(listener);
    listener([...this.logs]);
    return () => this.logListeners.delete(listener);
  }

  public clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem(STORAGE_KEYS.DEBUG_LOGS);
    } catch {}
    this.addLog('info', 'INIT', 'Diagnostic logs cleared by user');
  }

  public getTokenExpirationInfo(): SpotifyTokenExpirationInfo {
    if (!this.accessToken || !this.expiresAt) {
      return {
        expiresAt: 0,
        timeRemainingMs: 0,
        isExpired: true,
        isExpiringSoon: false,
        formattedExpiresAt: 'No active token',
        formattedRemaining: 'Not authenticated',
        status: 'MISSING',
        hasRefreshToken: !!this.refreshToken,
      };
    }

    const now = Date.now();
    const remainingMs = this.expiresAt - now;
    const isExpired = remainingMs <= 0;
    const isExpiringSoon = remainingMs > 0 && remainingMs < 5 * 60 * 1000; // less than 5 min

    let status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'MISSING' = 'VALID';
    if (isExpired) {
      status = 'EXPIRED';
    } else if (isExpiringSoon) {
      status = 'EXPIRING_SOON';
    }

    // Format remaining time
    let formattedRemaining = '';
    if (isExpired) {
      const agoSec = Math.floor(Math.abs(remainingMs) / 1000);
      const agoMin = Math.floor(agoSec / 60);
      formattedRemaining = agoMin > 0 ? `Expired ${agoMin}m ago` : `Expired ${agoSec}s ago`;
    } else {
      const remSec = Math.floor(remainingMs / 1000);
      const remMin = Math.floor(remSec / 60);
      const remSecOnly = remSec % 60;
      formattedRemaining = remMin > 0 ? `${remMin}m ${remSecOnly}s remaining` : `${remSecOnly}s remaining`;
    }

    return {
      expiresAt: this.expiresAt,
      timeRemainingMs: remainingMs,
      isExpired,
      isExpiringSoon,
      formattedExpiresAt: new Date(this.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      formattedRemaining,
      status,
      hasRefreshToken: !!this.refreshToken,
    };
  }

  // ==================== Status & Subscriptions ====================

  public isConnected(): boolean {
    return !!this.accessToken && Date.now() < this.expiresAt + 60000;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public getUserProfile(): SpotifyUserProfile | null {
    return this.userProfile;
  }

  public getLastLivePlayback(): SpotifyLivePlayback | null {
    return this.lastLivePlayback;
  }

  public subscribe(listener: (state: { isConnected: boolean; user: SpotifyUserProfile | null }) => void) {
    this.listeners.add(listener);
    listener({ isConnected: this.isConnected(), user: this.userProfile });
    return () => this.listeners.delete(listener);
  }

  public subscribePlayback(listener: (playback: SpotifyLivePlayback | null) => void) {
    this.playbackListeners.add(listener);
    if (this.lastLivePlayback) {
      listener(this.lastLivePlayback);
    }
    return () => this.playbackListeners.delete(listener);
  }

  private notify() {
    const isConn = this.isConnected();
    this.listeners.forEach((l) => l({ isConnected: isConn, user: this.userProfile }));
  }

  private notifyPlayback(playback: SpotifyLivePlayback | null) {
    this.lastLivePlayback = playback;
    this.playbackListeners.forEach((l) => l(playback));
  }

  public setTokens(tokens: { access_token: string; refresh_token?: string; expires_in?: number }) {
    const expiresIn = tokens.expires_in || 3600;
    this.accessToken = tokens.access_token;
    if (tokens.refresh_token) {
      this.refreshToken = tokens.refresh_token;
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
    }
    this.expiresAt = Date.now() + expiresIn * 1000;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, String(this.expiresAt));

    this.addLog('success', 'TOKEN_EXCHANGE', `Spotify Access Token stored successfully (Valid for ${expiresIn}s / ${Math.round(expiresIn / 60)} minutes)`, {
      expiresAt: new Date(this.expiresAt).toISOString(),
      hasRefreshToken: !!this.refreshToken,
      tokenPrefix: `${tokens.access_token.substring(0, 8)}...`,
    });

    this.fetchUserProfile().then(() => {
      this.notify();
      this.startPlaybackPolling();
    });
  }

  public async fetchUserProfile(): Promise<SpotifyUserProfile | null> {
    if (!this.accessToken) {
      this.addLog('warn', 'PROFILE', 'Cannot fetch user profile: No access token available');
      return null;
    }

    this.addLog('step', 'PROFILE', 'Fetching Spotify User Profile (/api/spotify/me)...');

    try {
      const res = await fetch('/api/spotify/me', {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });

      if (!res.ok) {
        this.addLog('warn', 'PROFILE', `Profile fetch returned HTTP ${res.status} ${res.statusText}`, {
          status: res.status,
        });

        if (res.status === 401) {
          this.addLog('warn', 'REFRESH', 'Access token rejected with 401 Unauthorized. Attempting automatic refresh...');
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            return this.fetchUserProfile();
          }
        }
        return null;
      }

      const data = await res.json();
      const profile: SpotifyUserProfile = {
        id: data.id,
        displayName: data.display_name || 'Spotify Listener',
        email: data.email,
        product: data.product,
        imageUrl: data.images && data.images.length > 0 ? data.images[0].url : undefined,
        country: data.country,
        followersCount: data.followers?.total,
      };

      this.userProfile = profile;
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      this.addLog('success', 'PROFILE', `Connected as ${profile.displayName} (${profile.product?.toUpperCase() || 'FREE'} Account, ${profile.country || 'Global'})`, {
        userId: profile.id,
        displayName: profile.displayName,
        product: profile.product,
        email: profile.email,
      });

      this.notify();
      return profile;
    } catch (err: any) {
      this.addLog('error', 'PROFILE', `Error fetching Spotify user profile: ${err.message}`, { error: err.message });
      console.warn('Error fetching Spotify user profile:', err);
      return null;
    }
  }

  public async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      this.addLog('warn', 'REFRESH', 'Token refresh aborted: No refresh token stored in session');
      this.disconnect();
      return false;
    }

    this.addLog('step', 'REFRESH', 'Attempting Spotify Token Refresh with stored refresh token...');

    try {
      const customClientId = localStorage.getItem(STORAGE_KEYS.CUSTOM_CLIENT_ID);
      const res = await fetch('/api/spotify/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: this.refreshToken,
          clientId: customClientId || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        this.addLog('error', 'REFRESH', `Spotify Token Refresh failed (HTTP ${res.status}): ${errData.error_description || errData.error || 'Invalid refresh token'}`, {
          status: res.status,
          response: errData,
        });
        this.disconnect();
        return false;
      }

      const data = await res.json();
      this.addLog('success', 'REFRESH', 'Spotify Access Token successfully refreshed!');
      this.setTokens(data);
      return true;
    } catch (err: any) {
      this.addLog('error', 'REFRESH', `Token refresh network error: ${err.message}`, { error: err.message });
      console.error('Failed to refresh Spotify token:', err);
      this.disconnect();
      return false;
    }
  }

  /**
   * Connects via direct OAuth Popup to Spotify accounts authorization page
   */
  public async connectWithPopup(customClientId?: string): Promise<{ success: boolean; user?: SpotifyUserProfile; error?: string }> {
    this.addLog('step', 'INIT', '=== Starting Spotify OAuth Connection Flow ===');

    if (customClientId) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_CLIENT_ID, customClientId.trim());
      this.addLog('info', 'CONFIG', `Using custom Spotify Client ID: ${customClientId.substring(0, 6)}...`);
    }

    const savedClientId = customClientId || localStorage.getItem(STORAGE_KEYS.CUSTOM_CLIENT_ID) || '';

    // 1. Generate PKCE code verifier and code challenge
    const codeVerifier = generateRandomString(64);
    sessionStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, codeVerifier);
    localStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, codeVerifier);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // 2. Fetch Auth URL from server
    let authUrl = '';
    let redirectUri = `${window.location.origin}/auth/callback`;

    this.addLog('step', 'AUTH_URL', `Requesting Spotify authorization URL with PKCE and redirect URI: ${redirectUri}`);

    try {
      const res = await fetch(
        `/api/spotify/auth-url?clientId=${encodeURIComponent(savedClientId)}&code_challenge=${encodeURIComponent(
          codeChallenge
        )}&code_challenge_method=S256`
      );
      const data = await res.json();
      
      this.addLog('info', 'AUTH_URL', `Server Auth URL response received (Configured: ${data.configured})`, {
        configured: data.configured,
        redirectUri: data.redirectUri || redirectUri,
        scopesCount: data.scopes ? data.scopes.split(' ').length : 0,
      });

      if (data.url) {
        authUrl = data.url;
        if (data.redirectUri) redirectUri = data.redirectUri;
      } else {
        // Build client-side fallback authorization URL with PKCE
        const cId = savedClientId || 'your_spotify_client_id_here';
        const scopes = encodeURIComponent(
          'user-read-currently-playing user-read-playback-state user-modify-playback-state user-read-recently-played user-read-playback-position user-read-email user-read-private playlist-read-private playlist-read-collaborative streaming'
        );
        authUrl = `https://accounts.spotify.com/authorize?client_id=${cId}&response_type=code&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&scope=${scopes}&show_dialog=true&code_challenge=${encodeURIComponent(
          codeChallenge
        )}&code_challenge_method=S256`;
        
        this.addLog('warn', 'AUTH_URL', 'Using fallback client-side authorization URL construction with PKCE', {
          clientIdSet: !!savedClientId,
          redirectUri,
        });
      }
    } catch (err: any) {
      this.addLog('error', 'AUTH_URL', `Failed to fetch auth URL: ${err.message}`, { error: err.message });
      console.error('Error fetching auth URL:', err);
    }

    if (!authUrl) {
      const errMsg = 'Could not construct Spotify authorization URL. Check SPOTIFY_CLIENT_ID or provide a Client ID.';
      this.addLog('error', 'CONFIG', errMsg);
      return { success: false, error: errMsg };
    }

    // 2. Open popup directly to Spotify (as required by preview iframe guidelines)
    const popupWidth = 540;
    const popupHeight = 700;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;

    this.addLog('step', 'POPUP', 'Opening Spotify Authorization Popup window...', {
      targetUrl: authUrl.substring(0, 80) + '...',
      dimensions: `${popupWidth}x${popupHeight}`,
    });

    let popup: Window | null = null;
    try {
      popup = window.open(
        authUrl,
        'spotify_oauth_popup',
        `width=${popupWidth},height=${popupHeight},top=${top},left=${left},status=no,resizable=yes,scrollbars=yes`
      );
    } catch (err: any) {
      this.addLog('error', 'POPUP', `Failed to launch popup: ${err.message}`);
    }

    if (!popup) {
      const errMsg = 'Popup blocked by browser. Please enable popups for this site and retry.';
      this.addLog('error', 'POPUP', errMsg);
      return { success: false, error: errMsg };
    }

    this.addLog('info', 'POPUP', 'Popup window opened. Waiting for user authorization on Spotify accounts page & postMessage callback...');

    // 3. Await PostMessage Handshake from Callback HTML
    return new Promise((resolve) => {
      let resolved = false;

      const messageHandler = async (event: MessageEvent) => {
        // Validate origin: AI Studio preview, localhost, or window origin
        const origin = event.origin;
        const isValidOrigin = origin.endsWith('.run.app') || origin.includes('localhost') || origin.includes('google.com') || origin === window.location.origin;

        if (!isValidOrigin) {
          this.addLog('warn', 'CALLBACK', `Ignored postMessage from untrusted origin: ${origin}`);
          return;
        }

        if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
          resolved = true;
          window.removeEventListener('message', messageHandler);
          this.addLog('success', 'CALLBACK', 'Received OAUTH_AUTH_SUCCESS message from popup callback!', {
            origin: event.origin,
            hasTokenData: !!event.data.tokenData,
            hasCode: !!event.data.code,
          });

          const { tokenData, code } = event.data;

          if (tokenData && tokenData.access_token) {
            this.setTokens(tokenData);
            const profile = await this.fetchUserProfile();
            resolve({ success: true, user: profile || undefined });
          } else if (code) {
            // Exchange code via server
            this.addLog('step', 'TOKEN_EXCHANGE', `Exchanging authorization code for access tokens via /api/spotify/token...`);
            const storedVerifier = sessionStorage.getItem(STORAGE_KEYS.CODE_VERIFIER) || localStorage.getItem(STORAGE_KEYS.CODE_VERIFIER) || undefined;
            try {
              const exchangeRes = await fetch('/api/spotify/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  code,
                  clientId: savedClientId || undefined,
                  redirectUri,
                  codeVerifier: storedVerifier,
                }),
              });

              if (exchangeRes.ok) {
                const exData = await exchangeRes.json();
                this.addLog('success', 'TOKEN_EXCHANGE', 'Authorization code exchanged successfully!');
                this.setTokens(exData);
                const profile = await this.fetchUserProfile();
                this.initWebPlaybackSDK();
                this.startPlaybackPolling(1800);
                resolve({ success: true, user: profile || undefined });
              } else {
                const errData = await exchangeRes.json().catch(() => ({}));
                const errMsg = errData.error_description || errData.error || `HTTP ${exchangeRes.status} Token Exchange Failed`;
                this.addLog('error', 'TOKEN_EXCHANGE', `Token exchange failed: ${errMsg}`, {
                  status: exchangeRes.status,
                  response: errData,
                  hint: 'Check if SPOTIFY_CLIENT_SECRET is set in Settings or if redirect_uri matches Spotify Dashboard exactly.',
                });
                resolve({ success: false, error: errMsg });
              }
            } catch (err: any) {
              this.addLog('error', 'TOKEN_EXCHANGE', `Token exchange network error: ${err.message}`, { error: err.message });
              resolve({ success: false, error: err.message });
            }
          } else {
            this.addLog('error', 'CALLBACK', 'Callback sent OAUTH_AUTH_SUCCESS but no code or tokenData was attached');
            resolve({ success: false, error: 'Incomplete authentication payload received' });
          }
        } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
          resolved = true;
          window.removeEventListener('message', messageHandler);
          const errMsg = event.data.error || 'Authorization cancelled or denied by user';
          this.addLog('error', 'CALLBACK', `Spotify authorization error: ${errMsg}`, { error: event.data });
          resolve({ success: false, error: errMsg });
        }
      };

      window.addEventListener('message', messageHandler);

      // Check for popup closure timeout
      const checkClosed = setInterval(() => {
        if (popup && popup.closed) {
          clearInterval(checkClosed);
          setTimeout(() => {
            if (!resolved) {
              window.removeEventListener('message', messageHandler);
              if (this.isConnected()) {
                this.addLog('success', 'POPUP', 'Popup window closed; connection established!');
                resolve({ success: true, user: this.userProfile || undefined });
              } else {
                this.addLog('warn', 'POPUP', 'Popup window was closed before authorization was completed');
                resolve({ success: false, error: 'Authentication window was closed before completing login.' });
              }
            }
          }, 1200);
        }
      }, 500);
    });
  }

  public disconnect() {
    this.addLog('info', 'DISCONNECT', 'Disconnecting Spotify account and clearing session tokens');
    this.stopPlaybackPolling();
    if (this.webPlayer) {
      try {
        this.webPlayer.disconnect();
      } catch {}
      this.webPlayer = null;
    }
    this.webDeviceId = null;
    this.cachedDevices = [];
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = 0;
    this.userProfile = null;
    this.lastLivePlayback = null;

    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);

    this.notify();
    this.notifyPlayback(null);
    this.deviceListeners.forEach((l) => l([]));
  }

  // ==================== Spotify Web Playback SDK ====================

  public initWebPlaybackSDK() {
    if (typeof window === 'undefined') return;
    if (!this.accessToken) return;

    const setupPlayer = () => {
      if (!window.Spotify || !this.accessToken) return;
      if (this.webPlayer) return;

      try {
        this.addLog('step', 'CONFIG', 'Initializing Spotify Web Playback SDK for in-browser streaming & Connect sync');
        const player = new window.Spotify.Player({
          name: 'Study Sanctuary Web Player',
          getOAuthToken: (cb: (token: string) => void) => {
            if (Date.now() >= this.expiresAt) {
              this.refreshAccessToken().then(() => cb(this.accessToken || ''));
            } else {
              cb(this.accessToken || '');
            }
          },
          volume: 0.8
        });

        player.addListener('ready', ({ device_id }: { device_id: string }) => {
          this.webDeviceId = device_id;
          this.addLog('success', 'CONFIG', `Spotify Web Playback SDK ready! Device ID: ${device_id}`);
          this.fetchDevices();
        });

        player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
          this.addLog('warn', 'CONFIG', `Spotify Web Playback SDK device went offline: ${device_id}`);
          if (this.webDeviceId === device_id) {
            this.webDeviceId = null;
          }
        });

        player.addListener('player_state_changed', (state: any) => {
          if (!state) return;
          const currentTrack = state.track_window?.current_track;
          if (currentTrack) {
            const livePlayback: SpotifyLivePlayback = {
              isPlaying: !state.paused,
              item: {
                id: currentTrack.id || `sdk-${Date.now()}`,
                name: currentTrack.name || 'Unknown Track',
                artists: currentTrack.artists?.map((a: any) => ({ name: a.name, id: a.uri })) || [{ name: 'Artist' }],
                album: {
                  name: currentTrack.album?.name || '',
                  images: currentTrack.album?.images || [],
                },
                durationMs: state.duration || 180000,
                uri: currentTrack.uri || '',
                externalUrl: `https://open.spotify.com/track/${currentTrack.id}`,
              },
              progressMs: state.position || 0,
              timestamp: Date.now(),
              device: {
                id: this.webDeviceId || 'web-player',
                name: 'Study Sanctuary Web Player',
                type: 'Computer',
                isActive: true,
              },
              shuffleState: state.shuffle,
              repeatState: state.repeat_mode === 1 ? 'context' : state.repeat_mode === 2 ? 'track' : 'off',
            };
            this.notifyPlayback(livePlayback);
          }
        });

        player.addListener('initialization_error', ({ message }: { message: string }) => {
          this.addLog('warn', 'CONFIG', `Spotify SDK Initialization: ${message}`);
        });

        player.addListener('authentication_error', ({ message }: { message: string }) => {
          this.addLog('warn', 'CONFIG', `Spotify SDK Auth: ${message}`);
        });

        player.addListener('account_error', ({ message }: { message: string }) => {
          this.addLog('warn', 'CONFIG', `Spotify SDK Account: ${message} (Spotify Premium required for active in-browser streaming; cross-device sync active for all accounts).`);
        });

        player.connect().then((success: boolean) => {
          if (success) {
            this.addLog('success', 'CONFIG', 'Connected to Spotify Web Playback SDK.');
          }
        }).catch((err: any) => {
          this.addLog('warn', 'CONFIG', `Web Playback SDK connect notice: ${err?.message || err}`);
        });

        this.webPlayer = player;
      } catch (err: any) {
        this.addLog('warn', 'CONFIG', `Web Playback SDK notice: ${err?.message || err}`);
      }
    };

    if (window.Spotify) {
      setupPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = () => {
        setupPlayer();
      };
      // Inject dynamically only if not already injected
      if (!document.getElementById('spotify-player-sdk-script')) {
        try {
          const script = document.createElement('script');
          script.id = 'spotify-player-sdk-script';
          script.src = 'https://sdk.scdn.co/spotify-player.js';
          script.async = true;
          script.onerror = () => {
            this.addLog('warn', 'CONFIG', 'Spotify SDK script could not be loaded in sandbox mode. Cloud Connect sync remains operational.');
          };
          document.head.appendChild(script);
        } catch {
          // Ignore script injection failure in restricted iframes
        }
      }
    }
  }

  public getWebDeviceId(): string | null {
    return this.webDeviceId;
  }

  public getWebPlayer(): any {
    return this.webPlayer;
  }

  // ==================== Spotify Connect Devices Management ====================

  public async fetchDevices(): Promise<SpotifyDevice[]> {
    if (!this.accessToken) return [];

    try {
      const res = await fetch('/api/spotify/devices', {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        const devices: SpotifyDevice[] = data.devices || [];
        this.cachedDevices = devices;
        this.deviceListeners.forEach((l) => l(devices));
        return devices;
      }
    } catch (err) {
      console.warn('Failed to fetch Spotify devices:', err);
    }
    return this.cachedDevices;
  }

  public subscribeDevices(listener: (devices: SpotifyDevice[]) => void) {
    this.deviceListeners.add(listener);
    listener(this.cachedDevices);
    return () => this.deviceListeners.delete(listener);
  }

  public async transferPlayback(deviceId: string, play: boolean = true): Promise<{ success: boolean; message?: string }> {
    if (!this.accessToken) {
      return { success: false, message: 'Spotify is not connected' };
    }

    this.addLog('step', 'PLAYBACK_POLL', `Transferring Spotify playback to device ID: ${deviceId}`);

    try {
      const res = await fetch('/api/spotify/player/transfer', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId, play }),
      });

      if (res.ok || res.status === 204) {
        this.addLog('success', 'PLAYBACK_POLL', `Playback transferred successfully to device!`);
        setTimeout(() => {
          this.fetchLivePlayback();
          this.fetchDevices();
        }, 500);
        return { success: true };
      }

      const data = await res.json().catch(() => ({}));
      return { success: false, message: data.error?.message || 'Failed to transfer playback' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  // ==================== Live Playback Synchronization ====================

  public startPlaybackPolling(intervalMs: number = 1800) {
    this.stopPlaybackPolling();
    this.fetchLivePlayback(); // Immediate first fetch
    this.fetchDevices();
    this.pollingIntervalId = setInterval(() => {
      this.fetchLivePlayback();
    }, intervalMs);

    // Also poll devices every 7 seconds
    this.devicePollingIntervalId = setInterval(() => {
      if (this.isConnected()) {
        this.fetchDevices();
      }
    }, 7000);
  }

  public stopPlaybackPolling() {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
    }
    if (this.devicePollingIntervalId) {
      clearInterval(this.devicePollingIntervalId);
      this.devicePollingIntervalId = null;
    }
  }

  public async fetchLivePlayback(): Promise<SpotifyLivePlayback | null> {
    if (!this.accessToken) return null;

    // Refresh if expired
    if (Date.now() >= this.expiresAt) {
      this.addLog('warn', 'PLAYBACK_POLL', 'Token expired during playback sync polling. Triggering automatic refresh...');
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) return null;
    }

    try {
      const res = await fetch('/api/spotify/player/state', {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });

      if (res.status === 401) {
        this.addLog('warn', 'PLAYBACK_POLL', 'Received 401 from Spotify player API. Refreshing token...');
        await this.refreshAccessToken();
        return null;
      }

      if (res.status === 204 || !res.ok) {
        // No active device or track
        if (this.lastLivePlayback !== null) {
          this.addLog('info', 'PLAYBACK_POLL', 'No active Spotify player device currently streaming music (Status 204)');
        }
        this.notifyPlayback(null);
        return null;
      }

      const data = await res.json();
      if (!data || !data.item) {
        this.notifyPlayback(null);
        return null;
      }

      const playback: SpotifyLivePlayback = {
        isPlaying: data.is_playing || false,
        item: {
          id: data.item.id || `spotify-${Date.now()}`,
          name: data.item.name || 'Unknown Track',
          artists: data.item.artists?.map((a: any) => ({ name: a.name, id: a.id })) || [{ name: 'Spotify Artist' }],
          album: {
            name: data.item.album?.name || 'Spotify Album',
            images: data.item.album?.images || [],
          },
          durationMs: data.item.duration_ms || 180000,
          uri: data.item.uri || '',
          externalUrl: data.item.external_urls?.spotify,
          previewUrl: data.item.preview_url,
          isExplicit: data.item.explicit,
        },
        progressMs: data.progress_ms || 0,
        timestamp: data.timestamp || Date.now(),
        device: data.device
          ? {
              id: data.device.id,
              name: data.device.name,
              type: data.device.type,
              volumePercent: data.device.volume_percent,
              isActive: data.device.is_active,
            }
          : undefined,
        shuffleState: data.shuffle_state,
        repeatState: data.repeat_state,
        context: data.context ? { type: data.context.type, uri: data.context.uri } : undefined,
      };

      // If new track changed, log
      if (!this.lastLivePlayback || this.lastLivePlayback.item?.id !== playback.item?.id) {
        this.addLog('info', 'PLAYBACK_POLL', `Live playback detected: "${playback.item?.name}" by ${playback.item?.artists[0]?.name} on ${playback.device?.name || 'Device'} (${playback.isPlaying ? 'Playing' : 'Paused'})`);
      }

      this.notifyPlayback(playback);
      return playback;
    } catch (err: any) {
      console.warn('Error fetching live Spotify playback:', err);
      return null;
    }
  }

  // ==================== Diagnostics & Self Test ====================

  public async runDiagnosticSelfTest(): Promise<{
    passed: boolean;
    serverConfigured: boolean;
    redirectUri: string;
    tokenStatus: SpotifyTokenExpirationInfo;
    hasRefreshToken?: boolean;
    checks: { name: string; status: 'ok' | 'warn' | 'error'; message: string; details?: any }[];
  }> {
    this.addLog('step', 'DIAGNOSTIC', '=== Running Spotify Connection Diagnostics ===');
    const checks: { name: string; status: 'ok' | 'warn' | 'error'; message: string; details?: any }[] = [];

    // 1. Origin & Environment Check
    const origin = window.location.origin;
    const expectedCallback = `${origin}/auth/callback`;
    checks.push({
      name: 'Application Origin & Callback URL',
      status: 'ok',
      message: `Origin: ${origin}`,
      details: {
        currentOrigin: origin,
        redirectUri: expectedCallback,
        isIframe: window.self !== window.top,
      },
    });

    // 2. Server Auth-URL Endpoint Check
    let serverConfigured = false;
    let serverRedirectUri = expectedCallback;
    try {
      const customClientId = localStorage.getItem(STORAGE_KEYS.CUSTOM_CLIENT_ID);
      const res = await fetch(`/api/spotify/auth-url?clientId=${encodeURIComponent(customClientId || '')}`);
      const data = await res.json();
      serverConfigured = !!data.configured;
      if (data.redirectUri) serverRedirectUri = data.redirectUri;

      if (data.configured) {
        checks.push({
          name: 'Backend Spotify Configuration',
          status: 'ok',
          message: `SPOTIFY_CLIENT_ID is configured (${data.clientId.substring(0, 6)}...). OAuth URL generated successfully.`,
          details: data,
        });
      } else {
        checks.push({
          name: 'Backend Spotify Configuration',
          status: customClientId ? 'ok' : 'warn',
          message: customClientId 
            ? `Using custom user Client ID (${customClientId.substring(0, 6)}...).` 
            : 'SPOTIFY_CLIENT_ID not set in backend environment variables. You can enter your Client ID in the Connect Modal.',
          details: data,
        });
      }
    } catch (err: any) {
      checks.push({
        name: 'Backend Spotify Configuration',
        status: 'error',
        message: `Failed to reach backend auth-url endpoint: ${err.message}`,
      });
    }

    // 3. Token Status Check
    const tokenInfo = this.getTokenExpirationInfo();
    if (tokenInfo.status === 'VALID') {
      checks.push({
        name: 'Access Token Expiration',
        status: 'ok',
        message: `Token is active and valid (${tokenInfo.formattedRemaining}). Expires at ${tokenInfo.formattedExpiresAt}.`,
        details: tokenInfo,
      });
    } else if (tokenInfo.status === 'EXPIRING_SOON') {
      checks.push({
        name: 'Access Token Expiration',
        status: 'warn',
        message: `Token is expiring soon (${tokenInfo.formattedRemaining}). Auto-refresh will trigger automatically.`,
        details: tokenInfo,
      });
    } else if (tokenInfo.status === 'EXPIRED') {
      checks.push({
        name: 'Access Token Expiration',
        status: tokenInfo.hasRefreshToken ? 'warn' : 'error',
        message: tokenInfo.hasRefreshToken 
          ? `Token is expired, but refresh token is present. Click "Refresh Token" to renew.` 
          : 'Token is expired and no refresh token is stored. Please reconnect your account.',
        details: tokenInfo,
      });
    } else {
      checks.push({
        name: 'Access Token Expiration',
        status: 'warn',
        message: 'No Spotify account is currently authenticated.',
      });
    }

    // 4. User Profile & Live API Ping (if token exists)
    if (this.accessToken) {
      try {
        const profile = await this.fetchUserProfile();
        if (profile) {
          checks.push({
            name: 'Spotify API Connectivity',
            status: 'ok',
            message: `Successfully queried /v1/me for ${profile.displayName} (${profile.product?.toUpperCase()})`,
            details: profile,
          });
        } else {
          checks.push({
            name: 'Spotify API Connectivity',
            status: 'error',
            message: 'Spotify API returned an error when fetching profile.',
          });
        }
      } catch (err: any) {
        checks.push({
          name: 'Spotify API Connectivity',
          status: 'error',
          message: `Network failure connecting to Spotify API: ${err.message}`,
        });
      }
    }

    const hasErrors = checks.some((c) => c.status === 'error');
    this.addLog(
      hasErrors ? 'error' : 'success',
      'DIAGNOSTIC',
      `Diagnostic Self-Test Completed (${hasErrors ? 'Found issues' : 'All checks passed'})`,
      { checks }
    );

    return {
      passed: !hasErrors,
      serverConfigured,
      redirectUri: serverRedirectUri,
      tokenStatus: tokenInfo,
      hasRefreshToken: !!this.refreshToken || !!tokenInfo.hasRefreshToken,
      checks,
    };
  }

  // ==================== Playback Controls ====================

  public async controlPlayback(
    action: 'play' | 'pause' | 'next' | 'previous' | 'seek' | 'volume' | 'shuffle' | 'repeat',
    value?: number | string | boolean,
    uriContext?: string
  ): Promise<{ success: boolean; message?: string }> {
    if (!this.accessToken) {
      this.addLog('warn', 'PLAYBACK_POLL', `Playback control "${action}" failed: Spotify is not connected`);
      return { success: false, message: 'Spotify is not connected' };
    }

    this.addLog('step', 'PLAYBACK_POLL', `Sending Spotify playback command: ${action.toUpperCase()}${value !== undefined ? ` (value: ${value})` : ''}`);

    // If Web Playback SDK is the active device, also trigger direct SDK commands for instant local execution
    if (this.webPlayer && this.webDeviceId) {
      const isWebActive = this.lastLivePlayback?.device?.id === this.webDeviceId || this.cachedDevices.find(d => d.id === this.webDeviceId)?.is_active;
      if (isWebActive) {
        try {
          if (action === 'play') this.webPlayer.resume?.().catch(() => {});
          if (action === 'pause') this.webPlayer.pause?.().catch(() => {});
          if (action === 'next') this.webPlayer.nextTrack?.().catch(() => {});
          if (action === 'previous') this.webPlayer.previousTrack?.().catch(() => {});
          if (action === 'seek') this.webPlayer.seek?.(Math.floor(Number(value) || 0)).catch(() => {});
          if (action === 'volume') this.webPlayer.setVolume?.(Math.max(0, Math.min(1, (Number(value) || 50) / 100))).catch(() => {});
        } catch {}
      }
    }

    try {
      let endpoint = `/api/spotify/player/${action}`;
      let method = 'POST';
      let body: any = undefined;

      if (action === 'play') {
        method = 'PUT';
        if (uriContext) {
          if (uriContext.startsWith('spotify:track:')) {
            body = { uris: [uriContext] };
          } else {
            body = { context_uri: uriContext };
          }
        }
      } else if (action === 'pause') {
        method = 'PUT';
      } else if (action === 'seek') {
        method = 'PUT';
        endpoint = `/api/spotify/player/seek?position_ms=${Math.floor(Number(value) || 0)}`;
      } else if (action === 'volume') {
        method = 'PUT';
        endpoint = `/api/spotify/player/volume?volume_percent=${Math.round(Number(value) || 50)}`;
      } else if (action === 'shuffle') {
        method = 'PUT';
        endpoint = `/api/spotify/player/shuffle?state=${value ?? true}`;
      } else if (action === 'repeat') {
        method = 'PUT';
        endpoint = `/api/spotify/player/repeat?state=${value || 'track'}`;
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (res.ok || res.status === 204) {
        this.addLog('success', 'PLAYBACK_POLL', `Playback command "${action}" executed successfully on Spotify player!`);
        setTimeout(() => this.fetchLivePlayback(), 300);
        return { success: true };
      }

      const data = await res.json().catch(() => ({}));
      const errMsg = data.error?.message || `Command ${action} requires an active Spotify player device or Spotify Premium.`;
      this.addLog('error', 'PLAYBACK_POLL', `Playback command "${action}" failed: ${errMsg}`, { error: data });
      return {
        success: false,
        message: errMsg,
      };
    } catch (err: any) {
      this.addLog('error', 'PLAYBACK_POLL', `Network error executing "${action}": ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  /**
   * Helper to convert live playback item to application SpotifyTrack
   */
  public livePlaybackToTrack(playback: SpotifyLivePlayback): SpotifyTrack {
    const item = playback.item!;
    const artistNames = item.artists.map((a) => a.name).join(', ');
    const coverUrl =
      item.album.images.length > 0
        ? item.album.images[0].url
        : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';

    const mins = Math.floor(item.durationMs / 60000);
    const secs = Math.floor((item.durationMs % 60000) / 1000);
    const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    return {
      id: `spotify-live-${item.id}`,
      title: item.name,
      artist: artistNames,
      album: item.album.name,
      coverUrl,
      spotifyUri: item.uri,
      embedUrl: `https://open.spotify.com/embed/track/${item.id}?utm_source=generator&theme=0`,
      previewAudioUrl: item.previewUrl,
      spotifyWebUrl: item.externalUrl || `https://open.spotify.com/track/${item.id}`,
      genre: 'Live Spotify Sync',
      duration: durationStr,
      category: 'ambient',
      type: 'track',
    };
  }
}

export const spotifyAuthService = new SpotifyAuthService();
