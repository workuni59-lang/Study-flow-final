import React from 'react';
import { PetMood, PetPerformanceTier } from '../../lib/pets/types';
import { useBlink } from '../../hooks/pets/useBlink';
import { useEyeTracking } from '../../hooks/pets/useEyeTracking';

interface PetEyesProps {
  mood: PetMood;
  tier: PetPerformanceTier;
  eyeColor: string;
  pupilColor?: string;
  position?: { x: number; y: number }; // Base position in SVG coordinates
}

export const PetEyes = ({ mood, tier, eyeColor, pupilColor = '#1e1b4b', position = { x: 40, y: 50 } }: PetEyesProps) => {
  const isBlinking = useBlink();
  const trackingOffset = useEyeTracking(tier);
  
  const isDormant = mood === 'asleep';
  const isTired = mood === 'tired';
  
  // Combine base position with tracking
  const leftEye = { x: position.x - 6 + trackingOffset.x, y: position.y + trackingOffset.y };
  const rightEye = { x: position.x + 6 + trackingOffset.x, y: position.y + trackingOffset.y };

  if (isDormant) {
    // Closed eyes
    return (
      <g stroke={eyeColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
        <line x1={leftEye.x - 2} y1={leftEye.y} x2={leftEye.x + 2} y2={leftEye.y} />
        <line x1={rightEye.x - 2} y1={rightEye.y} x2={rightEye.x + 2} y2={rightEye.y} />
      </g>
    );
  }

  if (isBlinking) {
    return (
      <g stroke={pupilColor} strokeWidth="1.5" strokeLinecap="round">
        <line x1={leftEye.x - 2} y1={leftEye.y} x2={leftEye.x + 2} y2={leftEye.y} />
        <line x1={rightEye.x - 2} y1={rightEye.y} x2={rightEye.x + 2} y2={rightEye.y} />
      </g>
    );
  }

  return (
    <g>
      {/* Eye whites or main color */}
      <circle cx={leftEye.x} cy={leftEye.y} r="2.5" fill={isTired ? '#888' : eyeColor} />
      <circle cx={rightEye.x} cy={rightEye.y} r="2.5" fill={isTired ? '#888' : eyeColor} />
      
      {/* Pupils (offset more for parallax effect) */}
      <circle cx={leftEye.x + trackingOffset.x * 0.5} cy={leftEye.y + trackingOffset.y * 0.5 - 0.5} r="1.2" fill={pupilColor} />
      <circle cx={rightEye.x + trackingOffset.x * 0.5} cy={rightEye.y + trackingOffset.y * 0.5 - 0.5} r="1.2" fill={pupilColor} />
      
      {/* Highlights for 'excited' mood */}
      {mood === 'excited' && (
        <>
          <circle cx={leftEye.x - 1} cy={leftEye.y - 1} r="0.5" fill="#fff" />
          <circle cx={rightEye.x - 1} cy={rightEye.y - 1} r="0.5" fill="#fff" />
        </>
      )}
    </g>
  );
};
