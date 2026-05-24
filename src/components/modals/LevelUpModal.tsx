import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, ArrowUpRight, Zap, Sparkles } from 'lucide-react';

interface LevelUpModalProps {
  level: number;
  isOpen: boolean;
  onClose: () => void;
}

export const LevelUpModal = ({ level, isOpen, onClose }: LevelUpModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 1.1, opacity: 0, transition: { duration: 0.2 } }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[48px] p-10 text-center shadow-[0_0_100px_rgba(99,102,241,0.3)] overflow-hidden"
          >
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" />
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px]" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/10 rounded-full blur-[60px]" />

            {/* Icon & Animation */}
            <div className="relative mb-8">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[32px] flex items-center justify-center text-white mx-auto shadow-2xl relative z-10"
              >
                <Trophy className="w-10 h-10" />
              </motion.div>
              
              {/* Floating Sparkles */}
              <motion.div 
                animate={{ y: [-10, 10, -10], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-0 right-1/4 text-amber-500"
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
            </div>

            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 mb-4 block">New Rank Achieved</span>
            <h2 className="text-4xl font-display font-black dark:text-white uppercase tracking-tighter mb-4 leading-none">
              Level <span className="text-indigo-600">{level}</span> REACHED
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed">
              Your dedication is paying off. You are evolving into a true master of your subjects.
            </p>

            <button 
              onClick={onClose}
              className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-black rounded-3xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
            >
              Continue My Flow <ArrowUpRight className="w-5 h-5" />
            </button>

            {/* Celebration Stats */}
            <div className="mt-8 flex justify-center gap-8 border-t border-slate-100 dark:border-slate-800 pt-8">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                  <p className="text-sm font-bold dark:text-white">Elite Scholar</p>
               </div>
               <div className="w-px h-8 bg-slate-100 dark:bg-slate-800" />
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Reward</p>
                  <p className="text-sm font-bold text-emerald-500">+1 Shield</p>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
