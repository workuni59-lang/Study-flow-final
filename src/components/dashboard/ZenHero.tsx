import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Zap, Crown } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { getDailyQuote } from '../../lib/quotes';

export const ZenHero = () => {
  const { user, userStats, themeConfig } = useStudy();
  const [time, setTime] = useState(new Date());
  const [quote] = useState(getDailyQuote());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }).split(' ');
  };

  const [timeStr, ampm] = formatTime(time);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="relative py-12 md:py-24 flex flex-col items-center justify-center text-center">
      {/* Background Decorative Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <div className="w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
      >
        {/* Large Flip-Clock Style Time */}
        {themeConfig.showClock && (
          <div className="flex items-baseline justify-center gap-4 mb-8">
            <h1 className="text-8xl md:text-[10rem] font-display font-black tracking-tighter dark:text-white leading-none tabular-nums drop-shadow-2xl">
              {timeStr}
            </h1>
            <span className="text-xl md:text-2xl font-black uppercase tracking-widest text-indigo-500/50">
              {ampm}
            </span>
          </div>
        )}

        {/* Personalized Greeting */}
        {themeConfig.showGreeting && (
          <div className="mb-8">
            <h2 className="text-2xl md:text-4xl font-display font-bold dark:text-white uppercase tracking-tight flex items-center justify-center gap-3">
              {getGreeting()}, <span className="text-indigo-600">{user?.displayName?.split(' ')[0]}</span>
              {userStats.isPremium && (
                <motion.span 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="inline-flex items-center justify-center w-8 h-8 bg-amber-500 rounded-xl shadow-lg"
                >
                  <Crown className="w-4 h-4 text-white" />
                </motion.span>
              )}
            </h2>
          </div>
        )}

        {/* Cinematic Quote */}
        {themeConfig.showQuote && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="max-w-2xl mx-auto px-6"
          >
            <div className="backdrop-blur-xl bg-white/5 dark:bg-slate-900/40 p-8 rounded-[40px] border border-white/10 shadow-2xl relative group">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-500 rounded-full" />
              <p className="text-slate-600 dark:text-slate-300 font-medium italic text-lg md:text-xl leading-relaxed">
                "{quote.text}"
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-6 flex items-center justify-center gap-4">
                <span className="w-8 h-px bg-slate-800" />
                {quote.author}
                <span className="w-8 h-px bg-slate-800" />
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
