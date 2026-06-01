import { useState, useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type Mode = 'home' | 'focus';

interface TopBarProps {
  mode: Mode;
  onModeChange: (m: Mode) => void;
  onMenuOpen: () => void;
}

const HELP_LINKS = [
  { icon: '📖', label: 'Help Center', url: 'https://www.notion.so/StudyFlow-Help-center-371488e28c0d8033a264d869e2359137' },
  { icon: '💬', label: 'Leave Feedback', url: 'https://tally.so/r/81MAzk' },
  { icon: '🎮', label: 'Join Discord', url: 'https://discord.gg/tUFvKERC' },
];

export const TopBar = ({ mode, onModeChange, onMenuOpen }: TopBarProps) => {
  const [helpOpen, setHelpOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!helpOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target as Node) &&
        popoverRef.current && !popoverRef.current.contains(e.target as Node)
      ) {
        setHelpOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setHelpOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [helpOpen]);

  return (
    <>
      {/* Hamburger */}
      <div className="top-bar fixed top-4 left-4 z-30 flex items-center gap-2">
        <button onClick={onMenuOpen}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1" />
        <img src="/logo.png" alt="StudyFlow" className="w-6 h-6 object-contain" />
        <span className="text-xs font-bold dark:text-white tracking-tight hidden sm:block">StudyFlow</span>
      </div>

      {/* ? Help button — top right */}
      <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 30 }}>
        <button
          ref={buttonRef}
          onClick={() => setHelpOpen(v => !v)}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.75)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 0.15s, transform 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          ?
        </button>

        <AnimatePresence>
          {helpOpen && (
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                top: '44px',
                right: '0',
                width: '220px',
                backgroundColor: 'rgba(15,15,26,0.92)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px',
                padding: '12px',
                zIndex: 100,
              }}
              className="help-popover"
            >
              {HELP_LINKS.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '13px',
                    gap: '10px',
                    textDecoration: 'none',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </span>
                  <ExternalLink size={12} style={{ opacity: 0.5, flexShrink: 0 }} />
                </a>
              ))}
              <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', margin: '6px 0 2px' }}>
                v1.0.0 &middot; StudyFlow
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mode toggle pill */}
      <div className="top-bar fixed top-5 left-1/2 -translate-x-1/2 z-30 flex gap-0.5 p-0.5 rounded-[10px] bg-white/30 dark:bg-[#0a0c10]/40 backdrop-blur-xl border border-white/20 dark:border-white/[0.06] shadow-sm">
        <button onClick={() => onModeChange('home')}
          className={`px-2.5 py-1 rounded-[7px] text-[9px] font-semibold uppercase tracking-wider transition-all ${
            mode === 'home'
              ? 'bg-white/70 dark:bg-white/10 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500/70 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Home
        </button>
        <button onClick={() => onModeChange('focus')}
          className={`px-2.5 py-1 rounded-[7px] text-[9px] font-semibold uppercase tracking-wider transition-all ${
            mode === 'focus'
              ? 'bg-white/70 dark:bg-white/10 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500/70 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Focus
        </button>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .help-popover {
            width: calc(100vw - 32px) !important;
            left: 16px !important;
            right: 16px !important;
          }
        }
      `}</style>
    </>
  );
};
