import type { PetEventType, ReactionEvent } from './gamification';
import { PARTICLE_BURSTS, type ParticleConfig } from './petAnimations';

/* ─── REACTION INTENSITY & MOOD ──────────────────────────────── */

export type ReactionIntensity = 'subtle' | 'normal' | 'big' | 'epic';

export type PetMood = 'happy' | 'neutral' | 'hungry' | 'tired' | 'excited' | 'dormant';

export interface ReactionPreset {
  animation: string;
  sound?: keyof typeof import('./sounds').sounds;
  particles?: ParticleConfig;
  spriteAnim?: string;
  duration: number;
  intensity: ReactionIntensity;
  moodShift?: PetMood;
  priority: number;
}

/* ─── CONSECUTIVE TASK COUNTER ────────────────────────────────── */

let consecutiveTasks = 0;
let lastTaskTime = 0;

export function trackConsecutiveTask(): number {
  const now = Date.now();
  if (now - lastTaskTime < 120_000) {
    consecutiveTasks++;
  } else {
    consecutiveTasks = 1;
  }
  lastTaskTime = now;
  return consecutiveTasks;
}

export function resetConsecutiveTasks() {
  consecutiveTasks = 0;
}

export function getConsecutiveTasks() {
  return consecutiveTasks;
}

/* ─── EVENT → REACTION MAPPING ───────────────────────────────── */

export const REACTION_MAP: Record<PetEventType, ReactionPreset[]> = {
  task_done: [
    {
      animation: 'happy_jump',
      sound: 'pop',
      particles: PARTICLE_BURSTS.heart_small,
      spriteAnim: 'happy',
      duration: 500,
      intensity: 'normal',
      priority: 1,
    },
  ],

  consecutive_task: [
    {
      animation: 'happy_jump',
      sound: 'chirp',
      particles: PARTICLE_BURSTS.heart_big,
      spriteAnim: 'happy',
      duration: 600,
      intensity: 'normal',
      priority: 2,
    },
  ],

  task_streak: [
    {
      animation: 'excited_spin',
      sound: 'streakChime',
      particles: PARTICLE_BURSTS.star,
      spriteAnim: 'happy',
      duration: 800,
      intensity: 'big',
      moodShift: 'excited',
      priority: 3,
    },
  ],

  focus_done: [
    {
      animation: 'happy_jump',
      sound: 'chime',
      particles: PARTICLE_BURSTS.sparkle,
      spriteAnim: 'happy',
      duration: 500,
      intensity: 'normal',
      priority: 1,
    },
  ],

  level_up: [
    {
      animation: 'celebration',
      sound: 'levelUp',
      particles: PARTICLE_BURSTS.confetti_party,
      spriteAnim: 'happy',
      duration: 1200,
      intensity: 'epic',
      moodShift: 'excited',
      priority: 4,
    },
  ],

  achievement_unlocked: [
    {
      animation: 'celebration',
      sound: 'achievement',
      particles: PARTICLE_BURSTS.trophy,
      spriteAnim: 'happy',
      duration: 1500,
      intensity: 'epic',
      moodShift: 'excited',
      priority: 5,
    },
  ],

  streak_milestone: [
    {
      animation: 'excited_spin',
      sound: 'celebration',
      particles: PARTICLE_BURSTS.celebration,
      spriteAnim: 'happy',
      duration: 1000,
      intensity: 'big',
      moodShift: 'excited',
      priority: 3,
    },
  ],

  streak_lost: [
    {
      animation: 'confused',
      sound: 'mistake',
      particles: PARTICLE_BURSTS.heart_small,
      duration: 600,
      intensity: 'subtle',
      moodShift: 'neutral',
      priority: 2,
    },
  ],

  exam_soon: [
    {
      animation: 'anticipation',
      particles: PARTICLE_BURSTS.fire,
      duration: 400,
      intensity: 'subtle',
      priority: 1,
    },
  ],

  neglect: [
    {
      animation: 'confused',
      sound: 'sad',
      duration: 600,
      intensity: 'subtle',
      priority: 1,
    },
  ],

  mistake: [
    {
      animation: 'confused',
      sound: 'confused',
      duration: 500,
      intensity: 'subtle',
      priority: 2,
    },
  ],
};

/* ─── REACTION SELECTOR ───────────────────────────────────────── */

export interface ResolvedReaction {
  preset: ReactionPreset;
  event: ReactionEvent;
  priority: number;
  timestamp: number;
}

const reactionQueue: ResolvedReaction[] = [];
let currentReaction: ResolvedReaction | null = null;
let isProcessing = false;

export function selectReaction(event: ReactionEvent, consecutive?: number): ReactionPreset | null {
  const presets = REACTION_MAP[event.type];
  if (!presets || presets.length === 0) return null;

  let preset: ReactionPreset;

  if (event.type === 'task_done' && consecutive && consecutive >= 3) {
    preset = REACTION_MAP.consecutive_task[0];
  } else {
    preset = presets[0];
  }

  if (event.metadata?.achievementRarity === 'Legendary' || event.metadata?.achievementRarity === 'Epic') {
    preset = { ...preset, duration: preset.duration * 1.3 };
  }

  if (event.metadata?.streakCount && event.metadata.streakCount >= 7) {
    const streakPreset = REACTION_MAP.streak_milestone[0];
    const milestoneModifier = Math.min(event.metadata.streakCount / 7, 5);
    preset = {
      ...streakPreset,
      duration: Math.min(streakPreset.duration + milestoneModifier * 100, 2500),
    };
  }

  return preset;
}

export function queueReaction(reaction: ResolvedReaction) {
  reactionQueue.push(reaction);
  reactionQueue.sort((a, b) => b.priority - a.priority);
  processQueue();
}

async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  while (reactionQueue.length > 0) {
    currentReaction = reactionQueue.shift()!;
    await new Promise<void>(resolve => {
      setTimeout(resolve, currentReaction!.preset.duration);
    });
  }

  currentReaction = null;
  isProcessing = false;
}

export { reactionQueue };
