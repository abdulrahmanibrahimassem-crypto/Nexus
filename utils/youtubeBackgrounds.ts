import { ThemeMode } from '../types';

export interface ThemeVideoSettings {
  enabled: boolean;
  videoId: string;
  customUrl: string;
  title: string;
  opacity: number; // 0.15 to 1.0 (default: 0.85)
  muteAudio: boolean; // default: true
  volume: number; // 0 to 100
  showOverlays: boolean; // overlay rain/window/particles on top of video (default: true)
}

export type ThemeVideoMap = Partial<Record<ThemeMode, ThemeVideoSettings>>;

// Default curated YouTube background videos per theme.
// User requested: 
// - https://youtu.be/0L38Z9hIi5s?si=Du1bMGer7AuAs1Uu for Rainy Cafe
// - https://youtu.be/4jZanmJJBds?si=3KIJfPE5qIv8dFoD for Stormy Night (Forest theme only)
// - https://youtu.be/zuIa75-EWCM?si=iaauy8XIw6RFPbLv for Stormy Night (Desert theme only)
// - https://youtu.be/UDTmUzu05BE?si=DZRQ4Dsxp0DNXWsq&t=120 for Pure Focus mood only
// - https://youtu.be/RxOqxyJwRIY?si=PqtutJI5b9XEPb8d for Playful Vibe mood only
// - https://youtu.be/6GxNJlmzqz4?si=cYhBeRvZKgrs-1mx for Zen Garden mood only
// - https://youtu.be/pwuFTsvJL34?si=Qxm0QQrjSXBUG8tN for Neon City mood only
// - https://youtu.be/SL2OFuERpKI?si=lAhgAmicDJjUYVdL for Cosmic Void mood only
// - https://youtu.be/wra4tQS3fXk?si=rojADUORHCdYgKQ6 for Cozy Library mood only
// - https://youtu.be/tDKzkgyCNZw?si=WWLLLWikw6M3HGhf for Ocean Tide mood only
// - https://www.youtube.com/live/5L0_Un1JpPU?si=iPcTc9bJupC5juuP for Autumn Cafe mood only
// - https://youtu.be/QnyZjxz7Tis?si=EmoWC2yfv3qQSc2h&t=60 for Late Night Train Journey mood only
// - https://www.youtube.com/live/4ApMS8qYWo0?si=eB94SqGNlpFDeK2w for Cozy Fireplace & Lo-Fi mood only
// - https://youtu.be/XWKcohg3_XY?si=0-WePaXY8VRPnTUd for Deep Space Observatory mood only
// - https://youtu.be/YUy3R249Vjk?si=T2Qgf6Y21r5DqWvt for Vintage Vinyl Jazz Cafe mood only
// - https://youtu.be/W5kw1hSN4ig?si=AreT50Sninjgy4F1 for Starlit Desert Night mood only
// - https://youtu.be/zZkjkzGNUF4?si=NVwfujH3Fmaaxy4o for Express Train mood only
// - https://youtu.be/ih4_1FyVjaY?si=L5HkkrEPZe93s9DM for Rainforest mood only
// - https://youtu.be/SRxf7QCzZuA?si=duumsRRJpIdMTUGU for Alpine Cabin mood only
// - https://youtu.be/0MTkODK1hzg?si=OGBAVioome2k3U1A for Wizard Sanctum mood only
// - https://youtu.be/xoam1ReST6U?si=JkK9ubSNF8QDRVhN&t=60 for Desert Camp mood only
// - https://youtu.be/Q5ymPoZZhUg?si=KYwURsRSIr3kIhPV for Desert Camp mood only
// - https://youtu.be/DEmQnIfnlgE?si=r7yGOMym35zAgj16 for Rainy Courtyard mood only
// - https://youtu.be/KmJ6BCzS-jY?si=_LlRh3_Cdbf604qc for Bamboo Forest mood only
// - https://youtu.be/Hqmv9XNHmjo?si=PDEmq3FhBO8C6LMs for Coding Lab mood only
// - https://youtu.be/5I7l6v7t1uw?si=a_LKtxoxz7nSycaz for greenhouse mood only
// - https://youtu.be/FJY2Mn4vu_M?si=FzhWE5I1KYn_CEM7 for tokyo snow mood only
// - https://youtu.be/TeO374JpPWk?si=oKdu0aZ0yqWLCmh5 for mountain waterfall mood only
// - https://www.youtube.com/live/eD1lvvjEL_0?si=ydJoO-y3aQPMAQNF for bookstore attic mood only
// - https://youtu.be/HRXzo2Qm8eQ?si=MoGlN3rqLmfVyEWT for aurora arctic mood only
// - https://youtu.be/dyP5geGal-I?si=dBjtuzlINeYOMQ5C for desert observatory mood only
// - https://youtu.be/nvUIukUIOuI?si=Et8Ms-uTboUL23Qc for observatory dome mood only
// - https://www.youtube.com/live/u-0fcXjsVA0?si=rlnxG9ah_HgAQHz6 for parisian balcony mood only
// - https://youtu.be/W0u-7lgWXpw?si=eKRhV8Yd1fFDOFAq for deep sea sanctuary mood only
// - https://youtu.be/CruGng16MAA?si=J2uOWkJ_x35Mk-mp for egyptian temple mood only
// - https://youtu.be/nuD5E1JFqHE?si=7UDY3rk-55nbRArQ for cyberpunk neon loft mood only
// - https://youtu.be/dBEqWbIdhZM?si=AKJ9PCtOqEHAIPhY for victorian storm mood only
// - https://youtu.be/YN6wj5NfOnM?si=aAsHP9T_E8HJHac4 for zen stone garden mood only
// - https://youtu.be/Um4JdxvT3Ho?si=WNWbksKkBCV6wIiW for lunar base mood only
export const DEFAULT_THEME_VIDEOS: Record<ThemeMode, { videoId: string; title: string; defaultOpacity: number }> = {
  rainy: {
    videoId: '0L38Z9hIi5s',
    title: 'Rainy Cafe Window & Ambient Street',
    defaultOpacity: 0.88,
  },
  stormy: {
    videoId: '4jZanmJJBds',
    title: 'Dark Stormy Night in Deep Forest & Thunder',
    defaultOpacity: 0.85,
  },
  victorian_storm: {
    videoId: 'dBEqWbIdhZM',
    title: 'Victorian Gothic Library Storm & Heavy Rain Ambience',
    defaultOpacity: 0.85,
  },
  cozy_fireplace: {
    videoId: '4ApMS8qYWo0',
    title: 'Cozy Fireplace & Lo-Fi Relaxing Beats',
    defaultOpacity: 0.85,
  },
  cozy_fireplace_lofi: {
    videoId: '4ApMS8qYWo0',
    title: 'Cozy Fireplace & Lo-Fi Relaxing Beats',
    defaultOpacity: 0.85,
  },
  late_night_train: {
    videoId: 'QnyZjxz7Tis',
    title: 'Late Night Train Journey Relaxing Ambience',
    defaultOpacity: 0.85,
  },
  train: {
    videoId: 'zZkjkzGNUF4',
    title: 'Express Train Scenic Journey Ambience',
    defaultOpacity: 0.85,
  },
  library: {
    videoId: 'wra4tQS3fXk',
    title: 'Cozy Antique Library & Rain Ambience',
    defaultOpacity: 0.85,
  },
  bookstore: {
    videoId: 'eD1lvvjEL_0',
    title: 'Vintage Bookstore Attic Live Ambience',
    defaultOpacity: 0.85,
  },
  deep_space_observatory: {
    videoId: 'XWKcohg3_XY',
    title: 'Deep Space Observatory Stargazing & Nebula',
    defaultOpacity: 0.80,
  },
  space: {
    videoId: 'SL2OFuERpKI',
    title: 'Cosmic Void Nebula & Stellar Drift',
    defaultOpacity: 0.80,
  },
  midnight_dome: {
    videoId: 'nvUIukUIOuI',
    title: 'Observatory Dome Night Sky & Telescope Ambience',
    defaultOpacity: 0.85,
  },
  lunar_base: {
    videoId: 'Um4JdxvT3Ho',
    title: 'Midnight Lunar Base & Earth Horizon Ambience',
    defaultOpacity: 0.85,
  },
  cyberpunk: {
    videoId: 'pwuFTsvJL34',
    title: 'Neon City Cyberpunk Lo-Fi Ambience',
    defaultOpacity: 0.82,
  },
  cyberpunk_loft: {
    videoId: 'nuD5E1JFqHE',
    title: 'Cyberpunk Neon Loft & Rain Ambience',
    defaultOpacity: 0.85,
  },
  coding: {
    videoId: 'Hqmv9XNHmjo',
    title: 'Cyberpunk Matrix Terminal & Coding Lab Ambience',
    defaultOpacity: 0.85,
  },
  tokyo_snow: {
    videoId: 'FJY2Mn4vu_M',
    title: 'Tokyo Snow Izakaya Lantern Alley Ambience',
    defaultOpacity: 0.85,
  },
  ocean: {
    videoId: 'tDKzkgyCNZw',
    title: 'Ocean Tide Shoreline Waves Ambience',
    defaultOpacity: 0.85,
  },
  deep_sea: {
    videoId: 'W0u-7lgWXpw',
    title: 'Deep Sea Abyssal Sanctuary & Bioluminescent Ambience',
    defaultOpacity: 0.85,
  },
  autumn: {
    videoId: '5L0_Un1JpPU',
    title: 'Cozy Autumn Coffee Shop & Drifting Leaves Ambience',
    defaultOpacity: 0.85,
  },
  whispering_pine: {
    videoId: 'vPhg6sc1Mk4',
    title: 'Pine Forest Mist & Rain Canopy',
    defaultOpacity: 0.85,
  },
  rainforest: {
    videoId: 'ih4_1FyVjaY',
    title: 'Lush Tropical Rainforest & Gentle Rain',
    defaultOpacity: 0.85,
  },
  zen: {
    videoId: '6GxNJlmzqz4',
    title: 'Zen Garden Japanese Aesthetic Ambience',
    defaultOpacity: 0.85,
  },
  bamboo: {
    videoId: 'KmJ6BCzS-jY',
    title: 'Kyoto Bamboo Forest Grove & Serene Zen Ambience',
    defaultOpacity: 0.85,
  },
  zen_stone: {
    videoId: 'YN6wj5NfOnM',
    title: 'Zen Stone Garden & Peaceful Water Fountain Ambience',
    defaultOpacity: 0.85,
  },
  paris_balcony: {
    videoId: 'u-0fcXjsVA0',
    title: 'Parisian Balcony Sunset Live Rain Ambience',
    defaultOpacity: 0.85,
  },
  greenhouse: {
    videoId: '5I7l6v7t1uw',
    title: 'Botanical Glass Greenhouse & Soft Rain Ambience',
    defaultOpacity: 0.85,
  },
  blizzard: {
    videoId: 'SRxf7QCzZuA',
    title: 'Alpine Cabin Blizzard & Warm Fireplace Ambience',
    defaultOpacity: 0.85,
  },
  focus: {
    videoId: 'UDTmUzu05BE',
    title: 'Pure Focus Calm Minimal Study Ambience',
    defaultOpacity: 0.85,
  },
  fun: {
    videoId: 'RxOqxyJwRIY',
    title: 'Playful Vibe Joyful Aesthetic Ambience',
    defaultOpacity: 0.85,
  },
  vintage_vinyl_jazz: {
    videoId: 'YUy3R249Vjk',
    title: 'Vintage Vinyl Jazz Cafe Relaxing Ambience',
    defaultOpacity: 0.85,
  },
  vinyl: {
    videoId: 'iUyeugHBZaI',
    title: 'Vinyl Lounge Vintage Turntable & Warm Jazz Ambience',
    defaultOpacity: 0.85,
  },
  hogwarts: {
    videoId: 'DEmQnIfnlgE',
    title: 'Rainy Courtyard Medieval Stone Cloister Ambience',
    defaultOpacity: 0.85,
  },
  waterfall: {
    videoId: 'TeO374JpPWk',
    title: 'Mountain Waterfall Stream & Alpine Ambience',
    defaultOpacity: 0.85,
  },
  aurora: {
    videoId: 'HRXzo2Qm8eQ',
    title: 'Dancing Northern Lights Arctic Sky Ambience',
    defaultOpacity: 0.85,
  },
  desert: {
    videoId: 'Q5ymPoZZhUg',
    title: 'Desert Camp Night Dunes & Starfield Ambience',
    defaultOpacity: 0.85,
  },
  starlit_desert: {
    videoId: 'dyP5geGal-I',
    title: 'Desert Observatory Stargazing & Starlight Ambience',
    defaultOpacity: 0.85,
  },
  starlit_desert_night: {
    videoId: 'dyP5geGal-I',
    title: 'Desert Observatory Stargazing & Starlight Ambience',
    defaultOpacity: 0.85,
  },
  wizard: {
    videoId: '0MTkODK1hzg',
    title: 'Wizard Sanctum Arcane Study & Ancient Magic Ambience',
    defaultOpacity: 0.85,
  },
  egyptian_temple: {
    videoId: 'CruGng16MAA',
    title: 'Ancient Egyptian Temple Chamber & Torchlight Ambience',
    defaultOpacity: 0.85,
  },
};

export const CURATED_PRESETS: Array<{
  theme: ThemeMode;
  themeName: string;
  videoId: string;
  url: string;
  title: string;
  description: string;
}> = [
  {
    theme: 'rainy',
    themeName: 'Rainy Cafe Haven',
    videoId: '0L38Z9hIi5s',
    url: 'https://youtu.be/0L38Z9hIi5s?si=Du1bMGer7AuAs1Uu',
    title: 'Rainy Cafe & Cozy Street Ambience',
    description: 'Cozy coffee shop window overlooking rain-soaked streets with warm interior lighting.',
  },
  {
    theme: 'stormy',
    themeName: 'Stormy Night Forest',
    videoId: '4jZanmJJBds',
    url: 'https://youtu.be/4jZanmJJBds?si=3KIJfPE5qIv8dFoD',
    title: 'Dark Stormy Night in Deep Forest & Thunder',
    description: 'Torrential downpour across a nocturnal evergreen forest canopy with rolling lightning and thunder.',
  },
  {
    theme: 'desert',
    themeName: 'Desert Camp',
    videoId: 'Q5ymPoZZhUg',
    url: 'https://youtu.be/Q5ymPoZZhUg?si=KYwURsRSIr3kIhPV',
    title: 'Desert Camp Night Dunes & Starfield Ambience',
    description: 'Stargazing open-air desert night camp with warm glowing lantern light, sweeping sand dunes, and tranquil serenity.',
  },
  {
    theme: 'focus',
    themeName: 'Pure Focus Zen Haven',
    videoId: 'UDTmUzu05BE',
    url: 'https://youtu.be/UDTmUzu05BE?si=DZRQ4Dsxp0DNXWsq&t=120',
    title: 'Pure Focus Calm Minimal Study Ambience',
    description: 'Tranquil minimalist focus environment with harmonic flow and deep alpha wave resonance.',
  },
  {
    theme: 'fun',
    themeName: 'Playful Vibe Joyful Garden',
    videoId: 'RxOqxyJwRIY',
    url: 'https://youtu.be/RxOqxyJwRIY?si=PqtutJI5b9XEPb8d',
    title: 'Playful Vibe Joyful Aesthetic Ambience',
    description: 'Vibrant, joyful study ambience with playful upbeat energy and aesthetic sunshine.',
  },
  {
    theme: 'zen',
    themeName: 'Zen Garden Sanctuary',
    videoId: '6GxNJlmzqz4',
    url: 'https://youtu.be/6GxNJlmzqz4?si=cYhBeRvZKgrs-1mx',
    title: 'Zen Garden Japanese Aesthetic Ambience',
    description: 'Tranquil Japanese Zen garden with meditative bamboo water trickle, stones, and calming aesthetic atmosphere.',
  },
  {
    theme: 'bamboo',
    themeName: 'Bamboo Forest',
    videoId: 'KmJ6BCzS-jY',
    url: 'https://youtu.be/KmJ6BCzS-jY?si=_LlRh3_Cdbf604qc',
    title: 'Kyoto Bamboo Forest Grove & Serene Zen Ambience',
    description: 'Slender green bamboo stalks rustling in gentle breezes, filtered emerald sunlight, and peaceful Arashiyama sanctuary calm.',
  },
  {
    theme: 'cozy_fireplace_lofi',
    themeName: 'Cozy Fireplace & Lo-Fi',
    videoId: '4ApMS8qYWo0',
    url: 'https://www.youtube.com/live/4ApMS8qYWo0?si=eB94SqGNlpFDeK2w',
    title: 'Cozy Fireplace & Lo-Fi Relaxing Beats',
    description: 'Warm crackling fireplace embers, gentle hearth glow, and smooth aesthetic lo-fi study beats.',
  },
  {
    theme: 'library',
    themeName: 'Cozy Library Sanctuary',
    videoId: 'wra4tQS3fXk',
    url: 'https://youtu.be/wra4tQS3fXk?si=rojADUORHCdYgKQ6',
    title: 'Cozy Antique Library & Rain Ambience',
    description: 'Warm historic wooden library shelves, gentle desk lamps, and quiet studious rainy solitude.',
  },
  {
    theme: 'late_night_train',
    themeName: 'Late Night Train Journey',
    videoId: 'QnyZjxz7Tis',
    url: 'https://youtu.be/QnyZjxz7Tis?si=EmoWC2yfv3qQSc2h&t=60',
    title: 'Late Night Train Journey Relaxing Ambience',
    description: 'Rhythmic rail motion, quiet midnight train cabin window, passing lights, and peaceful travel atmosphere.',
  },
  {
    theme: 'cyberpunk',
    themeName: 'Neon City Cyberpunk',
    videoId: 'pwuFTsvJL34',
    url: 'https://youtu.be/pwuFTsvJL34?si=Qxm0QQrjSXBUG8tN',
    title: 'Neon City Cyberpunk Lo-Fi Ambience',
    description: 'Futuristic glowing neon cityscape, rainy reflective streets, flying vehicles, and retro synthwave atmosphere.',
  },
  {
    theme: 'space',
    themeName: 'Cosmic Void Sanctuary',
    videoId: 'SL2OFuERpKI',
    url: 'https://youtu.be/SL2OFuERpKI?si=lAhgAmicDJjUYVdL',
    title: 'Cosmic Void Nebula & Stellar Drift',
    description: 'Hypnotic galactic deep void, stellar gaseous drift, and infinite cosmic peace.',
  },
  {
    theme: 'ocean',
    themeName: 'Ocean Tide Sanctuary',
    videoId: 'tDKzkgyCNZw',
    url: 'https://youtu.be/tDKzkgyCNZw?si=WWLLLWikw6M3HGhf',
    title: 'Ocean Tide Shoreline Waves Ambience',
    description: 'Tranquil rhythmic rolling shoreline ocean waves and soothing coastal sea foam ambience.',
  },
  {
    theme: 'autumn',
    themeName: 'Autumn Cafe Terrace',
    videoId: '5L0_Un1JpPU',
    url: 'https://www.youtube.com/live/5L0_Un1JpPU?si=iPcTc9bJupC5juuP',
    title: 'Cozy Autumn Coffee Shop & Drifting Leaves Ambience',
    description: 'Warm maple coffee terrace with falling autumn foliage, gentle coffee murmur, and soft acoustic vibes.',
  },
  {
    theme: 'deep_space_observatory',
    themeName: 'Deep Space Observatory',
    videoId: 'XWKcohg3_XY',
    url: 'https://youtu.be/XWKcohg3_XY?si=0-WePaXY8VRPnTUd',
    title: 'Deep Space Observatory Stargazing & Nebula',
    description: 'Breathtaking deep space telescope view, twinkling starfields, glowing nebulae, and meditative cosmic drift.',
  },
  {
    theme: 'vintage_vinyl_jazz',
    themeName: 'Vintage Vinyl Jazz Cafe',
    videoId: 'YUy3R249Vjk',
    url: 'https://youtu.be/YUy3R249Vjk?si=T2Qgf6Y21r5DqWvt',
    title: 'Vintage Vinyl Jazz Cafe Relaxing Ambience',
    description: 'Warm cafe acoustics, analog vinyl turntable warmth, mellow jazz piano chords, and soothing vintage coffeehouse vibes.',
  },
  {
    theme: 'starlit_desert_night',
    themeName: 'Desert Observatory',
    videoId: 'dyP5geGal-I',
    url: 'https://youtu.be/dyP5geGal-I?si=dBjtuzlINeYOMQ5C',
    title: 'Desert Observatory Stargazing & Starlight Ambience',
    description: 'Serene desert observatory under infinite starlit skies, deep cosmic telescopes, cool desert breeze, and crystalline celestial peace.',
  },
  {
    theme: 'train',
    themeName: 'Express Train',
    videoId: 'zZkjkzGNUF4',
    url: 'https://youtu.be/zZkjkzGNUF4?si=NVwfujH3Fmaaxy4o',
    title: 'Express Train Scenic Journey Ambience',
    description: 'Fast rhythmic tracks, passing countryside views, smooth cabin vibrations, and focused transit flow.',
  },
  {
    theme: 'rainforest',
    themeName: 'Tropical Rainforest',
    videoId: 'ih4_1FyVjaY',
    url: 'https://youtu.be/ih4_1FyVjaY?si=L5HkkrEPZe93s9DM',
    title: 'Lush Tropical Rainforest & Gentle Rain',
    description: 'Emerald green canopy leaves, soothing jungle rainfall, tranquil wildlife echoes, and immersive deep nature serenity.',
  },
  {
    theme: 'blizzard',
    themeName: 'Alpine Cabin',
    videoId: 'SRxf7QCzZuA',
    url: 'https://youtu.be/SRxf7QCzZuA?si=duumsRRJpIdMTUGU',
    title: 'Alpine Cabin Blizzard & Warm Fireplace Ambience',
    description: 'Rustic wooden alpine lodge with howling mountain snowstorms outside, cozy crackling stove warmth, and deep serene focus.',
  },
  {
    theme: 'wizard',
    themeName: 'Wizard Sanctum',
    videoId: '0MTkODK1hzg',
    url: 'https://youtu.be/0MTkODK1hzg?si=OGBAVioome2k3U1A',
    title: 'Wizard Sanctum Arcane Study & Ancient Magic Ambience',
    description: 'Mystical spellcaster sanctuary, glowing rune parchment, crackling alchemy hearth, and deep arcane concentration.',
  },
  {
    theme: 'hogwarts',
    themeName: 'Rainy Courtyard',
    videoId: 'DEmQnIfnlgE',
    url: 'https://youtu.be/DEmQnIfnlgE?si=r7yGOMym35zAgj16',
    title: 'Rainy Courtyard Medieval Stone Cloister Ambience',
    description: 'Historical stone cloister courtyard with heavy medieval rainfall, echoing thunder, and medieval study solitude.',
  },
  {
    theme: 'coding',
    themeName: 'Coding Lab',
    videoId: 'Hqmv9XNHmjo',
    url: 'https://youtu.be/Hqmv9XNHmjo?si=PDEmq3FhBO8C6LMs',
    title: 'Cyberpunk Matrix Terminal & Coding Lab Ambience',
    description: 'Advanced software engineering terminal workspace, matrix code streams, mechanical keyboard clicks, and late night focus.',
  },
  {
    theme: 'greenhouse',
    themeName: 'Greenhouse Sanctuary',
    videoId: '5I7l6v7t1uw',
    url: 'https://youtu.be/5I7l6v7t1uw?si=a_LKtxoxz7nSycaz',
    title: 'Botanical Glass Greenhouse & Soft Rain Ambience',
    description: 'Lush botanical glass greenhouse with rain patter, cascading foliage, dewdrops, and peaceful plant sanctuary study.',
  },
  {
    theme: 'tokyo_snow',
    themeName: 'Tokyo Lantern Alley',
    videoId: 'FJY2Mn4vu_M',
    url: 'https://youtu.be/FJY2Mn4vu_M?si=FzhWE5I1KYn_CEM7',
    title: 'Tokyo Snow Izakaya Lantern Alley Ambience',
    description: 'Soft silent snow drifting onto red lanterns in a nostalgic quiet Tokyo alley.',
  },
  {
    theme: 'waterfall',
    themeName: 'Mountain Waterfall',
    videoId: 'TeO374JpPWk',
    url: 'https://youtu.be/TeO374JpPWk?si=oKdu0aZ0yqWLCmh5',
    title: 'Mountain Waterfall Stream & Alpine Ambience',
    description: 'Deep mountain waterfall with continuous cascading water stream, alpine breeze, and tranquil nature serenity.',
  },
  {
    theme: 'bookstore',
    themeName: 'Vintage Bookstore Attic',
    videoId: 'eD1lvvjEL_0',
    url: 'https://www.youtube.com/live/eD1lvvjEL_0?si=ydJoO-y3aQPMAQNF',
    title: 'Vintage Bookstore Attic Live Ambience',
    description: 'Cozy vintage bookstore attic with antique wooden bookshelves, warm desk-lamp amber light, and peaceful reading solitude.',
  },
  {
    theme: 'aurora',
    themeName: 'Aurora Arctic',
    videoId: 'HRXzo2Qm8eQ',
    url: 'https://youtu.be/HRXzo2Qm8eQ?si=MoGlN3rqLmfVyEWT',
    title: 'Dancing Northern Lights Arctic Sky Ambience',
    description: 'Breathtaking arctic night sky with vibrant green and purple aurora borealis ribbon waves and peaceful polar serenity.',
  },
  {
    theme: 'midnight_dome',
    themeName: 'Observatory Dome',
    videoId: 'nvUIukUIOuI',
    url: 'https://youtu.be/nvUIukUIOuI?si=Et8Ms-uTboUL23Qc',
    title: 'Observatory Dome Night Sky & Telescope Ambience',
    description: 'Midnight astronomical observatory dome overlooking starry night skies, rotating telescope mechanics, and deep cosmic contemplation.',
  },
  {
    theme: 'paris_balcony',
    themeName: 'Parisian Balcony',
    videoId: 'u-0fcXjsVA0',
    url: 'https://www.youtube.com/live/u-0fcXjsVA0?si=rlnxG9ah_HgAQHz6',
    title: 'Parisian Balcony Sunset Live Rain Ambience',
    description: 'Cozy Parisian balcony overlooking sunset city rooftops with gentle evening rain patter and romantic European ambiance.',
  },
  {
    theme: 'deep_sea',
    themeName: 'Deep Sea Sanctuary',
    videoId: 'W0u-7lgWXpw',
    url: 'https://youtu.be/W0u-7lgWXpw?si=eKRhV8Yd1fFDOFAq',
    title: 'Deep Sea Abyssal Sanctuary & Bioluminescent Ambience',
    description: 'Immersive underwater deep sea abyss with glowing bioluminescent marine life, gentle ocean currents, and profound meditative calm.',
  },
  {
    theme: 'egyptian_temple',
    themeName: 'Egyptian Temple',
    videoId: 'CruGng16MAA',
    url: 'https://youtu.be/CruGng16MAA?si=J2uOWkJ_x35Mk-mp',
    title: 'Ancient Egyptian Temple Chamber & Torchlight Ambience',
    description: 'Mystical ancient Egyptian temple sanctuary with warm flickering torchlight, carved hieroglyph columns, and serene historical focus.',
  },
  {
    theme: 'cyberpunk_loft',
    themeName: 'Cyberpunk Neon Loft',
    videoId: 'nuD5E1JFqHE',
    url: 'https://youtu.be/nuD5E1JFqHE?si=7UDY3rk-55nbRArQ',
    title: 'Cyberpunk Neon Loft & Rain Ambience',
    description: 'Futuristic urban cyberpunk loft overlooking neon-drenched rainy city streets with vibrant crimson and cyan glow.',
  },
  {
    theme: 'victorian_storm',
    themeName: 'Victorian Storm',
    videoId: 'dBEqWbIdhZM',
    url: 'https://youtu.be/dBEqWbIdhZM?si=AKJ9PCtOqEHAIPhY',
    title: 'Victorian Gothic Library Storm & Heavy Rain Ambience',
    description: 'Dark antique Victorian study and library with heavy rain against old window panes, distant thunder, and warm desk lamp glow.',
  },
  {
    theme: 'zen_stone',
    themeName: 'Zen Stone Garden',
    videoId: 'YN6wj5NfOnM',
    url: 'https://youtu.be/YN6wj5NfOnM?si=aAsHP9T_E8HJHac4',
    title: 'Zen Stone Garden & Peaceful Water Fountain Ambience',
    description: 'Japanese rock garden at twilight with traditional bamboo water fountain, trickling stone stream, and deep mindfulness calm.',
  },
  {
    theme: 'lunar_base',
    themeName: 'Midnight Lunar Base',
    videoId: 'Um4JdxvT3Ho',
    url: 'https://youtu.be/Um4JdxvT3Ho?si=WNWbksKkBCV6wIiW',
    title: 'Midnight Lunar Base & Earth Horizon Ambience',
    description: 'Futuristic lunar outpost viewing the serene blue Earth rising over the moon horizon with deep cosmic ambient resonance.',
  },
];

const STORAGE_KEY = 'ultimate_pomodoro_youtube_backgrounds_v1';

/**
 * Robustly extracts the YouTube 11-character video ID from any YouTube URL or string.
 * Supports:
 * - youtu.be/0L38Z9hIi5s?si=...
 * - youtube.com/watch?v=0L38Z9hIi5s
 * - youtube.com/embed/0L38Z9hIi5s
 * - youtube.com/shorts/0L38Z9hIi5s
 * - youtube.com/live/0L38Z9hIi5s
 * - Raw 11-character video IDs like 0L38Z9hIi5s
 */
export function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If already a clean 11-character alphanumeric/dash/underscore string
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex covering all standard YouTube link formats
  const regExp = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/;
  const match = trimmed.match(regExp);

  return match && match[1] ? match[1] : null;
}

/**
 * Loads all saved theme video settings from localStorage merged with defaults.
 */
export function loadAllThemeVideos(): ThemeVideoMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};

    const merged: ThemeVideoMap = {};

    // Initialize defaults
    (Object.keys(DEFAULT_THEME_VIDEOS) as ThemeMode[]).forEach((t) => {
      const def = DEFAULT_THEME_VIDEOS[t]!;
      merged[t] = {
        enabled: true,
        videoId: def.videoId,
        customUrl: `https://youtu.be/${def.videoId}`,
        title: def.title,
        opacity: def.defaultOpacity ?? 0.85,
        muteAudio: true,
        volume: 50,
        showOverlays: true,
      };
    });

    // Override with user's saved preferences
    if (typeof parsed === 'object' && parsed !== null) {
      Object.keys(parsed).forEach((k) => {
        const theme = k as ThemeMode;
        if (parsed[theme]) {
          merged[theme] = {
            ...merged[theme],
            ...parsed[theme],
          };
          // Migrate old default stormy video ID to new stormy forest video
          if (theme === 'stormy' && (merged.stormy?.videoId === 'mPZkdNFkNps' || !merged.stormy?.videoId)) {
            merged.stormy.videoId = '4jZanmJJBds';
            merged.stormy.customUrl = 'https://youtu.be/4jZanmJJBds?si=3KIJfPE5qIv8dFoD';
            merged.stormy.title = 'Dark Stormy Night in Deep Forest & Thunder';
          }
          // Migrate old default focus video ID to pure focus video
          if (theme === 'focus' && (merged.focus?.videoId === 'WPni755-Krg' || !merged.focus?.videoId)) {
            merged.focus.videoId = 'UDTmUzu05BE';
            merged.focus.customUrl = 'https://youtu.be/UDTmUzu05BE?si=DZRQ4Dsxp0DNXWsq&t=120';
            merged.focus.title = 'Pure Focus Calm Minimal Study Ambience';
          }
          // Migrate old default fun video ID to playful vibe video
          if (theme === 'fun' && (merged.fun?.videoId === 'jfKfPfyJRdk' || !merged.fun?.videoId)) {
            merged.fun.videoId = 'RxOqxyJwRIY';
            merged.fun.customUrl = 'https://youtu.be/RxOqxyJwRIY?si=PqtutJI5b9XEPb8d';
            merged.fun.title = 'Playful Vibe Joyful Aesthetic Ambience';
          }
          // Migrate old default zen video ID to zen garden video
          if (theme === 'zen' && (merged.zen?.videoId === 'Dx5qF63XZao' || !merged.zen?.videoId)) {
            merged.zen.videoId = '6GxNJlmzqz4';
            merged.zen.customUrl = 'https://youtu.be/6GxNJlmzqz4?si=cYhBeRvZKgrs-1mx';
            merged.zen.title = 'Zen Garden Japanese Aesthetic Ambience';
          }
          // Migrate old default cyberpunk video ID to neon city video
          if (theme === 'cyberpunk' && (merged.cyberpunk?.videoId === 'gl48yN4k92c' || !merged.cyberpunk?.videoId)) {
            merged.cyberpunk.videoId = 'pwuFTsvJL34';
            merged.cyberpunk.customUrl = 'https://youtu.be/pwuFTsvJL34?si=Qxm0QQrjSXBUG8tN';
            merged.cyberpunk.title = 'Neon City Cyberpunk Lo-Fi Ambience';
          }
          // Migrate old default space video ID to cosmic void video
          if (theme === 'space' && (merged.space?.videoId === 'ncsF5d_iF0I' || !merged.space?.videoId)) {
            merged.space.videoId = 'SL2OFuERpKI';
            merged.space.customUrl = 'https://youtu.be/SL2OFuERpKI?si=lAhgAmicDJjUYVdL';
            merged.space.title = 'Cosmic Void Nebula & Stellar Drift';
          }
          // Migrate old default library video ID to cozy library video
          if (theme === 'library' && (merged.library?.videoId === 'CHFif_y2TyM' || !merged.library?.videoId)) {
            merged.library.videoId = 'wra4tQS3fXk';
            merged.library.customUrl = 'https://youtu.be/wra4tQS3fXk?si=rojADUORHCdYgKQ6';
            merged.library.title = 'Cozy Antique Library & Rain Ambience';
          }
          // Migrate old default ocean video ID to ocean tide video
          if (theme === 'ocean' && (merged.ocean?.videoId === 'V-_O7nl0Ii0' || !merged.ocean?.videoId)) {
            merged.ocean.videoId = 'tDKzkgyCNZw';
            merged.ocean.customUrl = 'https://youtu.be/tDKzkgyCNZw?si=WWLLLWikw6M3HGhf';
            merged.ocean.title = 'Ocean Tide Shoreline Waves Ambience';
          }
          // Migrate old default autumn video ID to autumn cafe video
          if (theme === 'autumn' && (merged.autumn?.videoId === 'vPhg6sc1Mk4' || !merged.autumn?.videoId)) {
            merged.autumn.videoId = '5L0_Un1JpPU';
            merged.autumn.customUrl = 'https://www.youtube.com/live/5L0_Un1JpPU?si=iPcTc9bJupC5juuP';
            merged.autumn.title = 'Cozy Autumn Coffee Shop & Drifting Leaves Ambience';
          }
          // Migrate old default late night train video ID to late night train journey video
          if (theme === 'late_night_train' && (merged.late_night_train?.videoId === 'qRTVg8HHzUo' || !merged.late_night_train?.videoId)) {
            merged.late_night_train.videoId = 'QnyZjxz7Tis';
            merged.late_night_train.customUrl = 'https://youtu.be/QnyZjxz7Tis?si=EmoWC2yfv3qQSc2h&t=60';
            merged.late_night_train.title = 'Late Night Train Journey Relaxing Ambience';
          }
          // Migrate old default fireplace / lofi video ID to cozy fireplace & lofi live video
          if ((theme === 'cozy_fireplace' || theme === 'cozy_fireplace_lofi') && (merged[theme]?.videoId === 'L_LUpnjgPso' || !merged[theme]?.videoId)) {
            merged[theme]!.videoId = '4ApMS8qYWo0';
            merged[theme]!.customUrl = 'https://www.youtube.com/live/4ApMS8qYWo0?si=eB94SqGNlpFDeK2w';
            merged[theme]!.title = 'Cozy Fireplace & Lo-Fi Relaxing Beats';
          }
          // Migrate old default deep space observatory video ID to new observatory video
          if (theme === 'deep_space_observatory' && (merged.deep_space_observatory?.videoId === 'ncsF5d_iF0I' || !merged.deep_space_observatory?.videoId)) {
            merged.deep_space_observatory.videoId = 'XWKcohg3_XY';
            merged.deep_space_observatory.customUrl = 'https://youtu.be/XWKcohg3_XY?si=0-WePaXY8VRPnTUd';
            merged.deep_space_observatory.title = 'Deep Space Observatory Stargazing & Nebula';
          }
          // Migrate old default vintage vinyl jazz video ID to new vinyl jazz video
          if ((theme === 'vintage_vinyl_jazz' || theme === 'vinyl') && (merged[theme]?.videoId === 'cf0Xk0o_a34' || !merged[theme]?.videoId)) {
            merged[theme]!.videoId = 'YUy3R249Vjk';
            merged[theme]!.customUrl = 'https://youtu.be/YUy3R249Vjk?si=T2Qgf6Y21r5DqWvt';
            merged[theme]!.title = 'Vintage Vinyl Jazz Cafe Relaxing Ambience';
          }
          // Migrate old default starlit desert video ID to new desert observatory video
          if ((theme === 'starlit_desert_night' || theme === 'starlit_desert') && (merged[theme]?.videoId === 'ncsF5d_iF0I' || merged[theme]?.videoId === 'W5kw1hSN4ig' || !merged[theme]?.videoId)) {
            merged[theme]!.videoId = 'dyP5geGal-I';
            merged[theme]!.customUrl = 'https://youtu.be/dyP5geGal-I?si=dBjtuzlINeYOMQ5C';
            merged[theme]!.title = 'Desert Observatory Stargazing & Starlight Ambience';
          }
          // Migrate old default train video ID to new express train video
          if (theme === 'train' && (merged.train?.videoId === 'qRTVg8HHzUo' || !merged.train?.videoId)) {
            merged.train.videoId = 'zZkjkzGNUF4';
            merged.train.customUrl = 'https://youtu.be/zZkjkzGNUF4?si=NVwfujH3Fmaaxy4o';
            merged.train.title = 'Express Train Scenic Journey Ambience';
          }
          // Migrate old default rainforest video ID to new rainforest video
          if (theme === 'rainforest' && (merged.rainforest?.videoId === 'vPhg6sc1Mk4' || !merged.rainforest?.videoId)) {
            merged.rainforest.videoId = 'ih4_1FyVjaY';
            merged.rainforest.customUrl = 'https://youtu.be/ih4_1FyVjaY?si=L5HkkrEPZe93s9DM';
            merged.rainforest.title = 'Lush Tropical Rainforest & Gentle Rain';
          }
          // Migrate old default blizzard video ID to new alpine cabin blizzard video
          if (theme === 'blizzard' && (merged.blizzard?.videoId === 'q76bEbVFAhg' || !merged.blizzard?.videoId)) {
            merged.blizzard.videoId = 'SRxf7QCzZuA';
            merged.blizzard.customUrl = 'https://youtu.be/SRxf7QCzZuA?si=duumsRRJpIdMTUGU';
            merged.blizzard.title = 'Alpine Cabin Blizzard & Warm Fireplace Ambience';
          }
          // Migrate old default wizard video ID to new wizard sanctum video
          if (theme === 'wizard' && (merged.wizard?.videoId === 'CHFif_y2TyM' || !merged.wizard?.videoId)) {
            merged.wizard.videoId = '0MTkODK1hzg';
            merged.wizard.customUrl = 'https://youtu.be/0MTkODK1hzg?si=OGBAVioome2k3U1A';
            merged.wizard.title = 'Wizard Sanctum Arcane Study & Ancient Magic Ambience';
          }
          // Migrate old default desert camp video ID to new desert camp video
          if (theme === 'desert' && (['zuIa75-EWCM', 'xoam1ReST6U'].includes(merged.desert?.videoId || '') || !merged.desert?.videoId)) {
            merged.desert.videoId = 'Q5ymPoZZhUg';
            merged.desert.customUrl = 'https://youtu.be/Q5ymPoZZhUg?si=KYwURsRSIr3kIhPV';
            merged.desert.title = 'Desert Camp Night Dunes & Starfield Ambience';
          }
          // Migrate old default vinyl video ID to new vinyl lounge video
          if (theme === 'vinyl' && (merged.vinyl?.videoId === 'YUy3R249Vjk' || !merged.vinyl?.videoId)) {
            merged.vinyl.videoId = 'iUyeugHBZaI';
            merged.vinyl.customUrl = 'https://www.youtube.com/live/iUyeugHBZaI?si=tgz64frm7dq06LCK';
            merged.vinyl.title = 'Vinyl Lounge Vintage Turntable & Warm Jazz Ambience';
          }
          // Migrate old default hogwarts video ID to new rainy courtyard video
          if (theme === 'hogwarts' && (merged.hogwarts?.videoId === '6r8u6EaZ6H8' || !merged.hogwarts?.videoId)) {
            merged.hogwarts.videoId = 'DEmQnIfnlgE';
            merged.hogwarts.customUrl = 'https://youtu.be/DEmQnIfnlgE?si=r7yGOMym35zAgj16';
            merged.hogwarts.title = 'Rainy Courtyard Medieval Stone Cloister Ambience';
          }
          // Migrate old default bamboo video ID to new bamboo forest video
          if (theme === 'bamboo' && (merged.bamboo?.videoId === 'Dx5qF63XZao' || !merged.bamboo?.videoId)) {
            merged.bamboo.videoId = 'KmJ6BCzS-jY';
            merged.bamboo.customUrl = 'https://youtu.be/KmJ6BCzS-jY?si=_LlRh3_Cdbf604qc';
            merged.bamboo.title = 'Kyoto Bamboo Forest Grove & Serene Zen Ambience';
          }
          // Migrate old default coding video ID to new coding lab video
          if (theme === 'coding' && (merged.coding?.videoId === 'gl48yN4k92c' || !merged.coding?.videoId)) {
            merged.coding.videoId = 'Hqmv9XNHmjo';
            merged.coding.customUrl = 'https://youtu.be/Hqmv9XNHmjo?si=PDEmq3FhBO8C6LMs';
            merged.coding.title = 'Cyberpunk Matrix Terminal & Coding Lab Ambience';
          }
          // Migrate old default greenhouse video ID to new greenhouse video
          if (theme === 'greenhouse' && (merged.greenhouse?.videoId === 'zVjFh0k2vV4' || !merged.greenhouse?.videoId)) {
            merged.greenhouse.videoId = '5I7l6v7t1uw';
            merged.greenhouse.customUrl = 'https://youtu.be/5I7l6v7t1uw?si=a_LKtxoxz7nSycaz';
            merged.greenhouse.title = 'Botanical Glass Greenhouse & Soft Rain Ambience';
          }
          // Migrate old default tokyo snow video ID to new tokyo snow video
          if (theme === 'tokyo_snow' && (merged.tokyo_snow?.videoId === '5wRWniH6G2A' || !merged.tokyo_snow?.videoId)) {
            merged.tokyo_snow.videoId = 'FJY2Mn4vu_M';
            merged.tokyo_snow.customUrl = 'https://youtu.be/FJY2Mn4vu_M?si=FzhWE5I1KYn_CEM7';
            merged.tokyo_snow.title = 'Tokyo Snow Izakaya Lantern Alley Ambience';
          }
          // Migrate old default waterfall video ID to new waterfall video
          if (theme === 'waterfall' && (merged.waterfall?.videoId === 'pZ3hF79H1V8' || !merged.waterfall?.videoId)) {
            merged.waterfall.videoId = 'TeO374JpPWk';
            merged.waterfall.customUrl = 'https://youtu.be/TeO374JpPWk?si=oKdu0aZ0yqWLCmh5';
            merged.waterfall.title = 'Mountain Waterfall Stream & Alpine Ambience';
          }
          // Migrate old default bookstore video ID to new bookstore live video
          if (theme === 'bookstore' && (merged.bookstore?.videoId === 'CHFif_y2TyM' || !merged.bookstore?.videoId)) {
            merged.bookstore.videoId = 'eD1lvvjEL_0';
            merged.bookstore.customUrl = 'https://www.youtube.com/live/eD1lvvjEL_0?si=ydJoO-y3aQPMAQNF';
            merged.bookstore.title = 'Vintage Bookstore Attic Live Ambience';
          }
          // Migrate old default aurora video ID to new aurora video
          if (theme === 'aurora' && (merged.aurora?.videoId === 'T39g_C3-gZ8' || !merged.aurora?.videoId)) {
            merged.aurora.videoId = 'HRXzo2Qm8eQ';
            merged.aurora.customUrl = 'https://youtu.be/HRXzo2Qm8eQ?si=MoGlN3rqLmfVyEWT';
            merged.aurora.title = 'Dancing Northern Lights Arctic Sky Ambience';
          }
          // Migrate old default midnight dome video ID to new observatory dome video
          if (theme === 'midnight_dome' && (merged.midnight_dome?.videoId === 'ncsF5d_iF0I' || !merged.midnight_dome?.videoId)) {
            merged.midnight_dome.videoId = 'nvUIukUIOuI';
            merged.midnight_dome.customUrl = 'https://youtu.be/nvUIukUIOuI?si=Et8Ms-uTboUL23Qc';
            merged.midnight_dome.title = 'Observatory Dome Night Sky & Telescope Ambience';
          }
          // Migrate old default paris balcony video ID to new paris balcony live video
          if (theme === 'paris_balcony' && (merged.paris_balcony?.videoId === '21X5lGlDOfg' || !merged.paris_balcony?.videoId)) {
            merged.paris_balcony.videoId = 'u-0fcXjsVA0';
            merged.paris_balcony.customUrl = 'https://www.youtube.com/live/u-0fcXjsVA0?si=rlnxG9ah_HgAQHz6';
            merged.paris_balcony.title = 'Parisian Balcony Sunset Live Rain Ambience';
          }
          // Migrate old default deep sea video ID to new deep sea abyssal video
          if (theme === 'deep_sea' && (merged.deep_sea?.videoId === 'V-_O7nl0Ii0' || !merged.deep_sea?.videoId)) {
            merged.deep_sea.videoId = 'W0u-7lgWXpw';
            merged.deep_sea.customUrl = 'https://youtu.be/W0u-7lgWXpw?si=eKRhV8Yd1fFDOFAq';
            merged.deep_sea.title = 'Deep Sea Abyssal Sanctuary & Bioluminescent Ambience';
          }
          // Migrate old default egyptian temple video ID to new egyptian temple video
          if (theme === 'egyptian_temple' && (merged.egyptian_temple?.videoId === 'ncsF5d_iF0I' || !merged.egyptian_temple?.videoId)) {
            merged.egyptian_temple.videoId = 'CruGng16MAA';
            merged.egyptian_temple.customUrl = 'https://youtu.be/CruGng16MAA?si=J2uOWkJ_x35Mk-mp';
            merged.egyptian_temple.title = 'Ancient Egyptian Temple Chamber & Torchlight Ambience';
          }
          // Migrate old default cyberpunk loft video ID to new cyberpunk loft video
          if (theme === 'cyberpunk_loft' && (merged.cyberpunk_loft?.videoId === 'gl48yN4k92c' || !merged.cyberpunk_loft?.videoId)) {
            merged.cyberpunk_loft.videoId = 'nuD5E1JFqHE';
            merged.cyberpunk_loft.customUrl = 'https://youtu.be/nuD5E1JFqHE?si=7UDY3rk-55nbRArQ';
            merged.cyberpunk_loft.title = 'Cyberpunk Neon Loft & Rain Ambience';
          }
          // Migrate old default victorian storm video ID to new victorian storm video
          if (theme === 'victorian_storm' && (merged.victorian_storm?.videoId === '4jZanmJJBds' || !merged.victorian_storm?.videoId)) {
            merged.victorian_storm.videoId = 'dBEqWbIdhZM';
            merged.victorian_storm.customUrl = 'https://youtu.be/dBEqWbIdhZM?si=AKJ9PCtOqEHAIPhY';
            merged.victorian_storm.title = 'Victorian Gothic Library Storm & Heavy Rain Ambience';
          }
          // Migrate old default zen stone video ID to new zen stone fountain video
          if (theme === 'zen_stone' && (merged.zen_stone?.videoId === 'Dx5qF63XZao' || !merged.zen_stone?.videoId)) {
            merged.zen_stone.videoId = 'YN6wj5NfOnM';
            merged.zen_stone.customUrl = 'https://youtu.be/YN6wj5NfOnM?si=aAsHP9T_E8HJHac4';
            merged.zen_stone.title = 'Zen Stone Garden & Peaceful Water Fountain Ambience';
          }
          // Migrate old default lunar base video ID to new lunar base video
          if (theme === 'lunar_base' && (merged.lunar_base?.videoId === 'ncsF5d_iF0I' || !merged.lunar_base?.videoId)) {
            merged.lunar_base.videoId = 'Um4JdxvT3Ho';
            merged.lunar_base.customUrl = 'https://youtu.be/Um4JdxvT3Ho?si=WNWbksKkBCV6wIiW';
            merged.lunar_base.title = 'Midnight Lunar Base & Earth Horizon Ambience';
          }
        }
      });
    }

    return merged;
  } catch {
    const fallback: ThemeVideoMap = {};
    const rainyDef = DEFAULT_THEME_VIDEOS.rainy!;
    fallback.rainy = {
      enabled: true,
      videoId: rainyDef.videoId,
      customUrl: `https://youtu.be/${rainyDef.videoId}`,
      title: rainyDef.title,
      opacity: rainyDef.defaultOpacity,
      muteAudio: true,
      volume: 50,
      showOverlays: true,
    };
    return fallback;
  }
}

/**
 * Saves a theme video setting to localStorage and triggers broadcast event.
 */
export function saveThemeVideo(theme: ThemeMode, settings: Partial<ThemeVideoSettings>): ThemeVideoSettings {
  const currentMap = loadAllThemeVideos();
  const existing = currentMap[theme] || {
    enabled: true,
    videoId: '',
    customUrl: '',
    title: 'Custom YouTube Background',
    opacity: 0.85,
    muteAudio: true,
    volume: 50,
    showOverlays: true,
  };

  const updated: ThemeVideoSettings = {
    ...existing,
    ...settings,
  };

  currentMap[theme] = updated;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentMap));
    // Dispatch custom event so all listeners immediately update
    window.dispatchEvent(new CustomEvent('youtube_backgrounds_updated', { detail: { theme, settings: updated } }));
  } catch (e) {
    console.warn('Failed to persist YouTube background settings', e);
  }

  return updated;
}

/**
 * Resets a theme to default video (or removes custom video).
 */
export function resetThemeVideo(theme: ThemeMode): void {
  const currentMap = loadAllThemeVideos();
  const def = DEFAULT_THEME_VIDEOS[theme];

  if (def) {
    currentMap[theme] = {
      enabled: true,
      videoId: def.videoId,
      customUrl: `https://youtu.be/${def.videoId}`,
      title: def.title,
      opacity: def.defaultOpacity,
      muteAudio: true,
      volume: 50,
      showOverlays: true,
    };
  } else {
    delete currentMap[theme];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentMap));
    window.dispatchEvent(new CustomEvent('youtube_backgrounds_updated', { detail: { theme } }));
  } catch (e) {
    console.warn('Failed to reset YouTube background settings', e);
  }
}

/**
 * Get active video setting for a theme.
 */
export function getThemeVideo(theme: ThemeMode): ThemeVideoSettings | null {
  const map = loadAllThemeVideos();
  const setting = map[theme];
  if (!setting || !setting.enabled || !setting.videoId) {
    return null;
  }
  return setting;
}

/**
 * Toggles a theme's video background enabled state.
 */
export function toggleThemeVideo(theme: ThemeMode): boolean {
  const map = loadAllThemeVideos();
  const def = DEFAULT_THEME_VIDEOS[theme];
  const existing = map[theme] || (def ? {
    enabled: true,
    videoId: def.videoId,
    customUrl: `https://youtu.be/${def.videoId}`,
    title: def.title,
    opacity: def.defaultOpacity,
    muteAudio: true,
    volume: 50,
    showOverlays: true,
  } : null);

  if (!existing) return false;

  const newEnabled = !existing.enabled;
  saveThemeVideo(theme, { enabled: newEnabled });
  return newEnabled;
}

/**
 * Toggles audio mute for a theme's ambient video.
 */
export function toggleThemeVideoMute(theme: ThemeMode): boolean {
  const map = loadAllThemeVideos();
  const existing = map[theme];
  if (!existing) return true;

  const newMute = !existing.muteAudio;
  saveThemeVideo(theme, { muteAudio: newMute });
  return newMute;
}

