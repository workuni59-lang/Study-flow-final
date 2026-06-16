import { useEffect } from 'react';

interface ShortcutHandlers {
  onTasksOpen: () => void;
  onMusicOpen: () => void;
  onNotepadOpen: () => void;
  onClosePanel: () => void;
}

export function useKeyboardShortcuts({
  onTasksOpen,
  onMusicOpen,
  onNotepadOpen,
  onClosePanel
}: ShortcutHandlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (isInput) return;

      switch (e.key) {
        case 't':
        case 'T':
          onTasksOpen();
          break;
        case 'm':
        case 'M':
          onMusicOpen();
          break;
        case 'n':
        case 'N':
          onNotepadOpen();
          break;
        case 'Escape':
          onClosePanel();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onTasksOpen, onMusicOpen, onNotepadOpen, onClosePanel]);
}
