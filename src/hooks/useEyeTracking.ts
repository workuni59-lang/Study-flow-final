import { useRef, useCallback, useEffect } from 'react';

export function useEyeTracking() {
  const petRef = useRef<HTMLDivElement | null>(null);
  const eyeOffsetRef = useRef({ dx: 0, dy: 0 });

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const pet = petRef.current;
      if (!pet) return;
      const rect = pet.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = e.clientX - cx;
      let dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 10) { dx = 0; dy = 0; }
      else {
        const normX = dx / dist;
        const normY = dy / dist;
        const clamp = Math.min(dist / 100, 1);
        dx = normX * 3 * clamp;
        dy = normY * 3 * clamp;
      }
      eyeOffsetRef.current = { dx, dy };
    };
    document.addEventListener('pointermove', handlePointerMove);
    return () => document.removeEventListener('pointermove', handlePointerMove);
  }, []);

  const getEyeOffset = useCallback(() => eyeOffsetRef.current, []);

  return { petRef, getEyeOffset };
}
