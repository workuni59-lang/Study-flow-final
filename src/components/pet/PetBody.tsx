import React from 'react';
import { PetMood, PetPerformanceTier, PetColors } from '../../lib/pets/types';
import { PetEyes } from './PetEyes';

interface PetBodyProps {
  speciesId: string;
  mood: PetMood;
  tier: PetPerformanceTier;
  colors: PetColors;
}

export const PetBody = ({ speciesId, mood, tier, colors }: PetBodyProps) => {
  const isDormant = mood === 'asleep';

  const renderSpecies = () => {
    switch (speciesId) {
      case 'ember':
        return (
          <svg viewBox="0 0 80 100" fill="none" className="w-full h-full drop-shadow-lg">
            <path 
              d="M40 20 C52 34 58 44 58 56 C58 66 50 72 40 72 C30 72 22 66 22 56 C22 44 28 34 40 20Z" 
              fill={colors.body} 
              opacity={isDormant ? 0.3 : 1}
            />
            <path 
              d="M40 32 C45 38 48 44 48 54 C48 60 44 64 40 64 C36 64 32 60 32 54 C32 44 35 38 40 32Z" 
              fill={colors.accent} 
              opacity={isDormant ? 0.1 : 0.4}
            />
            {(mood === 'happy' || mood === 'excited') && (
              <path d="M36 57 L40 60 L44 57" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity={0.6} />
            )}
            {mood === 'neutral' && (
              <line x1="37" y1="58" x2="43" y2="58" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
            )}
            <PetEyes mood={mood} tier={tier} eyeColor={isDormant ? '#666' : '#fff'} pupilColor="#451a03" position={{ x: 40, y: 50 }} />
          </svg>
        );

      case 'lumina':
        return (
          <svg viewBox="0 0 80 100" fill="none" className="w-full h-full drop-shadow-lg">
            <ellipse cx="40" cy="54" rx="16" ry="18" fill={colors.body} opacity={isDormant ? 0.3 : 1} />
            <circle cx="40" cy="34" r="13" fill={colors.body} opacity={isDormant ? 0.3 : 1} />
            <polygon points="28,26 22,14 34,24" fill={colors.accent} opacity={isDormant ? 0.2 : 0.6} />
            <polygon points="52,26 58,14 46,24" fill={colors.accent} opacity={isDormant ? 0.2 : 0.6} />
            {(mood === 'happy' || mood === 'excited') && (
              <ellipse cx="40" cy="40" rx="3" ry="2.2" fill={colors.accent} opacity={0.6} />
            )}
            <PetEyes mood={mood} tier={tier} eyeColor={isDormant ? '#666' : '#fff'} pupilColor="#4a1a5e" position={{ x: 40, y: 34 }} />
          </svg>
        );

      case 'nimbus':
        return (
          <svg viewBox="0 0 80 100" fill="none" className="w-full h-full drop-shadow-lg">
            <g opacity={isDormant ? 0.3 : 1}>
              <ellipse cx="40" cy="48" rx="20" ry="15" fill={colors.body} />
              <circle cx="28" cy="42" r="12" fill={colors.body} />
              <circle cx="52" cy="42" r="12" fill={colors.body} />
              <circle cx="40" cy="36" r="12" fill={colors.body} />
            </g>
            <polygon points="28,30 24,18 34,28" fill={colors.accent} opacity={0.5} />
            <polygon points="52,30 56,18 46,28" fill={colors.accent} opacity={0.5} />
            <PetEyes mood={mood} tier={tier} eyeColor={isDormant ? '#666' : '#fff'} pupilColor="#164e63" position={{ x: 40, y: 44 }} />
          </svg>
        );

      case 'pixie':
        return (
          <svg viewBox="0 0 80 100" fill="none" className="w-full h-full drop-shadow-lg">
            <ellipse cx="40" cy="52" rx="16" ry="19" fill={colors.body} opacity={isDormant ? 0.3 : 1} />
            <path d="M40 22 L42.5 28 L49 28 L44 32 L46 38 L40 34 L34 38 L36 32 L31 28 L37.5 28 Z" fill={colors.accent} opacity={0.7} />
            <PetEyes mood={mood} tier={tier} eyeColor={isDormant ? '#666' : '#fff'} pupilColor="#1e1b4b" position={{ x: 40, y: 47 }} />
          </svg>
        );

      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-full border border-white/10">
            <span className="text-4xl">🐾</span>
          </div>
        );
    }
  };

  return renderSpecies();
};
