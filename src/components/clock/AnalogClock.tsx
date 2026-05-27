import React, { useMemo } from 'react';
import type { ClockConfig } from './types';

interface AnalogClockProps {
  hours: number;
  minutes: number;
  seconds: number;
  config: ClockConfig;
}

function getHandAngles(hours: number, minutes: number, seconds: number, _smooth: boolean) {
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const secAngle = ((seconds) / 60) * 360;
  const minAngle = ((minutes * 60 + seconds) / 3600) * 360;
  const hrAngle = ((totalSeconds % 43200) / 43200) * 360;
  return { secondAngle: secAngle, minuteAngle: minAngle, hourAngle: hrAngle };
}

function renderTicks(tickStyle: string, accentColor: string, variant: string) {
  const ticks: React.ReactElement[] = [];
  if (tickStyle === 'none') return ticks;
  const isMinimal = variant === 'analog-minimal';
  const isHolo = variant === 'analog-hologram';

  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    const outerR = isMinimal ? 43 : isHolo ? 40 : 42;
    const innerR = tickStyle === 'dots' ? 40 : tickStyle === 'lines' ? 36 : 36;
    const x1 = 50 + outerR * Math.cos(angle);
    const y1 = 50 + outerR * Math.sin(angle);
    const x2 = 50 + innerR * Math.cos(angle);
    const y2 = 50 + innerR * Math.sin(angle);

    if (tickStyle === 'roman' || tickStyle === 'numeric') {
      const labelR = 34;
      const lx = 50 + labelR * Math.cos(angle);
      const ly = 50 + labelR * Math.sin(angle);
      const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
      const numbers = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
      ticks.push(
        <text key={`num-${i}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="central"
          fill={accentColor} opacity={0.55} fontSize="3.8"
          fontFamily="Outfit, sans-serif" fontWeight="500"
        >
          {tickStyle === 'numeric' ? numbers[i] : numerals[i]}
        </text>
      );
    } else if (tickStyle === 'dots') {
      ticks.push(
        <circle key={`tick-${i}`} cx={x1} cy={y1} r={1.2} fill={accentColor} opacity={0.4} />
      );
    } else if (tickStyle === 'lines') {
      ticks.push(
        <line key={`tick-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={accentColor} strokeWidth={1.2} strokeLinecap="round" opacity={0.3} />
      );
    }
  }
  return ticks;
}

function renderFace(variant: string, accentColor: string, faceTexture: string) {
  const base = (() => {
    switch (variant) {
      case 'analog-minimal':
        return <circle cx="50" cy="50" r="44" fill="oklch(0.25 0.02 280 / 0.15)" stroke={`${accentColor}22`} strokeWidth="0.5" />;
      case 'analog-apple':
        return (
          <>
            <rect x="6" y="6" width="88" height="88" rx="16" fill="oklch(0.12 0.02 280 / 0.4)" stroke={`${accentColor}33`} strokeWidth="0.8" />
            <circle cx="50" cy="50" r="40" fill="oklch(0.15 0.02 280 / 0.3)" />
          </>
        );
      case 'analog-luxury':
        return (
          <>
            <circle cx="50" cy="50" r="45" fill="oklch(0.18 0.03 50 / 0.35)" stroke={`${accentColor}44`} strokeWidth="1.5" />
            <circle cx="50" cy="50" r="43" fill="none" stroke={`${accentColor}15`} strokeWidth="0.5" />
            <circle cx="50" cy="50" r="6" fill="none" stroke={`${accentColor}22`} strokeWidth="0.5" />
          </>
        );
      case 'analog-cozy':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="oklch(0.22 0.04 60 / 0.3)" stroke={`${accentColor}33`} strokeWidth="1" />
            <circle cx="50" cy="50" r="42" fill={`${accentColor}08`} />
          </>
        );
      case 'analog-hologram':
        return (
          <>
            <circle cx="50" cy="50" r="45" fill="none" stroke={`${accentColor}22`} strokeWidth="0.5" />
            <circle cx="50" cy="50" r="42" fill={`${accentColor}04`} />
            <circle cx="50" cy="50" r="38" fill="none" stroke={`${accentColor}11`} strokeWidth="0.3" strokeDasharray="2 3" />
            <circle cx="50" cy="50" r="30" fill="none" stroke={`${accentColor}08`} strokeWidth="0.3" />
            <circle cx="50" cy="50" r="20" fill="none" stroke={`${accentColor}06`} strokeWidth="0.2" />
          </>
        );
      default:
        return <circle cx="50" cy="50" r="44" fill="oklch(0.2 0.02 280 / 0.2)" stroke={`${accentColor}22`} strokeWidth="0.5" />;
    }
  })();

  if (faceTexture === 'none') return base;

  const textureElements: React.ReactElement[] = [];

  switch (faceTexture) {
    case 'matte':
      textureElements.push(
        <circle key="matte" cx="50" cy="50" r="46" fill="oklch(0.15 0.01 280 / 0.25)" />
      );
      break;
    case 'brushed':
      for (let i = 0; i < 30; i++) {
        const y = 2 + i * 3.2;
        textureElements.push(
          <line key={`brush-${i}`} x1="4" y1={y} x2="96" y2={y + (i % 3 - 1) * 0.5}
            stroke={accentColor} strokeWidth="0.3" opacity={0.06 + (i % 5) * 0.008} />
        );
      }
      break;
    case 'sunburst':
      for (let i = 0; i < 24; i++) {
        const a = (i * 15 - 90) * (Math.PI / 180);
        const x1 = 50 + 4 * Math.cos(a);
        const y1 = 50 + 4 * Math.sin(a);
        const x2 = 50 + 46 * Math.cos(a);
        const y2 = 50 + 46 * Math.sin(a);
        textureElements.push(
          <line key={`sun-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={accentColor} strokeWidth="0.4" opacity={0.04 + (i % 6) * 0.006} />
        );
      }
      break;
    case 'carbon':
      for (let r = 0; r < 12; r++) {
        for (let c = 0; c < 12; c++) {
          const cx = 4 + c * 8.4;
          const cy = 4 + r * 8.4;
          const dist = Math.sqrt((cx - 50) ** 2 + (cy - 50) ** 2);
          if (dist > 46) continue;
          if ((r + c) % 2 === 0) {
            textureElements.push(
              <circle key={`cb-${r}-${c}`} cx={cx} cy={cy} r="1.8"
                fill={accentColor} opacity={0.04} />
            );
          }
        }
      }
      break;
  }

  return <>{base}{textureElements}</>;
}

function renderHands(angles: ReturnType<typeof getHandAngles>, variant: string, accentColor: string, handStyle: string) {
  const hAngle = angles.hourAngle;
  const mAngle = angles.minuteAngle;
  const sAngle = angles.secondAngle;
  const transit = 'transform 0.1s linear';

  const secondColor = accentColor;
  const minuteColor = `oklch(0.92 0.02 280 / 0.85)`;
  const hourColor = `oklch(0.88 0.02 280 / 0.95)`;

  // Base hand dimensions per variant (units out of 100 viewBox, r≈44)
  const base = (() => {
    switch (variant) {
      case 'analog-apple': return { hw: 3.5, mw: 2.5, sw: 1, hl: 28, ml: 36, sl: 40 };
      case 'analog-luxury': return { hw: 2.5, mw: 1.8, sw: 0.8, hl: 28, ml: 36, sl: 40 };
      case 'analog-cozy': return { hw: 4, mw: 2.5, sw: 0.8, hl: 24, ml: 34, sl: 38 };
      case 'analog-hologram': return { hw: 2, mw: 1.5, sw: 0.5, hl: 28, ml: 36, sl: 40 };
      default: return { hw: 2, mw: 1.2, sw: 0.6, hl: 26, ml: 34, sl: 38 }; // minimal
    }
  })();

  // Hand style scaling factor applied to base dimensions
  const scale = (() => {
    switch (handStyle) {
      case 'thin': return { w: 0.6, l: 0.92, cap: 'round' as const };
      case 'modern': return { w: 1.1, l: 0.85, cap: 'butt' as const };
      case 'cathedral': return { w: 1.2, l: 0.85, cap: 'butt' as const };
      case 'hologram': return { w: 0.7, l: 0.95, cap: 'round' as const };
      default: return { w: 1, l: 1, cap: 'round' as const }; // classic (no change)
    }
  })();

  const hw = base.hw * scale.w;
  const mw = base.mw * scale.w;
  const sw = base.sw * scale.w;
  const hl = base.hl * scale.l;
  const ml = base.ml * scale.l;
  const sl = base.sl * scale.l;

  const baseHands = (() => {
    switch (variant) {
      case 'analog-hologram':
        return (
          <g opacity={0.35}>
            <line x1="50" y1="50" x2="50" y2={50 - hl} stroke={accentColor} strokeWidth={hw} strokeLinecap={scale.cap}
              transform={`rotate(${hAngle} 50 50)`} style={{ transition: transit }} />
            <line x1="50" y1="50" x2="50" y2={50 - ml} stroke={accentColor} strokeWidth={mw} strokeLinecap={scale.cap}
              transform={`rotate(${mAngle} 50 50)`} style={{ transition: transit }} />
            <line x1="50" y1="50" x2="50" y2={50 - sl} stroke={secondColor} strokeWidth={sw} strokeLinecap="round" opacity={0.5}
              transform={`rotate(${sAngle} 50 50)`} style={{ transition: transit }} />
            <circle cx="50" cy="50" r="2.5" fill="none" stroke={accentColor} strokeWidth="0.5" />
          </g>
        );
      default:
        return (
          <g>
            {handStyle === 'cathedral' ? (
              <>
                <path d={`M48 ${50 - hl} L50 ${50 - hl - 4} L52 ${50 - hl} L52 50 L48 50 Z`} fill={hourColor}
                  transform={`rotate(${hAngle} 50 50)`} style={{ transition: transit }} />
                <line x1="50" y1="50" x2="50" y2={50 - ml} stroke={minuteColor} strokeWidth={mw} strokeLinecap="round"
                  transform={`rotate(${mAngle} 50 50)`} style={{ transition: transit }} />
              </>
            ) : (
              <>
                <line x1="50" y1="50" x2="50" y2={50 - hl} stroke={hourColor} strokeWidth={hw} strokeLinecap={scale.cap}
                  transform={`rotate(${hAngle} 50 50)`} style={{ transition: transit }} />
                <line x1="50" y1="50" x2="50" y2={50 - ml} stroke={minuteColor} strokeWidth={mw} strokeLinecap={scale.cap}
                  transform={`rotate(${mAngle} 50 50)`} style={{ transition: transit }} />
              </>
            )}
            <line x1="50" y1="50" x2="50" y2={50 - sl} stroke={secondColor} strokeWidth={sw} strokeLinecap="round" opacity={0.5}
              transform={`rotate(${sAngle} 50 50)`} style={{ transition: transit }} />
            <circle cx="50" cy="50" r={handStyle === 'modern' ? 2.5 : handStyle === 'thin' ? 1.5 : 2} fill={accentColor} opacity={0.7} />
          </g>
        );
    }
  })();

  return baseHands;
}

export default function AnalogClock({ hours, minutes, seconds, config }: AnalogClockProps) {
  const angles = useMemo(
    () => getHandAngles(hours, minutes, seconds, config.smoothSweep),
    [hours, minutes, seconds, config.smoothSweep]
  );

  const variant = config.variant;
  const face = useMemo(() => renderFace(variant, config.accentColor, config.faceTexture), [variant, config.accentColor, config.faceTexture]);
  const ticks = useMemo(
    () => renderTicks(config.tickStyle, config.accentColor, variant),
    [config.tickStyle, config.accentColor, variant]
  );
  const hands = useMemo(
    () => renderHands(angles, variant, config.accentColor, config.handStyle),
    [angles, variant, config.accentColor, config.handStyle]
  );

  const glowFilter = config.glowIntensity > 0
    ? `drop-shadow(0 0 ${config.glowIntensity * 0.2}px ${config.accentColor}66)`
    : undefined;

  return (
    <div className="flex items-center justify-center select-none" style={{ filter: glowFilter }}>
      <svg viewBox="0 0 100 100" className="w-full h-full max-w-[55vh]" style={{ opacity: config.opacity / 100 }}>
        {face}
        {ticks}
        {hands}
      </svg>
    </div>
  );
}
