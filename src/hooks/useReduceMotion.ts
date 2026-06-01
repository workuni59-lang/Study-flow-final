import { useState, useEffect } from 'react';

export function useReduceMotion() {
  const [reduceMotion, setReduceMotion] = useState(() =>
    window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReduceMotion(window.innerWidth < 768 || mq.matches);
    window.addEventListener('resize', handler);
    mq.addEventListener('change', handler);
    return () => {
      window.removeEventListener('resize', handler);
      mq.removeEventListener('change', handler);
    };
  }, []);

  return reduceMotion;
}
