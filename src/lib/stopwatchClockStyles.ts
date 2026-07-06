import type { CSSProperties } from 'react';

export interface ClockStyleDef {
  id: string;
  label: string;
  previewStyle: CSSProperties;
}

export const CLOCK_STYLES: ClockStyleDef[] = [
  {
    id: 'digital',
    label: 'Digital',
    previewStyle: {
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 700,
      fontSize: '24px',
      letterSpacing: '-0.02em',
      color: 'rgba(255,255,255,0.85)',
      textShadow: '0 1px 4px rgba(0,0,0,0.4)',
    },
  },
  {
    id: 'split-flap',
    label: 'Split-Flap',
    previewStyle: {
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 700,
      fontSize: '22px',
      color: 'rgba(255,255,255,0.9)',
      borderBottom: '1px solid rgba(255,255,255,0.15)',
      textShadow: '0 1px 3px rgba(0,0,0,0.4)',
    },
  },
  {
    id: 'dial',
    label: 'Dial',
    previewStyle: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.15)',
    },
  },
  {
    id: 'minimal',
    label: 'Minimal Line',
    previewStyle: {
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 300,
      fontSize: '22px',
      letterSpacing: '0.04em',
      color: 'rgba(255,255,255,0.5)',
    },
  },
  {
    id: 'segmented',
    label: 'Segmented LED',
    previewStyle: {
      fontFamily: 'SF Mono, ui-monospace, monospace',
      fontWeight: 400,
      fontSize: '22px',
      letterSpacing: '0.15em',
      color: 'rgba(129,140,248,0.8)',
      textShadow: '0 0 8px rgba(129,140,248,0.3), 0 0 20px rgba(129,140,248,0.1)',
    },
  },
  {
    id: 'stacked',
    label: 'Vertical Stack',
    previewStyle: {
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 700,
      fontSize: '14px',
      lineHeight: '1.4',
      color: 'rgba(255,255,255,0.85)',
      textShadow: '0 1px 4px rgba(0,0,0,0.4)',
    },
  },
];

export const CLOCK_STYLE_IDS = CLOCK_STYLES.map(s => s.id);
export const CLOCK_STYLE_DEFAULT = CLOCK_STYLES[0].id;
