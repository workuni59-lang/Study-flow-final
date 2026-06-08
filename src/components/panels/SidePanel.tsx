import { useState, type ReactNode } from 'react';
import { AnimatePresence } from 'motion/react';

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: 'left' | 'right';
}

export const SidePanel = ({ open, onClose, title, children, side = 'right' }: SidePanelProps) => {
  const panelSide = side === 'right' ? 'right-0' : 'left-0';
  const translateX = side === 'right' ? (open ? 'translate-x-0' : 'translate-x-full') : (open ? 'translate-x-0' : '-translate-x-full');

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
          <div
            className={`fixed top-0 ${panelSide} bottom-0 w-full max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl z-50 transform transition-transform duration-300 ease-out ${translateX}`}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-display font-semibold dark:text-white">{title}</h2>
              <button onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto h-[calc(100%-60px)] p-4 md:p-5">
              {children}
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
