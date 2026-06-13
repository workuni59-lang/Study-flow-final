import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NUDGE_KEY = 'study_flow_demo_nudge_count';
const NUDGE_LAST_KEY = 'study_flow_demo_nudge_last';
const MAX_SHOWS = 3;
const COOLDOWN_MS = 60 * 60 * 1000;
const AUTO_DISMISS_MS = 8000;

interface DemoSignUpNudgeProps {
  onOpenAuth?: () => void;
}

export const DemoSignUpNudge = ({ onOpenAuth }: DemoSignUpNudgeProps) => {
  const { isDemo } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isDemo) return;

    const count = parseInt(localStorage.getItem(NUDGE_KEY) || '0', 10);
    const last = parseInt(localStorage.getItem(NUDGE_LAST_KEY) || '0', 10);

    if (count >= MAX_SHOWS) return;
    if (Date.now() - last < COOLDOWN_MS) return;

    const timer = setTimeout(() => {
      setVisible(true);
      localStorage.setItem(NUDGE_KEY, String(count + 1));
      localStorage.setItem(NUDGE_LAST_KEY, String(Date.now()));
    }, 15000);

    return () => clearTimeout(timer);
  }, [isDemo]);

  const handleDismiss = () => {
    setVisible(false);
  };

  const handleSignIn = () => {
    setVisible(false);
    onOpenAuth?.();
    localStorage.setItem(NUDGE_KEY, String(MAX_SHOWS));
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[400] w-full max-w-sm px-4"
        >
          <div className="relative bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
            <div className="p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-500/15 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-800 dark:text-white leading-tight">
                  Save your progress
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                  Create a free account to keep your study data and unlock premium.
                </p>
                <button
                  onClick={handleSignIn}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[11px] font-bold hover:brightness-110 active:scale-[0.97] transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
              </div>

              <button
                onClick={handleDismiss}
                className="w-6 h-6 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center shrink-0 transition-colors"
              >
                <X className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            <div className="h-1 bg-slate-100 dark:bg-slate-800 mx-4 mb-3 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
                onAnimationComplete={handleDismiss}
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
