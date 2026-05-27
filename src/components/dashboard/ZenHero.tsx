import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Crown } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { useAuth } from '../../context/AuthContext';
import { getDailyQuote } from '../../lib/quotes';
import ClockRenderer from '../clock/ClockRenderer';

export const ZenHero = () => {
  const { user } = useAuth();
  const { userStats, themeConfig, focusSession } = useStudy();
  const [time, setTime] = useState(new Date());
  const [quote] = useState(getDailyQuote());
  const [clockReady, setClockReady] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setClockReady(true);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="relative py-16 md:py-28 flex flex-col items-center justify-center text-center">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <div className="w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-4xl mx-auto px-4"
      >
        {themeConfig.showClock && clockReady && (
          <div className="mb-6 md:mb-8">
            <ClockRenderer time={time} focusState={focusSession} />
          </div>
        )}

        {themeConfig.showGreeting && (
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-3xl font-display font-medium dark:text-white/80 tracking-tight flex items-center justify-center gap-2">
              {getGreeting()}, <span className="text-brand font-semibold">{user?.displayName?.split(' ')[0]}</span>
              {userStats.isPremium && (
                <motion.span 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="inline-flex items-center justify-center w-6 h-6 bg-amber-500 rounded-lg shadow-lg"
                >
                  <Crown className="w-3 h-3 text-white" />
                </motion.span>
              )}
            </h2>
          </div>
        )}

        {themeConfig.showQuote && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-xl mx-auto"
          >
            <div className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl rounded-2xl p-5 md:p-6 border border-white/10 dark:border-white/[0.06] shadow-lg">
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 font-light leading-relaxed italic">
                "{quote.text}"
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400 mt-4">
                — {quote.author}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
