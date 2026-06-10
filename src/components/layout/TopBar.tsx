import { useState, useEffect, useRef, memo } from 'react';
import { ExternalLink, LogIn } from 'lucide-react';
import LadderIcon from '../ui/LadderIcon';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

export type Mode = 'home' | 'focus';

interface TopBarProps {
  mode: Mode;
  onModeChange: (m: Mode) => void;
  onMenuOpen: () => void;
  onOpenAuth?: () => void;
  onLeaderboardOpen?: () => void;
  onProfileOpen?: () => void;
}

const HELP_LINKS = [
  { icon: '📖', label: 'Help Center', url: 'https://www.notion.so/StudyFlow-Help-center-371488e28c0d8033a264d869e2359137' },
  { icon: '💬', label: 'Leave Feedback', url: 'https://tally.so/r/81MAzk' },
  { icon: '🎮', label: 'Join Discord', url: 'https://discord.gg/tUFvKERC' },
];

export const TopBar = memo(({ mode, onModeChange, onMenuOpen, onOpenAuth, onLeaderboardOpen, onProfileOpen }: TopBarProps) => {
  const { user } = useAuth();
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
      {/* Left group: hamburger + brand + mode toggle */}
      <div className="top-bar fixed top-4 left-4 z-30 flex items-center gap-2">
        <button onClick={onMenuOpen} aria-label="Open menu"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <img src="/logo.png" alt="StudyFlow" className="w-6 h-6 object-contain" />
        <span className="text-xs font-bold dark:text-white tracking-tight hidden sm:block">StudyFlow</span>
        <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1" />
        <div className="flex gap-0.5 p-0.5 rounded-[10px] backdrop-blur-xl border border-white/[0.08] bg-black/20">
          <button onClick={() => onModeChange('home')}
            className={`px-3 py-1.5 rounded-[7px] text-[9px] font-semibold uppercase tracking-wider transition-all ${
              mode === 'home'
                ? 'bg-white/10 text-white shadow-xs'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            Home
          </button>
          <button onClick={() => onModeChange('focus')}
            className={`px-3 py-1.5 rounded-[7px] text-[9px] font-semibold uppercase tracking-wider transition-all ${
              mode === 'focus'
                ? 'bg-white/10 text-white shadow-xs'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            Focus
          </button>
        </div>
      </div>

      {/* Leaderboard + Sign-in + Help — top right */}
      <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 30, display: 'flex', alignItems: 'center', gap: '6px' }}>
        {onLeaderboardOpen && (
          <button onClick={onLeaderboardOpen} title="Leaderboard"
            style={{
              height: '32px',
              padding: '0 10px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.75)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            <LadderIcon size={12} />
            Leaderboard
          </button>
        )}
        {user && onProfileOpen && (
          <button onClick={onProfileOpen} title="View your profile" aria-label="View your profile"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
              border: '1px solid rgba(255,255,255,0.12)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: 'white',
              transition: 'border-color 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {user.displayName?.charAt(0) || '?'}
          </button>
        )}
        {!user && onOpenAuth && (
          <button onClick={onOpenAuth}
            style={{
              height: '32px',
              padding: '0 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.75)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            <LogIn size={12} />
            Sign in
          </button>
        )}
        <button aria-label="Help"
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
});
