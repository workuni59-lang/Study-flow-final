import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../../services/storage';

interface Step {
  icon: string;
  title: string;
  description: string;
  target?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

const STEPS: Step[] = [
  {
    icon: '🎯',
    title: 'Welcome to StudyFlow',
    description: 'Your focused study companion. Let\'s take 30 seconds to get oriented.',
  },
  {
    icon: '📊',
    title: 'Your Dashboard',
    description: 'Track your focus time, streaks, daily goal, and XP right here. Start every session from this hub.',
    target: 'dashboard',
    tooltipPosition: 'bottom',
  },
  {
    icon: '⏱️',
    title: 'Focus Timer',
    description: 'Switch to Focus mode for Pomodoro, Deep Work, or Flow sessions. Stay in the zone and build your streak.',
    target: 'focus',
    tooltipPosition: 'bottom',
  },
  {
    icon: '🎨',
    title: 'Customize Your Space',
    description: 'Open the soundboard to add ambient sounds, rain, or lo-fi beats. Change wallpapers and colors to match your mood.',
    target: 'customize',
    tooltipPosition: 'top',
  },
  {
    icon: '🏆',
    title: 'Progress & Leaderboards',
    description: 'See how you rank against other students. Earn badges, level up, and track your all-time stats.',
    target: 'leaderboard',
    tooltipPosition: 'bottom',
  },
  {
    icon: '🚀',
    title: 'Ready to Begin',
    description: 'You\'re all set. Start your first focus session or explore the app on your own!',
  },
];

function getTargetRect(selector: string): DOMRect | null {
  const el = document.querySelector<HTMLElement>(`[data-tour-target="${selector}"]`);
  if (!el) return null;
  return el.getBoundingClientRect();
}

export const OnboardingTour = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const done = storage.getOnboardingComplete();
    if (!done) setOpen(true);
  }, []);

  const recalc = useCallback(() => {
    const s = STEPS[step];
    if (s.target) {
      setTargetRect(getTargetRect(s.target));
    } else {
      setTargetRect(null);
    }
  }, [step]);

  useEffect(() => {
    recalc();
    const onResize = () => recalc();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [recalc]);

  const complete = useCallback(() => {
    storage.saveOnboardingComplete(true);
    setOpen(false);
  }, []);

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else complete();
  };

  const prev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  if (!open) return null;

  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const hasTarget = s.target && targetRect;

  const holeStyle = hasTarget ? {
    position: 'fixed' as const,
    top: targetRect!.top - 8,
    left: targetRect!.left - 8,
    width: targetRect!.width + 16,
    height: targetRect!.height + 16,
    borderRadius: '12px',
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
    zIndex: 9999,
    pointerEvents: 'none' as const,
  } : null;

  const tooltipX = hasTarget
    ? targetRect!.left + targetRect!.width / 2
    : window.innerWidth / 2;

  const tooltipY = hasTarget
    ? (s.tooltipPosition === 'top' ? targetRect!.top - 16 : targetRect!.bottom + 16)
    : window.innerHeight / 2;

  return (
    <>
      {/* Spotlight hole */}
      {holeStyle && <div style={holeStyle} />}

      {/* Dark backdrop (behind everything but covers the screen minus the hole) */}
      {!holeStyle && (
        <div
          className="fixed inset-0"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 9998 }}
        />
      )}

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        className="fixed z-[10001]"
        style={{
          top: hasTarget
            ? (s.tooltipPosition === 'top' ? targetRect!.top - 180 : targetRect!.bottom + 20)
            : '50%',
          left: '50%',
          transform: hasTarget
            ? `translateX(-50%)`
            : 'translate(-50%, -50%)',
          pointerEvents: 'auto',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-[300px] rounded-2xl border border-white/[0.08] p-6 text-center shadow-2xl"
            style={{ backgroundColor: 'rgba(15,15,26,0.96)' }}
          >
            {/* Arrow */}
            {hasTarget && (
              <div
                className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
                style={{
                  top: s.tooltipPosition === 'top' ? 'auto' : '-5px',
                  bottom: s.tooltipPosition === 'top' ? '-5px' : 'auto',
                  backgroundColor: 'rgba(15,15,26,0.96)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderTop: s.tooltipPosition === 'top' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  borderLeft: s.tooltipPosition === 'top' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}
              />
            )}

            {/* Skip button */}
            <button
              onClick={complete}
              className="absolute top-3 right-3 text-[10px] font-semibold text-white/30 hover:text-white/60 transition-colors uppercase tracking-wider"
            >
              Skip
            </button>

            <div className="text-4xl mb-4 mt-2">{s.icon}</div>
            <h2 className="text-base font-bold text-white mb-2">{s.title}</h2>
            <p className="text-[13px] text-white/50 leading-relaxed mb-6">{s.description}</p>

            {/* Dots */}
            <div className="flex items-center justify-center gap-1.5 mb-5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? 'bg-white w-5' : 'bg-white/15 w-1.5'
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={prev}
                disabled={step === 0}
                className={`text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all ${
                  step === 0
                    ? 'text-transparent pointer-events-none'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                Back
              </button>
              <button
                onClick={next}
                className="text-[11px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl bg-white text-black hover:bg-white/90 transition-all"
              >
                {isLast ? 'Done' : 'Next'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};
