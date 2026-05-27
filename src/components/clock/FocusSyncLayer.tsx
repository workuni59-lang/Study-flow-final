import { motion, AnimatePresence } from 'motion/react';
import type { ClockFocusState } from './types';

interface FocusSyncLayerProps {
  focusState: ClockFocusState | null;
  accentColor: string;
  glowIntensity: number;
}

export default function FocusSyncLayer({ focusState, accentColor, glowIntensity }: FocusSyncLayerProps) {
  if (!focusState || !focusState.isActive) return null;

  const progress = focusState.totalTime > 0
    ? (focusState.totalTime - focusState.timeLeft) / focusState.totalTime
    : 0;

  const circumference = 2 * Math.PI * 42;
  const offset = circumference * (1 - Math.min(progress, 1));
  const ringColor = focusState.mode === 'focus' ? accentColor : '#34d399';

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
      <AnimatePresence>
        {focusState.isActive && (
          <motion.svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke={`${ringColor}11`}
              strokeWidth="2"
            />
            <motion.circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke={ringColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              initial={false}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: 'linear' }}
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: '50% 50%',
                filter: glowIntensity > 0 ? `drop-shadow(0 0 ${glowIntensity * 0.15}px ${ringColor}66)` : undefined,
              }}
            />
            <circle
              cx="50" cy="50" r="44"
              fill="none"
              stroke={`${ringColor}08`}
              strokeWidth="0.5"
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  );
}
