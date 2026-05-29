import { useState, useEffect, useRef } from 'react';
import { storage } from '../../services/storage';
import { Save } from 'lucide-react';

export const NotepadPanel = () => {
  const [text, setText] = useState(() => storage.getNotepad() || '');
  const [saved, setSaved] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  const handleChange = (value: string) => {
    setText(value);
    setSaved(false);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      storage.saveNotepad(value);
      setSaved(true);
    }, 600);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col h-full">
      <textarea
        value={text}
        onChange={e => handleChange(e.target.value)}
        placeholder="Write your thoughts..."
        className="flex-1 w-full min-h-[200px] resize-none bg-transparent text-sm dark:text-white/80 placeholder-white/20 outline-none leading-relaxed"
      />
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] mt-3">
        <div className="flex items-center gap-2">
          {saved ? (
            <Save className="w-3 h-3 text-emerald-400" />
          ) : (
            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          )}
          <span className="text-[8px] text-white/30 font-medium">
            {saved ? 'Saved' : 'Saving...'}
          </span>
        </div>
        <span className="text-[8px] text-white/20">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </span>
      </div>
    </div>
  );
};