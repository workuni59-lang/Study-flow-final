import { useState, useEffect, useRef, useCallback } from 'react';
import type { PetAnimationName } from '../config/pets';
import type { PetEventType, ReactionEvent } from '../lib/gamification';
import type { PetMood, ReactionPreset } from '../lib/petReactions';
import type { ParticleConfig } from '../lib/petAnimations';
import { selectReaction, trackConsecutiveTask, getConsecutiveTasks } from '../lib/petReactions';
import { sounds } from '../lib/sounds';

export interface ReactionState {
  anim: PetAnimationName;
  preset: ReactionPreset | null;
  particles: ParticleConfig | null;
  mood: PetMood;
  isReacting: boolean;
  textPopup: { text: string; emoji?: string } | null;
}

interface UsePetReactionsOptions {
  isDormant: boolean;
  onFeedTrigger: number;
  defaultMood?: PetMood;
}

export function usePetReactions({ isDormant, onFeedTrigger, defaultMood = 'neutral' }: UsePetReactionsOptions) {
  const [state, setState] = useState<ReactionState>({
    anim: isDormant ? 'sleep' : 'idle',
    preset: null,
    particles: null,
    mood: defaultMood,
    isReacting: false,
    textPopup: null,
  });

  const prevEventId = useRef(0);
  const prevFeed = useRef(onFeedTrigger);
  const reactionTimer = useRef<ReturnType<typeof setTimeout>>();
  const textTimer = useRef<ReturnType<typeof setTimeout>>();
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (reactionTimer.current) clearTimeout(reactionTimer.current);
      if (textTimer.current) clearTimeout(textTimer.current);
    };
  }, []);

  const clearReaction = useCallback(() => {
    if (!mountedRef.current) return;
    setState(prev => ({
      ...prev,
      anim: isDormant ? 'sleep' : 'idle',
      preset: null,
      particles: null,
      isReacting: false,
      mood: prev.mood === 'excited' ? 'happy' : prev.mood,
    }));
  }, [isDormant]);

  const showText = useCallback((text: string, emoji?: string, duration = 1500) => {
    setState(prev => ({ ...prev, textPopup: { text, emoji } }));
    if (textTimer.current) clearTimeout(textTimer.current);
    textTimer.current = setTimeout(() => {
      if (mountedRef.current) setState(prev => ({ ...prev, textPopup: null }));
    }, duration);
  }, []);

  const fireReaction = useCallback((preset: ReactionPreset, eventType?: PetEventType) => {
    if (!mountedRef.current) return;

    const spriteAnim: PetAnimationName = preset.spriteAnim as PetAnimationName || 'happy';

    setState(prev => ({
      ...prev,
      anim: spriteAnim,
      preset,
      particles: preset.particles ?? null,
      isReacting: true,
      mood: preset.moodShift ?? prev.mood,
    }));

    if (preset.sound && sounds[preset.sound]) {
      (sounds[preset.sound] as () => void)();
    }

    if (reactionTimer.current) clearTimeout(reactionTimer.current);
    reactionTimer.current = setTimeout(() => {
      if (mountedRef.current) clearReaction();
    }, preset.duration);
  }, [clearReaction]);

  const handleEvent = useCallback((event: ReactionEvent | null) => {
    if (!event || event.id === prevEventId.current) return;
    prevEventId.current = event.id;

    if (isDormant) return;

    const consecutive = event.type === 'task_done'
      ? trackConsecutiveTask()
      : getConsecutiveTasks();

    const preset = selectReaction(event, consecutive);
    if (!preset) return;

    fireReaction(preset, event.type);

    if (event.type === 'task_done') {
      if (consecutive >= 5) showText('On Fire!', '🔥');
      else if (consecutive >= 3) showText('Keep Going!', '💪');
      else showText('Nice!', '✨');
    } else if (event.type === 'focus_done') {
      showText('Focused!', '🧠');
    } else if (event.type === 'level_up') {
      showText('Level Up!', '⬆️', 2000);
    } else if (event.type === 'achievement_unlocked') {
      showText('Achievement!', '🏆', 2000);
    } else if (event.type === 'streak_lost') {
      showText('Nooo...', '😢');
    } else if (event.type === 'streak_milestone') {
      showText('Streak!', '🔥', 2000);
    }
  }, [isDormant, fireReaction, showText]);

  // Handle feed trigger
  useEffect(() => {
    if (onFeedTrigger !== prevFeed.current) {
      prevFeed.current = onFeedTrigger;
      if (!isDormant) {
        setState(prev => ({
          ...prev,
          anim: 'feed',
          isReacting: true,
        }));
        sounds.feed();
        if (reactionTimer.current) clearTimeout(reactionTimer.current);
        reactionTimer.current = setTimeout(() => {
          if (mountedRef.current) clearReaction();
        }, 500);
      }
    }
  }, [onFeedTrigger, isDormant, clearReaction]);

  // Handle dormant state
  useEffect(() => {
    if (isDormant && state.anim !== 'sleep') {
      setState(prev => ({ ...prev, anim: 'sleep', mood: 'dormant' }));
    }
  }, [isDormant, state.anim]);

  const resetToIdle = useCallback(() => {
    if (mountedRef.current) {
      setState(prev => ({
        ...prev,
        anim: isDormant ? 'sleep' : 'idle',
        isReacting: false,
      }));
    }
  }, [isDormant]);

  return {
    ...state,
    handleEvent,
    resetToIdle,
    fireReaction,
    clearReaction,
  };
}
