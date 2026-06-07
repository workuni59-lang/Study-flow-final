import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Plus, Trash2, Bold, Italic, Heading, List, ListOrdered, CheckSquare, Maximize2, Minimize2, ChevronLeft, Save } from 'lucide-react';
import { motion } from 'motion/react';

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

const STORAGE_KEY = 'studyflow_notes';
const SAVE_DEBOUNCE = 800;

function load(): Note[] {
  try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : []; } catch { return []; }
}

function persist(notes: Note[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); } catch {}
}

function fmtTime(ts: number): string {
  const d = new Date(ts);
  let h = d.getHours();
  const a = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${d.getMinutes().toString().padStart(2, '0')} ${a}`;
}

function getFirstLine(html: string): string {
  const text = html.replace(/<[^>]*>/g, '');
  return text.split('\n')[0] || '';
}

function capture(editor: HTMLDivElement | null): Range | null {
  if (!editor) return null;
  const s = window.getSelection();
  if (s?.rangeCount && editor.contains(s.getRangeAt(0).commonAncestorContainer))
    return s.getRangeAt(0).cloneRange();
  return null;
}

function restore(editor: HTMLDivElement, range: Range | null) {
  editor.focus();
  if (range) {
    const s = window.getSelection();
    s?.removeAllRanges();
    s?.addRange(range);
  }
}

export const NotesPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [notes, setNotes] = useState<Note[]>(load);
  const [activeId, setActiveId] = useState<string | null>(notes[0]?.id || null);
  const [saved, setSaved] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const savedTimer = useRef<ReturnType<typeof setTimeout>>();
  const activeIdRef = useRef<string | null>(activeId);
  activeIdRef.current = activeId;

  const activeNote = notes.find(n => n.id === activeId) || null;

  useEffect(() => {
    return () => { clearTimeout(saveTimer.current); clearTimeout(savedTimer.current); };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!editorRef.current || !activeId) return;
    const note = notes.find(n => n.id === activeId);
    editorRef.current.innerHTML = note?.content || '';
  }, [activeId]);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName !== 'INPUT' || (t as HTMLInputElement).type !== 'checkbox') return;
      e.preventDefault();
      const cb = t as HTMLInputElement;
      cb.checked = !cb.checked;
      const item = cb.closest('.todo-item') as HTMLElement;
      if (!item) return;
      const span = item.querySelector('.todo-text') as HTMLElement;
      if (span) {
        span.style.textDecoration = cb.checked ? 'line-through' : 'none';
        span.style.color = cb.checked ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.8)';
      }
      if (activeIdRef.current && editorRef.current)
        updateNote(activeIdRef.current, { content: editorRef.current.innerHTML });
    };
    el.addEventListener('mousedown', handler, true);
    return () => el.removeEventListener('mousedown', handler, true);
  }, []);

  const updateNote = (id: string, patch: Partial<Note>) => {
    setNotes(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n);
      persist(updated);
      return updated;
    });
  };

  const scheduleSave = () => {
    setSaved(false);
    clearTimeout(saveTimer.current);
    clearTimeout(savedTimer.current);
    saveTimer.current = setTimeout(() => setSaved(true), SAVE_DEBOUNCE);
  };

  const handleEditorInput = () => {
    if (!editorRef.current || !activeId) return;
    updateNote(activeId, { content: editorRef.current.innerHTML });
    scheduleSave();
  };

  const handleTitleChange = (title: string) => {
    if (!activeId) return;
    updateNote(activeId, { title });
    scheduleSave();
  };

  const createNote = () => {
    const note: Note = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      title: '', content: '', updatedAt: Date.now(),
    };
    const updated = [note, ...notes];
    setNotes(updated);
    persist(updated);
    setActiveId(note.id);
    clearTimeout(saveTimer.current);
    setSaved(true);
  };

  const deleteNote = () => {
    if (!activeId) return;
    const updated = notes.filter(n => n.id !== activeId);
    setNotes(updated);
    persist(updated);
    setActiveId(updated[0]?.id || null);
    clearTimeout(saveTimer.current);
    setSaved(true);
  };

  const withSel = (fn: (rng: Range | null) => void) => (e: React.MouseEvent) => {
    const rng = capture(editorRef.current);
    e.preventDefault();
    const el = editorRef.current;
    if (!el) return;
    restore(el, rng);
    fn(rng);
    handleEditorInput();
  };

  const onCmd = (cmd: string, val?: string) => withSel(() => document.execCommand(cmd, false, val));

  const onHeading = withSel(() => {
    const s = window.getSelection();
    if (!s?.rangeCount) return;
    const n = s.getRangeAt(0).commonAncestorContainer;
    const b = (n.nodeType === 3 ? n.parentElement : n) as HTMLElement;
    document.execCommand('formatBlock', false, b?.closest?.('h2') ? '<p>' : '<h2>');
  });

  const onHighlight = withSel(() => document.execCommand('hiliteColor', false, '#facc1533'));

  const onTodo = withSel(() => {
    document.execCommand('insertHTML', false,
      '<span class="todo-item" style="display:inline-flex;align-items:center;gap:6px;">' +
      '<span class="todo-text" style="color:rgba(255,255,255,0.8);">\u200B</span>' +
      '<input type="checkbox" style="width:14px;height:14px;accent-color:#facc15;cursor:pointer;flex-shrink:0;" contenteditable="false">' +
      '</span>');
  });

  const wordCount = useMemo(() => {
    const text = activeNote?.content?.replace(/<[^>]*>/g, '') || '';
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [activeNote?.content]);

  const noteIndex = activeId ? notes.findIndex(n => n.id === activeId) + 1 : 0;

  if (!isOpen) return null;

  const rightContent = activeNote ? (
    <>
      <div className="flex items-center gap-2 px-4 pt-4 pb-2 shrink-0">
        <ChevronLeft className="w-4 h-4 text-white/30 shrink-0" />
        <input ref={titleRef} value={activeNote.title}
          onChange={e => handleTitleChange(e.target.value)}
          placeholder="Note title"
          className="flex-1 bg-transparent text-base font-semibold text-white outline-none placeholder-white/20 min-w-0" />
        <button onClick={deleteNote}
          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-white/40 hover:text-rose-400 transition-all shrink-0" title="Delete note">
          <Trash2 className="w-[18px] h-[18px]" />
        </button>
        <button onClick={createNote}
          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-white/80 transition-all shrink-0" title="New note">
          <Plus className="w-[18px] h-[18px]" />
        </button>
      </div>

      <div className="flex items-center gap-0.5 px-4 pb-2 shrink-0 overflow-x-auto no-scrollbar">
        <button onMouseDown={onCmd('bold')}
          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/50 hover:text-white/80 transition-all" title="Bold">
          <Bold className="w-[18px] h-[18px]" />
        </button>
        <button onMouseDown={onCmd('italic')}
          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/50 hover:text-white/80 transition-all" title="Italic">
          <Italic className="w-[18px] h-[18px]" />
        </button>
        <button onMouseDown={onHeading}
          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/50 hover:text-white/80 transition-all" title="Heading">
          <Heading className="w-[18px] h-[18px]" />
        </button>
        <div className="w-px h-4 bg-white/[0.08] mx-1" />
        <button onMouseDown={onCmd('insertUnorderedList')}
          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/50 hover:text-white/80 transition-all" title="Bullet list">
          <List className="w-[18px] h-[18px]" />
        </button>
        <button onMouseDown={onCmd('insertOrderedList')}
          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/50 hover:text-white/80 transition-all" title="Numbered list">
          <ListOrdered className="w-[18px] h-[18px]" />
        </button>
        <div className="w-px h-4 bg-white/[0.08] mx-1" />
        <button onMouseDown={onTodo}
          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/50 hover:text-white/80 transition-all" title="Todo checkbox">
          <CheckSquare className="w-[18px] h-[18px]" />
        </button>
        <button onMouseDown={onHighlight}
          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/50 hover:text-white/80 transition-all" title="Highlight">
          <span className="text-[10px] font-bold leading-none">Hl</span>
        </button>
        <button onClick={() => setFullscreen(v => !v)}
          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/50 hover:text-white/80 transition-all" title="Fullscreen">
          {fullscreen ? <Minimize2 className="w-[18px] h-[18px]" /> : <Maximize2 className="w-[18px] h-[18px]" />}
        </button>
      </div>

      <div className="flex-1 px-4 pb-2 min-h-0">
        <div ref={editorRef} contentEditable
          onInput={handleEditorInput}
          className="w-full h-full overflow-y-auto outline-none text-sm text-white/80 leading-relaxed
            empty:before:content-[attr(data-placeholder)] empty:before:text-white/20 empty:before:cursor-text
            [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5"
          data-placeholder="What are you working on?"
          suppressContentEditableWarning />
      </div>

      <div className="flex items-center justify-between px-4 pb-4 shrink-0">
        <div className="flex items-center gap-1.5">
          {saved ? (
            <Save className="w-3 h-3 text-emerald-400" />
          ) : (
            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          )}
          <span className="text-[10px] text-white/30">{saved ? 'Saved' : 'Saving...'}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-white/20">
          <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
          <span>{noteIndex} of {notes.length}</span>
        </div>
      </div>
    </>
  ) : (
    <div className="flex-1 flex items-center justify-center text-sm text-white/20">
      Select or create a note to get started
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(10, 10, 20, 0.95)' }}
    >
      <div className={`flex ${fullscreen ? 'w-full h-full' : 'w-[900px] h-[520px] max-w-[95vw] max-h-[90vh]'} rounded-xl overflow-hidden`}
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}>
        <div className="w-[300px] shrink-0 flex flex-col bg-black/40">
          <div className="flex items-center gap-1.5 px-4 pt-4 pb-3">
            <span className="text-base font-semibold text-white">Notes</span>
            <span className="text-sm text-white/30 font-normal">({notes.length})</span>
            <button onClick={createNote}
              className="ml-auto w-6 h-6 rounded-full bg-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.15] transition-all"
              title="New note">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
            {notes.map(note => (
              <button key={note.id} onClick={() => setActiveId(note.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                  activeId === note.id ? 'bg-white/[0.12]' : 'hover:bg-white/[0.04]'
                }`}>
                <div className={`text-sm font-semibold truncate ${activeId === note.id ? 'text-white' : 'text-white/70'}`}>
                  {note.title || 'Untitled'}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-white/30 shrink-0">{fmtTime(note.updatedAt)}</span>
                  <span className="text-[11px] text-white/20 truncate">{getFirstLine(note.content) || 'Empty note'}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="px-4 py-4">
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.15] transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="w-px bg-white/[0.06] shrink-0" />
        <div className="flex-1 flex flex-col min-w-0 bg-black/20">
          {rightContent}
        </div>
      </div>
    </motion.div>
  );
};
