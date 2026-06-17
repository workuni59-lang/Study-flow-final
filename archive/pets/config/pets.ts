export type PetAnimationName = 'idle' | 'walk' | 'feed' | 'happy' | 'sleep';

export interface SpriteAnimationConfig {
  src: string;
  frameWidth: number;
  frameHeight: number;
  cols: number;
  rows: number;
  startRow?: number;
  fps: number;
  loop: boolean;
}

export type AnimationMap = Record<PetAnimationName, SpriteAnimationConfig>;

export const PET_ANIMATIONS: Record<string, Partial<AnimationMap>> = {

  pixie: {},

  ember: {},
  lumina: {},
  nimbus: {},
};
