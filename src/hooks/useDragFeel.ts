import { useRef, useCallback } from 'react';
import { useMotionValue, useSpring } from 'motion/react';

export function useDragFeel(initialX: number, initialY: number) {
  const x = useMotionValue(initialX);
  const y = useMotionValue(initialY);
  const springX = useSpring(x, { damping: 18, stiffness: 180, mass: 0.8 });
  const springY = useSpring(y, { damping: 18, stiffness: 180, mass: 0.8 });
  const scaleX = useMotionValue(1);
  const scaleY = useMotionValue(1);
  const rotate = useMotionValue(0);

  const isDragging = useRef(false);

  const handleDragStart = useCallback(() => {
    isDragging.current = true;
    scaleX.set(1.06);
    scaleY.set(0.92);
  }, [scaleX, scaleY]);

  const handleDrag = useCallback((_: any, info: any) => {
    const vx = info.velocity.x;
    const vy = info.velocity.y;
    const sx = 1 + Math.abs(vx) * 0.0003;
    const sy = 1 - Math.abs(vy) * 0.00015;
    scaleX.set(Math.max(0.7, Math.min(1.3, sx)));
    scaleY.set(Math.max(0.7, Math.min(1.3, sy)));
    rotate.set(Math.max(-8, Math.min(8, (vx + vy) * 0.00015)));
  }, [scaleX, scaleY, rotate]);

  const handleDragEnd = useCallback((_: any, info: any) => {
    isDragging.current = false;
    const finalX = x.get() + info.velocity.x * 0.05;
    const finalY = y.get() + info.velocity.y * 0.05;
    x.set(finalX);
    y.set(finalY);
    scaleX.set(1);
    scaleY.set(1);
    rotate.set(0);
  }, [x, y, scaleX, scaleY, rotate]);

  return {
    x, y, springX, springY,
    scaleX, scaleY, rotate, isDragging,
    handleDragStart, handleDrag, handleDragEnd,
  };
}
