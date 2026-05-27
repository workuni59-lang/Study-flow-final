import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Save, Trash2 } from 'lucide-react';
import type { ThemePreset } from './types';
import { CLOCK_PRESETS, saveCustomPresets, loadCustomPresets } from './ThemeEngine';

interface ClockPresetsProps {
  onApply: (preset: ThemePreset) => void;
  currentPresetId?: string;
}

export default function ClockPresets({ onApply, currentPresetId }: ClockPresetsProps) {
  const [customPresets, setCustomPresets] = useState<ThemePreset[]>([]);

  useEffect(() => {
    setCustomPresets(loadCustomPresets());
  }, []);

  const handleDeleteCustom = (id: string) => {
    const next = customPresets.filter(p => p.id !== id);
    setCustomPresets(next);
    saveCustomPresets(next);
  };

  return (
    <div className="space-y-4">
      {/* Built-in presets */}
      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-2">Built-in Presets</p>
        <div className="grid grid-cols-2 gap-1.5">
          {CLOCK_PRESETS.map(preset => {
            const isActive = currentPresetId === preset.id;
            return (
              <motion.button
                key={preset.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onApply(preset)}
                className={`p-2.5 rounded-xl text-left transition-all border ${
                  isActive
                    ? 'bg-brand/20 border-brand/50 ring-1 ring-brand/50'
                    : 'bg-white/[0.04] border-white/5 hover:bg-white/[0.08]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{preset.icon}</span>
                  <span className="text-[10px] font-semibold text-white/90">{preset.name}</span>
                  {isActive && <Sparkles className="w-2.5 h-2.5 text-brand-light ml-auto" />}
                </div>
                <p className="text-[7px] text-white/30 leading-tight">{preset.description}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom presets */}
      {customPresets.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-2">Your Presets</p>
          <div className="space-y-1.5">
            {customPresets.map(preset => {
              const isActive = currentPresetId === preset.id;
              return (
                <div key={preset.id} className="flex items-center gap-1.5">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onApply(preset)}
                    className={`flex-1 p-2 rounded-xl text-left transition-all border ${
                      isActive
                        ? 'bg-brand/20 border-brand/50'
                        : 'bg-white/[0.04] border-white/5 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{preset.icon || '⭐'}</span>
                      <span className="text-[10px] font-semibold text-white/90">{preset.name}</span>
                      {isActive && <Sparkles className="w-2 h-2 text-brand-light ml-auto" />}
                    </div>
                  </motion.button>
                  <button
                    onClick={() => handleDeleteCustom(preset.id)}
                    className="p-2 rounded-xl text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5">
        <Save className="w-3 h-3 text-white/30" />
        <span className="text-[7px] text-white/30">Save your current config as a preset from the customization panel</span>
      </div>
    </div>
  );
}
