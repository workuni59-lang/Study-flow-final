import { PetState } from './types';

const STORAGE_KEY = 'sf_pet_v2';
const LEGACY_STORAGE_KEY = 'study_flow_pet_state';

export const INITIAL_PET_STATE: PetState = {
  name: 'Ember',
  speciesId: 'ember',
  skinId: 'ember_base',
  mood: 'happy',
  moodExpiresAt: null,
  hunger: 100,
  foodInventory: [
    { foodId: 'star-snack', quantity: 3 },
    { foodId: 'focus-bar', quantity: 1 }
  ],
  level: 1,
  totalXp: 0,
  totalFed: 0,
  totalInteractions: 0,
  daysTogether: 1,
  lastActiveDate: new Date().toISOString(),
  unlockedSpecies: ['ember'],
  unlockedSkins: ['ember_base'],
  position: null,
  firstMetAt: new Date().toISOString(),
  lastFedAt: null,
  lastInteractedAt: null,
};

function migratePetStateV1ToV2(v1State: any): PetState {
  if (!v1State || typeof v1State !== 'object') return INITIAL_PET_STATE;

  return {
    ...INITIAL_PET_STATE,
    name: v1State.name || INITIAL_PET_STATE.name,
    speciesId: 'ember', // Resetting species to default for v2 launch consistency
    skinId: 'ember_base',
    totalFed: typeof v1State.totalFed === 'number' ? v1State.totalFed : INITIAL_PET_STATE.totalFed,
    position: v1State.position || null,
    firstMetAt: v1State.firstMetAt || INITIAL_PET_STATE.firstMetAt,
  };
}

export const loadPetState = (): PetState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // Try migration
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const migrated = migratePetStateV1ToV2(JSON.parse(legacy));
      savePetState(migrated);
      // We don't remove legacy yet to be safe, but we could.
      return migrated;
    }
  } catch (e) {
    console.error('Failed to load pet state:', e);
  }

  return INITIAL_PET_STATE;
};

export const savePetState = (state: PetState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save pet state:', e);
  }
};
