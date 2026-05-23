import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, CheckCircle, Zap, Waves, Flame, Star } from 'lucide-react';
import { Achievement, Rarity } from '../../lib/gamification';

const ICON_MAP: Record<string, any> = {
  CheckCircle,
  Zap,
  Waves,
  Flame,
  Trophy
};

const RARITY_COLORS: Record<Rarity, string> = {
  Common: 'bg-slate-900',
  Rare: 'bg-indigo-600',
  Epic: 'bg-violet-600',
  Legendary: 'bg-amber-500'
};

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementNotification = ({ achievement, onClose }: AchievementNotificationProps) => {
  const Icon = achievement ? ICON_MAP[achievement.icon] : Trophy;

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed top-6 right-6 z-[200] w-full max-w-sm"
        >
          <div className="relative group">
            {/* Ambient Glow */}
            <div className={`absolute inset-0 rounded-[32px] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${RARITY_COLORS[achievement.rarity]}`} />
            
            <div className="relative bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-5 overflow-hidden">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-lg ${RARITY_COLORS[achievement.rarity]}`}>
                <Icon className="w-7 h-7" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Achievement Unlocked</span>
                  <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className={`text-[8px] font-black uppercase tracking-widest ${achievement.rarity === 'Legendary' ? 'text-amber-500' : 'text-slate-400'}`}>
                    {achievement.rarity}
                  </span>
                </div>
                <h4 className="text-lg font-display font-black dark:text-white leading-tight truncate">
                  {achievement.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                  {achievement.description}
                </p>
              </div>

              {/* Sparkle Decoration for Rare+ */}
              {achievement.rarity !== 'Common' && (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute -right-4 -bottom-4 opacity-10"
                >
                  <Star className="w-16 h-16" />
                </motion.div>
              )}
            </div>
            
            {/* Progress Bar / Timeout indicator */}
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              onAnimationComplete={onClose}
              className={`absolute bottom-0 left-8 right-8 h-1 rounded-full opacity-30 ${RARITY_COLORS[achievement.rarity]}`}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
