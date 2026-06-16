import { useState, useCallback } from 'react';
import { useSpring } from 'motion/react';
import { storage } from '../../services/storage';

export function usePetDrag(initialX: number, initialY: number) {
  const [isDragging, setIsDragging] = useState(false);
  
  const springX = useSpring(initialX, { stiffness: 150, damping: 25 });
  const springY = useSpring(initialY, { stiffness: 150, damping: 25 });

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback((_: any, info: any) => {
    setIsDragging(false);
    
    // Calculate new position based on offset
    let newX = springX.get() + info.offset.x;
    let newY = springY.get() + info.offset.y;
    
    // Viewport clamping (assuming pet size ~120px)
    const petSize = 120;
    const padding = 20;
    
    const minX = padding;
    const maxX = window.innerWidth - petSize - padding;
    const minY = padding;
    const maxY = window.innerHeight - petSize - padding;
    
    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));
    
    // Update springs
    springX.set(newX);
    springY.set(newY);
    
    storage.savePetPosition({ x: newX, y: newY });
  }, [springX, springY]);

  return {
    isDragging,
    springX,
    springY,
    onDragStart,
    onDragEnd
  };
}
