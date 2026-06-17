import React, { memo } from 'react';
import { motion } from 'motion/react';
import { usePet } from '../../context/PetContext';
import { getSpeciesById } from '../../lib/pets/species';
import { getSkinById } from '../../lib/pets/skins';
import { PetShadow } from './PetShadow';
import { PetGlow } from './PetGlow';
import { PetBody } from './PetBody';
import { usePetDrag } from '../../hooks/pets/usePetDrag';

interface PetEngineProps {
  onOpenPanel: () => void;
  size?: number;
}

export const PetEngine = memo(({ onOpenPanel, size = 120 }: PetEngineProps) => {
  const { petState, performanceTier, interact } = usePet();
  
  const species = getSpeciesById(petState.speciesId);
  const skin = getSkinById(petState.skinId || `${petState.speciesId}_base`);
  const colors = skin?.colors || species.defaultColors;
  const mood = petState.mood;
  const isDormant = mood === 'asleep';

  // Position
  const initX = petState.position?.x ?? 24;
  const initY = petState.position?.y ?? (typeof window !== 'undefined' ? window.innerHeight - 200 : 600);
  
  const { isDragging, springX, springY, onDragStart, onDragEnd } = usePetDrag(initX, initY);

  const handleTap = () => {
    if (isDragging) return;
    interact();
    onOpenPanel();
  };

  return (
    <motion.div
      className="fixed select-none touch-none z-50 cursor-pointer"
      style={{
        width: size,
        height: size,
        x: springX,
        y: springY,
      }}
      drag
      dragMomentum={false}
      dragConstraints={{
        left: 20,
        right: typeof window !== 'undefined' ? window.innerWidth - size - 20 : 1000,
        top: 20,
        bottom: typeof window !== 'undefined' ? window.innerHeight - size - 20 : 1000,
      }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onTap={handleTap}
    >
      {/* 1. Shadow Layer */}
      <PetShadow isDormant={isDormant} isInteracting={isDragging} />

      {/* 2. Glow Layer */}
      <PetGlow mood={mood} glowColor={colors.glow} />

      {/* 3. Main Body & Animations */}
      <motion.div
        className="relative w-full h-full"
        animate={
          mood === 'excited' ? {
            y: [0, -20, 0],
            scale: [1, 1.15, 1],
            rotate: [0, 5, -5, 0],
          } : mood === 'asleep' ? {
            scale: [0.95, 0.98, 0.95],
          } : species.idleMotion === 'float' ? {
            y: [0, -10, 0],
            rotate: [0, 2, -2, 0],
          } : species.idleMotion === 'bounce' ? {
            scaleY: [1, 0.9, 1.1, 1],
            y: [0, 5, -5, 0],
          } : species.idleMotion === 'sway' ? {
            rotate: [-3, 3, -3],
            x: [-2, 2, -2],
          } : {}
        }
        transition={{
          duration: mood === 'excited' ? 0.5 : mood === 'asleep' ? 4 : 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <PetBody 
          speciesId={petState.speciesId} 
          mood={mood} 
          tier={performanceTier} 
          colors={colors} 
        />
      </motion.div>

      {/* 4. Name Tag (Optional/Minimal) */}
      {!isDormant && (
        <motion.div 
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 drop-shadow-sm">
            {petState.name}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
});
