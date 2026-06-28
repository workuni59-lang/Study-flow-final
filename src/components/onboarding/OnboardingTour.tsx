import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../../services/storage';

interface Step {
  icon: string;
  title: string;
  description: string;
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
    description: 'Track your focus time, streaks, and XP at a glance. Start here every day.',
  },
  {
    icon: '⏱️',
    title: 'Focus Timer',
    description: 'Pomodoro, Deep Work, or Flow — choose your rhythm and start a session.',
  },
  {
    icon: '🎨',
    title: 'Customize Your Space',
    description: 'Change wallpapers, colors, and ambient sounds to create your perfect study atmosphere.',
  },
  {
    icon: '🏆',
    title: 'Progress & Leaderboards',
    description: 'Earn badges, level up, and see how you rank against other students.',
  },
  {
    icon: '🚀',
    title: 'Ready to Begin',
    description: 'You\'re all set. Start your first focus session or explore on your own!',
  },
];

export const OnboardingTour = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = storage.getOnboardingComplete();
    if (!done) setOpen(true);
  }, []);

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

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.65)' }}
    >
      {/* Skip button */}
      <button
        onClick={complete}
        className="absolute top-5 right-5 text-xs font-semibold text-white/40 hover:text-white/70 transition-colors uppercase tracking-wider"
      >
        Skip tour
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-sm mx-4 rounded-2xl border border-white/[0.08] p-8 text-center"
          style={{ backgroundColor: 'rgba(15,15,26,0.95)' }}
        >
          {/* Icon */}
          <div className="text-5xl mb-5">{s.icon}</div>

          {/* Title */}
          <h2 className="text-lg font-bold text-white mb-3">{s.title}</h2>

          {/* Description */}
          <p className="text-sm text-white/60 leading-relaxed mb-8 max-w-xs mx-auto">{s.description}</p>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'bg-white w-4' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={prev}
              disabled={step === 0}
              className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all ${
                step === 0
                  ? 'text-transparent pointer-events-none'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              Back
            </button>

            <button
              onClick={next}
              className="text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl bg-white text-black hover:bg-white/90 transition-all"
            >
              {isLast ? 'Done' : 'Next'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
