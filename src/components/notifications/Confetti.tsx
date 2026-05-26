import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Particle {
  id: number;
  x: string;
  y: string;
  color: string;
  size: number;
  rotation: number;
  isCircle: boolean;
}

export const Confetti = ({ active }: { active: boolean }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const colors = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: 100 }).map((_, i) => ({
        id: Date.now() + i,
        x: `${Math.random() * 100}vw`,
        y: `${Math.random() * 100}vh`,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 12 + 6,
        rotation: Math.random() * 360,
        isCircle: Math.random() > 0.5
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [active]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[300] overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ 
              x: "50vw", 
              y: "110vh", // Burst from bottom for better feel
              scale: 0, 
              rotate: 0,
              opacity: 1 
            }}
            animate={{ 
              x: p.x,
              y: p.y,
              scale: [0, 1.5, 0.5],
              rotate: p.rotation + 720,
              opacity: [1, 1, 0]
            }}
            transition={{ 
              duration: 2 + Math.random() * 1.5, 
              ease: "easeOut" 
            }}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.isCircle ? '50%' : '2px',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
