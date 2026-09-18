import { Course, StudyDocument, Flashcard, Quiz, ScheduleEvent, TaskItem, AIStrategy, SpotifyPlaylist, StudyTechniqueSet } from '../types';

// Zero mock courses until user explicitly adds them
export const INITIAL_COURSES: Course[] = [];

// Zero mock documents
export const INITIAL_DOCUMENTS: StudyDocument[] = [];

// Zero mock tasks - completely clean state as requested
export const INITIAL_TASKS: TaskItem[] = [];

export const INITIAL_SCHEDULE_EVENTS: ScheduleEvent[] = [];
export const INITIAL_FLASHCARDS: Flashcard[] = [];
export const INITIAL_QUIZZES: Quiz[] = [];
export const INITIAL_STRATEGIES: Record<string, AIStrategy> = {};
export const INITIAL_TECHNIQUES: Record<string, StudyTechniqueSet> = {};

export const COZY_STUDY_PLAYLISTS: SpotifyPlaylist[] = [
  {
    id: 'playlist-cozy-lofi',
    name: 'Espresso Bar Lo-fi • Warm Beats',
    description: 'Gentle vinyl crackles, soft Rhodes chords, and warm relaxing tempo for peaceful coffeehouse study.',
    coverUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&q=80',
    spotifyUri: 'spotify:playlist:37i9dQZF1DX8Uebhn9wzrS',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8Uebhn9wzrS?utm_source=generator&theme=0',
    previewAudioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/af/f1/ba/aff1bae9-0e2f-71b0-4a46-12ec643d5124/mzaf_6688367876241664405.plus.aac.p.m4a',
    category: 'lofi',
    recommendedMode: 'Best for: Focus Mode & Reading Comprehension',
    bpm: '78 BPM • Warm Chords',
    recommendedFor: 'Deep relaxed comprehension'
  },
  {
    id: 'playlist-rainy-coffee',
    name: 'Rainy Cafe Window • Soft Piano',
    description: 'Soft acoustic piano notes blended with gentle window rainfall and quiet coffee-shop warmth.',
    coverUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&q=80',
    spotifyUri: 'spotify:playlist:37i9dQZF1DX4sWSpwq3LiO',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator&theme=0',
    previewAudioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/5d/e8/db/5de8db2a-16e9-9952-1e92-72c8bd66c466/mzaf_12453809584145821574.plus.aac.p.m4a',
    category: 'ambient',
    recommendedMode: 'Best for: Rainy & Stormy Themes',
    bpm: '65 BPM • Acoustic Piano',
    recommendedFor: 'Calm writing and reflection'
  },
  {
    id: 'playlist-alpha-binaural',
    name: '10Hz Alpha Waves • Deep Retention',
    description: 'Soft isochronic frequencies designed for neural memory consolidation and effortless flow.',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80',
    spotifyUri: 'spotify:playlist:37i9dQZF1DX9uKNf5jGX6m',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX9uKNf5jGX6m?utm_source=generator&theme=0',
    previewAudioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/43/db/e8/43dbe8d9-eede-d066-4d44-5fce31130640/mzaf_15409472201423475078.plus.aac.p.m4a',
    category: 'binaural',
    recommendedMode: 'Best for: Active Recall & Spaced Repetition Drills',
    bpm: 'Isochronic 10Hz • Brainwave Sync',
    recommendedFor: 'Active recall & memory retention'
  },
  {
    id: 'playlist-classical-mind',
    name: 'Dark Academia Classical • Solo Cello & Keys',
    description: 'Delicate Chopin nocturnes and Bach preludes played with soft touch for quiet concentration.',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
    spotifyUri: 'spotify:playlist:37i9dQZF1DWZeKCadgRdKQ',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0',
    previewAudioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/fc/d5/f7/fcd5f7e1-b54a-dd62-9dc8-9f74da7bb318/mzaf_7518605195752636166.plus.aac.p.m4a',
    category: 'classical',
    recommendedMode: 'Best for: Logic derivation, math equations, and Mind Maps',
    bpm: 'Classical Solo • Strings & Piano',
    recommendedFor: 'Analytical focus & deep reading'
  },
  {
    id: 'playlist-cafe-jazz',
    name: 'Parisian Coffeehouse Jazz • Upbeat Flow',
    description: 'Gentle gypsy jazz guitars, soft brushes, and warm cafe ambiance for an energizing study session.',
    coverUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500&q=80',
    spotifyUri: 'spotify:playlist:37i9dQZF1DXbITWG1ZJKYt',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXbITWG1ZJKYt?utm_source=generator&theme=0',
    previewAudioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ad/a8/35/ada83596-5e76-e480-def6-b882ca10bfcb/mzaf_9038352204269951733.plus.aac.p.m4a',
    category: 'synthwave',
    recommendedMode: 'Best for: Fun Mode & Brainstorming',
    bpm: '92 BPM • Acoustic Swing',
    recommendedFor: 'Creative synthesis & brainstorming'
  },
  {
    id: 'playlist-late-synth',
    name: 'Midnight Mocha Synth • Chillwave Focus',
    description: 'Warm analog synthesizers, tape hiss, and mellow low-fi pulses for night owl students.',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80',
    spotifyUri: 'spotify:playlist:37i9dQZF1DXdLEN7aqioXM',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator&theme=0',
    previewAudioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/47/d0/32/47d0326f-0757-4400-6532-caf37f69feb2/mzaf_7480432866230687091.plus.aac.p.m4a',
    category: 'synthwave',
    recommendedMode: 'Best for: Night owl deep coding & problem sets',
    bpm: '82 BPM • Tape Synth',
    recommendedFor: 'Late night coding & problem sets'
  }
];

export const initialCourses = INITIAL_COURSES;
export const initialDocuments = INITIAL_DOCUMENTS;
export const initialTasks = INITIAL_TASKS;
export const initialScheduleEvents = INITIAL_SCHEDULE_EVENTS;
export const initialFlashcards = INITIAL_FLASHCARDS;
export const initialQuizzes = INITIAL_QUIZZES;
export const initialStrategies = INITIAL_STRATEGIES;
export const initialTechniques = INITIAL_TECHNIQUES;
export const initialPlaylists = COZY_STUDY_PLAYLISTS;
export const FOCUS_PLAYLISTS = COZY_STUDY_PLAYLISTS;
