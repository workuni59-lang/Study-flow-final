import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Zap, Award, Eye, EyeOff } from 'lucide-react';
import { usePet } from '../../context/PetContext';
import { useStudy } from '../../context/StudyContext';
import { PET_FOODS, getFoodById } from '../../lib/pets/food';
import { PET_SPECIES, getSpeciesById } from '../../lib/pets/species';
import { getSkinsForSpecies } from '../../lib/pets/skins';

interface PetPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PetPanel = ({ isOpen, onClose }: PetPanelProps) => {
  const { petState, feedPet, changeSpecies, changeSkin, purchaseSkin, isPetVisible, togglePetVisibility } = usePet();
  const { userStats, gameGold } = useStudy();
  const [activeTab, setActiveTab] = React.useState<'status' | 'species' | 'skins'>('status');
  const species = getSpeciesById(petState.speciesId);

  const isPremium = userStats.isPremium;

  const TABS = [
    { id: 'status', label: 'Status' },
    { id: 'species', label: 'Species' },
    { id: 'skins', label: 'Skins' },
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed inset-x-4 bottom-24 lg:inset-auto lg:right-6 lg:bottom-24 w-auto lg:w-80 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-[60] shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white leading-tight">{petState.name}</h3>
              <p className="text-xs text-white/70 uppercase tracking-widest font-bold">Level {petState.level} {species.name}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex px-6 border-b border-white/5">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 text-xs font-bold uppercase tracking-widest transition-colors relative mr-6 ${
                  activeTab === tab.id ? 'text-brand' : 'text-white/60'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="petTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6 max-h-[400px] overflow-y-auto no-scrollbar">
            {activeTab === 'status' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Stats */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-2 text-white/50"><Heart className="w-3.5 h-3.5 text-rose-500" /> Hunger</span>
                      <span className="text-white">{Math.round(petState.hunger)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-rose-500" animate={{ width: `${petState.hunger}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-2 text-white/50"><Zap className="w-3.5 h-3.5 text-amber-500" /> Mood</span>
                    <span className="text-white capitalize">{petState.mood}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-2 text-white/50"><Award className="w-3.5 h-3.5 text-indigo-400" /> XP</span>
                    <span className="text-white">{petState.totalXp}</span>
                  </div>
                </div>

                {/* Visibility toggle */}
                <button
                  onClick={togglePetVisibility}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white/80 transition-colors"
                >
                  {isPetVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {isPetVisible ? 'Hide Pet' : 'Show Pet'}
                </button>

                {/* Food Inventory */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-4">Food</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {petState.foodInventory.map(item => {
                      const food = getFoodById(item.foodId);
                      if (!food) return null;
                      return (
                        <button
                          key={item.foodId}
                          disabled={item.quantity <= 0}
                          onClick={() => feedPet(item.foodId)}
                          className="aspect-square flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all disabled:opacity-30 group"
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform">{food.icon}</span>
                          <span className="text-[10px] font-bold text-white/70 mt-1">{item.quantity}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'species' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3">
                {PET_SPECIES.map(s => {
                  const isSelected = petState.speciesId === s.id;
                  const isUnlocked = petState.unlockedSpecies.includes(s.id) || (s.isPremium && isPremium);
                  return (
                    <button
                      key={s.id}
                      disabled={!isUnlocked}
                      onClick={() => { console.log('🐾 changeSpecies:', s.id, 'isPremium:', isPremium); changeSpecies(s.id); }}
                      className={`p-4 rounded-xl border transition-all text-left flex flex-col gap-2 ${
                        isSelected 
                          ? 'bg-brand/10 border-brand' 
                          : 'bg-white/5 border-white/5 hover:bg-white/10'
                      } ${!isUnlocked && 'opacity-40 grayscale'}`}
                    >
                      <span className="text-xs font-bold text-white">{s.name}</span>
                      <p className="text-[10px] text-white/70 leading-tight">{s.vibe}</p>
                    </button>
                  );
                })}
              </motion.div>
            )}

            {activeTab === 'skins' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3">
                {getSkinsForSpecies(petState.speciesId).map(s => {
                  const isSelected = petState.skinId === s.id;
                  const isUnlocked = 
                    s.unlock.type === 'default' || 
                    petState.unlockedSkins.includes(s.id) || 
                    (s.unlock.type === 'premium' && isPremium) ||
                    (s.unlock.type === 'level' && petState.level >= (s.unlock.value as number)) ||
                    (s.unlock.type === 'gold' && petState.unlockedSkins.includes(s.id));
                  
                  const isGoldBuyable = !isUnlocked && s.unlock.type === 'gold';
                  const hasEnoughGold = isGoldBuyable && gameGold >= (s.unlock.value as number);
                  
                  const lockLabel = !isUnlocked && s.unlock.type === 'level'
                    ? `Lvl ${s.unlock.value}` 
                    : !isUnlocked && s.unlock.type === 'premium'
                    ? 'Premium'
                    : isGoldBuyable
                    ? hasEnoughGold ? `Buy ${s.unlock.value} gold` : `${s.unlock.value} gold`
                    : null;
                  
                    return (
                    <button
                      key={s.id}
                      disabled={!isUnlocked && !hasEnoughGold}
                      onClick={() => {
                        if (isGoldBuyable && hasEnoughGold) {
                          const ok = purchaseSkin(s.id);
                          if (ok) changeSkin(s.id);
                        } else if (isUnlocked) {
                          changeSkin(s.id);
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all text-left flex flex-col gap-2 ${
                        isSelected 
                          ? 'bg-brand/10 border-brand' 
                          : 'bg-white/5 border-white/5 hover:bg-white/10'
                      } ${!isUnlocked && !hasEnoughGold && 'opacity-40 grayscale'}`}
                    >
                      <div className="w-full aspect-square rounded-lg mb-1" style={{ background: s.colors.body }} />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">{s.name}</span>
                        {lockLabel && (
                          <span className={`text-[8px] font-bold uppercase tracking-tight ${
                            s.unlock.type === 'gold' && hasEnoughGold ? 'text-emerald-400' :
                            s.unlock.type === 'gold' ? 'text-amber-400' :
                            s.unlock.type === 'premium' ? 'text-indigo-400' :
                            'text-amber-500'
                          }`}>{lockLabel}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
