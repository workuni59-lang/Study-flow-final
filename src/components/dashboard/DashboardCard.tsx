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
        backdrop-blur-2xl 
        bg-white/50 
        dark:bg-slate-900/40 
        rounded-3xl 
        p-6 md:p-8 
        border 
        border-white/20 
        dark:border-white/[0.06] 
        shadow-lg shadow-black/[0.03] dark:shadow-black/[0.2]
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
