import React, { memo } from 'react';
import { motion } from 'motion/react';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardCard = memo(({ children, className = '' }: DashboardCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
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
});