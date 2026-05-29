import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Apple, Sparkles, Crown, Star, Circle, Trophy, Gem, PawPrint } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { PET_SPECIES, PET_FOODS, PET_SKINS } from '../../lib/gamification';
import PetSprite from '../ui/PetSprite';
import { PET_ANIMATIONS } from '../../config/pets';

export default function PetPanel({ onClose, onFeed, petVisible, petSize, onToggleVisible, onChangeSize }: {
  onClose: () => void;
  onFeed?: () => void;
  petVisible: boolean;
  petSize: number;
  onToggleVisible: (v: boolean) => void;
  onChangeSize: (s: number) => void;
}) {
  const { petState, feedPet, changePetSpecies, changePetSkin, purchaseSkin, userStats, setShowPremiumModal } = useStudy();
  const [tab, setTab] = useState<'feed' | 'species' | 'skins'>('feed');

  const species = PET_SPECIES.find(s => s.id === petState.species) || PET_SPECIES[0];

  const foodIcons: Record<string, typeof Star> = { Star, Circle, Trophy, Gem };

  const healthLabel = petState.health === 'happy' ? 'Happy' : petState.health === 'neutral' ? 'Neutral' : petState.health === 'weak' ? 'Weak' : 'Dormant';
  const healthColor = petState.health === 'happy' ? 'text-emerald-400' : petState.health === 'neutral' ? 'text-amber-400' : petState.health === 'weak' ? 'text-rose-400' : 'text-slate-500';

  const hungerPct = `${Math.round(petState.hunger)}%`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full sm:max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col"
      >
        {/* Handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header - sticky */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between px-6 pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <PawPrint className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-display font-semibold dark:text-white/90">{petState.name}</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.08] text-white/40 hover:text-white/70 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mx-6 h-px bg-white/[0.06]" />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-white/[0.04] rounded-2xl border border-white/[0.06]">
            {/* Pet preview */}
            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
                {PET_ANIMATIONS[species.id]?.idle ? (
                  <PetSprite species={species.id} animation="idle" size={52} float={false} />
                ) : (
                  <span className="text-2xl">{species.id === 'pixie' ? '✨' : species.id === 'ember' ? '🔥' : species.id === 'lumina' ? '🦊' : '☁️'}</span>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold dark:text-white/90">{species.name}</span>
                {species.isPremium && <Crown className="w-3 h-3 text-amber-500" />}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${healthColor}`}>{healthLabel}</span>
                <div className="flex-1 max-w-24 h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${
                    petState.health === 'happy' ? 'bg-emerald-400' :
                    petState.health === 'neutral' ? 'bg-amber-400' :
                    petState.health === 'weak' ? 'bg-rose-400' : 'bg-slate-500'
                  }`} style={{ width: hungerPct }} />
                </div>
                <span className="text-[9px] font-medium text-white/40">
                  {petState.hunger > 0 ? `${petState.hunger}%` : 'Starving'}
                </span>
              </div>
              <p className="text-[9px] text-white/30 mt-1">Fed {petState.totalFed} times</p>
            </div>
          </div>

          {/* Pet Settings */}
          <div className="p-4 bg-white/[0.04] rounded-2xl border border-white/[0.06] space-y-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">Settings</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Show pet</span>
              <button
                onClick={() => onToggleVisible(!petVisible)}
                className={`w-10 h-5 rounded-full transition-all ${petVisible ? 'bg-brand' : 'bg-white/10'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${petVisible ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Pet size</span>
              <div className="flex items-center gap-2">
                <button onClick={() => onChangeSize(Math.max(120, petSize - 20))} className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs flex items-center justify-center">−</button>
                <span className="text-xs text-white/80 w-10 text-center">{petSize}px</span>
                <button onClick={() => onChangeSize(Math.min(300, petSize + 20))} className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs flex items-center justify-center">+</button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 bg-white/[0.04] p-1 rounded-xl">
            <button onClick={() => setTab('feed')} className={`flex-1 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-wider transition-all ${tab === 'feed' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}>
              <div className="flex items-center justify-center gap-1.5">
                <Apple className="w-3 h-3" /> Food
              </div>
            </button>
            <button onClick={() => setTab('species')} className={`flex-1 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-wider transition-all ${tab === 'species' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}>
              <div className="flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Species
              </div>
            </button>
            <button onClick={() => setTab('skins')} className={`flex-1 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-wider transition-all ${tab === 'skins' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}>
              <div className="flex items-center justify-center gap-1.5">
                <Crown className="w-3 h-3" /> Skins
              </div>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tab === 'feed' ? (
              <motion.div key="feed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-2">
                {petState.foodInventory.length === 0 ? (
                  <div className="text-center py-8">
                    <Apple className="w-8 h-8 text-white/10 mx-auto mb-2" />
                    <p className="text-[10px] text-white/30 font-medium">No food yet</p>
                    <p className="text-[8px] text-white/20 mt-1">Complete tasks and focus sessions to earn food for your pet</p>
                  </div>
                ) : (
                  petState.foodInventory.map(item => {
                    const food = PET_FOODS.find(f => f.id === item.foodId);
                    if (!food || item.quantity <= 0) return null;
                    const FoodIcon = foodIcons[food.icon] || Star;
                    const rarityBg = food.rarity === 'Common' ? 'from-white/5 to-white/[0.02] border-white/5' :
                      food.rarity === 'Rare' ? 'from-blue-500/10 to-purple-500/10 border-blue-500/20' :
                      'from-amber-500/10 to-yellow-500/10 border-amber-500/20';
                    const rarityText = food.rarity === 'Common' ? 'text-white/50 border-white/5' :
                      food.rarity === 'Rare' ? 'text-blue-400 border-blue-500/20' :
                      'text-amber-400 border-amber-500/20';
                    return (
                      <div key={item.foodId} className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br ${rarityBg} border ${rarityText}`}>
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                          <FoodIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white/80">{food.name}</span>
                            <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded ${rarityText} border ${rarityText}`}>{food.rarity}</span>
                          </div>
                          <p className="text-[8px] text-white/30">+{food.hungerValue} hunger &bull; x{item.quantity}</p>
                        </div>
                        <button
                          onClick={() => { feedPet(item.foodId); onFeed?.(); }}
                          disabled={petState.hunger >= 100}
                          className="px-3 py-1.5 rounded-lg bg-brand/20 hover:bg-brand/30 text-brand-light text-[9px] font-bold uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Feed
                        </button>
                      </div>
                    );
                  })
                )}
              </motion.div>
            ) : tab === 'species' ? (
              <motion.div key="species" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid grid-cols-2 gap-2">
                {PET_SPECIES.map(s => {
                  const isUnlocked = petState.unlockedSpecies.includes(s.id) || (s.isPremium && userStats.isPremium);
                  const isActive = petState.species === s.id;
                  const canUnlock = !isUnlocked && !s.isPremium && false;
                  return (
                    <button
                      key={s.id}
                      onClick={() => { if (s.isPremium && !userStats.isPremium) { setShowPremiumModal(true); return; } changePetSpecies(s.id); }}
                      disabled={!isUnlocked || isActive}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isActive ? 'bg-brand/20 border-brand/50 ring-1 ring-brand/50' :
                        isUnlocked ? 'bg-white/[0.04] border-white/5 hover:bg-white/[0.08]' :
                        'bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
                          {PET_ANIMATIONS[s.id]?.idle ? (
                            <PetSprite species={s.id} animation="idle" size={32} float={false} />
                          ) : (
                            <span className="text-lg">{s.id === 'pixie' ? '✨' : s.id === 'ember' ? '🔥' : s.id === 'lumina' ? '🦊' : '☁️'}</span>
                          )}
                        </div>
                        {s.isPremium && <Crown className="w-3 h-3 text-amber-500" />}
                      </div>
                      <p className="text-xs font-semibold text-white/90">{s.name}</p>
                      <p className="text-[8px] text-white/30 mt-0.5 leading-tight">{s.description}</p>
                      {!isUnlocked && !s.isPremium && (
                        <p className="text-[8px] text-brand-light mt-1">Unlocks at level {s.unlockLevel}</p>
                      )}
                      {!isUnlocked && s.isPremium && (
                        <p className="text-[8px] text-amber-400 mt-1">Premium species</p>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div key="skins" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid grid-cols-2 gap-2">
                {PET_SKINS.filter(s => s.speciesId === petState.species).map(skin => {
                  const isUnlocked = petState.unlockedSkins.includes(skin.id);
                  const isActive = petState.skin === skin.id;
                  const canAfford = userStats.xp >= skin.price;
                  const meetsLevel = userStats.level >= skin.unlockLevel;
                  const canUnlock = !isUnlocked && !skin.isPremium && meetsLevel && canAfford;
                  const isPremiumLocked = skin.isPremium && !userStats.isPremium;
                  return (
                    <button
                      key={skin.id}
                      onClick={() => {
                        if (isPremiumLocked) { setShowPremiumModal(true); return; }
                        if (isUnlocked) { changePetSkin(skin.id); return; }
                        if (canUnlock || (skin.isPremium && userStats.isPremium && canAfford && meetsLevel)) {
                          purchaseSkin(skin.id);
                        }
                      }}
                      disabled={isActive || (!isUnlocked && !canUnlock && !(skin.isPremium && userStats.isPremium))}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isActive ? 'bg-brand/20 border-brand/50 ring-1 ring-brand/50' :
                        isUnlocked ? 'bg-white/[0.04] border-white/5 hover:bg-white/[0.08]' :
                        'bg-white/[0.02] border-white/5 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, ${skin.colors.body}44, ${skin.colors.accent}44)` }}
                        >
                          <div className="w-5 h-5 rounded-full" style={{ background: skin.colors.body }} />
                        </div>
                        <div className="flex items-center gap-1">
                          {skin.isPremium && <Crown className="w-3 h-3 text-amber-500" />}
                          {!isUnlocked && !skin.isPremium && (
                            <span className="text-[7px] font-bold px-1 py-0.5 rounded bg-brand/20 text-brand-light">FREE</span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-white/90">{skin.name}</p>
                      <p className="text-[8px] text-white/30 mt-0.5 leading-tight">{skin.description}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        {isActive ? (
                          <span className="text-[7px] font-bold uppercase tracking-wider text-brand-light">Equipped</span>
                        ) : isUnlocked ? (
                          <span className="text-[7px] font-bold uppercase tracking-wider text-emerald-400">Owned</span>
                        ) : isPremiumLocked ? (
                          <span className="text-[7px] font-bold uppercase tracking-wider text-amber-400">Premium</span>
                        ) : skin.price > 0 ? (
                          <span className={`text-[7px] font-bold uppercase tracking-wider ${canAfford ? 'text-white/60' : 'text-rose-400'}`}>{skin.price} XP</span>
                        ) : (
                          <span className="text-[7px] font-bold uppercase tracking-wider text-brand-light">Level {skin.unlockLevel}</span>
                        )}
                        {!meetsLevel && !isUnlocked && (
                          <span className="text-[7px] text-white/30">Lv.{skin.unlockLevel}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
