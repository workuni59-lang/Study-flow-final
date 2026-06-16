import type { PetSpecies } from './types';

export const PET_SPECIES: PetSpecies[] = [
  {
    id: 'ember',
    name: 'Ember',
    description: 'A warm fire spirit fueled by your focus sessions.',
    vibe: 'Warm, steady',
    idleMotion: 'float',
    passiveBonus: '+5% focus session XP',
    isPremium: false,
    defaultColors: {
      body: '#fbbf24',
      accent: '#f97316',
      eyes: '#fff',
      glow: '#fbbf24'
    },
    scale: 1
  },
  {
    id: 'lumina',
    name: 'Lumina',
    description: 'A crystal fox that radiates calm and wisdom.',
    vibe: 'Curious, playful',
    idleMotion: 'bounce',
    passiveBonus: '+2% task completion gold',
    isPremium: true,
    defaultColors: {
      body: '#e879f9',
      accent: '#6366f1',
      eyes: '#fff',
      glow: '#e879f9'
    },
    scale: 1.2
  },
  {
    id: 'nimbus',
    name: 'Nimbus',
    description: 'A cloud cat that drifts through your study sessions.',
    vibe: 'Sleepy, calm',
    idleMotion: 'sway',
    passiveBonus: '+5 min default focus duration',
    isPremium: true,
    defaultColors: {
      body: '#67e8f9',
      accent: '#06b6d4',
      eyes: '#fff',
      glow: '#67e8f9'
    },
    scale: 1.1
  },
  {
    id: 'pixie',
    name: 'Pixie',
    description: 'A floating star spirit that glows brighter with every focus session.',
    vibe: 'Energetic, sparkly',
    idleMotion: 'float',
    passiveBonus: '+10% streak bonus XP',
    isPremium: true,
    defaultColors: {
      body: '#a5b4fc',
      accent: '#6366f1',
      eyes: '#fff',
      glow: '#a5b4fc'
    },
    scale: 1
  }
];

export const getSpeciesById = (id: string) => PET_SPECIES.find(s => s.id === id) || PET_SPECIES[0];
