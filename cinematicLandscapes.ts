import { CinematicLandscapeTheme } from '../types';

export interface CinematicLandscapeImage {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  theme: CinematicLandscapeTheme;
  imageUrl: string;
  thumbnailUrl: string;
  accentColor: string;
  ambientTint: string;
  description: string;
  photographer: string;
}

export const CINEMATIC_LANDSCAPES: Record<CinematicLandscapeTheme, CinematicLandscapeImage[]> = {
  forest: [
    {
      id: 'forest-redwood-mist',
      title: 'Misty Redwood Cathedral',
      subtitle: 'Sunbeams through Ancient Canopy',
      location: 'Pacific Northwest Redwoods',
      theme: 'forest',
      imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=2560&auto=format&fit=crop&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&auto=format&fit=crop&q=80',
      accentColor: '#10b981', // emerald-500
      ambientTint: 'rgba(6, 78, 59, 0.35)',
      description: 'Towering thousand-year-old sequoias shrouded in morning coastal fog with radiant sunbeams.',
      photographer: 'Rich Hay',
    },
    {
      id: 'forest-emerald-pine',
      title: 'Emerald Pine Valley',
      subtitle: 'Deep Evergreen Haven',
      location: 'Black Forest Alpine Slopes',
      theme: 'forest',
      imageUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=2560&auto=format&fit=crop&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=400&auto=format&fit=crop&q=80',
      accentColor: '#059669', // emerald-600
      ambientTint: 'rgba(4, 120, 87, 0.3)',
      description: 'Endless rolling coniferous ridges under quiet overcast skies with rich pine aroma.',
      photographer: 'Luca Bravo',
    },
    {
      id: 'forest-mossy-woodland',
      title: 'Mossy Nordic Glen',
      subtitle: 'Lush Forest Floor & Brook',
      location: 'Olympic Rainforest Valleys',
      theme: 'forest',
      imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=2560&auto=format&fit=crop&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&auto=format&fit=crop&q=80',
      accentColor: '#34d399', // emerald-400
      ambientTint: 'rgba(5, 150, 105, 0.3)',
      description: 'Vibrant moss-draped branches and ferns glowing with gentle dappled afternoon sunlight.',
      photographer: 'Sebastian Unrau',
    },
    {
      id: 'forest-taiga-stream',
      title: 'Whispering Taiga River',
      subtitle: 'Clear Alpine Waterways',
      location: 'Scandinavia Pine Wilderness',
      theme: 'forest',
      imageUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=2560&auto=format&fit=crop&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=400&auto=format&fit=crop&q=80',
      accentColor: '#10b981',
      ambientTint: 'rgba(6, 95, 70, 0.35)',
      description: 'Pristine mountain stream meandering through a wild untouched boreal forest.',
      photographer: 'Dan Meyers',
    },
    {
      id: 'forest-bamboo-zen',
      title: 'Kyoto Bamboo Sanctuary',
      subtitle: 'Tranquil Emerald Walkway',
      location: 'Arashiyama Bamboo Grove',
      theme: 'forest',
      imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=2560&auto=format&fit=crop&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&auto=format&fit=crop&q=80',
      accentColor: '#84cc16', // lime-500
      ambientTint: 'rgba(63, 98, 18, 0.3)',
      description: 'Slender bamboo stalks filtering emerald daylight with rhythmic wind-chime whispers.',
      photographer: 'Soragrit Wongsa',
    }
  ],
  desert: [
    {
      id: 'desert-sahara-gold',
      title: 'Sahara Golden Dunes',
      subtitle: 'Wind-Sculpted Sand Crests',
      location: 'Erg Chebbi, Sahara Desert',
      theme: 'desert',
      imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=2560&auto=format&fit=crop&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&auto=format&fit=crop&q=80',
      accentColor: '#f59e0b', // amber-500
      ambientTint: 'rgba(180, 83, 9, 0.35)',
      description: 'Infinite golden sand dunes with delicate wind rippling under warm twilight horizon.',
      photographer: 'Jeremy Bishop',
    },
    {
      id: 'desert-starlit-milkyway',
      title: 'Starlit Atacama Dunes',
      subtitle: 'Celestial Night Canopy',
      location: 'Atacama Stargazing Sanctuary',
      theme: 'desert',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=2560&auto=format&fit=crop&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
      accentColor: '#fbbf24', // amber-400
      ambientTint: 'rgba(67, 56, 202, 0.4)',
      description: 'Crystal-clear desert night under a breathtaking arch of the Milky Way galaxy.',
      photographer: 'Jason Blackeye',
    },
    {
      id: 'desert-monument-sunset',
      title: 'Monument Sandstone Sunset',
      subtitle: 'Crimson Buttes & Golden Hour',
      location: 'Colorado Plateau Valley',
      theme: 'desert',
      imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=2560&auto=format&fit=crop&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&auto=format&fit=crop&q=80',
      accentColor: '#ea580c', // orange-600
      ambientTint: 'rgba(194, 65, 12, 0.35)',
      description: 'Ancient red rock monoliths casting long dramatic shadows across pristine desert plains.',
      photographer: 'Austin Neill',
    },
    {
      id: 'desert-death-valley-sunset',
      title: 'Mojave Golden Ridges',
      subtitle: 'Silken Wind Ripples',
      location: 'Death Valley National Park',
      theme: 'desert',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=2560&auto=format&fit=crop&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80',
      accentColor: '#f97316', // orange-500
      ambientTint: 'rgba(154, 52, 18, 0.35)',
      description: 'Warm, low-angle sunlight illuminating the razor-sharp curves of windblown dunes.',
      photographer: 'Bailey Zindel',
    },
    {
      id: 'desert-sedona-canyon',
      title: 'Sedona Terracotta Canyon',
      subtitle: 'Ancient Red Rock Formations',
      location: 'Oak Creek Wilderness',
      theme: 'desert',
      imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=2560&auto=format&fit=crop&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&auto=format&fit=crop&q=80',
      accentColor: '#d97706', // amber-600
      ambientTint: 'rgba(180, 83, 9, 0.35)',
      description: 'Deep crimson canyon cliffs framed by aromatic desert sage and expansive horizons.',
      photographer: 'Kalen Emsley',
    }
  ],
  mountain: [
    {
      id: 'mountain-alpine-alpenglow',
      title: 'Alpine Summit Alpenglow',
      subtitle: 'Snowy Peaks at Sunset',
      location: 'Swiss Alps Haute Route',
      theme: 'mountain',
      imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2560&auto=format&fit=crop&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&auto=format&fit=crop&q=80',
      accentColor: '#38bdf8', // sky-400
      ambientTint: 'rgba(14, 116, 144, 0.35)',
      description: 'Breathtaking snow-crested summits bathed in radiant pink and rose-gold twilight alpenglow.',
      photographer: 'Kalen Emsley',
    },
    {
      id: 'mountain-glacial-turquoise',
      title: 'Glacial Turquoise Lake',
      subtitle: 'Mirrored Alpine Summits',
      location: 'Banff National Park, Rockies',
      theme: 'mountain',
      imageUrl: 'https://images.unsplash.com/photo-1439853949127-fa647821eba0?w=2560&auto=format&fit=crop&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1439853949127-fa647821eba0?w=400&auto=format&fit=crop&q=80',
      accentColor: '#06b6d4', // cyan-500
      ambientTint: 'rgba(8, 145, 178, 0.35)',
      description: 'Glass-smooth turquoise glacial waters reflecting towering granite crags and morning mist.',
      photographer: 'Jeff Sheldon',
    },
    {
      id: 'mountain-dolomite-spires',
      title: 'Dolomite Jagged Towers',
      subtitle: 'Dramatic Limestone Precipices',
      location: 'Tre Cime di Lavaredo, Italy',
      theme: 'mountain',
      imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=2560&auto=format&fit=crop&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&auto=format&fit=crop&q=80',
      accentColor: '#818cf8', // indigo-400
      ambientTint: 'rgba(49, 46, 129, 0.4)',
      description: 'Sheer monumental rock towers piercing through a dramatic sea of drifting clouds.',
      photographer: 'Benjamin Davies',
    },
    {
      id: 'mountain-sea-of-clouds',
      title: 'Cascade Ridge Cloud Sea',
      subtitle: 'Summit Overlook at Sunrise',
      location: 'Mount Rainier Alpine Ridge',
      theme: 'mountain',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=2560&auto=format&fit=crop&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80',
      accentColor: '#0ea5e9', // sky-500
      ambientTint: 'rgba(3, 105, 161, 0.35)',
      description: 'Looking out from an alpine peak over an ocean of fluffy clouds touched with dawn fire.',
      photographer: 'Bailey Zindel',
    },
    {
      id: 'mountain-fitz-roy',
      title: 'Patagonian Granite Needles',
      subtitle: 'Wild Alpine Wilderness',
      location: 'Monte Fitz Roy, Patagonia',
      theme: 'mountain',
      imageUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=2560&auto=format&fit=crop&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=400&auto=format&fit=crop&q=80',
      accentColor: '#60a5fa', // blue-400
      ambientTint: 'rgba(30, 64, 175, 0.35)',
      description: 'Iconic sharp mountain horns rising abruptly above pristine sub-polar beech valleys.',
      photographer: 'Christopher Burns',
    }
  ]
};

export const CINEMATIC_THEME_DETAILS: Record<CinematicLandscapeTheme, {
  label: string;
  badge: string;
  emoji: string;
  iconName: string;
  description: string;
  primaryColor: string;
  gradientClass: string;
  tagline: string;
}> = {
  forest: {
    label: 'Forest Canopy',
    badge: 'Lush & Deep Oxygen',
    emoji: '🌲',
    iconName: 'Trees',
    description: 'Ancient redwoods, emerald pine valleys, mossy glens, and tranquil bamboo sanctuaries.',
    primaryColor: '#10b981',
    gradientClass: 'from-emerald-950/80 via-teal-950/60 to-slate-950/90',
    tagline: 'Deep botanical calm and natural focus',
  },
  desert: {
    label: 'Desert Horizons',
    badge: 'Warm & Vast Silence',
    emoji: '🏜️',
    iconName: 'Sun',
    description: 'Golden Sahara sand dunes, starlit Atacama skies, and glowing terracotta canyon sunsets.',
    primaryColor: '#f59e0b',
    gradientClass: 'from-amber-950/80 via-orange-950/60 to-slate-950/90',
    tagline: 'Vast openness, warm earth tones & cosmic silence',
  },
  mountain: {
    label: 'Mountain Summits',
    badge: 'Majestic & Crystal Air',
    emoji: '🏔️',
    iconName: 'Mountain',
    description: 'Alpine alpenglow summits, turquoise glacial lakes, and sheer limestone dolomite spires.',
    primaryColor: '#38bdf8',
    gradientClass: 'from-sky-950/80 via-indigo-950/60 to-slate-950/90',
    tagline: 'Elevated clarity, crisp peaks & expansive perspective',
  },
};
