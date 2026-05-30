export type Mode = 'home' | 'focus';

interface TopBarProps {
  mode: Mode;
  onModeChange: (m: Mode) => void;
  onMenuOpen: () => void;
  onSettingsOpen: () => void;
}

export const TopBar = ({ mode, onModeChange, onMenuOpen, onSettingsOpen }: TopBarProps) => (
  <>
    {/* Hamburger + Settings */}
    <div className="top-bar fixed top-4 left-4 z-30 flex items-center gap-2">
      <button onClick={onMenuOpen}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>
      <button onClick={onSettingsOpen}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>
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
  </>
);
