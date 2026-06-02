import { useState, useCallback, useRef, useEffect } from 'react';

export type AnimationPhase = 'idle' | 'reacting' | 'eating' | 'petting' | 'charging' | 'celebrating' | 'evolving' | 'sleeping';

export interface AnimationCommand {
  key: string;
  phase: AnimationPhase;
  duration: number;
  priority: number;
  onComplete?: () => void;
}

interface QueuedAnimation extends AnimationCommand {
  id: number;
}

export function useAnimationController() {
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [currentKey, setCurrentKey] = useState<string>('idle');
  const queueRef = useRef<QueuedAnimation[]>([]);
  const activeRef = useRef<QueuedAnimation | null>(null);
  const idRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const processQueue = useCallback(() => {
    if (queueRef.current.length === 0) {
      activeRef.current = null;
      setPhase('idle');
      setCurrentKey('idle');
      return;
    }

    queueRef.current.sort((a, b) => b.priority - a.priority);
    const next = queueRef.current.shift()!;
    activeRef.current = next;
    setPhase(next.phase);
    setCurrentKey(next.key);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      next.onComplete?.();
      processQueue();
    }, next.duration);
  }, []);

  const enqueue = useCallback((cmd: AnimationCommand) => {
    idRef.current++;
    const entry: QueuedAnimation = { ...cmd, id: idRef.current };

    if (!activeRef.current) {
      activeRef.current = entry;
      setPhase(entry.phase);
      setCurrentKey(entry.key);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        entry.onComplete?.();
        processQueue();
      }, entry.duration);
    } else if (entry.priority > activeRef.current.priority) {
      if (timerRef.current) clearTimeout(timerRef.current);
      activeRef.current.onComplete?.();
      queueRef.current.unshift(activeRef.current);
      activeRef.current = entry;
      setPhase(entry.phase);
      setCurrentKey(entry.key);
      timerRef.current = setTimeout(() => {
        entry.onComplete?.();
        processQueue();
      }, entry.duration);
    } else {
      queueRef.current.push(entry);
    }
  }, [processQueue]);

  const clearQueue = useCallback(() => {
    queueRef.current = [];
    if (timerRef.current) clearTimeout(timerRef.current);
    activeRef.current = null;
    setPhase('idle');
    setCurrentKey('idle');
  }, []);

  const isAnimating = phase !== 'idle' || queueRef.current.length > 0;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { phase, currentKey, enqueue, clearQueue, isAnimating, setPhase, setCurrentKey };
}
