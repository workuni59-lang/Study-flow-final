import React from 'react';
import { motion } from 'motion/react';
import { PetMood } from '../../lib/pets/types';

interface PetGlowProps {
  mood: PetMood;
  glowColor: string;
}

export const PetGlow = ({ mood, glowColor }: PetGlowProps) => {
  const isDormant = mood === 'asleep';
  
  // Opacity linked to mood
  const opacity = mood === 'excited' ? 0.3 : isDormant ? 0.05 : 0.15;
  const scale = mood === 'excited' ? [1, 1.2, 1] : isDormant ? 0.8 : [1, 1.05, 1];

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none rounded-full"
      animate={{ 
        opacity,
        scale
      }}
      transition={{ 
        duration: mood === 'excited' ? 1.5 : 3, 
        repeat: Infinity, 
        ease: 'easeInOut' 
      }}
      style={{
        background: `radial-gradient(circle, ${glowColor}55 0%, transparent 70%)`,
        filter: 'blur(12px)',
      }}
    />
  );
};
