import { useEffect, useRef, useState } from 'react';
import { useReduceMotion } from '../../hooks/useReduceMotion';

export const ScrollProgress = () => {
  const [scroll, setScroll] = useState(0);
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReduceMotion();
  const ticking = useRef(false);

  useEffect(() => {
    if (reduceMotion) return;

    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const doc = document.documentElement;
          const win = doc.scrollTop || document.body.scrollTop || 0;
          const height = doc.scrollHeight - doc.clientHeight;
          const pct = height > 0 ? Math.min((win / height) * 100, 100) : 0;
          setScroll(pct);
          setVisible(win > 50);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div
      className="scroll-progress"
      style={{
        width: `${scroll}%`,
        opacity: visible ? 1 : 0,
      }}
    />
  );
};
