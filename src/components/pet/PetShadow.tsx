import React from 'react';
import { motion } from 'motion/react';

interface PetShadowProps {
  isDormant: boolean;
  isInteracting: boolean;
}

export const PetShadow = ({ isDormant, isInteracting }: PetShadowProps) => {
  return (
    <motion.div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-black/20 dark:bg-black/40"
      animate={{
        width: isInteracting ? 48 : 32,
        height: isInteracting ? 10 : 7,
        opacity: isDormant ? 0.12 : isInteracting ? 0.35 : 0.2,
      }}
      transition={{ duration: 0.2 }}
    />
  );
};
