import { useMemo } from 'react';
import type { MoodTier } from './useIdleLife';

interface MoodInput {
  isDormant: boolean;
  hunger: number;
  health: string;
  isReacting: boolean;
  anim: string;
}

interface MoodResult {
  mood: MoodTier;
  energy: number;
  speedMultiplier: number;
  intensityMultiplier: number;
  idleFrequency: number;
}

export function usePetMood({ isDormant, hunger, health, isReacting, anim }: MoodInput): MoodResult {
  return useMemo(() => {
    if (isDormant) {
      return {
        mood: 'tired',
        energy: 0.1,
        speedMultiplier: 0.5,
        intensityMultiplier: 0.3,
        idleFrequency: 0.3,
      };
    }

    const isExcited = isReacting && ['happy_jump', 'celebration', 'excited_spin', 'level_up_celebrate'].includes(anim);
    if (isExcited) {
      return {
        mood: 'excited',
        energy: 1.0,
        speedMultiplier: 1.3,
        intensityMultiplier: 1.4,
        idleFrequency: 0.9,
      };
    }

    const isHappy = hunger > 60 && health === 'happy';
    if (isHappy) {
      return {
        mood: 'happy',
        energy: 0.75,
        speedMultiplier: 1.0,
        intensityMultiplier: 1.1,
        idleFrequency: 0.8,
      };
    }

    const isTired = hunger < 20 || health === 'weak' || health === 'dormant';
    if (isTired) {
      return {
        mood: 'tired',
        energy: 0.25,
        speedMultiplier: 0.7,
        intensityMultiplier: 0.5,
        idleFrequency: 0.4,
      };
    }

    if (hunger < 40) {
      return {
        mood: 'neutral',
        energy: 0.5,
        speedMultiplier: 0.85,
        intensityMultiplier: 0.8,
        idleFrequency: 0.6,
      };
    }

    return {
      mood: 'neutral',
      energy: 0.6,
      speedMultiplier: 1.0,
      intensityMultiplier: 1.0,
      idleFrequency: 0.7,
    };
  }, [isDormant, hunger, health, isReacting, anim]);
}
