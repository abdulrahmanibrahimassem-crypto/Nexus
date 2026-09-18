import { ThemeMode } from '../types';

export interface ColorRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface AtmosphericSignature {
  name: string;
  stops: [string, string, string, string]; // 4 gradient stops: top, mid1, mid2, bottom
  radialGlow: {
    color: string;
    x: number; // percentage (0-100)
    y: number; // percentage (0-100)
    radius: number; // percentage (0-100)
    opacity: number;
  };
  accentColor: string;
  ambientTint: string;
  contrast: number; // e.g. 1.0
  brightness: number; // e.g. 1.0
  vignetteOpacity: number;
}

export interface ParticleSignature {
  type: 'rain' | 'snow' | 'ember' | 'petal' | 'bubble' | 'spark' | 'star' | 'mist' | 'leaf';
  speedY: number; // Directed velocity Y (positive = down, negative = up)
  speedX: number; // Horizontal drift (wind)
  sizeMin: number;
  sizeMax: number;
  color: string;
  colorAlt: string;
  alpha: number;
  aspectRatio: number; // 1.0 for circle, > 1.0 for streak / elongated petal
  rotationSpeed: number;
  turbulence: number;
  density: number;
  glow: number;
}

export interface InterpolatedAtmosphere {
  stops: [string, string, string, string];
  radialGlow: {
    color: string;
    x: number;
    y: number;
    radius: number;
    opacity: number;
  };
  accentColor: string;
  ambientTint: string;
  contrast: number;
  brightness: number;
  vignetteOpacity: number;
  bloomResonance: number;
  cssBackground: string;
  cssRadialGlow: string;
}

export interface InterpolatedParticles {
  type: ParticleSignature['type'];
  speedY: number;
  speedX: number;
  sizeMin: number;
  sizeMax: number;
  color: string;
  colorAlt: string;
  alpha: number;
  aspectRatio: number;
  rotationSpeed: number;
  turbulence: number;
  density: number;
  particleDensity: number;
  glow: number;
  bloomResonance: number;
}

export interface ThemeAtmosphericProfile {
  particleDensity: number;
  bloomResonance: number;
}

export const THEME_ATMOSPHERIC_PROFILES: Record<ThemeMode, ThemeAtmosphericProfile> = {
  rainy: { particleDensity: 1.20, bloomResonance: 1.00 },
  stormy: { particleDensity: 1.45, bloomResonance: 1.30 },
  focus: { particleDensity: 0.70, bloomResonance: 0.75 },
  fun: { particleDensity: 1.05, bloomResonance: 1.10 },
  zen: { particleDensity: 0.85, bloomResonance: 0.90 },
  cyberpunk: { particleDensity: 1.35, bloomResonance: 1.45 },
  space: { particleDensity: 1.00, bloomResonance: 1.25 },
  library: { particleDensity: 0.70, bloomResonance: 0.85 },
  ocean: { particleDensity: 1.10, bloomResonance: 1.15 },
  autumn: { particleDensity: 0.95, bloomResonance: 0.95 },
  train: { particleDensity: 0.95, bloomResonance: 0.95 },
  late_night_train: { particleDensity: 0.95, bloomResonance: 1.00 },
  rainforest: { particleDensity: 1.25, bloomResonance: 1.05 },
  blizzard: { particleDensity: 1.40, bloomResonance: 1.15 },
  wizard: { particleDensity: 1.10, bloomResonance: 1.35 },
  desert: { particleDensity: 0.85, bloomResonance: 1.10 },
  vinyl: { particleDensity: 0.80, bloomResonance: 0.90 },
  vintage_vinyl_jazz: { particleDensity: 0.80, bloomResonance: 0.90 },
  cozy_fireplace: { particleDensity: 1.10, bloomResonance: 1.20 },
  cozy_fireplace_lofi: { particleDensity: 1.05, bloomResonance: 1.18 },
  deep_space_observatory: { particleDensity: 0.85, bloomResonance: 1.20 },
  starlit_desert_night: { particleDensity: 0.80, bloomResonance: 1.15 },
  hogwarts: { particleDensity: 1.25, bloomResonance: 1.10 },
  bamboo: { particleDensity: 0.85, bloomResonance: 0.95 },
  coding: { particleDensity: 1.10, bloomResonance: 1.20 },
  greenhouse: { particleDensity: 0.95, bloomResonance: 1.05 },
  tokyo_snow: { particleDensity: 1.15, bloomResonance: 1.10 },
  waterfall: { particleDensity: 1.25, bloomResonance: 1.10 },
  bookstore: { particleDensity: 0.75, bloomResonance: 0.85 },
  aurora: { particleDensity: 1.05, bloomResonance: 1.40 },
  starlit_desert: { particleDensity: 0.80, bloomResonance: 1.15 },
  midnight_dome: { particleDensity: 0.90, bloomResonance: 1.15 },
  paris_balcony: { particleDensity: 1.15, bloomResonance: 1.05 },
  deep_sea: { particleDensity: 1.00, bloomResonance: 1.20 },
  egyptian_temple: { particleDensity: 0.85, bloomResonance: 1.10 },
  cyberpunk_loft: { particleDensity: 1.30, bloomResonance: 1.35 },
  whispering_pine: { particleDensity: 0.95, bloomResonance: 0.90 },
  victorian_storm: { particleDensity: 1.35, bloomResonance: 1.15 },
  zen_stone: { particleDensity: 0.80, bloomResonance: 0.85 },
  lunar_base: { particleDensity: 0.90, bloomResonance: 1.15 },
};

// ============================================================================
// COLOR MATH & PARSING UTILITIES
// ============================================================================

export function parseColor(color: string): ColorRGBA {
  const trimmed = color.trim().toLowerCase();

  // Hex format #rgb, #rgba, #rrggbb, #rrggbbaa
  if (trimmed.startsWith('#')) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: 1.0,
      };
    }
    if (hex.length === 4) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: parseInt(hex[3] + hex[3], 16) / 255,
      };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 1.0,
      };
    }
    if (hex.length === 8) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: parseInt(hex.slice(6, 8), 16) / 255,
      };
    }
  }

  // rgba(r, g, b, a) or rgb(r, g, b)
  const rgbMatch = trimmed.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?\)/);
  if (rgbMatch) {
    return {
      r: Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10))),
      g: Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10))),
      b: Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10))),
      a: rgbMatch[4] !== undefined ? Math.min(1.0, Math.max(0, parseFloat(rgbMatch[4]))) : 1.0,
    };
  }

  // Fallback safe white
  return { r: 255, g: 255, b: 255, a: 1.0 };
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpColor(colorA: string, colorB: string, t: number): string {
  const cA = parseColor(colorA);
  const cB = parseColor(colorB);

  // Gamma-corrected perceptual interpolation
  const r = Math.round(Math.sqrt((1 - t) * (cA.r * cA.r) + t * (cB.r * cB.r)));
  const g = Math.round(Math.sqrt((1 - t) * (cA.g * cA.g) + t * (cB.g * cB.g)));
  const b = Math.round(Math.sqrt((1 - t) * (cA.b * cA.b) + t * (cB.b * cB.b)));
  const a = Math.round((cA.a + (cB.a - cA.a) * t) * 1000) / 1000;

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// Hermite smoothstep with cinematic ease
export function cinematicEase(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  // Ken Perlin's smootherstep: 6t^5 - 15t^4 + 10t^3
  return clamped * clamped * clamped * (clamped * (clamped * 6 - 15) + 10);
}

// ============================================================================
// THEME ATMOSPHERIC SIGNATURES
// ============================================================================

export const THEME_ATMOSPHERIC_SIGNATURES: Record<ThemeMode, AtmosphericSignature> = {
  rainy: {
    name: 'Cozy Rainy Cafe',
    stops: ['#070b14', '#0d1829', '#14233a', '#1e293b'],
    radialGlow: { color: 'rgba(96, 165, 250, 0.16)', x: 50, y: 35, radius: 70, opacity: 0.8 },
    accentColor: '#60a5fa',
    ambientTint: 'rgba(186, 230, 253, 0.04)',
    contrast: 1.02,
    brightness: 0.98,
    vignetteOpacity: 0.45,
  },
  stormy: {
    name: 'Stormy Thunder',
    stops: ['#020617', '#0a1020', '#131b2e', '#1f293d'],
    radialGlow: { color: 'rgba(147, 197, 253, 0.22)', x: 48, y: 25, radius: 85, opacity: 0.9 },
    accentColor: '#93c5fd',
    ambientTint: 'rgba(147, 197, 253, 0.06)',
    contrast: 1.08,
    brightness: 0.92,
    vignetteOpacity: 0.6,
  },
  focus: {
    name: 'Calm Zen Focus',
    stops: ['#03140e', '#062419', '#0c3827', '#124c36'],
    radialGlow: { color: 'rgba(52, 211, 153, 0.16)', x: 50, y: 40, radius: 75, opacity: 0.75 },
    accentColor: '#34d399',
    ambientTint: 'rgba(167, 243, 208, 0.04)',
    contrast: 1.0,
    brightness: 1.0,
    vignetteOpacity: 0.4,
  },
  fun: {
    name: 'Joyful Garden',
    stops: ['#170710', '#2a0c1e', '#3f132e', '#4c1d37'],
    radialGlow: { color: 'rgba(244, 114, 182, 0.18)', x: 52, y: 38, radius: 70, opacity: 0.8 },
    accentColor: '#f472b6',
    ambientTint: 'rgba(251, 207, 232, 0.05)',
    contrast: 1.04,
    brightness: 1.02,
    vignetteOpacity: 0.35,
  },
  zen: {
    name: 'Zen Garden',
    stops: ['#0e0918', '#1c122e', '#2c1c45', '#382356'],
    radialGlow: { color: 'rgba(251, 207, 232, 0.18)', x: 50, y: 32, radius: 80, opacity: 0.8 },
    accentColor: '#fbcfe8',
    ambientTint: 'rgba(244, 114, 182, 0.04)',
    contrast: 1.0,
    brightness: 1.0,
    vignetteOpacity: 0.4,
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    stops: ['#050814', '#0f1228', '#1e1138', '#2a0e3f'],
    radialGlow: { color: 'rgba(236, 72, 153, 0.24)', x: 45, y: 35, radius: 85, opacity: 0.95 },
    accentColor: '#ec4899',
    ambientTint: 'rgba(6, 182, 212, 0.06)',
    contrast: 1.15,
    brightness: 1.05,
    vignetteOpacity: 0.55,
  },
  space: {
    name: 'Cosmic Void',
    stops: ['#02040b', '#060b1e', '#0b1330', '#111b42'],
    radialGlow: { color: 'rgba(129, 140, 248, 0.18)', x: 50, y: 30, radius: 80, opacity: 0.85 },
    accentColor: '#818cf8',
    ambientTint: 'rgba(199, 210, 254, 0.03)',
    contrast: 1.1,
    brightness: 0.95,
    vignetteOpacity: 0.65,
  },
  library: {
    name: 'Cozy Library',
    stops: ['#160b03', '#2a1708', '#3d230e', '#4c2e14'],
    radialGlow: { color: 'rgba(251, 191, 36, 0.16)', x: 50, y: 40, radius: 70, opacity: 0.75 },
    accentColor: '#fbbf24',
    ambientTint: 'rgba(254, 243, 199, 0.04)',
    contrast: 1.02,
    brightness: 0.98,
    vignetteOpacity: 0.5,
  },
  ocean: {
    name: 'Ocean Tide',
    stops: ['#02101e', '#041f36', '#083254', '#0c4672'],
    radialGlow: { color: 'rgba(56, 189, 248, 0.2)', x: 50, y: 45, radius: 80, opacity: 0.85 },
    accentColor: '#38bdf8',
    ambientTint: 'rgba(186, 230, 253, 0.05)',
    contrast: 1.05,
    brightness: 1.0,
    vignetteOpacity: 0.45,
  },
  autumn: {
    name: 'Autumn Cafe',
    stops: ['#170802', '#2c1206', '#431d0b', '#572710'],
    radialGlow: { color: 'rgba(249, 115, 22, 0.18)', x: 52, y: 38, radius: 75, opacity: 0.8 },
    accentColor: '#f97316',
    ambientTint: 'rgba(254, 215, 170, 0.04)',
    contrast: 1.04,
    brightness: 1.0,
    vignetteOpacity: 0.45,
  },
  train: {
    name: 'Express Train',
    stops: ['#070b14', '#0f172a', '#18243b', '#202f4a'],
    radialGlow: { color: 'rgba(253, 224, 71, 0.14)', x: 54, y: 40, radius: 70, opacity: 0.75 },
    accentColor: '#fde047',
    ambientTint: 'rgba(254, 240, 138, 0.04)',
    contrast: 1.03,
    brightness: 0.98,
    vignetteOpacity: 0.5,
  },
  late_night_train: {
    name: 'Late Night Train',
    stops: ['#040711', '#0b1022', '#121832', '#1b2344'],
    radialGlow: { color: 'rgba(165, 180, 252, 0.18)', x: 50, y: 36, radius: 75, opacity: 0.85 },
    accentColor: '#a5b4fc',
    ambientTint: 'rgba(224, 231, 255, 0.04)',
    contrast: 1.06,
    brightness: 0.94,
    vignetteOpacity: 0.6,
  },
  rainforest: {
    name: 'Rainforest Sanctuary',
    stops: ['#031309', '#062413', '#0b371f', '#10492a'],
    radialGlow: { color: 'rgba(52, 211, 153, 0.18)', x: 50, y: 40, radius: 75, opacity: 0.8 },
    accentColor: '#10b981',
    ambientTint: 'rgba(167, 243, 208, 0.05)',
    contrast: 1.04,
    brightness: 0.98,
    vignetteOpacity: 0.45,
  },
  blizzard: {
    name: 'Alpine Cabin Blizzard',
    stops: ['#06101c', '#0d1e33', '#162e4c', '#203f64'],
    radialGlow: { color: 'rgba(224, 242, 254, 0.22)', x: 50, y: 30, radius: 85, opacity: 0.9 },
    accentColor: '#e0f2fe',
    ambientTint: 'rgba(240, 249, 255, 0.06)',
    contrast: 1.06,
    brightness: 1.04,
    vignetteOpacity: 0.4,
  },
  wizard: {
    name: 'Wizard Sanctum',
    stops: ['#0a0518', '#160b30', '#25144b', '#331d64'],
    radialGlow: { color: 'rgba(192, 132, 252, 0.22)', x: 50, y: 35, radius: 80, opacity: 0.9 },
    accentColor: '#c084fc',
    ambientTint: 'rgba(233, 213, 255, 0.05)',
    contrast: 1.08,
    brightness: 1.02,
    vignetteOpacity: 0.55,
  },
  desert: {
    name: 'Desert Camp',
    stops: ['#120803', '#241207', '#381e0d', '#4d2b15'],
    radialGlow: { color: 'rgba(251, 191, 36, 0.18)', x: 50, y: 38, radius: 75, opacity: 0.8 },
    accentColor: '#f59e0b',
    ambientTint: 'rgba(253, 230, 138, 0.04)',
    contrast: 1.04,
    brightness: 1.0,
    vignetteOpacity: 0.45,
  },
  vinyl: {
    name: 'Vinyl Lounge',
    stops: ['#130903', '#261408', '#3b200e', '#4d2b14'],
    radialGlow: { color: 'rgba(245, 158, 11, 0.16)', x: 50, y: 42, radius: 70, opacity: 0.75 },
    accentColor: '#f59e0b',
    ambientTint: 'rgba(254, 243, 199, 0.04)',
    contrast: 1.02,
    brightness: 0.98,
    vignetteOpacity: 0.5,
  },
  vintage_vinyl_jazz: {
    name: 'Vintage Vinyl Jazz',
    stops: ['#110803', '#241208', '#381e0e', '#492a14'],
    radialGlow: { color: 'rgba(245, 158, 11, 0.18)', x: 48, y: 40, radius: 75, opacity: 0.8 },
    accentColor: '#f59e0b',
    ambientTint: 'rgba(254, 243, 199, 0.04)',
    contrast: 1.03,
    brightness: 0.98,
    vignetteOpacity: 0.52,
  },
  cozy_fireplace: {
    name: 'Cozy Fireplace',
    stops: ['#160602', '#2f0e04', '#471708', '#5d200c'],
    radialGlow: { color: 'rgba(249, 115, 22, 0.25)', x: 50, y: 55, radius: 85, opacity: 0.95 },
    accentColor: '#f97316',
    ambientTint: 'rgba(254, 215, 170, 0.05)',
    contrast: 1.08,
    brightness: 1.02,
    vignetteOpacity: 0.5,
  },
  cozy_fireplace_lofi: {
    name: 'Cozy Fireplace & Lo-Fi',
    stops: ['#140703', '#2b0f05', '#41190a', '#54220e'],
    radialGlow: { color: 'rgba(251, 146, 60, 0.22)', x: 50, y: 52, radius: 80, opacity: 0.9 },
    accentColor: '#fb923c',
    ambientTint: 'rgba(254, 215, 170, 0.05)',
    contrast: 1.05,
    brightness: 1.0,
    vignetteOpacity: 0.48,
  },
  deep_space_observatory: {
    name: 'Deep Space Observatory',
    stops: ['#02040c', '#060a1f', '#0c1334', '#131b46'],
    radialGlow: { color: 'rgba(165, 180, 252, 0.2)', x: 50, y: 28, radius: 85, opacity: 0.9 },
    accentColor: '#a5b4fc',
    ambientTint: 'rgba(224, 231, 255, 0.04)',
    contrast: 1.12,
    brightness: 0.94,
    vignetteOpacity: 0.65,
  },
  starlit_desert_night: {
    name: 'Starlit Desert Night',
    stops: ['#0c0612', '#190e24', '#291739', '#37204c'],
    radialGlow: { color: 'rgba(253, 224, 71, 0.18)', x: 50, y: 32, radius: 78, opacity: 0.85 },
    accentColor: '#fde047',
    ambientTint: 'rgba(254, 240, 138, 0.04)',
    contrast: 1.06,
    brightness: 0.98,
    vignetteOpacity: 0.5,
  },
  hogwarts: {
    name: 'Hogwarts Courtyard',
    stops: ['#050a0e', '#0b161e', '#142430', '#1c3140'],
    radialGlow: { color: 'rgba(52, 211, 153, 0.16)', x: 50, y: 35, radius: 75, opacity: 0.8 },
    accentColor: '#34d399',
    ambientTint: 'rgba(167, 243, 208, 0.04)',
    contrast: 1.04,
    brightness: 0.96,
    vignetteOpacity: 0.55,
  },
  bamboo: {
    name: 'Kyoto Bamboo Forest',
    stops: ['#040f09', '#081f14', '#0f3221', '#16432d'],
    radialGlow: { color: 'rgba(132, 204, 22, 0.18)', x: 50, y: 38, radius: 75, opacity: 0.8 },
    accentColor: '#84cc16',
    ambientTint: 'rgba(217, 249, 157, 0.04)',
    contrast: 1.02,
    brightness: 1.0,
    vignetteOpacity: 0.42,
  },
  coding: {
    name: 'Cyber Coding Lab',
    stops: ['#030712', '#081226', '#0d1f3d', '#132b52'],
    radialGlow: { color: 'rgba(6, 182, 212, 0.22)', x: 50, y: 35, radius: 80, opacity: 0.9 },
    accentColor: '#06b6d4',
    ambientTint: 'rgba(165, 243, 252, 0.05)',
    contrast: 1.12,
    brightness: 1.02,
    vignetteOpacity: 0.55,
  },
  greenhouse: {
    name: 'Botanical Greenhouse',
    stops: ['#03120b', '#072417', '#0d3825', '#134a32'],
    radialGlow: { color: 'rgba(52, 211, 153, 0.2)', x: 50, y: 40, radius: 75, opacity: 0.85 },
    accentColor: '#34d399',
    ambientTint: 'rgba(167, 243, 208, 0.05)',
    contrast: 1.02,
    brightness: 1.0,
    vignetteOpacity: 0.4,
  },
  tokyo_snow: {
    name: 'Tokyo Snow',
    stops: ['#070f1a', '#0e1d2f', '#172d45', '#213c59'],
    radialGlow: { color: 'rgba(254, 243, 199, 0.2)', x: 50, y: 45, radius: 75, opacity: 0.85 },
    accentColor: '#fef08a',
    ambientTint: 'rgba(224, 242, 254, 0.05)',
    contrast: 1.04,
    brightness: 1.02,
    vignetteOpacity: 0.45,
  },
  waterfall: {
    name: 'Mountain Waterfall',
    stops: ['#03101d', '#072036', '#0d3251', '#14446b'],
    radialGlow: { color: 'rgba(56, 189, 248, 0.22)', x: 50, y: 35, radius: 80, opacity: 0.85 },
    accentColor: '#38bdf8',
    ambientTint: 'rgba(186, 230, 253, 0.05)',
    contrast: 1.05,
    brightness: 1.0,
    vignetteOpacity: 0.45,
  },
  bookstore: {
    name: 'Vintage Bookstore Attic',
    stops: ['#130903', '#261408', '#3a1f0d', '#4c2b13'],
    radialGlow: { color: 'rgba(251, 191, 36, 0.18)', x: 50, y: 40, radius: 70, opacity: 0.8 },
    accentColor: '#fbbf24',
    ambientTint: 'rgba(254, 243, 199, 0.04)',
    contrast: 1.02,
    brightness: 0.98,
    vignetteOpacity: 0.5,
  },
  aurora: {
    name: 'Aurora Arctic',
    stops: ['#021115', '#042228', '#07363e', '#0b4a53'],
    radialGlow: { color: 'rgba(45, 212, 191, 0.26)', x: 50, y: 25, radius: 85, opacity: 0.95 },
    accentColor: '#2dd4bf',
    ambientTint: 'rgba(153, 246, 228, 0.06)',
    contrast: 1.1,
    brightness: 1.05,
    vignetteOpacity: 0.45,
  },
  starlit_desert: {
    name: 'Starlit Desert',
    stops: ['#0b0713', '#170f24', '#261939', '#34234c'],
    radialGlow: { color: 'rgba(251, 191, 36, 0.18)', x: 50, y: 32, radius: 75, opacity: 0.85 },
    accentColor: '#fbbf24',
    ambientTint: 'rgba(253, 230, 138, 0.04)',
    contrast: 1.05,
    brightness: 0.98,
    vignetteOpacity: 0.5,
  },
  midnight_dome: {
    name: 'Observatory Dome',
    stops: ['#02040e', '#060a22', '#0c1236', '#131b4a'],
    radialGlow: { color: 'rgba(129, 140, 248, 0.22)', x: 50, y: 28, radius: 85, opacity: 0.9 },
    accentColor: '#818cf8',
    ambientTint: 'rgba(224, 231, 255, 0.04)',
    contrast: 1.1,
    brightness: 0.95,
    vignetteOpacity: 0.6,
  },
  paris_balcony: {
    name: 'Parisian Balcony',
    stops: ['#0b0813', '#161023', '#241b36', '#312548'],
    radialGlow: { color: 'rgba(251, 113, 133, 0.18)', x: 50, y: 38, radius: 75, opacity: 0.8 },
    accentColor: '#fb7185',
    ambientTint: 'rgba(255, 228, 230, 0.04)',
    contrast: 1.03,
    brightness: 0.98,
    vignetteOpacity: 0.48,
  },
  deep_sea: {
    name: 'Deep Sea Sanctuary',
    stops: ['#010914', '#02162a', '#042542', '#06355a'],
    radialGlow: { color: 'rgba(34, 211, 238, 0.24)', x: 50, y: 48, radius: 80, opacity: 0.9 },
    accentColor: '#22d3ee',
    ambientTint: 'rgba(165, 243, 252, 0.06)',
    contrast: 1.08,
    brightness: 0.98,
    vignetteOpacity: 0.55,
  },
  egyptian_temple: {
    name: 'Egyptian Temple',
    stops: ['#140902', '#281406', '#3e210b', '#522c10'],
    radialGlow: { color: 'rgba(245, 158, 11, 0.22)', x: 50, y: 45, radius: 75, opacity: 0.85 },
    accentColor: '#f59e0b',
    ambientTint: 'rgba(254, 243, 199, 0.05)',
    contrast: 1.05,
    brightness: 1.0,
    vignetteOpacity: 0.5,
  },
  cyberpunk_loft: {
    name: 'Cyberpunk Neon Loft',
    stops: ['#060714', '#110f27', '#20153c', '#2c194d'],
    radialGlow: { color: 'rgba(244, 63, 94, 0.24)', x: 45, y: 35, radius: 85, opacity: 0.92 },
    accentColor: '#f43f5e',
    ambientTint: 'rgba(56, 189, 248, 0.05)',
    contrast: 1.14,
    brightness: 1.04,
    vignetteOpacity: 0.55,
  },
  whispering_pine: {
    name: 'Whispering Pine',
    stops: ['#03100a', '#072216', '#0c3524', '#124832'],
    radialGlow: { color: 'rgba(52, 211, 153, 0.16)', x: 50, y: 35, radius: 75, opacity: 0.8 },
    accentColor: '#34d399',
    ambientTint: 'rgba(167, 243, 208, 0.04)',
    contrast: 1.02,
    brightness: 0.98,
    vignetteOpacity: 0.45,
  },
  victorian_storm: {
    name: 'Victorian Storm Study',
    stops: ['#0f0703', '#1e1009', '#2f1a10', '#3e2318'],
    radialGlow: { color: 'rgba(251, 191, 36, 0.18)', x: 48, y: 42, radius: 72, opacity: 0.8 },
    accentColor: '#fbbf24',
    ambientTint: 'rgba(254, 243, 199, 0.04)',
    contrast: 1.06,
    brightness: 0.96,
    vignetteOpacity: 0.55,
  },
  zen_stone: {
    name: 'Zen Stone Garden',
    stops: ['#060c12', '#0e1722', '#172433', '#213144'],
    radialGlow: { color: 'rgba(45, 212, 191, 0.16)', x: 50, y: 38, radius: 75, opacity: 0.78 },
    accentColor: '#2dd4bf',
    ambientTint: 'rgba(153, 246, 228, 0.04)',
    contrast: 1.0,
    brightness: 1.0,
    vignetteOpacity: 0.42,
  },
  lunar_base: {
    name: 'Midnight Lunar Base',
    stops: ['#03060d', '#080d1a', '#0e162a', '#141f3a'],
    radialGlow: { color: 'rgba(96, 165, 250, 0.2)', x: 50, y: 30, radius: 80, opacity: 0.85 },
    accentColor: '#60a5fa',
    ambientTint: 'rgba(191, 219, 254, 0.04)',
    contrast: 1.08,
    brightness: 0.96,
    vignetteOpacity: 0.6,
  },
};

// ============================================================================
// THEME PARTICLE SIGNATURES
// ============================================================================

export const THEME_PARTICLE_SIGNATURES: Record<ThemeMode, ParticleSignature> = {
  rainy: {
    type: 'rain',
    speedY: 18.0,
    speedX: -1.2,
    sizeMin: 1.2,
    sizeMax: 2.6,
    color: '#bae6fd',
    colorAlt: '#7dd3fc',
    alpha: 0.45,
    aspectRatio: 6.5,
    rotationSpeed: 0,
    turbulence: 0.2,
    density: 90,
    glow: 0.2,
  },
  stormy: {
    type: 'rain',
    speedY: 24.0,
    speedX: -2.8,
    sizeMin: 1.6,
    sizeMax: 3.2,
    color: '#93c5fd',
    colorAlt: '#60a5fa',
    alpha: 0.6,
    aspectRatio: 7.5,
    rotationSpeed: 0,
    turbulence: 0.5,
    density: 120,
    glow: 0.35,
  },
  focus: {
    type: 'star',
    speedY: -0.2,
    speedX: 0.1,
    sizeMin: 1.0,
    sizeMax: 2.2,
    color: '#a7f3d0',
    colorAlt: '#34d399',
    alpha: 0.55,
    aspectRatio: 1.0,
    rotationSpeed: 0.01,
    turbulence: 0.15,
    density: 50,
    glow: 0.4,
  },
  fun: {
    type: 'petal',
    speedY: 1.2,
    speedX: 0.8,
    sizeMin: 2.5,
    sizeMax: 5.5,
    color: '#fbcfe8',
    colorAlt: '#f472b6',
    alpha: 0.65,
    aspectRatio: 1.6,
    rotationSpeed: 0.03,
    turbulence: 0.4,
    density: 45,
    glow: 0.3,
  },
  zen: {
    type: 'petal',
    speedY: 1.4,
    speedX: 1.1,
    sizeMin: 3.0,
    sizeMax: 6.2,
    color: '#fbcfe8',
    colorAlt: '#f472b6',
    alpha: 0.72,
    aspectRatio: 1.8,
    rotationSpeed: 0.025,
    turbulence: 0.35,
    density: 42,
    glow: 0.3,
  },
  cyberpunk: {
    type: 'spark',
    speedY: 6.5,
    speedX: 0.6,
    sizeMin: 1.5,
    sizeMax: 3.5,
    color: '#ec4899',
    colorAlt: '#06b6d4',
    alpha: 0.8,
    aspectRatio: 3.5,
    rotationSpeed: 0.05,
    turbulence: 0.6,
    density: 70,
    glow: 0.8,
  },
  space: {
    type: 'star',
    speedY: 0.05,
    speedX: 0.05,
    sizeMin: 0.8,
    sizeMax: 2.4,
    color: '#e0e7ff',
    colorAlt: '#a5b4fc',
    alpha: 0.85,
    aspectRatio: 1.0,
    rotationSpeed: 0.005,
    turbulence: 0.05,
    density: 85,
    glow: 0.6,
  },
  library: {
    type: 'ember',
    speedY: -0.6,
    speedX: 0.2,
    sizeMin: 1.2,
    sizeMax: 2.8,
    color: '#fbbf24',
    colorAlt: '#f59e0b',
    alpha: 0.6,
    aspectRatio: 1.1,
    rotationSpeed: 0.01,
    turbulence: 0.2,
    density: 40,
    glow: 0.4,
  },
  ocean: {
    type: 'bubble',
    speedY: -1.8,
    speedX: 0.3,
    sizeMin: 2.0,
    sizeMax: 5.5,
    color: '#38bdf8',
    colorAlt: '#6ee7b7',
    alpha: 0.6,
    aspectRatio: 1.0,
    rotationSpeed: 0.02,
    turbulence: 0.3,
    density: 48,
    glow: 0.45,
  },
  autumn: {
    type: 'leaf',
    speedY: 2.0,
    speedX: 1.5,
    sizeMin: 3.5,
    sizeMax: 7.0,
    color: '#f97316',
    colorAlt: '#ea580c',
    alpha: 0.75,
    aspectRatio: 1.7,
    rotationSpeed: 0.04,
    turbulence: 0.5,
    density: 38,
    glow: 0.25,
  },
  train: {
    type: 'rain',
    speedY: 12.0,
    speedX: -4.5,
    sizeMin: 1.2,
    sizeMax: 2.5,
    color: '#bae6fd',
    colorAlt: '#93c5fd',
    alpha: 0.45,
    aspectRatio: 5.0,
    rotationSpeed: 0,
    turbulence: 0.3,
    density: 65,
    glow: 0.2,
  },
  late_night_train: {
    type: 'rain',
    speedY: 14.0,
    speedX: -5.0,
    sizeMin: 1.2,
    sizeMax: 2.4,
    color: '#a5b4fc',
    colorAlt: '#818cf8',
    alpha: 0.42,
    aspectRatio: 5.5,
    rotationSpeed: 0,
    turbulence: 0.3,
    density: 60,
    glow: 0.25,
  },
  rainforest: {
    type: 'rain',
    speedY: 8.0,
    speedX: -0.5,
    sizeMin: 1.0,
    sizeMax: 2.2,
    color: '#a7f3d0',
    colorAlt: '#6ee7b7',
    alpha: 0.4,
    aspectRatio: 4.0,
    rotationSpeed: 0,
    turbulence: 0.25,
    density: 55,
    glow: 0.2,
  },
  blizzard: {
    type: 'snow',
    speedY: 4.5,
    speedX: 3.2,
    sizeMin: 1.5,
    sizeMax: 4.5,
    color: '#ffffff',
    colorAlt: '#e0f2fe',
    alpha: 0.8,
    aspectRatio: 1.1,
    rotationSpeed: 0.03,
    turbulence: 0.7,
    density: 110,
    glow: 0.4,
  },
  wizard: {
    type: 'spark',
    speedY: -0.8,
    speedX: 0.4,
    sizeMin: 1.5,
    sizeMax: 3.5,
    color: '#c084fc',
    colorAlt: '#e879f9',
    alpha: 0.75,
    aspectRatio: 1.3,
    rotationSpeed: 0.04,
    turbulence: 0.5,
    density: 50,
    glow: 0.75,
  },
  desert: {
    type: 'mist',
    speedY: 0.4,
    speedX: 2.2,
    sizeMin: 0.8,
    sizeMax: 1.8,
    color: '#fde68a',
    colorAlt: '#f59e0b',
    alpha: 0.4,
    aspectRatio: 1.2,
    rotationSpeed: 0.02,
    turbulence: 0.4,
    density: 70,
    glow: 0.25,
  },
  vinyl: {
    type: 'ember',
    speedY: -0.5,
    speedX: 0.1,
    sizeMin: 1.0,
    sizeMax: 2.2,
    color: '#f59e0b',
    colorAlt: '#d97706',
    alpha: 0.5,
    aspectRatio: 1.0,
    rotationSpeed: 0.01,
    turbulence: 0.15,
    density: 35,
    glow: 0.3,
  },
  vintage_vinyl_jazz: {
    type: 'ember',
    speedY: -0.6,
    speedX: 0.15,
    sizeMin: 1.1,
    sizeMax: 2.4,
    color: '#fbbf24',
    colorAlt: '#f59e0b',
    alpha: 0.55,
    aspectRatio: 1.0,
    rotationSpeed: 0.015,
    turbulence: 0.2,
    density: 38,
    glow: 0.35,
  },
  cozy_fireplace: {
    type: 'ember',
    speedY: -3.8,
    speedX: 0.4,
    sizeMin: 1.8,
    sizeMax: 4.2,
    color: '#fffbeb',
    colorAlt: '#f97316',
    alpha: 0.85,
    aspectRatio: 1.2,
    rotationSpeed: 0.04,
    turbulence: 0.5,
    density: 65,
    glow: 0.8,
  },
  cozy_fireplace_lofi: {
    type: 'ember',
    speedY: -3.2,
    speedX: 0.3,
    sizeMin: 1.6,
    sizeMax: 3.8,
    color: '#fef3c7',
    colorAlt: '#fb923c',
    alpha: 0.8,
    aspectRatio: 1.2,
    rotationSpeed: 0.035,
    turbulence: 0.45,
    density: 58,
    glow: 0.75,
  },
  deep_space_observatory: {
    type: 'star',
    speedY: 0.04,
    speedX: 0.04,
    sizeMin: 0.8,
    sizeMax: 2.6,
    color: '#e0e7ff',
    colorAlt: '#818cf8',
    alpha: 0.88,
    aspectRatio: 1.0,
    rotationSpeed: 0.004,
    turbulence: 0.04,
    density: 95,
    glow: 0.65,
  },
  starlit_desert_night: {
    type: 'star',
    speedY: 0.1,
    speedX: 0.6,
    sizeMin: 1.0,
    sizeMax: 2.2,
    color: '#fef08a',
    colorAlt: '#fbbf24',
    alpha: 0.75,
    aspectRatio: 1.0,
    rotationSpeed: 0.01,
    turbulence: 0.15,
    density: 65,
    glow: 0.5,
  },
  hogwarts: {
    type: 'rain',
    speedY: 16.0,
    speedX: -1.0,
    sizeMin: 1.4,
    sizeMax: 2.8,
    color: '#a7f3d0',
    colorAlt: '#6ee7b7',
    alpha: 0.48,
    aspectRatio: 6.0,
    rotationSpeed: 0,
    turbulence: 0.25,
    density: 75,
    glow: 0.22,
  },
  bamboo: {
    type: 'petal',
    speedY: 1.5,
    speedX: 0.9,
    sizeMin: 2.2,
    sizeMax: 5.0,
    color: '#d9f99d',
    colorAlt: '#a3e635',
    alpha: 0.6,
    aspectRatio: 2.0,
    rotationSpeed: 0.03,
    turbulence: 0.35,
    density: 38,
    glow: 0.25,
  },
  coding: {
    type: 'spark',
    speedY: 4.0,
    speedX: 0.2,
    sizeMin: 1.2,
    sizeMax: 2.6,
    color: '#06b6d4',
    colorAlt: '#22d3ee',
    alpha: 0.75,
    aspectRatio: 2.5,
    rotationSpeed: 0.02,
    turbulence: 0.3,
    density: 60,
    glow: 0.6,
  },
  greenhouse: {
    type: 'mist',
    speedY: -0.4,
    speedX: 0.1,
    sizeMin: 1.5,
    sizeMax: 3.5,
    color: '#a7f3d0',
    colorAlt: '#6ee7b7',
    alpha: 0.45,
    aspectRatio: 1.0,
    rotationSpeed: 0.01,
    turbulence: 0.2,
    density: 45,
    glow: 0.3,
  },
  tokyo_snow: {
    type: 'snow',
    speedY: 2.8,
    speedX: 0.8,
    sizeMin: 2.0,
    sizeMax: 4.8,
    color: '#ffffff',
    colorAlt: '#fef08a',
    alpha: 0.82,
    aspectRatio: 1.1,
    rotationSpeed: 0.02,
    turbulence: 0.4,
    density: 85,
    glow: 0.4,
  },
  waterfall: {
    type: 'mist',
    speedY: 6.0,
    speedX: 0.8,
    sizeMin: 1.5,
    sizeMax: 4.0,
    color: '#bae6fd',
    colorAlt: '#7dd3fc',
    alpha: 0.55,
    aspectRatio: 2.2,
    rotationSpeed: 0.02,
    turbulence: 0.6,
    density: 80,
    glow: 0.35,
  },
  bookstore: {
    type: 'ember',
    speedY: -0.4,
    speedX: 0.1,
    sizeMin: 1.0,
    sizeMax: 2.2,
    color: '#fbbf24',
    colorAlt: '#f59e0b',
    alpha: 0.55,
    aspectRatio: 1.0,
    rotationSpeed: 0.01,
    turbulence: 0.15,
    density: 35,
    glow: 0.35,
  },
  aurora: {
    type: 'mist',
    speedY: -0.8,
    speedX: 0.3,
    sizeMin: 2.0,
    sizeMax: 4.5,
    color: '#2dd4bf',
    colorAlt: '#818cf8',
    alpha: 0.65,
    aspectRatio: 1.2,
    rotationSpeed: 0.015,
    turbulence: 0.35,
    density: 65,
    glow: 0.65,
  },
  starlit_desert: {
    type: 'star',
    speedY: 0.08,
    speedX: 0.4,
    sizeMin: 0.9,
    sizeMax: 2.4,
    color: '#fef08a',
    colorAlt: '#fbbf24',
    alpha: 0.78,
    aspectRatio: 1.0,
    rotationSpeed: 0.008,
    turbulence: 0.12,
    density: 70,
    glow: 0.55,
  },
  midnight_dome: {
    type: 'star',
    speedY: 0.05,
    speedX: 0.05,
    sizeMin: 0.8,
    sizeMax: 2.5,
    color: '#e0e7ff',
    colorAlt: '#818cf8',
    alpha: 0.86,
    aspectRatio: 1.0,
    rotationSpeed: 0.005,
    turbulence: 0.05,
    density: 90,
    glow: 0.6,
  },
  paris_balcony: {
    type: 'rain',
    speedY: 14.0,
    speedX: -1.4,
    sizeMin: 1.2,
    sizeMax: 2.4,
    color: '#fbcfe8',
    colorAlt: '#bae6fd',
    alpha: 0.45,
    aspectRatio: 5.5,
    rotationSpeed: 0,
    turbulence: 0.22,
    density: 65,
    glow: 0.25,
  },
  deep_sea: {
    type: 'bubble',
    speedY: -1.6,
    speedX: 0.25,
    sizeMin: 2.2,
    sizeMax: 6.0,
    color: '#22d3ee',
    colorAlt: '#38bdf8',
    alpha: 0.65,
    aspectRatio: 1.0,
    rotationSpeed: 0.02,
    turbulence: 0.25,
    density: 50,
    glow: 0.55,
  },
  egyptian_temple: {
    type: 'ember',
    speedY: -2.2,
    speedX: 0.3,
    sizeMin: 1.5,
    sizeMax: 3.2,
    color: '#fde047',
    colorAlt: '#f97316',
    alpha: 0.75,
    aspectRatio: 1.1,
    rotationSpeed: 0.025,
    turbulence: 0.35,
    density: 45,
    glow: 0.65,
  },
  cyberpunk_loft: {
    type: 'spark',
    speedY: 5.0,
    speedX: -0.8,
    sizeMin: 1.4,
    sizeMax: 3.2,
    color: '#f43f5e',
    colorAlt: '#38bdf8',
    alpha: 0.78,
    aspectRatio: 3.0,
    rotationSpeed: 0.03,
    turbulence: 0.45,
    density: 65,
    glow: 0.75,
  },
  whispering_pine: {
    type: 'mist',
    speedY: 0.8,
    speedX: 0.6,
    sizeMin: 1.2,
    sizeMax: 2.8,
    color: '#a7f3d0',
    colorAlt: '#6ee7b7',
    alpha: 0.45,
    aspectRatio: 1.2,
    rotationSpeed: 0.01,
    turbulence: 0.2,
    density: 40,
    glow: 0.25,
  },
  victorian_storm: {
    type: 'rain',
    speedY: 17.0,
    speedX: -2.2,
    sizeMin: 1.3,
    sizeMax: 2.6,
    color: '#bae6fd',
    colorAlt: '#fbbf24',
    alpha: 0.48,
    aspectRatio: 6.0,
    rotationSpeed: 0,
    turbulence: 0.35,
    density: 70,
    glow: 0.3,
  },
  zen_stone: {
    type: 'star',
    speedY: 0.2,
    speedX: 0.1,
    sizeMin: 1.0,
    sizeMax: 2.2,
    color: '#99f6e4',
    colorAlt: '#5eead4',
    alpha: 0.5,
    aspectRatio: 1.0,
    rotationSpeed: 0.01,
    turbulence: 0.1,
    density: 35,
    glow: 0.3,
  },
  lunar_base: {
    type: 'star',
    speedY: 0.02,
    speedX: 0.02,
    sizeMin: 0.8,
    sizeMax: 2.2,
    color: '#bfdbfe',
    colorAlt: '#60a5fa',
    alpha: 0.8,
    aspectRatio: 1.0,
    rotationSpeed: 0.005,
    turbulence: 0.03,
    density: 75,
    glow: 0.5,
  },
};

// ============================================================================
// BLENDING INTERPOLATION FUNCTIONS
// ============================================================================

export function interpolateAtmosphere(
  sigA: AtmosphericSignature,
  sigB: AtmosphericSignature,
  t: number
): InterpolatedAtmosphere {
  const easedT = cinematicEase(t);

  const stop0 = lerpColor(sigA.stops[0], sigB.stops[0], easedT);
  const stop1 = lerpColor(sigA.stops[1], sigB.stops[1], easedT);
  const stop2 = lerpColor(sigA.stops[2], sigB.stops[2], easedT);
  const stop3 = lerpColor(sigA.stops[3], sigB.stops[3], easedT);

  const glowColor = lerpColor(sigA.radialGlow.color, sigB.radialGlow.color, easedT);
  const glowX = lerp(sigA.radialGlow.x, sigB.radialGlow.x, easedT);
  const glowY = lerp(sigA.radialGlow.y, sigB.radialGlow.y, easedT);
  const glowRadius = lerp(sigA.radialGlow.radius, sigB.radialGlow.radius, easedT);
  const glowOpacity = lerp(sigA.radialGlow.opacity, sigB.radialGlow.opacity, easedT);

  const accentColor = lerpColor(sigA.accentColor, sigB.accentColor, easedT);
  const ambientTint = lerpColor(sigA.ambientTint, sigB.ambientTint, easedT);
  const contrast = lerp(sigA.contrast, sigB.contrast, easedT);
  const brightness = lerp(sigA.brightness, sigB.brightness, easedT);
  const vignetteOpacity = lerp(sigA.vignetteOpacity, sigB.vignetteOpacity, easedT);

  const cssBackground = `linear-gradient(180deg, ${stop0} 0%, ${stop1} 35%, ${stop2} 70%, ${stop3} 100%)`;
  const cssRadialGlow = `radial-gradient(circle at ${Math.round(glowX)}% ${Math.round(glowY)}%, ${glowColor} 0%, transparent ${Math.round(glowRadius)}%)`;
  const bloomResonance = lerp(sigA.radialGlow.opacity * 1.3, sigB.radialGlow.opacity * 1.3, easedT);

  return {
    stops: [stop0, stop1, stop2, stop3],
    radialGlow: {
      color: glowColor,
      x: glowX,
      y: glowY,
      radius: glowRadius,
      opacity: glowOpacity,
    },
    accentColor,
    ambientTint,
    contrast,
    brightness,
    vignetteOpacity,
    bloomResonance,
    cssBackground,
    cssRadialGlow,
  };
}

export function interpolateParticles(
  sigA: ParticleSignature,
  sigB: ParticleSignature,
  t: number
): InterpolatedParticles {
  const easedT = cinematicEase(t);

  // Intermediate shape morphing: closer to target after midpoint
  const currentType = t < 0.5 ? sigA.type : sigB.type;
  const particleDensity = lerp(sigA.density / 50, sigB.density / 50, easedT);
  const bloomResonance = lerp(sigA.glow, sigB.glow, easedT);

  return {
    type: currentType,
    speedY: lerp(sigA.speedY, sigB.speedY, easedT),
    speedX: lerp(sigA.speedX, sigB.speedX, easedT),
    sizeMin: lerp(sigA.sizeMin, sigB.sizeMin, easedT),
    sizeMax: lerp(sigA.sizeMax, sigB.sizeMax, easedT),
    color: lerpColor(sigA.color, sigB.color, easedT),
    colorAlt: lerpColor(sigA.colorAlt, sigB.colorAlt, easedT),
    alpha: lerp(sigA.alpha, sigB.alpha, easedT),
    aspectRatio: lerp(sigA.aspectRatio, sigB.aspectRatio, easedT),
    rotationSpeed: lerp(sigA.rotationSpeed, sigB.rotationSpeed, easedT),
    turbulence: lerp(sigA.turbulence, sigB.turbulence, easedT),
    density: Math.round(lerp(sigA.density, sigB.density, easedT)),
    particleDensity,
    glow: lerp(sigA.glow, sigB.glow, easedT),
    bloomResonance,
  };
}

// ============================================================================
// CINEMATIC BLENDING ENGINE CLASS
// ============================================================================

export class CinematicBlendingEngine {
  private fromTheme: ThemeMode;
  private toTheme: ThemeMode;
  private progress: number = 1.0;
  private isBlending: boolean = false;
  private duration: number = 2.0; // Seconds (standard 2.0s smooth theme transition)
  private startTime: number = 0;
  private listeners: Set<(engine: CinematicBlendingEngine) => void> = new Set();
  private rafId: number | null = null;

  public currentAtmosphere: InterpolatedAtmosphere;
  public currentParticles: InterpolatedParticles;
  public currentParticleDensity: number = 1.0;
  public currentBloomResonance: number = 1.0;
  public sourceDensity: number = 1.0;
  public targetDensity: number = 1.0;
  public sourceBloom: number = 1.0;
  public targetBloom: number = 1.0;

  constructor(initialTheme: ThemeMode = 'rainy', duration: number = 2.0) {
    this.fromTheme = initialTheme;
    this.toTheme = initialTheme;
    this.duration = Math.max(0.5, duration);
    this.progress = 1.0;
    this.isBlending = false;

    const initialAtmo = THEME_ATMOSPHERIC_SIGNATURES[initialTheme] || THEME_ATMOSPHERIC_SIGNATURES.rainy;
    const initialPart = THEME_PARTICLE_SIGNATURES[initialTheme] || THEME_PARTICLE_SIGNATURES.rainy;
    const initialProfile = THEME_ATMOSPHERIC_PROFILES[initialTheme] || { particleDensity: 1.0, bloomResonance: 1.0 };

    this.currentParticleDensity = initialProfile.particleDensity;
    this.currentBloomResonance = initialProfile.bloomResonance;
    this.sourceDensity = initialProfile.particleDensity;
    this.targetDensity = initialProfile.particleDensity;
    this.sourceBloom = initialProfile.bloomResonance;
    this.targetBloom = initialProfile.bloomResonance;

    this.currentAtmosphere = interpolateAtmosphere(initialAtmo, initialAtmo, 1.0);
    this.currentParticles = interpolateParticles(initialPart, initialPart, 1.0);
  }

  public getFromTheme(): ThemeMode {
    return this.fromTheme;
  }

  public getToTheme(): ThemeMode {
    return this.toTheme;
  }

  public getProgress(): number {
    return this.progress;
  }

  public getIsBlending(): boolean {
    return this.isBlending;
  }

  public getDuration(): number {
    return this.duration;
  }

  public setDuration(duration: number): void {
    this.duration = Math.max(0.5, duration);
  }

  public subscribe(listener: (engine: CinematicBlendingEngine) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this);
    }
  }

  public transitionTo(newTheme: ThemeMode, customDuration: number = 2.0): void {
    if (newTheme === this.toTheme && !this.isBlending) {
      return;
    }

    this.duration = Math.max(0.5, customDuration);

    // Set source as the current visual point
    this.fromTheme = this.toTheme;
    this.toTheme = newTheme;
    this.progress = 0.0;
    this.isBlending = true;
    this.startTime = performance.now();

    const fromProf = THEME_ATMOSPHERIC_PROFILES[this.fromTheme] || { particleDensity: 1.0, bloomResonance: 1.0 };
    const toProf = THEME_ATMOSPHERIC_PROFILES[this.toTheme] || { particleDensity: 1.0, bloomResonance: 1.0 };

    this.sourceDensity = this.currentParticleDensity || fromProf.particleDensity;
    this.targetDensity = toProf.particleDensity;
    this.sourceBloom = this.currentBloomResonance || fromProf.bloomResonance;
    this.targetBloom = toProf.bloomResonance;

    this.startAnimationLoop();
  }

  private startAnimationLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }

    const step = (now: number) => {
      const elapsed = (now - this.startTime) / 1000;
      const rawProgress = Math.min(1.0, elapsed / this.duration);
      this.progress = rawProgress;

      // Smooth cinematic Perlin smootherstep for optical crossfade
      const easedProgress = rawProgress * rawProgress * rawProgress * (rawProgress * (rawProgress * 6 - 15) + 10);
      this.currentParticleDensity = this.sourceDensity + (this.targetDensity - this.sourceDensity) * easedProgress;
      this.currentBloomResonance = this.sourceBloom + (this.targetBloom - this.sourceBloom) * easedProgress;

      const sigAtmoA = THEME_ATMOSPHERIC_SIGNATURES[this.fromTheme] || THEME_ATMOSPHERIC_SIGNATURES.rainy;
      const sigAtmoB = THEME_ATMOSPHERIC_SIGNATURES[this.toTheme] || THEME_ATMOSPHERIC_SIGNATURES.rainy;
      const sigPartA = THEME_PARTICLE_SIGNATURES[this.fromTheme] || THEME_PARTICLE_SIGNATURES.rainy;
      const sigPartB = THEME_PARTICLE_SIGNATURES[this.toTheme] || THEME_PARTICLE_SIGNATURES.rainy;

      this.currentAtmosphere = interpolateAtmosphere(sigAtmoA, sigAtmoB, this.progress);
      this.currentParticles = interpolateParticles(sigPartA, sigPartB, this.progress);

      this.notify();

      if (rawProgress < 1.0) {
        this.rafId = requestAnimationFrame(step);
      } else {
        this.isBlending = false;
        this.progress = 1.0;
        this.fromTheme = this.toTheme;
        this.currentParticleDensity = this.targetDensity;
        this.currentBloomResonance = this.targetBloom;
        this.rafId = null;
        this.notify();
      }
    };

    this.rafId = requestAnimationFrame(step);
  }

  public applyToCSSVariables(element: HTMLElement = document.documentElement): void {
    const atmo = this.currentAtmosphere;
    element.style.setProperty('--cinematic-blend-progress', `${Math.round(this.progress * 100)}%`);
    element.style.setProperty('--cinematic-sky-stop-0', atmo.stops[0]);
    element.style.setProperty('--cinematic-sky-stop-1', atmo.stops[1]);
    element.style.setProperty('--cinematic-sky-stop-2', atmo.stops[2]);
    element.style.setProperty('--cinematic-sky-stop-3', atmo.stops[3]);
    element.style.setProperty('--cinematic-accent-color', atmo.accentColor);
    element.style.setProperty('--cinematic-ambient-tint', atmo.ambientTint);
    element.style.setProperty('--cinematic-radial-glow', atmo.cssRadialGlow);
    element.style.setProperty('--cinematic-sky-gradient', atmo.cssBackground);
    element.style.setProperty('--theme-particle-density', this.currentParticleDensity.toFixed(3));
    element.style.setProperty('--theme-bloom-resonance', this.currentBloomResonance.toFixed(3));
    element.style.setProperty('--theme-transition-progress', `${Math.round(this.progress * 100)}%`);
    element.style.setProperty('--theme-transition-active', this.isBlending ? '1' : '0');
  }

  public destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.listeners.clear();
  }
}
