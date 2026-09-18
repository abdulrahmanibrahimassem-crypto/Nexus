import { ThemeMode } from '../types';

export interface ThemeToken {
  accent: string;
  glow: string;
  textTint: string;
  textPrimary: string;
  textSecondary: string;
  borderAccent: string;
  badgeBg: string;
  auroraGrad: string;
}

export const THEME_TOKENS: Record<ThemeMode, ThemeToken> = {
  rainy: {
    accent: '#60a5fa',
    glow: 'rgba(96, 165, 250, 0.35)',
    textTint: '#eff6ff',
    textPrimary: '#ffffff',
    textSecondary: '#cbd5e1',
    borderAccent: 'rgba(96, 165, 250, 0.45)',
    badgeBg: 'rgba(96, 165, 250, 0.15)',
    auroraGrad: 'radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, rgba(37, 99, 235, 0.08) 40%, transparent 70%)',
  },
  stormy: {
    accent: '#facc15',
    glow: 'rgba(250, 204, 21, 0.4)',
    textTint: '#fefce8',
    textPrimary: '#fefce8',
    textSecondary: '#fde047',
    borderAccent: 'rgba(250, 204, 21, 0.5)',
    badgeBg: 'rgba(250, 204, 21, 0.18)',
    auroraGrad: 'radial-gradient(circle, rgba(250, 204, 21, 0.16) 0%, rgba(202, 138, 4, 0.08) 40%, transparent 70%)',
  },
  focus: {
    accent: '#34d399',
    glow: 'rgba(52, 211, 153, 0.35)',
    textTint: '#ecfdf5',
    textPrimary: '#f0fdf4',
    textSecondary: '#a7f3d0',
    borderAccent: 'rgba(52, 211, 153, 0.45)',
    badgeBg: 'rgba(52, 211, 153, 0.15)',
    auroraGrad: 'radial-gradient(circle, rgba(52, 211, 153, 0.15) 0%, rgba(5, 150, 105, 0.08) 40%, transparent 70%)',
  },
  fun: {
    accent: '#f472b6',
    glow: 'rgba(244, 114, 182, 0.4)',
    textTint: '#fdf2f8',
    textPrimary: '#fff1f2',
    textSecondary: '#fbcfe8',
    borderAccent: 'rgba(244, 114, 182, 0.5)',
    badgeBg: 'rgba(244, 114, 182, 0.18)',
    auroraGrad: 'radial-gradient(circle, rgba(244, 114, 182, 0.16) 0%, rgba(219, 39, 119, 0.08) 40%, transparent 70%)',
  },
  zen: {
    accent: '#a78bfa',
    glow: 'rgba(167, 139, 250, 0.35)',
    textTint: '#f5f3ff',
    textPrimary: '#faf5ff',
    textSecondary: '#ddd6fe',
    borderAccent: 'rgba(167, 139, 250, 0.45)',
    badgeBg: 'rgba(167, 139, 250, 0.15)',
    auroraGrad: 'radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, rgba(109, 40, 217, 0.08) 40%, transparent 70%)',
  },
  cyberpunk: {
    accent: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.5)',
    textTint: '#fce7f3',
    textPrimary: '#ffffff',
    textSecondary: '#f472b6',
    borderAccent: 'rgba(236, 72, 153, 0.65)',
    badgeBg: 'rgba(236, 72, 153, 0.22)',
    auroraGrad: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, rgba(6, 182, 212, 0.15) 50%, transparent 70%)',
  },
  space: {
    accent: '#818cf8',
    glow: 'rgba(129, 140, 248, 0.45)',
    textTint: '#e0e7ff',
    textPrimary: '#e0e7ff',
    textSecondary: '#c7d2fe',
    borderAccent: 'rgba(129, 140, 248, 0.55)',
    badgeBg: 'rgba(129, 140, 248, 0.2)',
    auroraGrad: 'radial-gradient(circle, rgba(129, 140, 248, 0.18) 0%, rgba(79, 70, 229, 0.1) 40%, transparent 70%)',
  },
  library: {
    accent: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.35)',
    textTint: '#fffbeb',
    textPrimary: '#fffbeb',
    textSecondary: '#fde68a',
    borderAccent: 'rgba(251, 191, 36, 0.45)',
    badgeBg: 'rgba(251, 191, 36, 0.15)',
    auroraGrad: 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, rgba(180, 83, 9, 0.08) 40%, transparent 70%)',
  },
  ocean: {
    accent: '#22d3ee',
    glow: 'rgba(34, 211, 238, 0.4)',
    textTint: '#ecfeff',
    textPrimary: '#ecfeff',
    textSecondary: '#a5f3fc',
    borderAccent: 'rgba(34, 211, 238, 0.5)',
    badgeBg: 'rgba(34, 211, 238, 0.18)',
    auroraGrad: 'radial-gradient(circle, rgba(34, 211, 238, 0.16) 0%, rgba(14, 116, 144, 0.08) 40%, transparent 70%)',
  },
  autumn: {
    accent: '#fb923c',
    glow: 'rgba(251, 146, 60, 0.4)',
    textTint: '#fff7ed',
    textPrimary: '#fff7ed',
    textSecondary: '#fed7aa',
    borderAccent: 'rgba(251, 146, 60, 0.5)',
    badgeBg: 'rgba(251, 146, 60, 0.18)',
    auroraGrad: 'radial-gradient(circle, rgba(251, 146, 60, 0.16) 0%, rgba(194, 65, 12, 0.08) 40%, transparent 70%)',
  },
  train: {
    accent: '#94a3b8',
    glow: 'rgba(148, 163, 184, 0.35)',
    textTint: '#f8fafc',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    borderAccent: 'rgba(148, 163, 184, 0.45)',
    badgeBg: 'rgba(148, 163, 184, 0.15)',
    auroraGrad: 'radial-gradient(circle, rgba(148, 163, 184, 0.15) 0%, rgba(71, 85, 105, 0.08) 40%, transparent 70%)',
  },
  rainforest: {
    accent: '#4ade80',
    glow: 'rgba(74, 222, 128, 0.4)',
    textTint: '#f0fdf4',
    textPrimary: '#f0fdf4',
    textSecondary: '#bbf7d0',
    borderAccent: 'rgba(74, 222, 128, 0.5)',
    badgeBg: 'rgba(74, 222, 128, 0.18)',
    auroraGrad: 'radial-gradient(circle, rgba(74, 222, 128, 0.16) 0%, rgba(22, 101, 52, 0.08) 40%, transparent 70%)',
  },
  blizzard: {
    accent: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.4)',
    textTint: '#f0f9ff',
    textPrimary: '#f0f9ff',
    textSecondary: '#bae6fd',
    borderAccent: 'rgba(56, 189, 248, 0.5)',
    badgeBg: 'rgba(56, 189, 248, 0.18)',
    auroraGrad: 'radial-gradient(circle, rgba(56, 189, 248, 0.16) 0%, rgba(3, 105, 161, 0.08) 40%, transparent 70%)',
  },
  wizard: {
    accent: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.45)',
    textTint: '#faf5ff',
    textPrimary: '#faf5ff',
    textSecondary: '#e9d5ff',
    borderAccent: 'rgba(192, 132, 252, 0.55)',
    badgeBg: 'rgba(192, 132, 252, 0.2)',
    auroraGrad: 'radial-gradient(circle, rgba(192, 132, 252, 0.18) 0%, rgba(126, 34, 206, 0.1) 40%, transparent 70%)',
  },
  desert: {
    accent: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
    textTint: '#fffbeb',
    textPrimary: '#fffbeb',
    textSecondary: '#fde68a',
    borderAccent: 'rgba(245, 158, 11, 0.5)',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    auroraGrad: 'radial-gradient(circle, rgba(245, 158, 11, 0.16) 0%, rgba(180, 83, 9, 0.08) 40%, transparent 70%)',
  },
  vinyl: {
    accent: '#d97706',
    glow: 'rgba(217, 119, 6, 0.4)',
    textTint: '#fef3c7',
    textPrimary: '#fef3c7',
    textSecondary: '#fcd34d',
    borderAccent: 'rgba(217, 119, 6, 0.5)',
    badgeBg: 'rgba(217, 119, 6, 0.18)',
    auroraGrad: 'radial-gradient(circle, rgba(217, 119, 6, 0.16) 0%, rgba(120, 53, 15, 0.08) 40%, transparent 70%)',
  },
  hogwarts: {
    accent: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    textTint: '#ecfdf5',
    textPrimary: '#ecfdf5',
    textSecondary: '#a7f3d0',
    borderAccent: 'rgba(16, 185, 129, 0.5)',
    badgeBg: 'rgba(16, 185, 129, 0.18)',
    auroraGrad: 'radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, rgba(6, 78, 59, 0.08) 40%, transparent 70%)',
  },
  bamboo: {
    accent: '#84cc16',
    glow: 'rgba(132, 204, 22, 0.4)',
    textTint: '#f7fee7',
    textPrimary: '#f7fee7',
    textSecondary: '#bef264',
    borderAccent: 'rgba(132, 204, 22, 0.5)',
    badgeBg: 'rgba(132, 204, 22, 0.18)',
    auroraGrad: 'radial-gradient(circle, rgba(132, 204, 22, 0.16) 0%, rgba(54, 83, 20, 0.08) 40%, transparent 70%)',
  },
  coding: {
    accent: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.45)',
    textTint: '#ecfeff',
    textPrimary: '#ecfeff',
    textSecondary: '#a5f3fc',
    borderAccent: 'rgba(6, 182, 212, 0.55)',
    badgeBg: 'rgba(6, 182, 212, 0.2)',
    auroraGrad: 'radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, rgba(14, 116, 144, 0.1) 40%, transparent 70%)',
  },
  greenhouse: {
    accent: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    textTint: '#ecfdf5',
    textPrimary: '#ffffff',
    textSecondary: '#a7f3d0',
    borderAccent: 'rgba(16, 185, 129, 0.5)',
    badgeBg: 'rgba(16, 185, 129, 0.18)',
    auroraGrad: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(4, 120, 87, 0.1) 40%, transparent 70%)',
  },
  tokyo_snow: {
    accent: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.4)',
    textTint: '#f0f9ff',
    textPrimary: '#ffffff',
    textSecondary: '#bae6fd',
    borderAccent: 'rgba(56, 189, 248, 0.5)',
    badgeBg: 'rgba(56, 189, 248, 0.18)',
    auroraGrad: 'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, rgba(2, 132, 199, 0.1) 40%, transparent 70%)',
  },
  waterfall: {
    accent: '#0ea5e9',
    glow: 'rgba(14, 165, 233, 0.4)',
    textTint: '#f0f9ff',
    textPrimary: '#ffffff',
    textSecondary: '#bae6fd',
    borderAccent: 'rgba(14, 165, 233, 0.5)',
    badgeBg: 'rgba(14, 165, 233, 0.18)',
    auroraGrad: 'radial-gradient(circle, rgba(14, 165, 233, 0.18) 0%, rgba(3, 105, 161, 0.1) 40%, transparent 70%)',
  },
  bookstore: {
    accent: '#d97706',
    glow: 'rgba(217, 119, 6, 0.4)',
    textTint: '#fffbeb',
    textPrimary: '#ffffff',
    textSecondary: '#fde68a',
    borderAccent: 'rgba(217, 119, 6, 0.5)',
    badgeBg: 'rgba(217, 119, 6, 0.18)',
    auroraGrad: 'radial-gradient(circle, rgba(217, 119, 6, 0.18) 0%, rgba(146, 64, 14, 0.1) 40%, transparent 70%)',
  },
  aurora: {
    accent: '#2dd4bf',
    glow: 'rgba(45, 212, 191, 0.45)',
    textTint: '#f0fdfa',
    textPrimary: '#ffffff',
    textSecondary: '#99f6e4',
    borderAccent: 'rgba(45, 212, 191, 0.55)',
    badgeBg: 'rgba(45, 212, 191, 0.2)',
    auroraGrad: 'radial-gradient(circle, rgba(45, 212, 191, 0.2) 0%, rgba(13, 148, 136, 0.12) 40%, transparent 70%)',
  },
  starlit_desert: {
    accent: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
    textTint: '#fffbeb',
    textPrimary: '#ffffff',
    textSecondary: '#fde68a',
    borderAccent: 'rgba(245, 158, 11, 0.5)',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    auroraGrad: 'radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, rgba(180, 83, 9, 0.1) 40%, transparent 70%)',
  },
  midnight_dome: {
    accent: '#6366f1',
    glow: 'rgba(99, 102, 241, 0.45)',
    textTint: '#eef2ff',
    textPrimary: '#ffffff',
    textSecondary: '#c7d2fe',
    borderAccent: 'rgba(99, 102, 241, 0.55)',
    badgeBg: 'rgba(99, 102, 241, 0.2)',
    auroraGrad: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(67, 56, 202, 0.12) 40%, transparent 70%)',
  },
  paris_balcony: {
    accent: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.4)',
    textTint: '#fff1f2',
    textPrimary: '#ffffff',
    textSecondary: '#fbcfe8',
    borderAccent: 'rgba(244, 63, 94, 0.5)',
    badgeBg: 'rgba(244, 63, 94, 0.18)',
    auroraGrad: 'radial-gradient(circle, rgba(244, 63, 94, 0.18) 0%, rgba(190, 18, 60, 0.1) 40%, transparent 70%)',
  },
  deep_sea: {
    accent: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.45)',
    textTint: '#f0f9ff',
    textPrimary: '#ffffff',
    textSecondary: '#7dd3fc',
    borderAccent: 'rgba(56, 189, 248, 0.55)',
    badgeBg: 'rgba(56, 189, 248, 0.2)',
    auroraGrad: 'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, rgba(3, 105, 161, 0.12) 40%, transparent 70%)',
  },
  egyptian_temple: {
    accent: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.4)',
    textTint: '#fffbeb',
    textPrimary: '#ffffff',
    textSecondary: '#fde68a',
    borderAccent: 'rgba(251, 191, 36, 0.5)',
    badgeBg: 'rgba(251, 191, 36, 0.18)',
    auroraGrad: 'radial-gradient(circle, rgba(251, 191, 36, 0.18) 0%, rgba(180, 83, 9, 0.1) 40%, transparent 70%)',
  },
  cyberpunk_loft: {
    accent: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.45)',
    textTint: '#fff1f2',
    textPrimary: '#ffffff',
    textSecondary: '#fda4af',
    borderAccent: 'rgba(244, 63, 94, 0.55)',
    badgeBg: 'rgba(244, 63, 94, 0.2)',
    auroraGrad: 'radial-gradient(circle, rgba(244, 63, 94, 0.2) 0%, rgba(225, 29, 72, 0.12) 40%, transparent 70%)',
  },
  whispering_pine: {
    accent: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    textTint: '#ecfdf5',
    textPrimary: '#ffffff',
    textSecondary: '#6ee7b7',
    borderAccent: 'rgba(16, 185, 129, 0.5)',
    badgeBg: 'rgba(16, 185, 129, 0.18)',
    auroraGrad: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(5, 150, 105, 0.1) 40%, transparent 70%)',
  },
  victorian_storm: {
    accent: '#d97706',
    glow: 'rgba(217, 119, 6, 0.4)',
    textTint: '#fffbeb',
    textPrimary: '#ffffff',
    textSecondary: '#fcd34d',
    borderAccent: 'rgba(217, 119, 6, 0.5)',
    badgeBg: 'rgba(217, 119, 6, 0.18)',
    auroraGrad: 'radial-gradient(circle, rgba(217, 119, 6, 0.18) 0%, rgba(180, 83, 9, 0.1) 40%, transparent 70%)',
  },
  zen_stone: {
    accent: '#14b8a6',
    glow: 'rgba(20, 184, 166, 0.4)',
    textTint: '#f0fdfa',
    textPrimary: '#ffffff',
    textSecondary: '#5eead4',
    borderAccent: 'rgba(20, 184, 166, 0.5)',
    badgeBg: 'rgba(20, 184, 166, 0.18)',
    auroraGrad: 'radial-gradient(circle, rgba(20, 184, 166, 0.18) 0%, rgba(13, 148, 136, 0.1) 40%, transparent 70%)',
  },
  lunar_base: {
    accent: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.45)',
    textTint: '#eff6ff',
    textPrimary: '#ffffff',
    textSecondary: '#93c5fd',
    borderAccent: 'rgba(59, 130, 246, 0.55)',
    badgeBg: 'rgba(59, 130, 246, 0.2)',
    auroraGrad: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(30, 64, 175, 0.12) 40%, transparent 70%)',
  },
  late_night_train: {
    accent: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.4)',
    textTint: '#fffbeb',
    textPrimary: '#ffffff',
    textSecondary: '#fde68a',
    borderAccent: 'rgba(251, 191, 36, 0.5)',
    badgeBg: 'rgba(251, 191, 36, 0.18)',
    auroraGrad: 'radial-gradient(circle, rgba(251, 191, 36, 0.18) 0%, rgba(180, 83, 9, 0.1) 40%, transparent 70%)',
  },
  cozy_fireplace: {
    accent: '#f97316',
    glow: 'rgba(249, 115, 22, 0.45)',
    textTint: '#fff7ed',
    textPrimary: '#ffffff',
    textSecondary: '#fdba74',
    borderAccent: 'rgba(249, 115, 22, 0.55)',
    badgeBg: 'rgba(249, 115, 22, 0.2)',
    auroraGrad: 'radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, rgba(194, 65, 12, 0.12) 40%, transparent 70%)',
  },
  cozy_fireplace_lofi: {
    accent: '#f97316',
    glow: 'rgba(249, 115, 22, 0.45)',
    textTint: '#fff7ed',
    textPrimary: '#ffffff',
    textSecondary: '#fdba74',
    borderAccent: 'rgba(249, 115, 22, 0.55)',
    badgeBg: 'rgba(249, 115, 22, 0.2)',
    auroraGrad: 'radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, rgba(194, 65, 12, 0.12) 40%, transparent 70%)',
  },
  deep_space_observatory: {
    accent: '#818cf8',
    glow: 'rgba(129, 140, 248, 0.45)',
    textTint: '#eef2ff',
    textPrimary: '#ffffff',
    textSecondary: '#c7d2fe',
    borderAccent: 'rgba(129, 140, 248, 0.55)',
    badgeBg: 'rgba(129, 140, 248, 0.2)',
    auroraGrad: 'radial-gradient(circle, rgba(129, 140, 248, 0.22) 0%, rgba(67, 56, 202, 0.12) 40%, transparent 70%)',
  },
  vintage_vinyl_jazz: {
    accent: '#d97706',
    glow: 'rgba(217, 119, 6, 0.45)',
    textTint: '#fffbeb',
    textPrimary: '#ffffff',
    textSecondary: '#fde68a',
    borderAccent: 'rgba(217, 119, 6, 0.55)',
    badgeBg: 'rgba(217, 119, 6, 0.2)',
    auroraGrad: 'radial-gradient(circle, rgba(217, 119, 6, 0.2) 0%, rgba(146, 64, 14, 0.12) 40%, transparent 70%)',
  },
  starlit_desert_night: {
    accent: '#eab308',
    glow: 'rgba(234, 179, 8, 0.45)',
    textTint: '#fefce8',
    textPrimary: '#ffffff',
    textSecondary: '#fef08a',
    borderAccent: 'rgba(234, 179, 8, 0.55)',
    badgeBg: 'rgba(234, 179, 8, 0.2)',
    auroraGrad: 'radial-gradient(circle, rgba(234, 179, 8, 0.2) 0%, rgba(161, 98, 7, 0.12) 40%, transparent 70%)',
  },
};

export function calculateLuminance(hexColor: string): number {
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return 0.5;
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map(v => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function applyThemeTokens(theme: ThemeMode, variant: 'light' | 'dark' = 'dark') {
  const token = THEME_TOKENS[theme] || THEME_TOKENS.rainy;
  const root = document.documentElement;
  
  // Calculate relative luminance of the accent and ambient theme tint (WCAG standard)
  const accentLum = calculateLuminance(token.accent);
  const textTintLum = calculateLuminance(token.textTint);
  
  // Weighted atmospheric luminance based on accent color, ambient background variant, and text tint
  const atmosphereLuminance = Math.round(
    (accentLum * 0.70 + textTintLum * 0.15 + (variant === 'light' ? 0.20 : 0.05)) * 100
  ) / 100;
  
  // Higher luminance requires bolder text weights and stronger, deeper shadows to prevent wash-out against luminous glass reflections
  // Normalized contrast modifier: ~0.88 (deep low-luminance) to 1.45 (bright high-luminance)
  const contrastModifier = Math.round((0.88 + (atmosphereLuminance * 0.72)) * 100) / 100;
  const computedShadowIntensity = Math.round((0.76 + (atmosphereLuminance * 0.24)) * 100) / 100;
  const computedFontWeight = atmosphereLuminance > 0.42 ? 600 : 500;

  root.style.setProperty('--mode-accent', token.accent);
  root.style.setProperty('--mode-glow', token.glow);
  root.style.setProperty('--mode-text-tint', token.textTint);
  root.style.setProperty('--text-primary', token.textPrimary);
  root.style.setProperty('--text-secondary', token.textSecondary);
  root.style.setProperty('--mode-text-main', token.textPrimary);
  root.style.setProperty('--mode-text-muted', token.textSecondary);
  root.style.setProperty('--mode-accent-glow', token.glow);
  root.style.setProperty('--mode-border-accent', token.borderAccent);
  root.style.setProperty('--mode-badge-bg', token.badgeBg);
  root.style.setProperty('--mode-aurora-grad', token.auroraGrad);

  // Computed CSS variables for atmosphere luminance and text contrast modifier
  root.style.setProperty('--mode-luminance', String(atmosphereLuminance));
  root.style.setProperty('--atmosphere-luminance', String(atmosphereLuminance));
  root.style.setProperty('--text-contrast-modifier', String(contrastModifier));
  root.style.setProperty('--text-shadow-intensity', String(computedShadowIntensity));
  root.style.setProperty('--glass-text-weight', String(computedFontWeight));
}
