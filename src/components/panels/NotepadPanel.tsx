import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { storage, type Note } from '../../services/storage';
import { Save, Plus, Trash2, ChevronLeft, Bold, Italic, Heading, List, ListOrdered, Link, Code, Code2, Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';

const NOTE_THEMES = [
  { id: 'dark', bg: 'bg-slate-800', text: 'text-white', circle: 'bg-slate-600' },
  { id: 'cream', bg: 'bg-amber-50', text: 'text-slate-800', circle: 'bg-amber-200' },
  { id: 'sepia', bg: 'bg-amber-100', text: 'text-amber-900', circle: 'bg-amber-600' },
  { id: 'gray', bg: 'bg-gray-100', text: 'text-slate-700', circle: 'bg-gray-400' },
] as const;

function mdToHtml(md: string): string {
  let html = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/### (.+)/g, '<h3>$1</h3>')
    .replace(/## (.+)/g, '<h2>$1</h2>')
    .replace(/# (.+)/g, '<h1>$1</h1>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  const lines = html.split('\n');
  let result = '';
  let inUl = false, inOl = false;
  for (const line of lines) {
    const ulMatch = line.match(/^- (.+)/);
    const olMatch = line.match(/^\d+\. (.+)/);
    if (ulMatch) { if (!inUl) { result += '<ul>'; inUl = true; } result += '<li>' + ulMatch[1] + '</li>'; }
    else { if (inUl) { result += '</ul>'; inUl = false; } }
    if (olMatch) { if (!inOl) { result += '<ol>'; inOl = true; } result += '<li>' + olMatch[1] + '</li>'; }
    else { if (inOl) { result += '</ol>'; inOl = false; } }
    if (!ulMatch && !olMatch) {
      if (!line.match(/^<(h[123]|pre|ul|ol)/) && line.trim()) result += '<p>' + line + '</p>';
      else if (line.trim()) result += line;
    }
  }
  if (inUl) result += '</ul>';
  if (inOl) result += '</ol>';
  return result;
}

function highlightMd(md: string): string {
  let h = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/(```)([\s\S]*?)(```)/g, '<span class="text-white/45">$1</span><code class="text-cyan-300">$2</code><span class="text-white/45">$3</span>')
    .replace(/(`)([^`]+)(`)/g, '<span class="text-white/45">$1</span><code class="text-cyan-300 bg-white/5 rounded px-0.5">$2</code><span class="text-white/45">$3</span>')
    .replace(/(^### )(.*)/gm, '<span class="text-white/45">### </span><span class="text-orange-300 font-bold">$2</span>')
    .replace(/(^## )(.*)/gm, '<span class="text-white/45">## </span><span class="text-orange-300 font-semibold">$2</span>')
    .replace(/(^# )(.*)/gm, '<span class="text-white/45"># </span><span class="text-orange-300 font-bold">$2</span>')
    .replace(/(\*\*)([^*]+)(\*\*)/g, '<span class="text-white/45">$1</span><strong class="text-white">$2</strong><span class="text-white/45">$3</span>')
    .replace(/(\*)([^*]+)(\*)/g, '<span class="text-white/45">$1</span><em class="text-white/90">$2</em><span class="text-white/45">$3</span>')
    .replace(/(\[)([^\]]+)(\]\()([^)]+)(\))/g, '<span class="text-white/45">$1</span><span class="text-sky-300">$2</span><span class="text-white/45">$3</span><span class="text-sky-400/70 underline">$4</span><span class="text-white/45">$5</span>')
    .replace(/(^- )(.*)/gm, '<span class="text-white/45">- </span><span>$2</span>')
    .replace(/(^\d+\. )(.*)/gm, '<span class="text-white/45">$1</span><span>$2</span>');
  return h.split('\n').join('<br>');
}

function insertSyntax(textarea: HTMLTextAreaElement, before: string, after: string) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const replacement = before + selected + after;
  const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
  return { value: newValue, cursorPos: start + before.length + selected.length + after.length };
}

function insertLinePrefix(textarea: HTMLTextAreaElement, prefix: string) {
  const start = textarea.selectionStart;
  const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
  const line = textarea.value.substring(lineStart, start);
  const newValue = textarea.value.substring(0, lineStart) + prefix + line + textarea.value.substring(start);
  return { value: newValue, cursorPos: start + prefix.length };
}

export const NotepadPanel = () => {
  const [notes, setNotes] = useState<Note[]>(() => storage.getNotes());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const activeNote = notes.find(n => n.id === activeId) || null;
  const activeTheme = NOTE_THEMES.find(t => t.id === (activeNote?.theme || 'dark')) || NOTE_THEMES[0];

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (activeNote) {
      setText(activeNote.content);
      setSaved(true);
      setShowPreview(false);
    }
  }, [activeId]);

  const persist = (updated: Note[]) => {
    setNotes(updated);
    storage.saveNotes(updated);
  };

  const handleChange = (value: string) => {
    setText(value);
    setSaved(false);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (activeId) {
        const updated = notes.map(n => n.id === activeId ? { ...n, content: value, updatedAt: new Date().toISOString() } : n);
        persist(updated);
        setSaved(true);
      }
    }, 600);
  };

  const handleScroll = useCallback(() => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleTitleSave = () => {
    const t = titleDraft.trim() || 'Untitled';
    if (activeId) {
      const updated = notes.map(n => n.id === activeId ? { ...n, title: t, updatedAt: new Date().toISOString() } : n);
      persist(updated);
    }
    setEditingTitle(false);
  };

  const createNote = () => {
    const note: Note = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      title: 'Untitled',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      theme: 'dark',
    };
    persist([note, ...notes]);
    setActiveId(note.id);
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    persist(updated);
    if (activeId === id) setActiveId(updated.length > 0 ? updated[0].id : null);
  };

  const handleToolbar = (fn: () => { value: string; cursorPos: number } | null) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const result = fn();
    if (!result) return;
    setText(result.value);
    handleChange(result.value);
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = result.cursorPos; }, 0);
  };

  const handleThemeChange = (themeId: string) => {
    if (!activeId) return;
    const updated = notes.map(n => n.id === activeId ? { ...n, theme: themeId as Note['theme'], updatedAt: new Date().toISOString() } : n);
    persist(updated);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const previewHtml = useMemo(() => mdToHtml(text), [text]);
  const highlightHtml = useMemo(() => highlightMd(text), [text]);

  useEffect(() => {
    if (fullscreen) {
      const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setFullscreen(false); };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
  }, [fullscreen]);

  const toolbarButtons = [
    { icon: Bold, action: () => insertSyntax(textareaRef.current!, '**', '**'), label: 'Bold' },
    { icon: Italic, action: () => insertSyntax(textareaRef.current!, '*', '*'), label: 'Italic' },
    { icon: Heading, action: () => insertLinePrefix(textareaRef.current!, '## '), label: 'Heading' },
    { icon: List, action: () => insertLinePrefix(textareaRef.current!, '- '), label: 'List' },
    { icon: ListOrdered, action: () => insertLinePrefix(textareaRef.current!, '1. '), label: 'Numbered' },
    { icon: Link, action: () => insertSyntax(textareaRef.current!, '[', '](url)'), label: 'Link' },
    { icon: Code, action: () => insertSyntax(textareaRef.current!, '`', '`'), label: 'Code' },
  ];

  const toggleButtons = (
    <div className="flex items-center gap-1 ml-auto">
      <button onClick={() => setShowHighlight(v => !v)}
        title="Show formatted markdown (not raw syntax)"
        className={`flex items-center gap-1 px-1.5 py-1 rounded-lg text-[8px] font-bold uppercase tracking-wider transition-all ${showHighlight ? 'bg-brand/15 text-brand' : 'hover:bg-white/[0.06] text-white/50 hover:text-white/70'}`}>
        <Code2 className="w-3.5 h-3.5" />
        <span>Highlight</span>
      </button>
      <button onClick={() => setShowPreview(v => !v)}
        title={showPreview ? 'Hide preview' : 'Show preview'}
        className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white/70 transition-all">
        {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
      <button onClick={() => setFullscreen(v => !v)}
        title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white/70 transition-all">
        {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );

  const editorContent = (isFullscreen: boolean) => (
    <>
      <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06] shrink-0">
        {!isFullscreen && (
          <button onClick={() => { setActiveId(null); setEditingTitle(false); setShowHighlight(false); }}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/70 hover:text-white transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {editingTitle ? (
          <input value={titleDraft} onChange={e => setTitleDraft(e.target.value)}
            onBlur={handleTitleSave} onKeyDown={e => e.key === 'Enter' && handleTitleSave()}
            className="flex-1 bg-transparent text-sm font-semibold text-white outline-none border-b border-white/20 py-0.5" autoFocus />
        ) : (
          <button onClick={() => { setTitleDraft(activeNote!.title); setEditingTitle(true); }}
            className="flex-1 text-left text-sm font-semibold text-white/80 truncate hover:text-white transition-colors">
            {activeNote!.title}
          </button>
        )}
        <button onClick={() => deleteNote(activeNote!.id)}
          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-white/60 hover:text-rose-400 transition-all">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={createNote}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white/70 transition-all">
          <Plus className="w-3.5 h-3.5" />
        </button>
        {isFullscreen && (
          <button onClick={() => setFullscreen(false)}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white/70 transition-all">
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-0.5 pb-2 overflow-x-auto no-scrollbar shrink-0">
        {toolbarButtons.map(({ icon: Icon, action, label }) => (
          <button key={label} onClick={() => handleToolbar(action)}
            title={label}
            className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/70 hover:text-white/80 transition-all">
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
        {toggleButtons}
      </div>

      <div className={`relative flex-1 min-h-0 ${activeTheme.bg} ${activeTheme.text} rounded-lg overflow-hidden`}>
        {showHighlight && (
          <div ref={highlightRef}
            className="absolute inset-0 overflow-hidden whitespace-pre-wrap pointer-events-none font-mono text-sm leading-relaxed p-3"
            dangerouslySetInnerHTML={{ __html: highlightHtml }} />
        )}
        <textarea ref={textareaRef} value={text}
          onChange={e => handleChange(e.target.value)}
          onScroll={handleScroll}
          placeholder="Write your thoughts..."
          className={`w-full h-full resize-none outline-none font-mono text-sm leading-relaxed p-3 ${showHighlight ? 'text-white/5 caret-white' : activeTheme.text} bg-transparent placeholder-white/50`} />
      </div>

      {showPreview && (
        <div className="shrink-0 max-h-48 overflow-y-auto border-t border-white/[0.06] p-3 text-sm text-white/80 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: previewHtml }} />
      )}

      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] shrink-0 mt-auto">
        <div className="flex items-center gap-2">
          {saved ? (
            <Save className="w-3 h-3 text-emerald-400" />
          ) : (
            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          )}
          <span className="text-[8px] text-white/50 font-medium">{saved ? 'Saved' : 'Saving...'}</span>
        </div>
        <div className="flex items-center gap-2">
          {NOTE_THEMES.map(t => (
            <button key={t.id} onClick={() => handleThemeChange(t.id)}
              title={t.id}
              className={`w-3.5 h-3.5 rounded-full ${t.circle} transition-all ${(activeNote?.theme || 'dark') === t.id ? 'ring-2 ring-white/50 scale-110' : 'ring-1 ring-white/10 hover:scale-110'}`} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[8px] text-white/50">{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
          <span className="text-[8px] text-white/50">{notes.findIndex(n => n.id === activeNote!.id) + 1} of {notes.length}</span>
        </div>
      </div>
    </>
  );

  if (!activeNote && notes.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
            <Code2 className="w-5 h-5 text-white/50" />
          </div>
          <p className="text-white/70 text-sm font-medium mb-4">No notes yet</p>
          <button onClick={createNote}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity">
            <Plus className="w-3.5 h-3.5" /> Create Note
          </button>
        </div>
      </div>
    );
  }

  if (!activeNote) {
    const last = notes[notes.length - 1];
    if (last) setActiveId(last.id);
    return null;
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {editorContent(false)}
      </div>

      {fullscreen && createPortal(
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 md:p-8"
          onClick={e => { if (e.target === e.currentTarget) setFullscreen(false); }}>
          <div className="w-full max-w-4xl max-h-full flex flex-col bg-slate-900 rounded-2xl border border-white/[0.06] p-4 md:p-6 overflow-hidden">
            {editorContent(true)}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
