import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { SpotifyTrack, SpotifyPlaylist, SpotifyUserProfile, SpotifyLivePlayback, SpotifyDevice } from '../types';
import { SPOTIFY_SEARCH_CATALOGUE } from '../data/spotifyCatalogue';
import { themeAudio, ambientSoundscapeMixer } from '../utils/themeAudio';
import { spotifyAuthService } from '../services/spotifyAuthService';

export function trackToPlaylist(track: SpotifyTrack): SpotifyPlaylist {
  return {
    id: track.id,
    name: track.title,
    description: `${track.artist} • ${track.album || track.genre}`,
    coverUrl: track.coverUrl,
    spotifyUri: track.spotifyUri,
    embedUrl: track.embedUrl,
    category: (track.genre as any) || 'ambient',
    recommendedMode: 'Deep Study',
    bpm: track.bpm || 'Focus Tempo',
    artist: track.artist,
    duration: track.duration
  };
}

export function playlistToTrack(playlist: SpotifyPlaylist): SpotifyTrack {
  return {
    id: playlist.id,
    title: playlist.name,
    artist: playlist.artist || playlist.description.split('•')[0]?.trim() || 'Study Sanctuary',
    album: playlist.description.split('•')[1]?.trim() || playlist.name,
    coverUrl: playlist.coverUrl,
    spotifyUri: playlist.spotifyUri,
    embedUrl: playlist.embedUrl,
    genre: playlist.category || 'ambient',
    bpm: playlist.bpm || 'Focus Tempo',
    duration: playlist.duration || '03:30'
  };
}

// Parse duration string (e.g. "3:45", "03:45") to seconds
function parseDurationToSeconds(durationStr?: string): number {
  if (!durationStr) return 180;
  const parts = durationStr.split(':');
  if (parts.length === 2) {
    const min = parseInt(parts[0], 10) || 0;
    const sec = parseInt(parts[1], 10) || 0;
    return min * 60 + sec;
  }
  return 180;
}

export interface MusicContextType {
  currentTrack: SpotifyTrack;
  currentPlaylist: SpotifyPlaylist;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  volume: number;
  isMuted: boolean;
  isLooping: boolean;
  isShuffle: boolean;
  savedTracks: SpotifyTrack[];
  isDucked: boolean;
  playbackEngine: 'in-app-audio' | 'spotify-embed';
  setPlaybackEngine: (engine: 'in-app-audio' | 'spotify-embed') => void;
  // Live Spotify Connection & Playback Sync
  isSpotifyConnected: boolean;
  spotifyUser: SpotifyUserProfile | null;
  isLiveSpotifySync: boolean;
  liveSpotifyPlayback: SpotifyLivePlayback | null;
  availableDevices: SpotifyDevice[];
  activeDevice: SpotifyDevice | null;
  webDeviceId: string | null;
  connectSpotify: (clientId?: string) => Promise<{ success: boolean; user?: SpotifyUserProfile; error?: string }>;
  disconnectSpotify: () => void;
  toggleLiveSpotifySync: () => void;
  refreshSpotifyPlayback: () => Promise<void>;
  refreshDevices: () => Promise<void>;
  transferToDevice: (deviceId: string) => Promise<boolean>;
  controlLiveSpotify: (
    action: 'play' | 'pause' | 'next' | 'previous' | 'seek' | 'volume' | 'shuffle' | 'repeat',
    value?: number | string | boolean
  ) => Promise<{ success: boolean; message?: string }>;
  // Core Player Controls
  playTrack: (trackOrPlaylist: SpotifyTrack | SpotifyPlaylist) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  addCustomTrack: (track: SpotifyTrack) => void;
  removeCustomTrack: (trackId: string) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Saved custom library
  const [savedTracks, setSavedTracks] = useState<SpotifyTrack[]>(() => {
    try {
      const saved = localStorage.getItem('aesthetic_study_custom_spotify_tracks');
      if (saved) return JSON.parse(saved);
    } catch {}
    return SPOTIFY_SEARCH_CATALOGUE.slice(0, 8);
  });

  // Currently playing track
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack>(() => {
    try {
      const saved = localStorage.getItem('aesthetic_study_last_played_track');
      if (saved) return JSON.parse(saved);
    } catch {}
    return SPOTIFY_SEARCH_CATALOGUE[0];
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(() => parseDurationToSeconds(SPOTIFY_SEARCH_CATALOGUE[0].duration));
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [playbackEngine, setPlaybackEngineState] = useState<'in-app-audio' | 'spotify-embed'>('spotify-embed');

  const setPlaybackEngine = useCallback((engine: 'in-app-audio' | 'spotify-embed') => {
    setPlaybackEngineState(engine);
    try {
      localStorage.setItem('aesthetic_study_playback_engine', engine);
    } catch {}
    if (engine === 'spotify-embed') {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    }
  }, []);

  // Live Spotify Connection State
  const [isSpotifyConnected, setIsSpotifyConnected] = useState<boolean>(() => spotifyAuthService.isConnected());
  const [spotifyUser, setSpotifyUser] = useState<SpotifyUserProfile | null>(() => spotifyAuthService.getUserProfile());
  const [liveSpotifyPlayback, setLiveSpotifyPlayback] = useState<SpotifyLivePlayback | null>(() => spotifyAuthService.getLastLivePlayback());
  const [availableDevices, setAvailableDevices] = useState<SpotifyDevice[]>([]);
  const [webDeviceId, setWebDeviceId] = useState<string | null>(() => spotifyAuthService.getWebDeviceId());
  const [isLiveSpotifySync, setIsLiveSpotifySync] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aesthetic_study_spotify_auto_sync_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  // Persistent root-level audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Stable tracking refs to avoid recreating intervals or resetting audio across navigation
  const currentTrackIdRef = useRef<string>(currentTrack.id);
  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;
  const isLoopingRef = useRef<boolean>(isLooping);
  isLoopingRef.current = isLooping;
  const isShuffleRef = useRef<boolean>(isShuffle);
  isShuffleRef.current = isShuffle;
  const savedTracksRef = useRef<SpotifyTrack[]>(savedTracks);
  savedTracksRef.current = savedTracks;
  const currentTrackRef = useRef<SpotifyTrack>(currentTrack);
  currentTrackRef.current = currentTrack;
  const durationRef = useRef<number>(duration);
  durationRef.current = duration;
  const volumeRef = useRef<number>(volume);
  volumeRef.current = volume;
  const isMutedRef = useRef<boolean>(isMuted);
  isMutedRef.current = isMuted;
  const isLiveSpotifySyncRef = useRef<boolean>(isLiveSpotifySync);
  isLiveSpotifySyncRef.current = isLiveSpotifySync;
  const isSpotifyConnectedRef = useRef<boolean>(isSpotifyConnected);
  isSpotifyConnectedRef.current = isSpotifyConnected;
  const liveSpotifyPlaybackRef = useRef<SpotifyLivePlayback | null>(liveSpotifyPlayback);
  liveSpotifyPlaybackRef.current = liveSpotifyPlayback;

  // Save custom tracks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aesthetic_study_custom_spotify_tracks', JSON.stringify(savedTracks));
    } catch {}
  }, [savedTracks]);

  // Subscribe to Spotify Auth & Live Playback Sync
  useEffect(() => {
    const unsubAuth = spotifyAuthService.subscribe(({ isConnected, user }) => {
      setIsSpotifyConnected(isConnected);
      setSpotifyUser(user);
    });

    const unsubPlayback = spotifyAuthService.subscribePlayback((playback) => {
      setLiveSpotifyPlayback(playback);

      // If user has Spotify Sync enabled and there is an active song playing on Spotify
      if (playback && playback.item && isLiveSpotifySyncRef.current) {
        const liveTrack = spotifyAuthService.livePlaybackToTrack(playback);
        const progressSec = Math.floor(playback.progressMs / 1000);
        const durationSec = Math.floor(playback.item.durationMs / 1000);

        setCurrentTrack(liveTrack);
        currentTrackRef.current = liveTrack;
        currentTrackIdRef.current = liveTrack.id;

        setCurrentTime(progressSec);
        setDuration(durationSec > 0 ? durationSec : 180);
        setIsPlaying(playback.isPlaying);

        // Stop local preview audio since user is listening through real Spotify app/device
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
        }
      }
    });

    const unsubDevices = spotifyAuthService.subscribeDevices((devs) => {
      setAvailableDevices(devs);
      setWebDeviceId(spotifyAuthService.getWebDeviceId());
    });

    return () => {
      unsubAuth();
      unsubPlayback();
      unsubDevices();
    };
  }, []);

  // Compute active Spotify Connect device
  const activeDevice: SpotifyDevice | null = liveSpotifyPlayback?.device
    ? {
        id: liveSpotifyPlayback.device.id || '',
        name: liveSpotifyPlayback.device.name,
        type: liveSpotifyPlayback.device.type,
        is_active: true,
        volume_percent: liveSpotifyPlayback.device.volumePercent,
      }
    : (availableDevices.find(d => d.is_active) || null);

  // Connect Spotify handler
  const connectSpotify = useCallback(async (customClientId?: string) => {
    const result = await spotifyAuthService.connectWithPopup(customClientId);
    if (result.success) {
      setIsSpotifyConnected(true);
      if (result.user) setSpotifyUser(result.user);
      spotifyAuthService.startPlaybackPolling(1800);
      spotifyAuthService.fetchDevices();
    }
    return result;
  }, []);

  // Disconnect Spotify handler
  const disconnectSpotify = useCallback(() => {
    spotifyAuthService.disconnect();
    setIsSpotifyConnected(false);
    setSpotifyUser(null);
    setLiveSpotifyPlayback(null);
    setAvailableDevices([]);
    setWebDeviceId(null);
  }, []);

  // Toggle Live Sync
  const toggleLiveSpotifySync = useCallback(() => {
    setIsLiveSpotifySync((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('aesthetic_study_spotify_auto_sync_enabled', String(next));
      } catch {}
      if (next && isSpotifyConnected) {
        spotifyAuthService.fetchLivePlayback();
        spotifyAuthService.fetchDevices();
      }
      return next;
    });
  }, [isSpotifyConnected]);

  // Refresh Spotify Playback manually
  const refreshSpotifyPlayback = useCallback(async () => {
    if (isSpotifyConnected) {
      await spotifyAuthService.fetchLivePlayback();
      await spotifyAuthService.fetchDevices();
    }
  }, [isSpotifyConnected]);

  // Refresh Devices
  const refreshDevices = useCallback(async () => {
    if (isSpotifyConnected) {
      const devs = await spotifyAuthService.fetchDevices();
      setAvailableDevices(devs);
      setWebDeviceId(spotifyAuthService.getWebDeviceId());
    }
  }, [isSpotifyConnected]);

  // Transfer playback to selected device
  const transferToDevice = useCallback(async (deviceId: string) => {
    if (!isSpotifyConnected) return false;
    const res = await spotifyAuthService.transferPlayback(deviceId, true);
    if (res.success) {
      await spotifyAuthService.fetchDevices();
      await spotifyAuthService.fetchLivePlayback();
      return true;
    }
    return false;
  }, [isSpotifyConnected]);

  // Control Live Spotify
  const controlLiveSpotify = useCallback(async (
    action: 'play' | 'pause' | 'next' | 'previous' | 'seek' | 'volume' | 'shuffle' | 'repeat',
    value?: number | string | boolean
  ) => {
    if (!isSpotifyConnected) {
      return { success: false, message: 'Spotify is not connected' };
    }
    return await spotifyAuthService.controlPlayback(action, value);
  }, [isSpotifyConnected]);

  // Preload current track audio stream on mount/change so clicking play begins instantly
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentTrack?.previewAudioUrl && (!audio.src || audio.src === window.location.href)) {
      audio.src = currentTrack.previewAudioUrl;
      audio.crossOrigin = 'anonymous';
      audio.load();
    }
  }, [currentTrack]);

  // Sync audio element volume & loop settings
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.loop = isLooping;
    }
  }, [volume, isMuted, isLooping]);

  /**
   * Cross-fade & Ducking synchronization:
   * When Spotify track starts, ambient rain/storm soundscapes dip by 20% smoothly over 1.2s.
   * When Spotify track pauses, ambient rain/storm soundscapes smoothly return to 100%.
   */
  useEffect(() => {
    const audio = audioRef.current;

    if (isPlaying) {
      // 1. Cross-fade ducking on ambient soundscape engines (20% volume dip)
      themeAudio.setDucking(true, 1.2);
      ambientSoundscapeMixer.setDucking(true, 1.2);

      // If live spotify sync is playing, don't force local audio file
      if (liveSpotifyPlaybackRef.current?.isPlaying && isLiveSpotifySyncRef.current) {
        return;
      }

      // 2. Play HTML5 audio if src exists and is paused
      if (audio && audio.src && audio.src !== window.location.href && audio.src !== '') {
        if (audio.paused) {
          audio.play().catch(err => {
            console.warn('Direct audio stream playback notice:', err);
          });
        }
      }
    } else {
      // 1. Restore ambient soundscape engines back to full unducked volume
      themeAudio.setDucking(false, 1.2);
      ambientSoundscapeMixer.setDucking(false, 1.2);

      // 2. Pause audio element
      if (audio && !audio.paused) {
        audio.pause();
      }
    }
  }, [isPlaying]);

  // Safe helper to get track pool
  const getTrackPool = useCallback((): SpotifyTrack[] => {
    const pool = savedTracksRef.current;
    return pool.length > 0 ? pool : SPOTIFY_SEARCH_CATALOGUE;
  }, []);

  // Helper to fetch live audio preview for tracks that don't have one
  const resolveAudioPreviewForTrack = useCallback(async (track: SpotifyTrack) => {
    if (track.previewAudioUrl) return track.previewAudioUrl;

    try {
      const term = `${track.title} ${track.artist}`;
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0 && data.results[0].previewUrl) {
          const previewUrl = data.results[0].previewUrl;
          track.previewAudioUrl = previewUrl;

          // If this is currently active track, switch to live audio stream
          if (currentTrackRef.current.id === track.id) {
            const audio = audioRef.current;
            if (audio) {
              if (audio.src !== previewUrl) {
                audio.src = previewUrl;
              }
              audio.volume = isMutedRef.current ? 0 : volumeRef.current;
              audio.loop = isLoopingRef.current;
              if (isPlayingRef.current && audio.paused) {
                audio.play().catch(() => {});
              }
            }
          }

          // Update saved state
          setSavedTracks(prev => prev.map(t => t.id === track.id ? { ...t, previewAudioUrl: previewUrl } : t));
          return previewUrl;
        }
      }
    } catch (err) {
      console.warn('Audio stream preview search notice:', err);
    }
    return undefined;
  }, []);

  const playTrack = useCallback((trackOrPlaylist: SpotifyTrack | SpotifyPlaylist) => {
    let track: SpotifyTrack;
    if ('title' in trackOrPlaylist) {
      track = trackOrPlaylist;
    } else {
      track = playlistToTrack(trackOrPlaylist);
    }

    const isNewTrack = currentTrackIdRef.current !== track.id;
    currentTrackIdRef.current = track.id;
    currentTrackRef.current = track;

    setCurrentTrack(track);
    if (isNewTrack) {
      setCurrentTime(0);
    }

    const durSec = parseDurationToSeconds(track.duration);
    setDuration(durSec > 0 ? durSec : 180);
    setIsPlaying(true);

    // If Spotify is connected and user selects a song from the library, attempt to command their real Spotify device too!
    if (spotifyAuthService.isConnected() && track.spotifyUri) {
      spotifyAuthService.controlPlayback('play', undefined, track.spotifyUri).catch(() => {});
    }

    // Save to localStorage
    try {
      localStorage.setItem('aesthetic_study_last_played_track', JSON.stringify(track));
    } catch {}

    // Add to saved tracks if not already present
    setSavedTracks(prev => {
      const exists = prev.some(t => t.id === track.id || t.title === track.title);
      if (!exists) {
        return [track, ...prev].slice(0, 25);
      }
      return prev;
    });

    const audio = audioRef.current;
    if (audio) {
      if (track.previewAudioUrl) {
        if (audio.src !== track.previewAudioUrl) {
          audio.src = track.previewAudioUrl;
          audio.load();
        }
        audio.volume = isMutedRef.current ? 0 : volumeRef.current;
        audio.loop = isLoopingRef.current;
        if (audio.paused) {
          audio.play().catch(err => {
            console.warn('Audio play request handled:', err);
          });
        }
      } else {
        resolveAudioPreviewForTrack(track).then(previewUrl => {
          if (previewUrl && audio && currentTrackRef.current.id === track.id) {
            if (audio.src !== previewUrl) {
              audio.src = previewUrl;
              audio.load();
            }
            audio.volume = isMutedRef.current ? 0 : volumeRef.current;
            if (audio.paused) {
              audio.play().catch(() => {});
            }
          }
        });
      }
    }
  }, [resolveAudioPreviewForTrack]);

  const nextTrack = useCallback(() => {
    if (isSpotifyConnectedRef.current && liveSpotifyPlaybackRef.current?.item) {
      spotifyAuthService.controlPlayback('next').catch(() => {});
    }

    const pool = getTrackPool();
    if (isShuffleRef.current && pool.length > 1) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      playTrack(pool[randomIndex]);
      return;
    }

    const cur = currentTrackRef.current;
    const currentIndex = pool.findIndex(t => t.id === cur.id || t.title === cur.title);
    if (currentIndex >= 0 && currentIndex < pool.length - 1) {
      playTrack(pool[currentIndex + 1]);
    } else if (pool.length > 0) {
      playTrack(pool[0]);
    }
  }, [getTrackPool, playTrack]);

  const prevTrack = useCallback(() => {
    if (isSpotifyConnectedRef.current && liveSpotifyPlaybackRef.current?.item) {
      spotifyAuthService.controlPlayback('previous').catch(() => {});
    }

    const audio = audioRef.current;
    if (audio && audio.currentTime > 4) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const pool = getTrackPool();
    const cur = currentTrackRef.current;
    const currentIndex = pool.findIndex(t => t.id === cur.id || t.title === cur.title);
    if (currentIndex > 0) {
      playTrack(pool[currentIndex - 1]);
    } else if (pool.length > 0) {
      playTrack(pool[pool.length - 1]);
    }
  }, [getTrackPool, playTrack]);

  const nextTrackRef = useRef(nextTrack);
  nextTrackRef.current = nextTrack;

  // Robust time ticker for smooth playback and persistent progress across sections
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const audio = audioRef.current;
      if (audio && !audio.paused && audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
      } else {
        setCurrentTime((prev) => {
          const maxDur = durationRef.current || 180;
          if (prev >= maxDur) {
            if (isLoopingRef.current) {
              if (audio && audio.src) {
                audio.currentTime = 0;
                audio.play().catch(() => {});
              }
              return 0;
            } else {
              nextTrackRef.current();
              return 0;
            }
          }
          return prev + 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    if (isSpotifyConnected && liveSpotifyPlayback?.item) {
      if (isPlaying) {
        spotifyAuthService.controlPlayback('pause').catch(() => {});
        setIsPlaying(false);
      } else {
        spotifyAuthService.controlPlayback('play').catch(() => {});
        setIsPlaying(true);
      }
      return;
    }

    if (!isPlayingRef.current) {
      const audio = audioRef.current;
      const cur = currentTrackRef.current;
      if (audio) {
        if (!audio.src || audio.src === window.location.href || (cur.previewAudioUrl && audio.src !== cur.previewAudioUrl)) {
          if (cur.previewAudioUrl) {
            audio.src = cur.previewAudioUrl;
            audio.crossOrigin = 'anonymous';
            audio.load();
          } else {
            resolveAudioPreviewForTrack(cur);
          }
        }
        audio.volume = isMutedRef.current ? 0 : volumeRef.current;
        audio.loop = isLoopingRef.current;
        audio.play().catch(err => {
          console.warn('Audio play request handled:', err);
        });
      }
      setIsPlaying(true);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    }
  }, [isSpotifyConnected, isPlaying, liveSpotifyPlayback, resolveAudioPreviewForTrack]);

  const pause = useCallback(() => {
    if (isSpotifyConnected && liveSpotifyPlayback?.item) {
      spotifyAuthService.controlPlayback('pause').catch(() => {});
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, [isSpotifyConnected, liveSpotifyPlayback]);

  const resume = useCallback(() => {
    if (isSpotifyConnected && liveSpotifyPlayback?.item) {
      spotifyAuthService.controlPlayback('play').catch(() => {});
    }
    const audio = audioRef.current;
    const cur = currentTrackRef.current;
    if (audio) {
      if (!audio.src || audio.src === window.location.href) {
        if (cur.previewAudioUrl) {
          audio.src = cur.previewAudioUrl;
          audio.crossOrigin = 'anonymous';
          audio.load();
        } else {
          resolveAudioPreviewForTrack(cur);
        }
      }
      audio.volume = isMutedRef.current ? 0 : volumeRef.current;
      audio.play().catch(() => {});
    }
    setIsPlaying(true);
  }, [isSpotifyConnected, liveSpotifyPlayback, resolveAudioPreviewForTrack]);

  const seek = useCallback((seconds: number) => {
    const clamped = Math.max(0, Math.min(seconds, durationRef.current || 180));
    setCurrentTime(clamped);
    if (isSpotifyConnected && liveSpotifyPlayback?.item) {
      spotifyAuthService.controlPlayback('seek', clamped * 1000).catch(() => {});
    }
    if (audioRef.current) {
      audioRef.current.currentTime = clamped;
    }
  }, [isSpotifyConnected, liveSpotifyPlayback]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    setIsMuted(clamped === 0);
    if (isSpotifyConnected && liveSpotifyPlayback?.device) {
      spotifyAuthService.controlPlayback('volume', clamped * 100).catch(() => {});
    }
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, [isSpotifyConnected, liveSpotifyPlayback]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.volume = next ? 0 : volumeRef.current;
      }
      return next;
    });
  }, []);

  const toggleLoop = useCallback(() => {
    setIsLooping(prev => {
      const next = !prev;
      if (isSpotifyConnected) {
        spotifyAuthService.controlPlayback('repeat', next ? 'track' : 'off').catch(() => {});
      }
      return next;
    });
  }, [isSpotifyConnected]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => {
      const next = !prev;
      if (isSpotifyConnected) {
        spotifyAuthService.controlPlayback('shuffle', next).catch(() => {});
      }
      return next;
    });
  }, [isSpotifyConnected]);

  const addCustomTrack = useCallback((track: SpotifyTrack) => {
    setSavedTracks(prev => {
      const filtered = prev.filter(t => t.id !== track.id && t.title !== track.title);
      return [track, ...filtered].slice(0, 25);
    });
  }, []);

  const removeCustomTrack = useCallback((trackId: string) => {
    setSavedTracks(prev => prev.filter(t => t.id !== trackId));
  }, []);

  const currentPlaylist = trackToPlaylist(currentTrack);
  const progress = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        currentPlaylist,
        isPlaying,
        currentTime,
        duration,
        progress,
        volume,
        isMuted,
        isLooping,
        isShuffle,
        savedTracks,
        isDucked: isPlaying,
        playbackEngine,
        setPlaybackEngine,
        isSpotifyConnected,
        spotifyUser,
        isLiveSpotifySync,
        liveSpotifyPlayback,
        availableDevices,
        activeDevice,
        webDeviceId,
        connectSpotify,
        disconnectSpotify,
        toggleLiveSpotifySync,
        refreshSpotifyPlayback,
        refreshDevices,
        transferToDevice,
        controlLiveSpotify,
        playTrack,
        togglePlay,
        pause,
        resume,
        seek,
        nextTrack,
        prevTrack,
        setVolume,
        toggleMute,
        toggleLoop,
        toggleShuffle,
        addCustomTrack,
        removeCustomTrack
      }}
    >
      {/* Root-Level Persistent HTML5 Audio element - Never pauses when switching tabs, routes, or closing modals */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="auto"
        loop={isLooping}
        onTimeUpdate={() => {
          if (audioRef.current && !isNaN(audioRef.current.currentTime)) {
            setCurrentTime(audioRef.current.currentTime);
            if (audioRef.current.duration && isFinite(audioRef.current.duration) && audioRef.current.duration > 0) {
              setDuration(audioRef.current.duration);
            }
          }
        }}
        onEnded={() => {
          if (isLoopingRef.current) {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(() => {});
            }
          } else {
            nextTrack();
          }
        }}
        onError={(e) => {
          console.warn('Audio stream error notice:', e);
        }}
      />
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};


