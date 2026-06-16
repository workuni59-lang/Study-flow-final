import type { PetSkin } from './types';
import { PET_SPECIES } from './species';

export const PET_SKINS: PetSkin[] = [
  // --- Base Skins ---
  ...PET_SPECIES.map(species => ({
    id: `${species.id}_base`,
    name: 'Original',
    speciesId: species.id,
    rarity: 'common' as const,
    colors: species.defaultColors,
    unlock: { type: 'default' as const }
  })),

  // --- Ember Skins ---
  {
    id: 'ember_frost',
    name: 'Frostbite',
    speciesId: 'ember',
    rarity: 'rare',
    colors: {
      body: '#60a5fa',
      accent: '#3b82f6',
      eyes: '#fff',
      glow: '#60a5fa'
    },
    unlock: { type: 'level', value: 5 }
  },
  {
    id: 'ember_void',
    name: 'Void',
    speciesId: 'ember',
    rarity: 'epic',
    colors: {
      body: '#1e1b4b',
      accent: '#6366f1',
      eyes: '#818cf8',
      glow: '#4338ca'
    },
    unlock: { type: 'premium' }
  },
  {
    id: 'ember_gold',
    name: 'Goldenfire',
    speciesId: 'ember',
    rarity: 'legendary',
    colors: {
      body: '#fde047',
      accent: '#eab308',
      eyes: '#fff',
      glow: '#fde047'
    },
    unlock: { type: 'gold', value: 5000 }
  },

  // --- Lumina Skins ---
  {
    id: 'lumina_midnight',
    name: 'Midnight',
    speciesId: 'lumina',
    rarity: 'rare',
    colors: {
      body: '#1e293b',
      accent: '#94a3b8',
      eyes: '#f1f5f9',
      glow: '#334155'
    },
    unlock: { type: 'premium' }
  },

  // --- Nimbus Skins ---
  {
    id: 'nimbus_storm',
    name: 'Stormy',
    speciesId: 'nimbus',
    rarity: 'rare',
    colors: {
      body: '#475569',
      accent: '#0f172a',
      eyes: '#fff',
      glow: '#94a3b8'
    },
    unlock: { type: 'level', value: 3 }
  },

  // --- Pixie Skins ---
  {
    id: 'pixie_nebula',
    name: 'Nebula',
    speciesId: 'pixie',
    rarity: 'epic',
    colors: {
      body: '#701a75',
      accent: '#f472b6',
      eyes: '#fff',
      glow: '#d946ef'
    },
    unlock: { type: 'premium' }
  }
];

export const getSkinById = (id: string) => PET_SKINS.find(s => s.id === id);
export const getSkinsForSpecies = (speciesId: string) => PET_SKINS.filter(s => s.speciesId === speciesId);
