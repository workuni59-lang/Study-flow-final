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
        bg-white 
        dark:bg-[#141622]
        rounded-3xl 
        p-6 md:p-8 
        border 
        border-slate-100 
        dark:border-slate-800/50
        shadow-lg shadow-black/[0.03] dark:shadow-black/[0.2]
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
