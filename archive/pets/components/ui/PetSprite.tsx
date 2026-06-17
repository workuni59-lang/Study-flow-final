import { useState, useEffect, useRef, useCallback } from 'react';
import type { SpriteAnimationConfig, PetAnimationName } from '../../config/pets';
import { PET_ANIMATIONS } from '../../config/pets';

interface PetSpriteProps {
  /** Pet species ID (e.g. 'pixie', 'ember') */
  species: string;
  /** Which animation to play */
  animation?: PetAnimationName;
  /** Display size in CSS pixels (default: 200) */
  size?: number;
  /** Additional CSS class names */
  className?: string;
  /** Whether the pet should float/bob gently */
  float?: boolean;
  /** Whether the pet is in dormant state */
  isDormant?: boolean;
  /** Skin ID for color customization */
  skin?: string;
  /** Callback when a non-looping animation completes */
  onAnimationComplete?: () => void;
}

/* ─── SKIN COLOR OVERLAYS ─────────────────────────────────────── */
/* Uses the sprite sheet as a CSS mask so color only hits visible pixels.
 * The base image gets a sepia/saturate/hue-rotate filter chain to
 * aggressively remap colors, then a masked overlay reinforces the tone. */

const SKIN_OVERLAYS: Record<string, { color: string; opacity: number; filter: string; blendMode?: string }> = {
  pixie_crimson: { color: '#06b6d4', opacity: 0.75, filter: 'sepia(1) saturate(5) hue-rotate(150deg) brightness(1.1)', blendMode: 'color' },
  pixie_royal: { color: '#7c3aed', opacity: 0.75, filter: 'sepia(1) saturate(5) hue-rotate(210deg) brightness(1.1)', blendMode: 'color' },
};

/**
 * PetSprite — renders a sprite sheet animation for a virtual pet.
 *
 * ── FRAME CALCULATION ──
 * Each animation plays one row (startRow) of the sprite sheet grid.
 * Total frames = cols (horizontal cycle within the row).
 *
 *   col         = frameIndex
 *   row         = startRow
 *   bgPositionX = -(col * displaySize) px
 *   bgPositionY = -(row * displaySize) px
 *
 * ── SPRITE SHEET ──
 * The full sheet (cols × rows) is scaled to (cols * size) × (rows * size)
 * as the background. The background-position shifts the visible area to
 * show the correct frame within the correct row.
 *
 * ── SKINS ──
 * Non-default skins apply a colored overlay (mix-blend-mode: color)
 * and optional CSS filter to transform the sprite's appearance.
 *
 * ── PERFORMANCE ──
 * Uses CSS background-image + background-position (GPU composited).
 * Frame stepping uses requestAnimationFrame throttled to the configured FPS.
 */
export default function PetSprite({
  species,
  animation = 'idle',
  size = 200,
  className = '',
  float = true,
  isDormant = false,
  skin,
  onAnimationComplete,
}: PetSpriteProps) {

  // Resolve the animation config for the current species + animation state
  const speciesAnims = PET_ANIMATIONS[species];
  const config: SpriteAnimationConfig | undefined = speciesAnims?.[animation];

  // If no sprite config found, render nothing (parent can show SVG fallback)
  if (!config) return null;

  return (
    <SpriteRenderer
      config={config}
      size={size}
      className={className}
      float={float}
      isDormant={isDormant}
      skin={skin}
      onAnimationComplete={onAnimationComplete}
    />
  );
}

/* ─── INTERNAL RENDERER ────────────────────────────────────────── */

interface RendererProps {
  config: SpriteAnimationConfig;
  size: number;
  className: string;
  float: boolean;
  isDormant: boolean;
  skin?: string;
  onAnimationComplete?: () => void;
}

function SpriteRenderer({
  config,
  size,
  className,
  float: enableFloat,
  isDormant,
  skin,
  onAnimationComplete,
}: RendererProps) {

  const { src, cols, rows, fps, loop } = config;
  const startRow = config.startRow ?? 0;
  const totalFrames = cols;

  const [frameIndex, setFrameIndex] = useState(0);
  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const completedRef = useRef(false);

  const frameInterval = 1000 / fps;

  const tick = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = timestamp - lastTimeRef.current;

    if (delta >= frameInterval) {
      lastTimeRef.current = timestamp - (delta % frameInterval);

      const nextFrame = frameRef.current + 1;

      if (nextFrame >= totalFrames) {
        if (loop) {
          frameRef.current = 0;
          setFrameIndex(0);
        } else {
          if (!completedRef.current) {
            completedRef.current = true;
            onAnimationComplete?.();
          }
          return;
        }
      } else {
        frameRef.current = nextFrame;
        setFrameIndex(nextFrame);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [totalFrames, loop, frameInterval, onAnimationComplete]);

  useEffect(() => {
    completedRef.current = false;
    lastTimeRef.current = 0;
    frameRef.current = 0;
    setFrameIndex(0);

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  const col = frameIndex;
  const row = startRow;

  const baseFilter = 'saturate(1.25) brightness(1.08)';
  const overlay = skin ? SKIN_OVERLAYS[skin] : undefined;
  const skinFilter = overlay?.filter ?? '';
  const combinedFilter = skinFilter || baseFilter;

  return (
    <div
      className={`relative overflow-hidden ${enableFloat ? 'animate-float' : ''} ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      <div
        className="w-full h-full bg-no-repeat pointer-events-none"
        style={{
          width: size,
          height: size,
          backgroundImage: `url(/${src})`,
          backgroundSize: `${cols * size}px ${rows * size}px`,
          backgroundPosition: `${-(col * size)}px ${-(row * size)}px`,
          imageRendering: 'auto',
          filter: combinedFilter,
          opacity: isDormant ? 0.4 : 1,
          transition: 'opacity 0.6s ease, filter 0.6s ease',
          willChange: 'background-position',
        }}
      />
      {overlay && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            width: size,
            height: size,
            background: overlay.color,
            opacity: overlay.opacity,
            mixBlendMode: (overlay.blendMode ?? 'overlay') as any,
            WebkitMaskImage: `url(/${src})`,
            WebkitMaskSize: `${cols * size}px ${rows * size}px`,
            WebkitMaskPosition: `${-(col * size)}px ${-(row * size)}px`,
            maskImage: `url(/${src})`,
            maskSize: `${cols * size}px ${rows * size}px`,
            maskPosition: `${-(col * size)}px ${-(row * size)}px`,
            maskRepeat: 'no-repeat',
            transition: 'opacity 0.6s ease',
          }}
        />
      )}
    </div>
  );
}
