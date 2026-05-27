import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings2, Save, Sparkles, ChevronDown, ChevronUp, Sun, Moon } from 'lucide-react';
import type { ClockConfig, ClockVariant, HandStyle, TickStyle, FaceTexture, ThemePreset } from './types';
import { getDefaultConfig, CLOCK_PRESETS, saveCustomPresets, getVariantType } from './ThemeEngine';
import DigitalClock from './DigitalClock';
import AnalogClock from './AnalogClock';

interface ClockCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  config: ClockConfig;
  onChange: (config: ClockConfig) => void;
  currentPresetId?: string;
  onPresetChange: (id?: string) => void;
}

const ACCENT_COLORS = [
  '#6366f1', '#a5b4fc', '#22d3ee', '#06b6d4',
  '#4ade80', '#fbbf24', '#f97316', '#fb7185',
  '#a78bfa', '#c084fc', '#34d399', '#f472b6',
];

const FONT_OPTIONS = [
  { id: 'Outfit', label: 'Outfit' },
  { id: 'Inter', label: 'Inter' },
  { id: 'monospace', label: 'Mono' },
  { id: "'Georgia', serif", label: 'Serif' },
];

function Slider({ label, value, min, max, step, onChange, unit }: {
  label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; unit?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-medium text-white/50">{label}</span>
        <span className="text-[9px] font-semibold text-white/70 tabular-nums">{value}{unit || ''}</span>
      </div>
      <input type="range" min={min} max={max} step={step || 1} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-white/8 rounded-full appearance-none accent-brand cursor-pointer" />
    </div>
  );
}

function Toggle({ label, value, onToggle, onLabel, offLabel }: {
  label: string; value: boolean; onToggle: () => void; onLabel?: string; offLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[9px] font-medium text-white/50">{label}</span>
      <button onClick={onToggle}
        className={`px-2.5 py-1 rounded-lg text-[7px] font-bold uppercase tracking-wider transition-all ${value ? 'bg-brand text-white' : 'bg-white/[0.04] text-white/40'}`}>
        {value ? (onLabel || 'On') : (offLabel || 'Off')}
      </button>
    </div>
  );
}

function ColorGrid({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <span className="text-[9px] font-medium text-white/50 block mb-1.5">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {ACCENT_COLORS.map(c => (
          <button key={c} onClick={() => onChange(c)}
            className={`w-5 h-5 rounded-full transition-all border-2 ${value === c ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
            style={{ background: c }} />
        ))}
        <label className="w-5 h-5 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40">
          <input type="color" value={value} onChange={e => onChange(e.target.value)}
            className="absolute opacity-0 w-0 h-0" />
          <span className="text-[9px] text-white/30">+</span>
        </label>
      </div>
    </div>
  );
}

function OptGroup<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: { id: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <div>
      <span className="text-[9px] font-medium text-white/50 block mb-1">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map(opt => (
          <button key={opt.id} onClick={() => onChange(opt.id)}
            className={`px-2 py-1 rounded-lg text-[7px] font-semibold uppercase tracking-wider transition-all ${
              value === opt.id ? 'bg-brand text-white shadow-sm' : 'bg-white/[0.04] text-white/40 hover:text-white/60 hover:bg-white/[0.08]'
            }`}
          >{opt.label}</button>
        ))}
      </div>
    </div>
  );
}

const DIGITAL_VARIANTS: { id: ClockVariant; label: string }[] = [
  { id: 'digital-minimal', label: 'Minimal' },
  { id: 'digital-amoled', label: 'AMOLED' },
  { id: 'digital-neon', label: 'Neon' },
  { id: 'digital-retro', label: 'Retro' },
  { id: 'digital-glass', label: 'Glass' },
  { id: 'digital-matrix', label: 'Matrix' },
  { id: 'digital-flip', label: 'Flip' },
  { id: 'digital-lofi', label: 'Lo-fi' },
];

const ANALOG_VARIANTS: { id: ClockVariant; label: string }[] = [
  { id: 'analog-minimal', label: 'Minimal' },
  { id: 'analog-apple', label: 'Watch' },
  { id: 'analog-luxury', label: 'Luxury' },
  { id: 'analog-cozy', label: 'Cozy' },
  { id: 'analog-hologram', label: 'Holo' },
];

const HAND_OPTIONS: { id: HandStyle; label: string }[] = [
  { id: 'classic', label: 'Classic' }, { id: 'modern', label: 'Modern' },
  { id: 'thin', label: 'Thin' }, { id: 'cathedral', label: 'Cathedral' }, { id: 'hologram', label: 'Holo' },
];

const TICK_OPTIONS: { id: TickStyle; label: string }[] = [
  { id: 'lines', label: 'Lines' }, { id: 'dots', label: 'Dots' },
  { id: 'numeric', label: 'Nums' }, { id: 'roman', label: 'Roman' }, { id: 'none', label: 'None' },
];

const FACE_OPTIONS: { id: FaceTexture; label: string }[] = [
  { id: 'none', label: 'Plain' }, { id: 'matte', label: 'Matte' },
  { id: 'brushed', label: 'Brushed' }, { id: 'sunburst', label: 'Sunburst' }, { id: 'carbon', label: 'Carbon' },
];

function MiniClockPreview({ variant, accentColor, hour }: { variant: ClockVariant; accentColor: string; hour: number }) {
  const miniConfig: ClockConfig = {
    ...getDefaultConfig(),
    variant,
    accentColor,
    hour12: true,
    showSeconds: false,
    opacity: 100,
    animationIntensity: 0,
    size: 35,
  };
  const h = hour % 12 || 12;
  const m = '00';
  const s = '00';
  const ampm = hour >= 12 ? 'PM' : 'AM';

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <div style={{ transform: 'scale(0.35)', transformOrigin: 'center center' }}>
        <DigitalClock hours={h} minutes={0} seconds={0} ampm={ampm} config={miniConfig} />
      </div>
    </div>
  );
}

function MiniAnalogPreview({ variant, accentColor, hour }: { variant: ClockVariant; accentColor: string; hour: number }) {
  const miniConfig: ClockConfig = {
    ...getDefaultConfig(),
    variant,
    accentColor,
    hour12: true,
    showSeconds: false,
    opacity: 100,
    animationIntensity: 0,
    size: 30,
  };
  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden" style={{ filter: 'brightness(1.2)' }}>
      <div style={{ transform: 'scale(0.28)', transformOrigin: 'center center' }}>
        <AnalogClock hours={hour} minutes={0} seconds={0} config={miniConfig} />
      </div>
    </div>
  );
}

export default function ClockCustomizer({ isOpen, onClose, config, onChange, currentPresetId, onPresetChange }: ClockCustomizerProps) {
  const [section, setSection] = useState<'variants' | 'general' | 'digital' | 'analog' | 'presets'>('variants');
  const [saveName, setSaveName] = useState('');
  const [saved, setSaved] = useState(false);
  const isAnalog = getVariantType(config.variant) === 'analog';
  const previewHour = 10;

  const update = useCallback((partial: Partial<ClockConfig>) => {
    onChange({ ...config, ...partial });
    onPresetChange(undefined);
  }, [config, onChange, onPresetChange]);

  const handleSavePreset = () => {
    if (!saveName.trim()) return;
    const newPreset: ThemePreset = {
      id: `custom-${Date.now()}`,
      name: saveName.trim(),
      description: 'Custom preset',
      icon: '⭐',
      config: { ...config },
    };
    const existing = loadCustomPresets();
    existing.push(newPreset);
    saveCustomPresets(existing);
    setSaveName('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full sm:max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-inherit rounded-t-3xl">
              <div className="flex items-center justify-between px-6 pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Settings2 className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-sm font-display font-semibold dark:text-white/90">Clock Style</h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.08] text-white/40 hover:text-white/70 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mx-6 h-px bg-white/[0.06]" />
            </div>

            {/* Section tabs */}
            <div className="flex gap-1.5 px-6 pt-3 pb-1 bg-white/[0.02] border-b border-white/[0.04]">
              {[
                { id: 'variants' as const, label: 'Layout' },
                { id: 'general' as const, label: 'Style' },
                { id: isAnalog ? 'analog' as const : 'digital' as const, label: isAnalog ? 'Hands' : 'Format' },
                { id: 'presets' as const, label: 'Presets' },
              ].map(s => (
                <button key={s.id} onClick={() => setSection(s.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[7px] font-bold uppercase tracking-wider transition-all ${
                    section === s.id ? 'bg-brand text-white shadow-sm' : 'text-white/40 hover:text-white/60'
                  }`}
                >{s.label}</button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-12 space-y-4">
              {/* ── VARIANTS SECTION ── */}
              {section === 'variants' && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-2">Digital Clocks</p>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {DIGITAL_VARIANTS.map(v => {
                      const active = config.variant === v.id;
                      return (
                        <button key={v.id} onClick={() => update({ variant: v.id })}
                          className={`rounded-xl overflow-hidden transition-all border ${
                            active ? 'ring-2 ring-brand border-brand/50 bg-brand/10' : 'border-white/5 bg-white/[0.03] hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="h-12 flex items-center justify-center p-1" style={{
                            background: active ? `linear-gradient(180deg, ${config.accentColor}11, transparent)` : undefined,
                          }}>
                            <MiniClockPreview variant={v.id} accentColor={config.accentColor} hour={previewHour} />
                          </div>
                          <div className="px-1.5 py-1 text-center">
                            <span className={`text-[7px] font-bold uppercase tracking-wider ${active ? 'text-brand-light' : 'text-white/50'}`}>
                              {v.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-2">Analog Clocks</p>
                  <div className="grid grid-cols-4 gap-2">
                    {ANALOG_VARIANTS.map(v => {
                      const active = config.variant === v.id;
                      return (
                        <button key={v.id} onClick={() => update({ variant: v.id })}
                          className={`rounded-xl overflow-hidden transition-all border ${
                            active ? 'ring-2 ring-brand border-brand/50 bg-brand/10' : 'border-white/5 bg-white/[0.03] hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="h-12 flex items-center justify-center p-1">
                            <MiniAnalogPreview variant={v.id} accentColor={config.accentColor} hour={previewHour} />
                          </div>
                          <div className="px-1.5 py-1 text-center">
                            <span className={`text-[7px] font-bold uppercase tracking-wider ${active ? 'text-brand-light' : 'text-white/50'}`}>
                              {v.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── GENERAL SECTION ── */}
              {section === 'general' && (
                <div className="space-y-3">
                  <Slider label="Size" value={config.size} min={50} max={200} onChange={v => update({ size: v })} unit="%" />
                  <Slider label="Opacity" value={config.opacity} min={20} max={100} onChange={v => update({ opacity: v })} unit="%" />
                  <Slider label="Blur" value={config.blur} min={0} max={20} onChange={v => update({ blur: v })} unit="px" />
                  <Slider label="Roundness" value={config.borderRadius} min={0} max={40} onChange={v => update({ borderRadius: v })} unit="px" />
                  <Slider label="Glow" value={config.glowIntensity} min={0} max={100} onChange={v => update({ glowIntensity: v })} unit="%" />
                  <Slider label="Shadow" value={config.shadowSoftness} min={0} max={100} onChange={v => update({ shadowSoftness: v })} unit="%" />
                  <Slider label="Animation" value={config.animationIntensity} min={0} max={100} onChange={v => update({ animationIntensity: v })} unit="%" />
                  <ColorGrid label="Accent Color" value={config.accentColor} onChange={v => update({ accentColor: v })} />
                </div>
              )}

              {/* ── DIGITAL SECTION ── */}
              {section === 'digital' && !isAnalog && (
                <div className="space-y-3">
                  <OptGroup label="Font" value={config.fontFamily} options={FONT_OPTIONS} onChange={v => update({ fontFamily: v })} />
                  <Toggle label="12h / 24h" value={config.hour12} onToggle={() => update({ hour12: !config.hour12 })} onLabel="12h" offLabel="24h" />
                  <Toggle label="Seconds" value={config.showSeconds} onToggle={() => update({ showSeconds: !config.showSeconds })} />
                  <Toggle label="Neon Glow" value={config.glowEffect} onToggle={() => update({ glowEffect: !config.glowEffect })} />
                </div>
              )}

              {/* ── ANALOG SECTION ── */}
              {section === 'analog' && isAnalog && (
                <div className="space-y-3">
                  <OptGroup label="Hand Style" value={config.handStyle} options={HAND_OPTIONS} onChange={v => update({ handStyle: v })} />
                  <OptGroup label="Tick Marks" value={config.tickStyle} options={TICK_OPTIONS} onChange={v => update({ tickStyle: v })} />
                  <OptGroup label="Face" value={config.faceTexture} options={FACE_OPTIONS} onChange={v => update({ faceTexture: v })} />
                  <Toggle label="Smooth Sweep" value={config.smoothSweep} onToggle={() => update({ smoothSweep: !config.smoothSweep })} />
                </div>
              )}

              {/* ── PRESETS SECTION ── */}
              {section === 'presets' && (
                <div className="space-y-3">
                  <p className="text-[8px] font-medium text-white/30">Select a preset to instantly transform your clock</p>
                  <div className="grid grid-cols-2 gap-2">
                    {CLOCK_PRESETS.map(p => {
                      const active = currentPresetId === p.id;
                      return (
                        <motion.button key={p.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => { onChange({ ...p.config }); onPresetChange(p.id); }}
                          className={`p-3 rounded-xl text-left transition-all border ${
                            active ? 'bg-brand/20 border-brand/50 ring-1 ring-brand/50' : 'bg-white/[0.04] border-white/5 hover:bg-white/[0.08]'
                          }`}
                        >
                          <span className="text-lg">{p.icon}</span>
                          <p className="text-[10px] font-semibold text-white/90 mt-0.5">{p.name}</p>
                          <p className="text-[7px] text-white/30 leading-tight">{p.description}</p>
                          {active && <span className="text-[7px] font-bold text-brand-light mt-1 block">Active</span>}
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="h-px bg-white/[0.06] my-2" />

                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">Save Current</p>
                  <div className="flex gap-2">
                    <input type="text" value={saveName} onChange={e => setSaveName(e.target.value)}
                      placeholder="Preset name..."
                      className="flex-1 bg-white/[0.04] border border-white/5 rounded-lg px-3 py-2 text-[9px] font-medium text-white/70 placeholder-white/20 focus:ring-1 ring-brand transition-all outline-none" />
                    <button onClick={handleSavePreset} disabled={!saveName.trim() || saved}
                      className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                        saved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-brand/20 text-brand-light hover:bg-brand/30'
                      } disabled:opacity-30`}
                    >{saved ? 'Saved!' : <Save className="w-3 h-3" />}</button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function loadCustomPresets(): ThemePreset[] {
  try {
    return JSON.parse(localStorage.getItem('study_flow_clock_custom_presets') || '[]');
  } catch { return []; }
}
