import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Crown, Zap, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PremiumModal = ({ isOpen, onClose }: PremiumModalProps) => {
  const { togglePremium } = useStudy();

  const benefits = [
    { icon: Sparkles, t: 'Exclusive Customization', d: 'Unlock Sunset, Glacier, and Sakura atmospheres.' },
    { icon: Zap, t: 'Dynamic Wallpapers', d: 'Arctic Aurora and Deep Space animated backgrounds.' },
    { icon: Shield, t: 'Permanent Shield', d: 'One automatic streak preservation every week.' },
    { icon: Crown, t: 'Priority Support', d: 'Direct access to the Study Flow dev team.' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[48px] overflow-hidden shadow-2xl border border-white dark:border-slate-800"
          >
            {/* Hero Header */}
            <div className="p-10 md:p-14 bg-indigo-600 text-white relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                 <Crown className="w-48 h-48" />
              </div>
              
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md mb-6 border border-white/10">
                    <Crown className="w-3.5 h-3.5 text-amber-300" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Flow Pro</span>
                 </div>
                 <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter mb-4 leading-none">
                    The Ultimate <br/> Focus Toolkit.
                 </h2>
                 <p className="text-indigo-100 font-medium text-lg max-w-md mx-auto">
                    Maintain your momentum with professional-grade aesthetic and protection features.
                 </p>
              </div>
            </div>

            <div className="p-10 md:p-14">
               <div className="grid md:grid-cols-2 gap-8 mb-12">
                  {benefits.map((b, i) => (
                    <div key={i} className="flex gap-4 items-start">
                       <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0">
                          <b.icon className="w-5 h-5" />
                       </div>
                       <div>
                          <h4 className="font-bold dark:text-white text-sm mb-1">{b.t}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{b.d}</p>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => {
                      togglePremium();
                      alert("Demo: Premium status toggled!");
                      onClose();
                    }}
                    className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-600/20"
                  >
                    Unlock Pro (Mock Toggle)
                  </button>
                  <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">
                    One-time academic year license • $19.99
                  </p>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
