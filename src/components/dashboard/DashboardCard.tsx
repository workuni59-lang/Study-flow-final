import React from 'react';
import { motion } from 'motion/react';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardCard = ({ children, className = '' }: DashboardCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        backdrop-blur-3xl 
        bg-white/70 
        dark:bg-slate-900/60 
        rounded-[40px] 
        p-8 
        border 
        border-white/20 
        dark:border-white/5 
        shadow-[0_8px_32px_rgba(0,0,0,0.1)] 
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
