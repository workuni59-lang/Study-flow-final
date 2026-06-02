import { useState, useEffect, useRef, useCallback } from 'react';

export type IdleAction =
  | 'blink'
  | 'look_left'
  | 'look_right'
  | 'stretch'
  | 'scratch'
  | 'yawn'
  | 'sleepy_nod'
  | 'curious_tilt'
  | 'ear_twitch'
  | 'tail_swish'
  | 'sniff'
  | 'sigh';

export type MoodTier = 'happy' | 'neutral' | 'tired' | 'excited';

interface WeightedAction {
  action: IdleAction;
  weight: number;
  duration: number;
}

const getWeightedPool = (mood: MoodTier): WeightedAction[] => {
  const base: WeightedAction[] = [
    { action: 'blink',       weight: 30, duration: 200 },
    { action: 'look_left',   weight: 15, duration: 1200 },
    { action: 'look_right',  weight: 15, duration: 1200 },
    { action: 'stretch',     weight: 8,  duration: 1500 },
    { action: 'scratch',     weight: 8,  duration: 1400 },
    { action: 'yawn',        weight: 6,  duration: 2200 },
    { action: 'sleepy_nod',  weight: 4,  duration: 1800 },
    { action: 'curious_tilt',weight: 10, duration: 1000 },
    { action: 'ear_twitch',  weight: 12, duration: 300 },
    { action: 'tail_swish',  weight: 10, duration: 800 },
    { action: 'sniff',       weight: 8,  duration: 900 },
    { action: 'sigh',        weight: 5,  duration: 1200 },
  ];

  switch (mood) {
    case 'happy':
      base.forEach(a => {
        if (['blink', 'curious_tilt', 'tail_swish'].includes(a.action)) a.weight *= 1.5;
        if (['sleepy_nod', 'yawn', 'sigh'].includes(a.action)) a.weight *= 0.4;
      });
      break;
    case 'excited':
      base.forEach(a => {
        if (['blink', 'tail_swish', 'sniff', 'curious_tilt'].includes(a.action)) a.weight *= 2;
        if (['sleepy_nod', 'yawn', 'sigh', 'stretch'].includes(a.action)) a.weight *= 0.2;
      });
      break;
    case 'tired':
      base.forEach(a => {
        if (['blink', 'yawn', 'sleepy_nod', 'sigh', 'stretch'].includes(a.action)) a.weight *= 2;
        if (['tail_swish', 'sniff', 'curious_tilt'].includes(a.action)) a.weight *= 0.4;
      });
      break;
  }
  return base;
};

const selectWeighted = (pool: WeightedAction[]): WeightedAction => {
  const total = pool.reduce((s, a) => s + a.weight, 0);
  let r = Math.random() * total;
  for (const entry of pool) {
    r -= entry.weight;
    if (r <= 0) return entry;
  }
  return pool[0];
};

interface IdleLifeOptions {
  mood: MoodTier;
  isDormant: boolean;
  isReacting: boolean;
  isDragging: boolean;
}

interface IdleLifeResult {
  currentAction: IdleAction | null;
  isIdleAnimating: boolean;
}

export function useIdleLife({ mood, isDormant, isReacting, isDragging }: IdleLifeOptions): IdleLifeResult {
  const [currentAction, setCurrentAction] = useState<IdleAction | null>(null);
  const [isIdleAnimating, setIsIdleAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionEndRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const scheduleNext = useCallback(() => {
    if (!mountedRef.current) return;
    if (isDormant || isReacting || isDragging) {
      timerRef.current = setTimeout(scheduleNext, 2000);
      return;
    }

    const pool = getWeightedPool(mood);
    const selected = selectWeighted(pool);
    const preDelay = 800 + Math.random() * 2000;

    timerRef.current = setTimeout(() => {
      if (!mountedRef.current || isReacting || isDragging) {
        scheduleNext();
        return;
      }
      setCurrentAction(selected.action);
      setIsIdleAnimating(true);

      if (actionEndRef.current) clearTimeout(actionEndRef.current);
      actionEndRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setCurrentAction(null);
          setIsIdleAnimating(false);
          scheduleNext();
        }
      }, selected.duration);
    }, preDelay);
  }, [mood, isDormant, isReacting, isDragging]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (actionEndRef.current) clearTimeout(actionEndRef.current);
    setCurrentAction(null);
    setIsIdleAnimating(false);
    scheduleNext();
  }, [scheduleNext]);

  return { currentAction, isIdleAnimating };
}
