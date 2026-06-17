import { useState, useEffect, type ReactNode, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useNavigationContext } from '../../hooks/useNavigationContext';

interface FloatingPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: number;
}

export const FloatingPanel = ({ open, onClose, title, children, width = 320 }: FloatingPanelProps) => {
  const { mode } = useNavigationContext();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 767px)').matches);
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (isMobile) {
    return (
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40"
              onClick={onClose}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  onClose();
                }
              }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] bg-[#0f0f1f] border-t border-white/[0.08] max-h-[85vh] flex flex-col shadow-2xl"
            >
              <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 rounded-full bg-white/[0.15]" />
              </div>
              <div className="flex items-center justify-between px-6 py-2">
                <span className="text-base font-bold text-white/95">{title}</span>
                <button onClick={onClose}
                  className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center text-white/50 hover:text-white transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-6 pb-10 overflow-y-auto no-scrollbar">
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  const isFocus = mode === 'focus';

  const cardStyle: CSSProperties = isFocus
    ? { bottom: '7rem', left: '1.5rem', width: `${width}px` }
    : { bottom: '5rem', left: '1.5rem', width: `${width}px` };

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-[45]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              ...cardStyle,
              position: 'fixed',
              zIndex: 50,
              transformOrigin: 'bottom center',
            }}
            className="max-h-[70vh] overflow-y-auto rounded-xl bg-[#0f0f1f]/95 backdrop-blur-2xl border border-white/[0.06] shadow-2xl cursor-grab"
            drag
            dragMomentum={false}
            whileTap={{ cursor: 'grabbing' }}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h3 className="text-sm font-semibold text-white/90">{title}</h3>
              <button onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
