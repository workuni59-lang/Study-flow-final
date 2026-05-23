import React from 'react';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardCard = ({ children, className = '' }: DashboardCardProps) => {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-xl hover:shadow-indigo-500/5 ${className}`}>
      {children}
    </div>
  );
};
