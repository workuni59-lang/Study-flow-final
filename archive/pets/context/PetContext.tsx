import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { PetState, PetMood, PetPerformanceTier } from '../lib/pets/types';
import { loadPetState, savePetState, INITIAL_PET_STATE } from '../lib/pets/storage';
import { getSpeciesById } from '../lib/pets/species';
import { getFoodById } from '../lib/pets/food';
import { getSkinById } from '../lib/pets/skins';
import { useStudy } from './StudyContext';

interface PetContextType {
  petState: PetState;
  performanceTier: PetPerformanceTier;
  isPanelOpen: boolean;
  isPetVisible: boolean;
  
  // Actions
  setPanelOpen: (open: boolean) => void;
  togglePetVisibility: () => void;
  feedPet: (foodId: string) => void;
  interact: () => void;
  setPetName: (name: string) => void;
  changeSpecies: (speciesId: string) => void;
  changeSkin: (skinId: string) => void;
  purchaseSkin: (skinId: string) => boolean;
  
  // Mood / Emotional triggers
  triggerExcited: (duration?: number) => void;
  
  // System
  refreshMood: () => void;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export function PetProvider({ children }: { children: React.ReactNode }) {
  const { userStats, gameGold, awardGold } = useStudy();
  const [petState, setPetState] = useState<PetState>(() => loadPetState());
  const [performanceTier, setPerformanceTier] = useState<PetPerformanceTier>('mid');
  const [isPanelOpen, setPanelOpen] = useState(false);
  const [isPetVisible, setPetVisible] = useState(() => {
    try { return localStorage.getItem('sf_pet_visible') !== 'false'; } catch { return true; }
  });

  // Detect performance tier on mount
  useEffect(() => {
    const detectTier = (): PetPerformanceTier => {
      const cores = navigator.hardwareConcurrency || 4;
      const memory = (navigator as any).deviceMemory || 4;
      if (cores <= 4 || memory <= 4) return 'low';
      if (cores <= 6 || memory <= 6) return 'mid';
      return 'high';
    };
    setPerformanceTier(detectTier());
  }, []);

  // Persistence
  useEffect(() => {
    savePetState(petState);
  }, [petState]);

  // Mood derivation logic
  const calculateCurrentMood = useCallback((state: PetState): PetMood => {
    const now = Date.now();
    
    // 1. Check for manual 'excited' state
    if (state.moodExpiresAt && now < state.moodExpiresAt) {
      return 'excited';
    }

    // 2. Check for absence
    if (state.lastActiveDate) {
      const lastActive = new Date(state.lastActiveDate).getTime();
      const diffHours = (now - lastActive) / (1000 * 60 * 60);
      
      if (diffHours >= 72) return 'asleep';
      if (diffHours >= 24) return 'tired';
    }

    // 3. Default to happy if active today, neutral otherwise
    // (In v2, "happy" is the default state when the user is active)
    return 'happy';
  }, []);

  // Update mood when state changes or on interval
  const refreshMood = useCallback(() => {
    setPetState(prev => {
      const newMood = calculateCurrentMood(prev);
      if (newMood === prev.mood) return prev;
      return { ...prev, mood: newMood };
    });
  }, [calculateCurrentMood]);

  useEffect(() => {
    refreshMood();
    const interval = setInterval(refreshMood, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [refreshMood]);

  // --- Actions ---

  const triggerExcited = useCallback((duration = 8000) => {
    setPetState(prev => ({
      ...prev,
      mood: 'excited',
      moodExpiresAt: Date.now() + duration
    }));
  }, []);

  const feedPet = useCallback((foodId: string) => {
    const food = getFoodById(foodId);
    if (!food) return;

    setPetState(prev => {
      const inventoryItem = prev.foodInventory.find(i => i.foodId === foodId);
      if (!inventoryItem || inventoryItem.quantity <= 0) return prev;

      const newInventory = prev.foodInventory.map(i => 
        i.foodId === foodId ? { ...i, quantity: i.quantity - 1 } : i
      );

      return {
        ...prev,
        hunger: Math.min(100, prev.hunger + food.hungerValue),
        foodInventory: newInventory,
        totalFed: prev.totalFed + 1,
        lastFedAt: new Date().toISOString(),
        // Feeding restores happy state immediately
        mood: prev.mood === 'asleep' || prev.mood === 'tired' ? 'happy' : prev.mood,
        lastActiveDate: new Date().toISOString()
      };
    });
  }, []);

  const togglePetVisibility = useCallback(() => {
    setPetVisible(prev => {
      const next = !prev;
      localStorage.setItem('sf_pet_visible', String(next));
      return next;
    });
  }, []);

  const interact = useCallback(() => {
    setPetState(prev => ({
      ...prev,
      totalInteractions: prev.totalInteractions + 1,
      lastInteractedAt: new Date().toISOString(),
      lastActiveDate: new Date().toISOString(),
      mood: prev.mood === 'asleep' || prev.mood === 'tired' ? 'happy' : prev.mood
    }));
  }, []);

  const setPetName = useCallback((name: string) => {
    setPetState(prev => ({ ...prev, name }));
  }, []);

  const changeSpecies = useCallback((speciesId: string) => {
    const species = getSpeciesById(speciesId);
    if (!species) return;
    if (species.isPremium && !userStats.isPremium) {
      console.log('🐾 changeSpecies blocked:', speciesId, 'not premium');
      return;
    }
    console.log('🐾 changeSpecies:', speciesId, 'isPremium:', userStats.isPremium);
    setPetState(prev => {
      const newUnlockedSpecies = prev.unlockedSpecies.includes(speciesId)
        ? prev.unlockedSpecies
        : [...prev.unlockedSpecies, speciesId];
      return { 
        ...prev, 
        speciesId,
        skinId: `${speciesId}_base`,
        unlockedSpecies: newUnlockedSpecies
      };
    });
  }, [userStats.isPremium]);

  const changeSkin = useCallback((skinId: string) => {
    setPetState(prev => {
      if (prev.unlockedSkins.includes(skinId)) {
        return { ...prev, skinId };
      }
      return { ...prev, skinId, unlockedSkins: [...prev.unlockedSkins, skinId] };
    });
  }, []);

  const purchaseSkin = useCallback((skinId: string): boolean => {
    const skin = getSkinById(skinId);
    if (!skin || skin.unlock.type !== 'gold') return false;
    const cost = skin.unlock.value as number;
    if (gameGold < cost) return false;
    awardGold(-cost);
    setPetState(prev => {
      if (prev.unlockedSkins.includes(skinId)) {
        return { ...prev, skinId };
      }
      return { ...prev, skinId, unlockedSkins: [...prev.unlockedSkins, skinId] };
    });
    return true;
  }, [gameGold, awardGold]);

  const value = useMemo(() => ({
    petState,
    performanceTier,
    isPanelOpen,
    isPetVisible,
    setPanelOpen,
    togglePetVisibility,
    feedPet,
    interact,
    setPetName,
    changeSpecies,
    changeSkin,
    purchaseSkin,
    triggerExcited,
    refreshMood,
  }), [petState, performanceTier, isPanelOpen, isPetVisible, setPanelOpen, togglePetVisibility, feedPet, interact, setPetName, changeSpecies, changeSkin, purchaseSkin, triggerExcited, refreshMood]);

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
}

export function usePet() {
  const context = useContext(PetContext);
  if (context === undefined) {
    throw new Error('usePet must be used within a PetProvider');
  }
  return context;
}
