import type { ClockConfig, ThemePreset, ClockVariant } from './types';

export const DEFAULT_CLOCK_CONFIG: ClockConfig = {
  variant: 'digital-minimal',
  size: 100,
  opacity: 100,
  blur: 0,
  borderRadius: 0,
  accentColor: '#6366f1',
  glowIntensity: 0,
  shadowSoftness: 0,
  animationIntensity: 100,

  hour12: true,
  showSeconds: false,
  fontFamily: 'Outfit',
  glowEffect: false,

  handStyle: 'modern',
  tickStyle: 'lines',
  faceTexture: 'none',
  smoothSweep: true,
  showRomanNumerals: false,
};

export const CLOCK_PRESETS: ThemePreset[] = [
  {
    id: 'midnight-focus',
    name: 'Midnight Focus',
    description: 'Dark, calm, deep concentration',
    icon: '🌙',
    config: {
      ...DEFAULT_CLOCK_CONFIG,
      variant: 'digital-minimal',
      accentColor: '#a5b4fc',
      glowIntensity: 30,
      opacity: 95,
      fontFamily: 'Outfit',
      animationIntensity: 60,
      showSeconds: false,
    },
  },
  {
    id: 'cyber-focus',
    name: 'Cyber Focus',
    description: 'Neon glow, futuristic edge',
    icon: '💠',
    config: {
      ...DEFAULT_CLOCK_CONFIG,
      variant: 'digital-neon',
      accentColor: '#22d3ee',
      glowIntensity: 80,
      glowEffect: true,
      fontFamily: 'monospace',
      animationIntensity: 100,
      showSeconds: true,
    },
  },
  {
    id: 'amoled',
    name: 'AMOLED Black',
    description: 'True black, battery-saving, crisp',
    icon: '⚫',
    config: {
      ...DEFAULT_CLOCK_CONFIG,
      variant: 'digital-amoled',
      accentColor: '#4ade80',
      glowIntensity: 0,
      opacity: 100,
      fontFamily: 'Outfit',
      animationIntensity: 30,
      showSeconds: false,
    },
  },
  {
    id: 'cozy-rain',
    name: 'Cozy Rain',
    description: 'Soft warm tones for rainy study days',
    icon: '☕',
    config: {
      ...DEFAULT_CLOCK_CONFIG,
      variant: 'digital-lofi',
      accentColor: '#fbbf24',
      glowIntensity: 20,
      opacity: 90,
      fontFamily: 'Inter',
      animationIntensity: 40,
      showSeconds: false,
      borderRadius: 16,
    },
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    description: 'Neon-lit city night aesthetic',
    icon: '🌃',
    config: {
      ...DEFAULT_CLOCK_CONFIG,
      variant: 'digital-glass',
      accentColor: '#c084fc',
      glowIntensity: 50,
      glowEffect: true,
      fontFamily: 'Outfit',
      animationIntensity: 70,
      showSeconds: true,
      borderRadius: 24,
    },
  },
  {
    id: 'minimal-white',
    name: 'Minimal White',
    description: 'Clean, light, distraction-free',
    icon: '⬜',
    config: {
      ...DEFAULT_CLOCK_CONFIG,
      variant: 'digital-minimal',
      accentColor: '#6366f1',
      glowIntensity: 0,
      opacity: 85,
      fontFamily: 'Outfit',
      animationIntensity: 20,
      showSeconds: false,
    },
  },
  {
    id: 'smartwatch',
    name: 'Smartwatch UI',
    description: 'Wear OS inspired glanceable time',
    icon: '⌚',
    config: {
      ...DEFAULT_CLOCK_CONFIG,
      variant: 'analog-apple',
      accentColor: '#34d399',
      glowIntensity: 15,
      handStyle: 'modern',
      tickStyle: 'dots',
      faceTexture: 'matte',
      smoothSweep: true,
      opacity: 95,
      animationIntensity: 80,
    },
  },
  {
    id: 'lofi-study',
    name: 'Lo-fi Study',
    description: 'Chill beats, warm CRT glow',
    icon: '🎧',
    config: {
      ...DEFAULT_CLOCK_CONFIG,
      variant: 'digital-retro',
      accentColor: '#f97316',
      glowIntensity: 40,
      glowEffect: true,
      fontFamily: 'monospace',
      animationIntensity: 50,
      showSeconds: true,
      opacity: 88,
      borderRadius: 8,
    },
  },
];

export function getDefaultConfig(): ClockConfig {
  return { ...DEFAULT_CLOCK_CONFIG };
}

export function getPreset(id: string): ThemePreset | undefined {
  return CLOCK_PRESETS.find(p => p.id === id);
}

export function applyPreset(_config: ClockConfig, preset: ThemePreset): ClockConfig {
  return { ...preset.config };
}

const STORAGE_KEY = 'study_flow_clock_config';
const CUSTOM_PRESETS_KEY = 'study_flow_clock_custom_presets';

export function saveClockConfig(config: ClockConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch { }
}

export function loadClockConfig(): ClockConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCustomPresets(presets: ThemePreset[]): void {
  try {
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(presets));
  } catch { }
}

export function loadCustomPresets(): ThemePreset[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PRESETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getVariantType(variant: ClockVariant): 'digital' | 'analog' {
  return variant.startsWith('digital-') ? 'digital' : 'analog';
}
