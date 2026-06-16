import { useState, useEffect, useRef } from 'react';
import { PetPerformanceTier } from '../../lib/pets/types';

export function useEyeTracking(tier: PetPerformanceTier) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isCuriousRef = useRef(false);

  useEffect(() => {
    if (tier === 'low') return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const cycleCuriosity = () => {
      // 30% chance to look at mouse, otherwise look straight or wander
      const roll = Math.random();
      
      if (roll < 0.3) {
        isCuriousRef.current = true;
      } else {
        isCuriousRef.current = false;
        setOffset({ x: 0, y: 0 });
      }

      timeoutId = setTimeout(cycleCuriosity, 2000 + Math.random() * 6000);
    };

    cycleCuriosity();

    const handleMouseMove = (e: MouseEvent) => {
      if (!isCuriousRef.current) return;
      
      const { clientX, clientY } = e;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const dx = (clientX / windowWidth) * 2 - 1;
      const dy = (clientY / windowHeight) * 2 - 1;

      // Subtle range (max 2px)
      const range = 2;
      
      setOffset({ 
        x: dx * range, 
        y: dy * range 
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, [tier]);

  return offset;
}
