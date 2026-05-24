import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, CheckCircle, Zap, Waves, Flame, Star, Sparkles } from 'lucide-react';
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

const RARITY_GLOW: Record<Rarity, string> = {
  Common: 'shadow-slate-500/20',
  Rare: 'shadow-indigo-500/40',
  Epic: 'shadow-violet-500/40',
  Legendary: 'shadow-amber-500/60'
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
          initial={{ opacity: 0, y: -150, scale: 0.3, rotate: -15 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            rotate: 0,
            transition: { 
              type: 'spring', 
              stiffness: 260, 
              damping: 20 
            }
          }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="fixed top-12 left-1/2 -translate-x-1/2 z-[400] w-full max-w-sm px-6"
        >
          <motion.div 
            animate={{ x: [0, -2, 2, -2, 2, 0] }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative group"
          >
            {/* Massive Ambient Glow */}
            <div className={`absolute -inset-4 rounded-[40px] blur-3xl opacity-30 group-hover:opacity-50 transition-opacity ${RARITY_COLORS[achievement.rarity]}`} />
            
            <div className={`relative bg-white dark:bg-slate-900 rounded-[32px] p-1 border-2 border-white/20 shadow-2xl overflow-hidden ${RARITY_GLOW[achievement.rarity]}`}>
              
              {/* Animated Shimmer Stripe */}
              <motion.div 
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"
              />

              <div className="p-6 flex items-center gap-5">
                <motion.div 
                  initial={{ rotate: -45, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-xl ${RARITY_COLORS[achievement.rarity]}`}
                >
                  <Icon className="w-8 h-8" />
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Mastery Unlocked</span>
                  </div>
                  <h4 className="text-xl font-display font-black dark:text-white leading-tight truncate">
                    {achievement.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold line-clamp-1 uppercase tracking-wider">
                    {achievement.rarity} Rank
                  </p>
                </div>
              </div>

              {/* Progress Bar / Timeout indicator */}
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-6 mb-4 overflow-hidden">
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 6, ease: "linear" }}
                  onAnimationComplete={onClose}
                  className={`h-full ${RARITY_COLORS[achievement.rarity]}`}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
