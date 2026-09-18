export type NavbarFloatMode = 'sync' | 'water' | 'stormy' | 'cosmic' | 'focus' | 'cyberpunk' | 'fireplace' | 'snow';

export const NAVBAR_FLOAT_MODES: { id: NavbarFloatMode; label: string; icon: string; desc: string }[] = [
  { id: 'sync', label: 'Sync with Vibe', icon: '✨', desc: 'Dynamically matches current environment physics' },
  { id: 'water', label: 'Calm Waters Bobbing', icon: '💧', desc: 'Rhythmic 4.8s fluid water surface bobbing' },
  { id: 'stormy', label: 'Stormy Tempest Waves', icon: '⚡', desc: 'Turbulent 3.6s tilt & wind ripple sway' },
  { id: 'cosmic', label: 'Cosmic Zero-Gravity', icon: '🌌', desc: 'Weightless 9.0s deep void orbit drift' },
  { id: 'focus', label: 'Zen 16s Box-Breathing', icon: '🧘', desc: 'Calming 16.0s expansion & contraction pulse' },
  { id: 'cyberpunk', label: 'Cyber Matrix Pulse', icon: '🌆', desc: 'Synthetic 3.8s neon strobe vibration' },
  { id: 'fireplace', label: 'Hearth Ember Rise', icon: '🔥', desc: 'Warm 5.0s fireside floating warmth' },
  { id: 'snow', label: 'Tokyo Snow Drift', icon: '❄️', desc: 'Gentle 5.2s icy snowfall float' },
];

export function getVibeFloatClass(theme: string): string {
  const clean = theme.toLowerCase().replace(/[^a-z0-9_]/g, '');
  return `vibe-float-${clean}`;
}

export function getNavbarFloatClass(floatMode: NavbarFloatMode | string, currentTheme: string): string {
  if (floatMode === 'sync') {
    return getVibeFloatClass(currentTheme);
  }
  switch (floatMode) {
    case 'water': return 'vibe-float-rainy';
    case 'stormy': return 'vibe-float-stormy mode-stormy-water';
    case 'cosmic': return 'vibe-float-space';
    case 'focus': return 'vibe-float-focus';
    case 'cyberpunk': return 'vibe-float-cyberpunk';
    case 'fireplace': return 'vibe-float-cozy_fireplace_lofi';
    case 'snow': return 'vibe-float-tokyo_snow';
    default: return getVibeFloatClass(currentTheme);
  }
}
