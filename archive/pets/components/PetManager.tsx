import React, { useEffect } from 'react';
import { PetEngine } from './PetEngine';
import { PetPanel } from './PetPanel';
import { RewardToast } from './RewardToast';
import { usePet } from '../../context/PetContext';
import { useStudy } from '../../context/StudyContext';
import { ENABLE_PETS } from '../../config/features';

export const PetManager = () => {
  const { triggerExcited, isPanelOpen, setPanelOpen, isPetVisible } = usePet();
  const { petEvent } = useStudy();

  useEffect(() => {
    if (!petEvent) return;
    if (['task_done', 'focus_done', 'level_up', 'achievement_unlocked'].includes(petEvent.type)) {
      triggerExcited();
    }
  }, [petEvent, triggerExcited]);

  if (!ENABLE_PETS) return null;

  return (
    <>
      {isPetVisible && <PetEngine onOpenPanel={() => setPanelOpen(true)} />}
      <PetPanel isOpen={isPanelOpen} onClose={() => setPanelOpen(false)} />
      <RewardToast />
    </>
  );
};
