import { memo, useMemo, useRef, useEffect, useState, type ReactNode } from 'react';
import { StudyTimer } from '../dashboard/StudyTimer';
import { NotesPanel } from '../panels/NotesPanel';
import { useStudy } from '../../context/StudyContext';

interface FocusEnvironmentProps {
  onTasksOpen: () => void;
  onMusicOpen?: () => void;
  onNotepadOpen?: () => void;
  onQuestsOpen?: () => void;
  section?: string;
  onFullscreenChange?: (fullscreen: boolean) => void;
}

const UtilityButton = memo(({ onClick, children, label }: {
  onClick: () => void;
  children: ReactNode;
  label: string;
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 px-3 py-2 rounded-xl backdrop-blur-md bg-white/[0.04] border border-white/[0.04] text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all text-[10px] font-medium"
    title={label} aria-label={label}
  >
    {children}
    <span className="hidden sm:inline">{label}</span>
  </button>
));
export const FocusEnvironment = memo(({
  onTasksOpen, onMusicOpen, onNotepadOpen, onQuestsOpen, onFullscreenChange,
}: FocusEnvironmentProps) => {
  const dockRef = useRef<HTMLDivElement>(null);
  const [isMobile] = useState(() => window.innerWidth < 768);
  const [dockVisible, setDockVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handle = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handle);
    return () => document.removeEventListener('fullscreenchange', handle);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  // Notify parent so it can hide chrome
  useEffect(() => {
    onFullscreenChange?.(isFullscreen);
  }, [isFullscreen, onFullscreenChange]);

  // Auto-hide dock when idle
  useEffect(() => {
    if (isMobile) return;
    const show = () => {
      setDockVisible(true);
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => setDockVisible(false), 4000);
    };
    const hide = () => {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => setDockVisible(false), 4000);
    };
    document.addEventListener('mousemove', show);
    document.addEventListener('touchstart', show);
    document.addEventListener('mouseleave', hide);
    show();
    return () => {
      document.removeEventListener('mousemove', show);
      document.removeEventListener('touchstart', show);
      document.removeEventListener('mouseleave', hide);
      clearTimeout(hideTimerRef.current);
    };
  }, [isMobile]);



  const utilityItems = useMemo(() => [
    { id: 'tasks', label: 'Tasks', handler: onTasksOpen },
    { id: 'notes', label: 'Notes', handler: onNotepadOpen },
    { id: 'ambience', label: 'Ambience', handler: onMusicOpen },
    { id: 'quests', label: 'Quests', handler: onQuestsOpen },
  ].filter(i => i.handler), [onTasksOpen, onNotepadOpen, onMusicOpen, onQuestsOpen]);

  if (isFullscreen) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-screen">
        {/* Atmosphere glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vmin] h-[60vmin] rounded-full bg-brand/[0.04] blur-[60px] pointer-events-none z-0" />
        <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vmin] h-[40vmin] rounded-full bg-violet-500/[0.04] blur-[50px] pointer-events-none z-0" />

        <div className="relative z-10 w-full max-w-lg px-4">
          <StudyTimer variant="floating" />
        </div>
        <button
          onClick={toggleFullscreen}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.04] text-white/20 hover:text-white/60 hover:bg-white/[0.06] transition-all text-[10px] font-medium opacity-0 hover:opacity-100 focus-visible:opacity-100"
          aria-label="Exit fullscreen"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3"/>
          </svg>
          <span className="hidden sm:inline">Exit</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center w-full min-h-[calc(100dvh-8rem)]">
      {/* Atmosphere glow — soft radial light behind timer */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vmin] h-[60vmin] rounded-full bg-brand/[0.04] blur-[60px] pointer-events-none z-0" />
      <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vmin] h-[40vmin] rounded-full bg-violet-500/[0.04] blur-[50px] pointer-events-none z-0" />

      {/* Timer — flex-1 centers it vertically between atmosphere and dock */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full px-4 min-h-0">
        <div className="w-full max-w-lg">
          <StudyTimer variant="floating" onToggleFullscreen={toggleFullscreen} />
        </div>
      </div>

      {/* Utility dock — auto-hides after inactivity; responsive bottom gap avoids overlap */}
      <div
        ref={dockRef}
        className={`z-20 flex items-center gap-2 px-3 py-2 rounded-2xl backdrop-blur-xl bg-black/15 border border-white/[0.04] transition-all duration-500 mb-[clamp(8px,4dvh,32px)] ${
          dockVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >

        {utilityItems.map(({ id, label, handler }) => (
          <UtilityButton key={id} onClick={handler!} label={label}>
            {id === 'tasks' && <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>}
            {id === 'ambience' && <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>}
            {id === 'notes' && <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>}
            {id === 'quests' && <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
          </UtilityButton>
        ))}

      </div>
    </div>
  );
});
