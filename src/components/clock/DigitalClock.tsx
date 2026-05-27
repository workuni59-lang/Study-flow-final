import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ClockConfig } from './types';
import { digitTransition, flipDigitTransition, shouldAnimate, getAnimationIntensity } from './ClockAnimations';

interface DigitalClockProps {
  hours: number;
  minutes: number;
  seconds: number;
  ampm: string;
  config: ClockConfig;
}

function AnimatedDigit({ value, intensity, variant = 'default' }: { value: string; intensity: number; variant?: 'default' | 'flip' }) {
  const animate = shouldAnimate(intensity);
  const baseVariants = variant === 'flip' ? flipDigitTransition : digitTransition;
  const intensityFactor = intensity / 100;
  const yOffset = 15 + intensityFactor * 35;
  const blurAmt = 2 + intensityFactor * 8;
  const scaleAmt = 0.9 + (1 - intensityFactor) * 0.1;
  const dur = 0.25 - intensityFactor * 0.1;
  const customVariants = variant === 'flip' ? undefined : {
    initial: { y: yOffset, opacity: 0, scale: scaleAmt, filter: `blur(${blurAmt}px)` },
    animate: { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { y: -yOffset, opacity: 0, scale: scaleAmt, filter: `blur(${blurAmt}px)` },
  };
  return (
    <span className="relative inline-block tabular-nums">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          variants={animate ? (customVariants || baseVariants) : undefined}
          initial={animate ? 'initial' : false}
          animate={animate ? 'animate' : { opacity: 1 }}
          exit={animate ? 'exit' : undefined}
          transition={{ duration: dur, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
          style={{ perspective: animate ? '800px' : undefined }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ── MINIMAL ─────────────────────────────────── */
function Minimal({ hours, minutes, seconds, ampm, config, padHours }: DigitalClockProps & { padHours: string }) {
  const i = getAnimationIntensity(config.animationIntensity);
  return (
    <div className="flex items-baseline justify-center select-none" style={{ fontFamily: config.fontFamily, color: `oklch(0.97 0.01 280 / ${config.opacity / 100})` }}>
      <span className="tracking-tight font-medium leading-none text-[1em]">
        <AnimatedDigit value={padHours} intensity={i} />
        <span className="mx-1 opacity-30">:</span>
        <AnimatedDigit value={minutes.toString().padStart(2, '0')} intensity={i} />
        {config.showSeconds && (
          <><span className="mx-0.5 text-[0.45em] align-middle opacity-20">:</span><span className="text-[0.45em] align-middle opacity-50"><AnimatedDigit value={seconds.toString().padStart(2, '0')} intensity={i} /></span></>
        )}
      </span>
      {config.hour12 && <span className="ml-2 text-[0.25em] font-medium tracking-wider opacity-30">{ampm}</span>}
    </div>
  );
}

/* ── AMOLED ──────────────────────────────────── */
function Amoled({ hours, minutes, seconds, ampm, config, padHours }: DigitalClockProps & { padHours: string }) {
  const i = getAnimationIntensity(config.animationIntensity);
  return (
    <div className="flex flex-col items-center select-none gap-1" style={{ fontFamily: config.fontFamily }}>
      <div className="rounded-2xl px-6 py-3" style={{ background: '#000', border: `1px solid ${config.accentColor}15` }}>
        <div className="flex items-baseline justify-center tracking-tight font-extralight leading-none" style={{ color: config.accentColor }}>
          <span className="text-[1em]">
            <AnimatedDigit value={padHours} intensity={i} />
            <span className="mx-1 opacity-20">:</span>
            <AnimatedDigit value={minutes.toString().padStart(2, '0')} intensity={i} />
            {config.showSeconds && (
              <><span className="mx-0.5 text-[0.35em] align-middle opacity-10">:</span><span className="text-[0.35em] align-middle opacity-30"><AnimatedDigit value={seconds.toString().padStart(2, '0')} intensity={i} /></span></>
            )}
          </span>
        </div>
      </div>
      {config.hour12 && (
        <span className="text-[0.18em] tracking-[0.3em] font-medium uppercase" style={{ color: config.accentColor, opacity: 0.25 }}>{ampm}</span>
      )}
    </div>
  );
}

/* ── NEON ────────────────────────────────────── */
function Neon({ hours, minutes, seconds, ampm, config, padHours }: DigitalClockProps & { padHours: string }) {
  const i = getAnimationIntensity(config.animationIntensity);
  const glow = `0 0 7px ${config.accentColor}, 0 0 20px ${config.accentColor}88, 0 0 40px ${config.accentColor}44, 0 0 80px ${config.accentColor}22`;
  const altGlow = `0 0 4px ${config.accentColor}, 0 0 15px ${config.accentColor}66`;
  return (
    <div className="flex items-baseline justify-center select-none" style={{ fontFamily: "'Courier New', monospace" }}>
      <div className="relative px-4 py-2" style={{
        background: `linear-gradient(180deg, ${config.accentColor}08, transparent)`,
        border: `1px solid ${config.accentColor}22`,
        borderRadius: 4,
      }}>
        <div className="flex items-baseline justify-center font-bold leading-none tracking-wider" style={{ color: config.accentColor, textShadow: glow }}>
          <span className="text-[1em]">
            <AnimatedDigit value={padHours} intensity={i} />
            <span className="mx-1 animate-pulse" style={{ textShadow: altGlow }}>:</span>
            <AnimatedDigit value={minutes.toString().padStart(2, '0')} intensity={i} />
            {config.showSeconds && (
              <><span className="mx-0.5 text-[0.35em] align-middle opacity-40" style={{ textShadow: altGlow }}>:</span><span className="text-[0.4em] align-middle" style={{ textShadow: altGlow, opacity: 0.6 }}><AnimatedDigit value={seconds.toString().padStart(2, '0')} intensity={i} /></span></>
            )}
          </span>
          {config.hour12 && <span className="ml-2 text-[0.2em] font-semibold tracking-widest" style={{ textShadow: altGlow, opacity: 0.6 }}>{ampm}</span>}
        </div>
      </div>
    </div>
  );
}

/* ── RETRO LED ──────────────────────────────── */
function RetroLED({ hours, minutes, seconds, ampm, config, padHours }: DigitalClockProps & { padHours: string }) {
  const i = getAnimationIntensity(config.animationIntensity);
  const glow = `0 0 3px ${config.accentColor}, 0 0 8px ${config.accentColor}66`;
  return (
    <div className="flex flex-col items-center select-none gap-1" style={{ fontFamily: "'VT323', 'Courier New', monospace" }}>
      <div className="rounded-lg px-4 py-2" style={{
        background: `${config.accentColor}11`,
        border: `2px solid ${config.accentColor}22`,
        boxShadow: `inset 0 0 20px ${config.accentColor}11`,
      }}>
        <div className="flex items-baseline justify-center font-bold leading-none tracking-[0.08em]" style={{ color: config.accentColor, textShadow: glow }}>
          <span className="text-[1em]">
            <AnimatedDigit value={padHours} intensity={i} />
            <span className="mx-1 opacity-40">:</span>
            <AnimatedDigit value={minutes.toString().padStart(2, '0')} intensity={i} />
            {config.showSeconds && (
              <><span className="mx-0.5 text-[0.35em] align-middle opacity-20">:</span><span className="text-[0.4em] align-middle opacity-50"><AnimatedDigit value={seconds.toString().padStart(2, '0')} intensity={i} /></span></>
            )}
          </span>
        </div>
      </div>
      {config.hour12 && (
        <div className="flex gap-2">
          <span className="text-[0.18em] font-bold tracking-[0.2em]" style={{ color: ampm === 'AM' ? config.accentColor : `${config.accentColor}44`, textShadow: ampm === 'AM' ? glow : 'none' }}>AM</span>
          <span className="text-[0.18em] font-bold tracking-[0.2em]" style={{ color: ampm === 'PM' ? config.accentColor : `${config.accentColor}44`, textShadow: ampm === 'PM' ? glow : 'none' }}>PM</span>
        </div>
      )}
    </div>
  );
}

/* ── GLASS ───────────────────────────────────── */
function Glass({ hours, minutes, seconds, ampm, config, padHours }: DigitalClockProps & { padHours: string }) {
  const i = getAnimationIntensity(config.animationIntensity);
  return (
    <div className="flex items-baseline justify-center select-none" style={{ fontFamily: config.fontFamily }}>
      <div className="flex items-baseline justify-center gap-3 px-5 py-3" style={{
        background: `linear-gradient(135deg, ${config.accentColor}18, ${config.accentColor}06)`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${config.accentColor}22`,
        borderRadius: config.borderRadius || 20,
        boxShadow: `0 8px 32px ${config.accentColor}11, inset 0 1px 0 ${config.accentColor}11`,
      }}>
        <span className="tracking-tight font-light leading-none" style={{ color: `oklch(0.97 0.01 280 / ${config.opacity / 100})` }}>
          <span className="text-[1em]">
            <AnimatedDigit value={padHours} intensity={i} />
            <span className="mx-1 opacity-20" style={{ fontWeight: 100 }}>:</span>
            <AnimatedDigit value={minutes.toString().padStart(2, '0')} intensity={i} />
            {config.showSeconds && (
              <><span className="mx-0.5 text-[0.35em] align-middle opacity-10">:</span><span className="text-[0.4em] align-middle opacity-40"><AnimatedDigit value={seconds.toString().padStart(2, '0')} intensity={i} /></span></>
            )}
          </span>
        </span>
        {config.hour12 && <span className="text-[0.2em] font-medium tracking-wider opacity-30">{ampm}</span>}
      </div>
    </div>
  );
}

/* ── MATRIX ──────────────────────────────────── */
function Matrix({ hours, minutes, seconds, ampm, config, padHours }: DigitalClockProps & { padHours: string }) {
  const i = getAnimationIntensity(config.animationIntensity);
  const rain = useMemo(() =>
    Array.from({ length: 16 }, () => ({
      char: String.fromCharCode(0x30A0 + Math.random() * 96),
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 3,
      speed: 1 + Math.random() * 2,
    })), [seconds]
  );
  const glow = `0 0 5px ${config.accentColor}, 0 0 15px ${config.accentColor}66`;
  return (
    <div className="relative select-none overflow-hidden rounded-xl px-4 py-3" style={{
      fontFamily: "'Courier New', monospace",
      background: '#0a0a0a',
      border: `1px solid ${config.accentColor}22`,
    }}>
      {rain.map((r, idx) => (
        <span key={idx} className="absolute text-[6px] pointer-events-none" style={{
          color: config.accentColor,
          opacity: 0.15 + Math.random() * 0.15,
          left: `${idx * 6.25}%`,
          top: r.top,
          animation: `matrix-fall ${r.speed}s linear ${r.delay}s infinite`,
        }}>{r.char}</span>
      ))}
      <div className="flex items-baseline justify-center font-bold leading-none tracking-[0.1em] relative z-10" style={{ color: config.accentColor, textShadow: glow }}>
        <span className="text-[1em]">
          <AnimatedDigit value={padHours} intensity={i} />
          <span className="mx-1 opacity-30">:</span>
          <AnimatedDigit value={minutes.toString().padStart(2, '0')} intensity={i} />
          {config.showSeconds && (
            <><span className="mx-0.5 text-[0.35em] align-middle opacity-10">:</span><span className="text-[0.35em] align-middle opacity-40"><AnimatedDigit value={seconds.toString().padStart(2, '0')} intensity={i} /></span></>
          )}
        </span>
        {config.hour12 && <span className="ml-2 text-[0.2em] font-bold tracking-widest opacity-40">{ampm}</span>}
      </div>
    </div>
  );
}

/* ── FLIP ────────────────────────────────────── */
function FlipDigit(props: Record<string, any>) {
  const { val, id, bg, border, fontFamily, opacity, accentColor, animate } = props;
  return (
    <div className="relative overflow-hidden" style={{ background: bg, border, borderRadius: 4, minWidth: '0.45em' }}>
      <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: `${accentColor}15` }} />
      <div className="px-1.5 py-1 font-bold tabular-nums leading-none" style={{ fontFamily, color: `oklch(0.97 0.01 280 / ${opacity / 100})` }}>
        <AnimatePresence mode="popLayout">
          <motion.span key={`${id}-${val}`}
            variants={animate ? flipDigitTransition : undefined}
            initial={animate ? 'initial' : false}
            animate={animate ? 'animate' : { opacity: 1 }}
            exit={animate ? 'exit' : undefined}
            transition={{ duration: 0.3 }} className="inline-block" style={{ perspective: '800px' }}
          >{val}</motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Flip({ hours, minutes, seconds, ampm, config, padHours }: DigitalClockProps & { padHours: string }) {
  const i = getAnimationIntensity(config.animationIntensity);
  const bg = `linear-gradient(180deg, ${config.accentColor}18 0%, ${config.accentColor}08 50%, ${config.accentColor}18 100%)`;
  const border = `1px solid ${config.accentColor}22`;
  const animate = shouldAnimate(i);
  const flipDigitProps = {
    bg, border, fontFamily: config.fontFamily, opacity: config.opacity,
    accentColor: config.accentColor, animate
  };

  return (
    <div className="flex items-baseline justify-center select-none gap-1.5" style={{ fontFamily: config.fontFamily }}>
      <div className="flex gap-1">{padHours.split('').map((d, i) => <FlipDigit key={`h${i}`} val={d} id={`h${i}`} {...flipDigitProps} />)}</div>
      <span className="text-[0.3em] font-bold" style={{ color: config.accentColor, opacity: 0.35 }}>:</span>
      <div className="flex gap-1">{minutes.toString().padStart(2, '0').split('').map((d, i) => <FlipDigit key={`m${i}`} val={d} id={`m${i}`} {...flipDigitProps} />)}</div>
      {config.showSeconds && (
        <><span className="text-[0.22em] opacity-20">:</span><div className="flex gap-0.5" style={{ fontSize: '0.45em' }}>{seconds.toString().padStart(2, '0').split('').map((d, i) => <FlipDigit key={`s${i}`} val={d} id={`s${i}`} {...flipDigitProps} />)}</div></>
      )}
      {config.hour12 && <span className="ml-1 text-[0.2em] font-semibold tracking-wider opacity-35" style={{ color: config.accentColor }}>{ampm}</span>}
    </div>
  );
}

/* ── LO-FI ───────────────────────────────────── */
function Lofi({ hours, minutes, seconds, ampm, config, padHours }: DigitalClockProps & { padHours: string }) {
  const i = getAnimationIntensity(config.animationIntensity);
  const vinylColors = [config.accentColor, `${config.accentColor}66`, `${config.accentColor}33`, `${config.accentColor}11`];
  return (
    <div className="flex flex-col items-center select-none gap-2" style={{ fontFamily: config.fontFamily }}>
      <div className="relative px-5 py-3 overflow-hidden" style={{
        background: `linear-gradient(145deg, ${config.accentColor}12, ${config.accentColor}06)`,
        borderRadius: config.borderRadius || 16,
        border: `1px solid ${config.accentColor}15`,
        boxShadow: `0 4px 24px ${config.accentColor}11`,
      }}>
        <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-[0.04]" style={{ background: `radial-gradient(circle, ${config.accentColor}, transparent)` }} />
        <div className="flex items-baseline justify-center font-light leading-none tracking-tight" style={{ color: `oklch(0.95 0.02 80 / ${config.opacity / 100})` }}>
          <span className="text-[1em]">
            <AnimatedDigit value={padHours} intensity={i} />
            <span className="mx-1 opacity-25">:</span>
            <AnimatedDigit value={minutes.toString().padStart(2, '0')} intensity={i} />
            {config.showSeconds && (
              <><span className="mx-0.5 text-[0.35em] align-middle opacity-15">:</span><span className="text-[0.4em] align-middle opacity-40"><AnimatedDigit value={seconds.toString().padStart(2, '0')} intensity={i} /></span></>
            )}
          </span>
          {config.hour12 && <span className="ml-2 text-[0.2em] font-medium tracking-wider opacity-35">{ampm}</span>}
        </div>
      </div>
    </div>
  );
}

const RENDERERS: Record<string, (props: DigitalClockProps & { padHours: string }) => React.ReactElement> = {
  'digital-minimal': Minimal,
  'digital-amoled': Amoled,
  'digital-neon': Neon,
  'digital-retro': RetroLED,
  'digital-glass': Glass,
  'digital-matrix': Matrix,
  'digital-flip': Flip,
  'digital-lofi': Lofi,
};

export default function DigitalClock(props: DigitalClockProps) {
  const { hours, config } = props;
  const padHours = config.hour12
    ? (hours % 12 || 12).toString().padStart(2, '0')
    : hours.toString().padStart(2, '0');
  const renderer = RENDERERS[config.variant] || Minimal;
  const inner = renderer({ ...props, padHours });
  if (config.borderRadius > 0) {
    return (
      <div style={{ borderRadius: config.borderRadius, overflow: 'hidden', display: 'inline-block' }}>
        {inner}
      </div>
    );
  }
  return inner;
}
