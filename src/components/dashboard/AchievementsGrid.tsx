import React from 'react';
import { Trophy, CheckCircle, Zap, Waves, Flame, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useStudy } from '../../context/StudyContext';
import { ACHIEVEMENTS, Rarity } from '../../lib/gamification';

const ICON_MAP: Record<string, any> = {
  CheckCircle, Zap, Waves, Flame, Trophy
};

type AchievementProgress = { current: number; max: number; percentage: number };

function getProgress(achievement: typeof ACHIEVEMENTS[0], stats: { totalTasksCompleted: number; totalFocusSeconds: number; currentStreak: number }, greenTopics: number): AchievementProgress {
  let current: number;
  switch (achievement.type) {
    case 'tasks': current = stats.totalTasksCompleted; break;
    case 'focus': current = stats.totalFocusSeconds; break;
    case 'streak': current = stats.currentStreak; break;
    case 'mastery': current = greenTopics; break;
    default: current = 0;
  }
  return { current: Math.min(current, achievement.requirement), max: achievement.requirement, percentage: Math.min((current / achievement.requirement) * 100, 100) };
}

const RARITY_CARD: Record<Rarity, string> = {
  Common: 'bg-white/[0.03] border-white/[0.06]',
  Rare: 'bg-blue-500/[0.06] border-blue-400/20 shadow-[0_0_20px_#3b82f615]',
  Epic: 'bg-violet-500/[0.08] border-violet-400/25 shadow-[0_0_25px_#8b5cf620]',
  Legendary: 'bg-amber-400/[0.08] border-amber-300/25 shadow-[0_0_30px_#f59e0b25] relative overflow-hidden',
};

const RARITY_MEDAL: Record<Rarity, string> = {
  Common: 'bg-white/[0.05]',
  Rare: 'bg-blue-500/15',
  Epic: 'bg-violet-500/15',
  Legendary: 'bg-amber-400/15',
};

export const AchievementsGrid = () => {
  const { unlockedBadges, userStats, subjects } = useStudy();
  const greenTopics = subjects.reduce((acc, s) => acc + s.topics.filter(t => t.mastery === 'Green').length, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {ACHIEVEMENTS.map((achievement, index) => {
        const isUnlocked = unlockedBadges.some(b => b.achievementId === achievement.id);
        const Icon = ICON_MAP[achievement.icon] || Trophy;
        const { current, max, percentage } = getProgress(achievement, userStats, greenTopics);

        return (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.05 }}
            whileHover={isUnlocked ? { y: -6, scale: 1.02 } : { y: -4, scale: 1.015 }}
            className={`group relative rounded-3xl border p-5 transition-colors ${
              isUnlocked
                ? 'bg-emerald-400/[0.04] border-emerald-400/20'
                : RARITY_CARD[achievement.rarity]
            } ${!isUnlocked && achievement.rarity === 'Legendary' ? 'hover:shadow-[0_0_40px_#f59e0b30]' : ''}`}
          >
            {isUnlocked && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: (index * 1.3) % 5 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
              />
            )}

            {achievement.rarity === 'Legendary' && !isUnlocked && (
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-[linear-gradient(110deg,transparent_35%,#f59e0b08_50%,transparent_65%)] pointer-events-none"
              />
            )}

            {isUnlocked && (
              <div className="absolute top-3 right-3 z-10">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
            )}

            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isUnlocked ? RARITY_MEDAL[achievement.rarity] : 'bg-white/[0.05]'}`}>
                {isUnlocked ? (
                  <Icon className="w-6 h-6" />
                ) : (
                  <div className="relative">
                    <Icon className={`w-6 h-6 ${achievement.rarity === 'Common' ? 'text-white/30' : achievement.rarity === 'Rare' ? 'text-blue-300/40' : achievement.rarity === 'Epic' ? 'text-violet-300/40' : 'text-amber-300/40'}`} />
                    <Lock className="w-3.5 h-3.5 absolute -top-1.5 -right-2 text-white/30" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h4 className={`font-bold leading-tight truncate ${isUnlocked ? 'text-white' : 'text-white/80'}`}>{achievement.title}</h4>
                <span className={`text-[8px] font-black uppercase tracking-widest ${
                  isUnlocked
                    ? 'text-emerald-400/70'
                    : achievement.rarity === 'Common' ? 'text-white/30'
                    : achievement.rarity === 'Rare' ? 'text-blue-400/60'
                    : achievement.rarity === 'Epic' ? 'text-violet-400/60'
                    : 'text-amber-400/60'
                }`}>{achievement.rarity}</span>
              </div>
            </div>

            <p className={`text-xs font-medium leading-relaxed relative z-10 mb-3 ${isUnlocked ? 'text-white/60' : 'text-white/40'}`}>
              {achievement.description}
            </p>

            {!isUnlocked && (
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-semibold text-white/50">{current.toLocaleString()} / {max.toLocaleString()}</span>
                  <span className="text-[10px] font-semibold text-white/50">{Math.round(percentage)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.05, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      achievement.rarity === 'Rare' ? 'bg-blue-400 shadow-[0_0_8px_#3b82f680]'
                      : achievement.rarity === 'Epic' ? 'bg-violet-400 shadow-[0_0_8px_#8b5cf680]'
                      : achievement.rarity === 'Legendary' ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b80]'
                      : 'bg-white/30'
                    }`}
                  />
                </div>
              </div>
            )}

            {isUnlocked && (
              <div className="relative z-10 flex items-center gap-1.5 mt-1">
                {achievement.rarity === 'Common' && <span className="text-[9px] text-emerald-500/70 font-semibold">Earned</span>}
                {(achievement.rarity === 'Rare' || achievement.rarity === 'Epic' || achievement.rarity === 'Legendary') && (
                  <>
                    <Sparkles className="w-3 h-3 text-amber-400/70" />
                    <span className="text-[9px] text-amber-400/70 font-semibold">Earned</span>
                  </>
                )}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
