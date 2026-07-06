import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ─── Formatting ─── */

export const formatElapsed = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

export const formatElapsedShort = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
};

export const formatLapTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${Math.floor((s - Math.floor(s)) * 100).toString().padStart(2, '0')}`;
};

/* ─── Shared digit flip primitive ─── */

export const FlipDigit = ({ digit, reduceMotion, className, children }: { digit: string; reduceMotion: boolean; className?: string; children?: ReactNode; key?: string }) => (
  <span className={`inline-block relative overflow-hidden text-center ${className ?? ''}`}>
    <AnimatePresence mode="popLayout">
      <motion.span
        key={digit}
        initial={reduceMotion ? false : { y: '80%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={reduceMotion ? false : { y: '-80%', opacity: 0 }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
        className="inline-block will-change-transform"
      >
        {children ?? digit}
      </motion.span>
    </AnimatePresence>
  </span>
);

/* ─── Digit row helper ─── */

export const DigitRow = ({ time, cs, reduceMotion, children }: { time: string; cs: number; reduceMotion: boolean; children: (ch: string, key: string) => ReactNode }) => {
  const parts = time.split(':');
  return (
    <>
      {parts.flatMap((part, pi) => [
        ...(pi > 0 ? [<span key={`c${pi}`} className="inline-block w-[0.3em] text-center opacity-50">:</span>] : []),
        ...part.split('').map((ch, ci) => (
          <span key={`p${pi}d${ci}`} className="inline-flex">
            {children(ch, `p${pi}d${ci}`)}
          </span>
        )),
      ])}
      <span className="inline-flex items-baseline ml-1.5">
        <span className="text-[0.25em] opacity-40">.</span>
        <span className="text-[0.25em] opacity-40 tabular-nums">
          {cs.toString().padStart(2, '0')}
        </span>
      </span>
    </>
  );
};

/* ─── 1. Digital ─── */

export const DigitalDisplay = ({ elapsed, reduceMotion }: { elapsed: number; reduceMotion: boolean }) => {
  const displayTime = formatElapsed(Math.round(elapsed));
  const cs = Math.floor((elapsed - Math.floor(elapsed)) * 100);
  return (
    <span
      className="font-mono font-bold leading-none tracking-tight text-white select-none inline-flex items-baseline"
      style={{ textShadow: '0 2px 16px rgba(0,0,0,0.6), 0 0 48px rgba(0,0,0,0.25)' }}
    >
      <DigitRow time={displayTime} cs={cs} reduceMotion={reduceMotion}>
        {(ch) => <FlipDigit className="w-[0.55em]" digit={ch} reduceMotion={reduceMotion} />}
      </DigitRow>
    </span>
  );
};

/* ─── 2. Split-Flap ─── */

const FlapDigit = ({ digit, reduceMotion }: { digit: string; reduceMotion: boolean }) => (
  <span
    className="relative inline-flex items-center justify-center mx-[0.03em]"
    style={{
      minWidth: '0.65em',
      height: '1.2em',
      background: 'rgba(255,255,255,0.04)',
      borderRadius: '3px',
      border: '1px solid rgba(255,255,255,0.05)',
    }}
  >
    <FlipDigit className="w-[0.65em]" digit={digit} reduceMotion={reduceMotion} />
    <span
      className="absolute left-0 right-0 pointer-events-none"
      style={{
        top: '50%',
        height: 1,
        background: 'rgba(255,255,255,0.08)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
      }}
    />
  </span>
);

export const SplitFlapDisplay = ({ elapsed, reduceMotion }: { elapsed: number; reduceMotion: boolean }) => {
  const displayTime = formatElapsed(Math.round(elapsed));
  const cs = Math.floor((elapsed - Math.floor(elapsed)) * 100);
  return (
    <span
      className="inline-flex items-baseline select-none"
      style={{
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 700,
        color: 'rgba(255,255,255,0.92)',
        textShadow: '0 2px 12px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.2)',
        letterSpacing: '0.02em',
      }}
    >
      <DigitRow time={displayTime} cs={cs} reduceMotion={reduceMotion}>
        {(ch) => <FlapDigit digit={ch} reduceMotion={reduceMotion} />}
      </DigitRow>
    </span>
  );
};

/* ─── 3. Dial ─── */

const DIAL_RADIUS = 110;
const DIAL_SIZE = 260;

export const DialDisplay = ({ elapsed, reduceMotion }: { elapsed: number; reduceMotion: boolean }) => {
  const secondAngle = ((elapsed % 60) / 60) * 360;
  const displayTime = formatElapsedShort(elapsed);

  return (
    <div className="relative flex items-center justify-center" style={{ width: DIAL_SIZE, height: DIAL_SIZE }}>
      <svg width={DIAL_SIZE} height={DIAL_SIZE} viewBox={`0 0 ${DIAL_SIZE} ${DIAL_SIZE}`} aria-hidden="true">
        <circle
          cx={DIAL_SIZE / 2} cy={DIAL_SIZE / 2} r={DIAL_RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1.5"
        />
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const outer = DIAL_RADIUS - 4;
          const inner = i % 3 === 0 ? DIAL_RADIUS - 14 : DIAL_RADIUS - 10;
          return (
            <line
              key={i}
              x1={DIAL_SIZE / 2 + outer * Math.cos(angle)}
              y1={DIAL_SIZE / 2 + outer * Math.sin(angle)}
              x2={DIAL_SIZE / 2 + inner * Math.cos(angle)}
              y2={DIAL_SIZE / 2 + inner * Math.sin(angle)}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={i % 3 === 0 ? 2 : 1}
            />
          );
        })}
        {!reduceMotion && (
          <line
            x1={DIAL_SIZE / 2} y1={DIAL_SIZE / 2}
            x2={DIAL_SIZE / 2} y2={DIAL_SIZE / 2 - DIAL_RADIUS + 20}
            stroke="rgba(129,140,248,0.7)"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ transform: `rotate(${secondAngle}deg)`, transformOrigin: `${DIAL_SIZE / 2}px ${DIAL_SIZE / 2}px` }}
          />
        )}
        <circle cx={DIAL_SIZE / 2} cy={DIAL_SIZE / 2} r={3} fill="rgba(129,140,248,0.6)" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center select-none" style={{ pointerEvents: 'none' }}>
        <span
          className="font-mono font-bold tracking-tight text-white/90"
          style={{
            fontSize: 'clamp(1.2rem, 4vw, 2.4rem)',
            textShadow: '0 2px 16px rgba(0,0,0,0.6), 0 0 40px rgba(0,0,0,0.25)',
          }}
        >
          {displayTime}
        </span>
      </div>
    </div>
  );
};

/* ─── 4. Minimal Line ─── */

export const MinimalDisplay = ({ elapsed, reduceMotion: _reduceMotion }: { elapsed: number; reduceMotion: boolean }) => {
  const displayTime = formatElapsed(Math.round(elapsed));
  return (
    <span
      className="select-none inline-flex items-baseline"
      style={{
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 300,
        fontSize: 'clamp(2.5rem, 9vw, 6rem)',
        lineHeight: 1,
        letterSpacing: '0.04em',
        color: 'rgba(255,255,255,0.55)',
        textShadow: '0 1px 8px rgba(0,0,0,0.3)',
      }}
    >
      {displayTime.split(':').map((part, pi, arr) => (
        <span key={pi} className="inline-flex items-baseline">
          {pi > 0 && (
            <span className="inline-block px-[0.08em] opacity-30 text-[0.7em]" style={{ verticalAlign: '0.05em' }}>:</span>
          )}
          {part}
        </span>
      ))}
    </span>
  );
};

/* ─── 5. Segmented LED ─── */

export const SegmentedDisplay = ({ elapsed, reduceMotion }: { elapsed: number; reduceMotion: boolean }) => {
  const displayTime = formatElapsed(Math.round(elapsed));
  const cs = Math.floor((elapsed - Math.floor(elapsed)) * 100);
  return (
    <span
      className="select-none inline-flex items-baseline"
      style={{
        fontFamily: 'SF Mono, ui-monospace, "Cascadia Code", "Roboto Mono", "Fira Code", monospace',
        fontWeight: 400,
        letterSpacing: '0.06em',
        color: 'rgba(255,255,255,0.8)',
        textShadow: '0 0 12px rgba(129,140,248,0.25), 0 0 30px rgba(129,140,248,0.1), 0 2px 16px rgba(0,0,0,0.5)',
      }}
    >
      <DigitRow time={displayTime} cs={cs} reduceMotion={reduceMotion}>
        {(ch) => <FlipDigit className="w-[0.6em]" digit={ch} reduceMotion={reduceMotion} />}
      </DigitRow>
    </span>
  );
};

/* ─── 6. Vertical Stack ─── */

export const StackedDisplay = ({ elapsed, reduceMotion }: { elapsed: number; reduceMotion: boolean }) => {
  const parts = formatElapsed(Math.round(elapsed)).split(':');
  const cs = Math.floor((elapsed - Math.floor(elapsed)) * 100);
  return (
    <div
      className="flex flex-col items-center leading-none select-none"
      style={{ textShadow: '0 2px 16px rgba(0,0,0,0.6), 0 0 48px rgba(0,0,0,0.25)' }}
    >
      {parts.map((part, pi) => (
        <div
          key={pi}
          className="inline-flex items-center justify-center"
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(1.8rem, 6vw, 4.5rem)',
            color: 'rgba(255,255,255,0.88)',
          }}
        >
          {part.split('').map((ch, ci) => (
            <FlipDigit key={`${pi}-${ci}`} className="w-[0.65em]" digit={ch} reduceMotion={reduceMotion} />
          ))}
        </div>
      ))}
      <div
        className="flex items-center justify-center mt-1"
        style={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 400,
          fontSize: 'clamp(0.6rem, 2vw, 1.2rem)',
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.15em',
        }}
      >
        {cs.toString().padStart(2, '0')}
      </div>
    </div>
  );
};

/* ─── Progress Ring ─── */

const PROGRESS_RADIUS = 110;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;

export const ProgressRing = ({ elapsed }: { elapsed: number }) => {
  const hourProgress = (elapsed % 3600) / 3600;
  const offset = PROGRESS_CIRCUMFERENCE * (1 - Math.min(hourProgress, 1));
  return (
    <svg
      width="260"
      height="260"
      viewBox="0 0 260 260"
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10"
      aria-hidden="true"
    >
      <circle
        cx="130" cy="130" r={PROGRESS_RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="2"
      />
      <motion.circle
        cx="130" cy="130" r={PROGRESS_RADIUS}
        fill="none"
        stroke="url(#ringGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={PROGRESS_CIRCUMFERENCE}
        strokeDashoffset={PROGRESS_CIRCUMFERENCE - (offset === PROGRESS_CIRCUMFERENCE ? 0 : offset)}
        transform="rotate(-90 130 130)"
        className="transition-[stroke-dashoffset] duration-300 ease-linear"
      />
      <defs>
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--theme-accent, #818cf8)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--theme-accent, #818cf8)" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/* ─── Clock Face Dispatcher ─── */

export const SHOW_RING_STYLES = new Set(['digital', 'split-flap', 'segmented', 'stacked']);

export const ClockFace = ({ clockStyle, elapsed, reduceMotion }: { clockStyle: string; elapsed: number; reduceMotion: boolean }) => {
  switch (clockStyle) {
    case 'digital':
      return <DigitalDisplay elapsed={elapsed} reduceMotion={reduceMotion} />;
    case 'split-flap':
      return <SplitFlapDisplay elapsed={elapsed} reduceMotion={reduceMotion} />;
    case 'dial':
      return <DialDisplay elapsed={elapsed} reduceMotion={reduceMotion} />;
    case 'minimal':
      return <MinimalDisplay elapsed={elapsed} reduceMotion={reduceMotion} />;
    case 'segmented':
      return <SegmentedDisplay elapsed={elapsed} reduceMotion={reduceMotion} />;
    case 'stacked':
      return <StackedDisplay elapsed={elapsed} reduceMotion={reduceMotion} />;
    default:
      return <DigitalDisplay elapsed={elapsed} reduceMotion={reduceMotion} />;
  }
};
