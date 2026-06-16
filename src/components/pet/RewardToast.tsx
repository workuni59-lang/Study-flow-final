import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStudy } from '../../context/StudyContext';

interface ToastItem {
  id: number;
  emoji: string;
  text: string;
  color: string;
}

const EVENT_TOASTS: Record<string, (id: number) => ToastItem> = {
  task_done: (id) => ({ id, emoji: '🎯', text: '+50 XP', color: 'text-emerald-400' }),
  focus_done: (id) => ({ id, emoji: '🧘', text: '+XP', color: 'text-blue-400' }),
  level_up: (id) => ({ id, emoji: '⬆️', text: 'Level Up!', color: 'text-amber-400' }),
  achievement_unlocked: (id) => ({ id, emoji: '🏆', text: 'Achievement!', color: 'text-purple-400' }),
  streak_lost: (id) => ({ id, emoji: '🔥', text: 'Streak Lost', color: 'text-rose-400' }),
};

export const RewardToast = () => {
  const { petEvent } = useStudy();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (!petEvent) return;
    const maker = EVENT_TOASTS[petEvent.type];
    if (!maker) return;
    idRef.current += 1;
    const toastId = idRef.current;
    const toast = maker(toastId);
    setToasts(prev => [...prev.slice(-2), toast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 2000);
  }, [petEvent]);

  return (
    <div className="fixed top-20 right-6 z-[100] flex flex-col items-end gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(t => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 shadow-lg ${t.color} text-xs font-bold`}
          >
            <span>{t.emoji}</span>
            <span>{t.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
