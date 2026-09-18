import { LyricLine, TrackLyrics, SpotifyTrack } from '../types';

/**
 * Parses standard LRC format strings into structured LyricLine array sorted by time.
 * Supports [mm:ss.xx], [mm:ss.xxx], [m:ss.xx], and multi-timestamp lines [00:10][00:20] text
 */
export function parseLrc(lrcContent: string): LyricLine[] {
  if (!lrcContent) return [];
  const lines = lrcContent.split(/\r?\n/);
  const parsedLines: LyricLine[] = [];

  const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Skip metadata headers like [ti:Title], [ar:Artist], [al:Album], [by:Creator], etc.
    if (/^\[(ti|ar|al|by|offset|length|re|ve):/i.test(trimmed)) {
      continue;
    }

    const matches = Array.from(trimmed.matchAll(timeRegex));
    if (matches.length === 0) continue;

    // Text is whatever comes after all timestamps
    const text = trimmed.replace(timeRegex, '').trim();

    for (const match of matches) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const millisecondsStr = match[3] || '0';
      const fraction = millisecondsStr.length === 3 
        ? parseInt(millisecondsStr, 10) / 1000 
        : parseInt(millisecondsStr.padEnd(2, '0'), 10) / 100;

      const totalTime = minutes * 60 + seconds + fraction;
      parsedLines.push({
        time: parseFloat(totalTime.toFixed(2)),
        text: text || '♪'
      });
    }
  }

  // Sort chronologically
  return parsedLines.sort((a, b) => a.time - b.time);
}

/**
 * Formats plain text lyrics by spacing lines evenly over track duration
 */
export function parsePlainTextLyrics(plainLyrics: string, durationSeconds: number = 180): LyricLine[] {
  if (!plainLyrics) return [];
  const rawLines = plainLyrics
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (rawLines.length === 0) return [];

  const startOffset = 4; // Start 4 seconds into the song
  const playableDuration = Math.max(20, durationSeconds - 12);
  const step = playableDuration / rawLines.length;

  return rawLines.map((line, idx) => ({
    time: parseFloat((startOffset + idx * step).toFixed(2)),
    text: line
  }));
}

// In-memory cache for fast instant retrieval
const lyricsCache = new Map<string, TrackLyrics>();

// Built-in curated synced lyrics for popular catalog study tracks
const CURATED_LRC_DATABASE: Record<string, string> = {
  'blinding lights': `[00:00.00] ♪ Synth intro ♪
[00:13.13] Yeah
[00:16.56] ♪
[00:27.16] I've been tryna call
[00:29.96] I've been on my own for long enough
[00:32.71] Maybe you can show me how to love, maybe
[00:38.29] I'm goin' through withdrawals
[00:41.01] You don't even have to do too much
[00:43.76] You can turn me on with just a touch, baby
[00:49.32] I look around and Sin City's cold and empty
[00:54.67] No one's around to judge me
[00:57.65] I can't see clearly when you're gone
[01:03.22] I said, ooh, I'm blinded by the lights
[01:10.02] No, I can't sleep until I feel your touch
[01:14.65] I said, ooh, I'm drowning in the night
[01:21.05] Oh, when I'm like this, you're the one I trust
[01:28.00] ♪ Upbeat 80s synth riff ♪
[01:36.50] I'm running out of time
[01:39.20] 'Cause I can see the sun light up the sky
[01:42.00] So I hit the road in overdrive, baby
[01:47.70] The city's cold and empty
[01:53.00] No one's around to judge me
[01:56.00] I can't see clearly when you're gone
[02:01.50] I said, ooh, I'm blinded by the lights
[02:08.20] No, I can't sleep until I feel your touch`,

  'starboy': `[00:00.00] ♪ Daft Punk electronic bassline intro ♪
[00:14.50] I'm tryna put you in the worst mood, ah
[00:18.20] P1 cleaner than your church shoes, ah
[00:21.80] Milli point two just to hurt you, ah
[00:25.50] All red Lamb' just to tease you, ah
[00:29.20] None of these toys on lease too, ah
[00:32.80] Made your whole year in a week too, yah
[00:36.50] Main bitch out of your league too, ah
[00:40.00] Side bitch out of your league too, ah
[00:44.20] Look what you've done
[00:47.50] I'm a motherfuckin' starboy
[00:51.50] Look what you've done
[00:54.80] I'm a motherfuckin' starboy
[00:59.00] Every day a nigga try to test me, ah
[01:02.50] Every day a nigga try to end me, ah
[01:06.00] Pull up in that Roadster SV, ah
[01:09.80] Pockets overweight, gettin' hefty, ah`,

  'cardigan': `[00:00.00] ♪ Vintage piano progression ♪
[00:07.50] Vintage tee, brand new phone
[00:11.20] High heels on cobblestones
[00:15.00] When you are young, they assume you know nothing
[00:22.50] Sequin smile, black lipstick
[00:26.20] Sensual politics
[00:30.00] When you are young, they assume you know nothing
[00:36.80] But I knew you
[00:39.50] Dancin' in your Levi's
[00:41.20] Drunk under a streetlight, I
[00:44.50] I knew you
[00:46.80] Hand under my sweatshirt
[00:48.50] Baby, kiss it better, I
[00:52.00] And when I felt like I was an old cardigan
[00:56.50] Under someone's bed
[00:59.20] You put me on and said I was your favorite
[01:06.50] ♪ Soft acoustic interlude ♪
[01:14.00] A friend to all is a friend to none
[01:17.50] Chase two girls, lose the one
[01:21.00] When you are young, they assume you know nothing`,

  'willow': `[00:00.00] ♪ Acoustic fingerpicking intro ♪
[00:08.50] I'm like the water when your ship rolled in that night
[00:13.20] Rough on the surface, but you cut through like a knife
[00:17.50] And if it was an open-shut case
[00:21.80] I never would've known from that look on your face
[00:25.50] Lost in your current like a priceless wine
[00:33.20] The more that you say, the less I know
[00:37.00] Wherever you stray, I follow
[00:40.50] I'm begging for you to take my hand
[00:44.00] Wreck my plans, that's my man
[00:49.00] Life was a willow and it bent right to your wind (oh)
[00:56.80] Head on the pillow, I could smell you on the breeze`,

  'birds of a feather': `[00:00.00] ♪ Indie pop rhythm chords ♪
[00:06.50] I want you to stay
[00:09.50] 'Til I'm in the grave
[00:12.80] 'Til I rot away, dead and buried
[00:16.20] 'Til I'm in the casket you carry
[00:19.50] If you go, I'm goin' too, uh
[00:23.00] 'Cause it was always you, alright
[00:26.50] And if I'm turnin' blue, please don't save me
[00:29.80] Nothin' in this world to distrust
[00:33.00] Birds of a feather, we should stick together, I know
[00:39.50] I said I'd never think I wasn't better alone
[00:46.00] Can't change the weather, might not be forever
[00:51.50] But if it's forever, it's even better`,

  'lovely': `[00:00.00] ♪ Haunting piano chords and cello entrance ♪
[00:12.50] Thought I found a way
[00:18.00] Thought I found a way out (found)
[00:24.00] But you never go away (never go away)
[00:29.80] So I guess I gotta stay now
[00:36.00] Oh, I hope some day I'll make it out of here
[00:42.50] Even if it takes all night or a hundred years
[00:48.50] Need a place to hide, but I can't find one near
[00:54.50] Wanna feel alive, outside I can't fight my fear
[01:00.80] Isn't it lovely, all alone?
[01:07.00] Heart made of glass, my mind of stone
[01:13.20] Tear me to pieces, skin to bone
[01:19.50] Hello, welcome home`,

  'viva la vida': `[00:00.00] ♪ Staccato orchestral string section ♪
[00:14.00] I used to rule the world
[00:17.50] Seas would rise when I gave the word
[00:21.00] Now in the morning I sleep alone
[00:24.80] Sweep the streets I used to own
[00:28.50] ♪ Timpani drum roll ♪
[00:35.50] I used to roll the dice
[00:38.80] Feel the fear in my enemy's eyes
[00:42.50] Listen as the crowd would sing
[00:46.20] "Now the old king is dead, long live the king"
[00:50.00] One minute I held the key
[00:53.50] Next the walls were closed on me
[00:57.00] And I discovered that my castles stand
[01:00.50] Upon pillars of salt and pillars of sand
[01:04.20] I hear Jerusalem bells a-ringin'
[01:08.00] Roman Cavalry choirs are singin'`,

  'yellow': `[00:00.00] ♪ Bright acoustic guitar strumming intro ♪
[00:16.00] Look at the stars
[00:19.80] Look how they shine for you
[00:24.20] And everything you do
[00:29.00] Yeah, they were all yellow
[00:34.00] I came along
[00:37.50] I wrote a song for you
[00:42.00] And all the things you do
[00:46.50] And it was called "Yellow"
[00:51.50] So then I took my turn
[00:55.20] Oh what a thing to have done
[01:00.00] And it was all yellow
[01:08.50] Your skin, oh yeah, your skin and bones
[01:14.50] Turn into something beautiful`,

  'fix you': `[00:00.00] ♪ Ambient organ chords ♪
[00:13.50] When you try your best, but you don't succeed
[00:20.50] When you get what you want, but not what you need
[00:27.50] When you feel so tired, but you can't sleep
[00:34.00] Stuck in reverse
[00:41.00] And the tears come streaming down your face
[00:47.80] When you lose something you can't replace
[00:54.50] When you love someone, but it goes to waste
[01:01.00] Could it be worse?
[01:08.50] Lights will guide you home
[01:15.50] And ignite your bones
[01:22.00] And I will try to fix you`
};

/**
 * Curated instrumental and classical track soundscape journeys.
 * These provide timed focus thoughts and movement indicators that sync with the music.
 */
function generateInstrumentalFocusLyrics(track: SpotifyTrack): TrackLyrics {
  const isClassical = track.genre === 'classical' || /chopin|debussy|satie|bach|beethoven|einaudi|zimmer/i.test(track.artist + ' ' + track.title);
  const isLofi = track.genre === 'lofi' || /lo-fi|lofi|chill|coffee|rain/i.test(track.title);

  let lines: LyricLine[] = [];

  if (/clair de lune/i.test(track.title)) {
    lines = [
      { time: 0.0, text: '♪ Gentle arpeggios open the sanctuary space ♪' },
      { time: 14.0, text: '♪ The primary D-flat major melody descends like moonlight ♪' },
      { time: 28.0, text: 'Take a deep diaphragm breath in... hold for 4 seconds...' },
      { time: 42.0, text: '♪ Left-hand harmonies ripple through the lower register ♪' },
      { time: 58.0, text: '♪ Tempo gently sways with rubato phrasing ♪' },
      { time: 75.0, text: 'Allow all background distractions to fade away' },
      { time: 92.0, text: '♪ The central movement unfolds into rich flowing chords ♪' },
      { time: 110.0, text: 'Deep focus active • Let your thoughts align with your study goals' },
      { time: 130.0, text: '♪ Delicate high-octave cadenza sparkles like evening stars ♪' },
      { time: 155.0, text: '♪ The soothing opening motif returns in tranquil whisper ♪' },
      { time: 180.0, text: '♪ Final serene chord resonates into absolute peace ♪' }
    ];
  } else if (/gymnop/i.test(track.title)) {
    lines = [
      { time: 0.0, text: '♪ Satie’s iconic alternating bass chords establish the calm pulse ♪' },
      { time: 12.0, text: '♪ The melancholy Greek modal melody begins its slow dance ♪' },
      { time: 25.0, text: 'Focus on one line of thought at a time' },
      { time: 40.0, text: '♪ Major seventh intervals suspend time in the room ♪' },
      { time: 58.0, text: 'Inhale clarity... exhale academic tension...' },
      { time: 76.0, text: '♪ The phrase repeats with subtle harmonic nuance ♪' },
      { time: 98.0, text: 'Uninterrupted mental momentum' },
      { time: 120.0, text: '♪ Lingering chords bring the mind back to center ♪' }
    ];
  } else if (/nocturne/i.test(track.title)) {
    lines = [
      { time: 0.0, text: '♪ Chopin’s sweet E-flat major theme opens with warmth ♪' },
      { time: 15.0, text: '♪ Grace notes and ornamentations glide across the keyboard ♪' },
      { time: 30.0, text: 'Your concentration deepens with every measure' },
      { time: 48.0, text: '♪ The passionate crescendo rises into higher octaves ♪' },
      { time: 68.0, text: 'Stay immersed in your subject material' },
      { time: 90.0, text: '♪ Gentle trills and chromatic flourishes cascade like rain ♪' },
      { time: 115.0, text: '♪ A peaceful cadenza closes the passage into stillness ♪' }
    ];
  } else if (/experience/i.test(track.title)) {
    lines = [
      { time: 0.0, text: '♪ Einaudi’s minimalist piano loop begins quietly ♪' },
      { time: 20.0, text: '♪ Subtle cello and violin textures join beneath the piano ♪' },
      { time: 45.0, text: 'Energy builds • Enter your peak analytical state' },
      { time: 70.0, text: '♪ Cascading string arpeggios pulse with unstoppable drive ♪' },
      { time: 95.0, text: 'Full flow state unlocked' },
      { time: 125.0, text: '♪ The grand symphonic peak surges with motivation ♪' },
      { time: 160.0, text: '♪ Music decrescendos back to the intimate solo piano ♪' }
    ];
  } else if (/time|interstellar|cornfield/i.test(track.title)) {
    lines = [
      { time: 0.0, text: '♪ Hans Zimmer’s iconic 4-chord progression enters quietly ♪' },
      { time: 18.0, text: '♪ Strings swell slowly from beneath the piano pulse ♪' },
      { time: 40.0, text: 'Time expands when you focus with complete intention' },
      { time: 65.0, text: '♪ Horns and rhythmic synthesizers add epic depth ♪' },
      { time: 90.0, text: 'Every minute of study is compounded mastery' },
      { time: 120.0, text: '♪ Full brass and percussion reach heroic intensity ♪' },
      { time: 150.0, text: '♪ The sound gently recedes back to solo keys ♪' }
    ];
  } else if (isLofi) {
    lines = [
      { time: 0.0, text: '♪ Warm vinyl crackle and mellow electric piano chords ♪' },
      { time: 12.0, text: '♪ Boom-bap kick and snare drum groove kicks in ♪' },
      { time: 24.0, text: 'Cozy study sanctuary • Sip some tea, stay steady' },
      { time: 42.0, text: '♪ Relaxed bassline and gentle jazz saxophone textures ♪' },
      { time: 65.0, text: 'Deep work zone: No hurry, no pauses, just flow' },
      { time: 88.0, text: '♪ Distant coffee shop chatter and rain against the glass ♪' },
      { time: 115.0, text: 'Keep writing, solving, and reading' },
      { time: 145.0, text: '♪ Tape-stop effect and rhythmic beat loop repeats ♪' }
    ];
  } else if (isClassical) {
    lines = [
      { time: 0.0, text: '♪ Orchestral prelude sets the contemplative mood ♪' },
      { time: 18.0, text: '♪ Elegant harmonic progression develops smoothly ♪' },
      { time: 40.0, text: 'Clear your mind of all extraneous tasks' },
      { time: 65.0, text: '♪ Dynamic contrast enhances intellectual alertness ♪' },
      { time: 95.0, text: 'Steady focus sustained throughout the study block' },
      { time: 130.0, text: '♪ Harmonious counterpoint resolves in perfect cadence ♪' }
    ];
  } else {
    lines = [
      { time: 0.0, text: '♪ Instrumental study ambience plays ♪' },
      { time: 15.0, text: '♪ Harmonically tuned frequencies to induce alpha focus ♪' },
      { time: 35.0, text: 'Deep breathing: Inhale for 4 seconds, exhale for 6 seconds' },
      { time: 60.0, text: 'Maintain steady momentum across your study objectives' },
      { time: 90.0, text: '♪ Rhythmic soundscape deepens your cognitive retention ♪' },
      { time: 125.0, text: 'Great focus today • You are mastering this material' },
      { time: 160.0, text: '♪ Flowing background resonance continues smoothly ♪' }
    ];
  }

  return {
    trackId: track.id,
    title: track.title,
    artist: track.artist,
    lines,
    isSynced: true,
    isInstrumental: true,
    source: 'instrumental'
  };
}

/**
 * Cleans track titles (removes (Remastered), - 2020 Remaster, [Feat. ...], etc.)
 * to maximize match rate on lyrics APIs
 */
function cleanTrackTitle(title: string): string {
  return title
    .replace(/\s*[\(\[](?:feat|ft|with|prod|remaster|live|official|audio|deluxe|version).*?[\)\]]/gi, '')
    .replace(/\s*-\s*(?:remastered|live|deluxe|version|radio edit).*$/gi, '')
    .trim();
}

/**
 * Cleans artist name (takes primary artist)
 */
function cleanArtistName(artist: string): string {
  return artist
    .split(/[,&/]|ft\.|feat\./i)[0]
    .trim();
}

/**
 * Main function to fetch real-time synchronized lyrics for any track:
 * 1. Checks memory cache
 * 2. Checks built-in curated LRC database
 * 3. Fetches from free public LRCLIB API
 * 4. Falls back to plain lyrics parsed with rhythmic timing, or instrumental guide
 */
export async function getTrackLyrics(track: SpotifyTrack): Promise<TrackLyrics> {
  const cacheKey = `${track.title}___${track.artist}`.toLowerCase().trim();
  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey)!;
  }

  const cleanTitle = cleanTrackTitle(track.title);
  const cleanArtist = cleanArtistName(track.artist);
  const simpleKey = cleanTitle.toLowerCase();

  // 1. Check built-in curated catalog
  for (const [key, lrc] of Object.entries(CURATED_LRC_DATABASE)) {
    if (simpleKey.includes(key) || key.includes(simpleKey)) {
      const result: TrackLyrics = {
        trackId: track.id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        lines: parseLrc(lrc),
        isSynced: true,
        source: 'curated'
      };
      lyricsCache.set(cacheKey, result);
      return result;
    }
  }

  // 2. Try fetching from LRCLIB.net public API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500); // 4.5s max

    // Attempt direct get
    const getUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}`;
    const response = await fetch(getUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'StudySanctuaryApp/1.0'
      }
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.syncedLyrics) {
        const parsed = parseLrc(data.syncedLyrics);
        if (parsed.length > 0) {
          const result: TrackLyrics = {
            trackId: track.id,
            title: data.trackName || track.title,
            artist: data.artistName || track.artist,
            album: data.albumName || track.album,
            duration: data.duration,
            lines: parsed,
            isSynced: true,
            source: 'lrclib'
          };
          lyricsCache.set(cacheKey, result);
          return result;
        }
      }

      if (data.plainLyrics) {
        const plainParsed = parsePlainTextLyrics(data.plainLyrics, data.duration || 180);
        if (plainParsed.length > 0) {
          const result: TrackLyrics = {
            trackId: track.id,
            title: data.trackName || track.title,
            artist: data.artistName || track.artist,
            album: data.albumName || track.album,
            duration: data.duration,
            lines: plainParsed,
            isSynced: true,
            source: 'lrclib'
          };
          lyricsCache.set(cacheKey, result);
          return result;
        }
      }

      if (data.instrumental) {
        const result = generateInstrumentalFocusLyrics(track);
        lyricsCache.set(cacheKey, result);
        return result;
      }
    } else if (response.status === 404) {
      // Try search endpoint
      const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanTitle + ' ' + cleanArtist)}`;
      const searchRes = await fetch(searchUrl, {
        headers: { 'User-Agent': 'StudySanctuaryApp/1.0' }
      });
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (Array.isArray(searchData) && searchData.length > 0) {
          // Find first with syncedLyrics
          const matchWithSynced = searchData.find((item: any) => item.syncedLyrics);
          if (matchWithSynced) {
            const parsed = parseLrc(matchWithSynced.syncedLyrics);
            const result: TrackLyrics = {
              trackId: track.id,
              title: matchWithSynced.trackName || track.title,
              artist: matchWithSynced.artistName || track.artist,
              album: matchWithSynced.albumName || track.album,
              duration: matchWithSynced.duration,
              lines: parsed,
              isSynced: true,
              source: 'lrclib'
            };
            lyricsCache.set(cacheKey, result);
            return result;
          }

          const firstWithPlain = searchData.find((item: any) => item.plainLyrics);
          if (firstWithPlain) {
            const plainParsed = parsePlainTextLyrics(firstWithPlain.plainLyrics, firstWithPlain.duration || 180);
            const result: TrackLyrics = {
              trackId: track.id,
              title: firstWithPlain.trackName || track.title,
              artist: firstWithPlain.artistName || track.artist,
              album: firstWithPlain.albumName || track.album,
              duration: firstWithPlain.duration,
              lines: plainParsed,
              isSynced: true,
              source: 'lrclib'
            };
            lyricsCache.set(cacheKey, result);
            return result;
          }
        }
      }
    }
  } catch (err) {
    // Network or timeout failure, smoothly fall through to instrumental/guide
  }

  // 3. Fallback: Instrumental study guide & timed affirmations
  const fallbackResult = generateInstrumentalFocusLyrics(track);
  lyricsCache.set(cacheKey, fallbackResult);
  return fallbackResult;
}
