export type ClockVariant =
  | 'digital-minimal'
  | 'digital-amoled'
  | 'digital-neon'
  | 'digital-retro'
  | 'digital-glass'
  | 'digital-matrix'
  | 'digital-flip'
  | 'digital-lofi'
  | 'analog-minimal'
  | 'analog-apple'
  | 'analog-luxury'
  | 'analog-cozy'
  | 'analog-hologram';

export type HandStyle = 'classic' | 'modern' | 'thin' | 'cathedral' | 'hologram';
export type TickStyle = 'roman' | 'numeric' | 'dots' | 'lines' | 'none';
export type FaceTexture = 'none' | 'brushed' | 'sunburst' | 'matte' | 'carbon';

export type FocusMode = 'focus' | 'shortBreak' | 'longBreak' | 'idle';

export interface ClockConfig {
  variant: ClockVariant;
  size: number;
  opacity: number;
  blur: number;
  borderRadius: number;
  accentColor: string;
  glowIntensity: number;
  shadowSoftness: number;
  animationIntensity: number;

  hour12: boolean;
  showSeconds: boolean;
  fontFamily: string;
  glowEffect: boolean;

  handStyle: HandStyle;
  tickStyle: TickStyle;
  faceTexture: FaceTexture;
  smoothSweep: boolean;
  showRomanNumerals: boolean;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  config: ClockConfig;
}

export interface ClockFocusState {
  mode: FocusMode;
  timeLeft: number;
  totalTime: number;
  isActive: boolean;
  sessionsCompleted: number;
}
