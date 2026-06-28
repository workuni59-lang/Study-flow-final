import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NUDGE_KEY = 'study_flow_demo_nudge_count';
const NUDGE_LAST_KEY = 'study_flow_demo_nudge_last';
const TOUR_KEY = 'sf_tour_done';
const MAX_SHOWS = 3;
const COOLDOWN_MS = 60 * 60 * 1000;
const INITIAL_DELAY_MS = 5000;

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
    const tourDone = localStorage.getItem(TOUR_KEY);

    if (count >= MAX_SHOWS) return;
    if (Date.now() - last < COOLDOWN_MS) return;
    if (!tourDone) return;

    const timer = setTimeout(() => {
      setVisible(true);
      localStorage.setItem(NUDGE_KEY, String(count + 1));
      localStorage.setItem(NUDGE_LAST_KEY, String(Date.now()));
    }, INITIAL_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isDemo]);

  const handleDismiss = () => setVisible(false);

  const handleSignIn = () => {
    setVisible(false);
    onOpenAuth?.();
    localStorage.setItem(NUDGE_KEY, String(MAX_SHOWS));
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-xs mx-auto mt-4"
        >
          <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
            <div className="p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-white leading-tight">
                  Save your progress
                </p>
                <p className="text-[10px] text-white/50 leading-tight mt-0.5">
                  Sign in to keep your study data
                </p>
              </div>
              <button
                onClick={handleSignIn}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[10px] font-bold hover:brightness-110 active:scale-[0.97] transition-all flex items-center gap-1"
              >
                <LogIn className="w-3 h-3" />
                Sign In
              </button>
              <button
                onClick={handleDismiss}
                className="w-5 h-5 rounded-full hover:bg-white/10 flex items-center justify-center shrink-0 transition-colors"
              >
                <X className="w-2.5 h-2.5 text-white/30" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
