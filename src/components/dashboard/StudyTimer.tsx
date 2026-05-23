import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Zap, Music, Maximize2, X, Volume2, 
  CloudRain, Coffee, Waves, Palette, VolumeX, Lock, Crown, Layout, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardCard } from './DashboardCard';
import { storage } from '../../services/storage';
import { useStudy } from '../../context/StudyContext';
import { ATMOSPHERES, WALLPAPERS, ATMOSPHERE_REQUIREMENTS } from '../../lib/gamification';
import { PremiumModal } from '../modals/PremiumModal';

// Verified direct high-quality audio sources
const AMBIENCE_TRACKS = [
  { 
    id: 'lofi', 
    name: 'Focus Lofi', 
    icon: Coffee, 
    url: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Files/main/lofi.mp3' 
  },
  { 
    id: 'rain', 
    name: 'Rainy Window', 
    icon: CloudRain, 
    url: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Files/main/rain.mp3'
  },
  { 
    id: 'white-noise', 
    name: 'Deep Focus', 
    icon: Waves, 
    url: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Files/main/white-noise.mp3'
  },
];

interface StudyTimerProps {
  onTick?: () => void;
}

export const StudyTimer = ({ onTick }: StudyTimerProps) => {
  const { themeConfig, setThemeConfig, completeFocusSession, userStats } = useStudy();
  const SESSION_DURATION = 25 * 60;
  
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = storage.getTimerState();
    return saved !== null ? saved : SESSION_DURATION;
  });
  const [isActive, setIsActive] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [activeAmbience, setActiveAmbience] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [pickerTab, setPickerTab] = useState<'atm' | 'wall'>('atm');
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionElapsed = useRef(0);

  // Timer Logic
  useEffect(() => {
    let interval: number | undefined;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        const nextTime = timeLeft - 1;
        setTimeLeft(nextTime);
        sessionElapsed.current += 1;
        storage.saveTimerState(nextTime);
        if (sessionElapsed.current >= 60) {
          completeFocusSession(60);
          sessionElapsed.current = 0;
        }
        if (onTick) onTick();
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (sessionElapsed.current > 0) {
        completeFocusSession(sessionElapsed.current);
        sessionElapsed.current = 0;
      }
      storage.saveTimerState(SESSION_DURATION);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onTick, completeFocusSession]);

  // Update volume
  useEffect(() => {
    AMBIENCE_TRACKS.forEach(track => {
      const el = document.getElementById(`audio-${track.id}`) as HTMLAudioElement;
      if (el) el.volume = volume;
    });
  }, [volume]);

  const handleAmbienceToggle = (trackId: string) => {
    AMBIENCE_TRACKS.forEach(track => {
      const el = document.getElementById(`audio-${track.id}`) as HTMLAudioElement;
      if (el) {
        el.pause();
        el.currentTime = 0;
      }
    });

    if (activeAmbience !== trackId) {
      setActiveAmbience(trackId);
      const target = document.getElementById(`audio-${trackId}`) as HTMLAudioElement;
      if (target) {
        target.volume = volume;
        target.play().catch(() => {});
      }
    } else {
      setActiveAmbience(null);
    }
  };

  const toggleTimer = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    
    if (nextState && activeAmbience) {
      const target = document.getElementById(`audio-${activeAmbience}`) as HTMLAudioElement;
      if (target) target.play().catch(() => {});
    } else if (!nextState && activeAmbience) {
      const target = document.getElementById(`audio-${activeAmbience}`) as HTMLAudioElement;
      if (target) target.pause();
    }

    if (!nextState && sessionElapsed.current > 0) {
      completeFocusSession(sessionElapsed.current);
      sessionElapsed.current = 0;
    }
  };

  const resetTimer = () => {
    if (sessionElapsed.current > 0) {
      completeFocusSession(sessionElapsed.current);
      sessionElapsed.current = 0;
    }
    setIsActive(false);
    setTimeLeft(SESSION_DURATION);
    storage.saveTimerState(SESSION_DURATION);
    AMBIENCE_TRACKS.forEach(track => {
      const el = document.getElementById(`audio-${track.id}`) as HTMLAudioElement;
      if (el) {
        el.pause();
        el.currentTime = 0;
      }
    });
    setActiveAmbience(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCustomizationClick = (type: 'atm' | 'wall', id: any, isPremium: boolean, levelReq: number) => {
    if (isPremium && !userStats.isPremium) {
      setShowPremiumModal(true);
      return;
    }
    if (userStats.level < levelReq) {
      return;
    }

    if (type === 'atm') {
      setThemeConfig({ ...themeConfig, atmosphere: id });
    } else {
      setThemeConfig({ ...themeConfig, wallpaper: id });
    }
  };

  const currentTrack = AMBIENCE_TRACKS.find(t => t.id === activeAmbience);
  const currentAtmosphere = ATMOSPHERES.find(a => a.id === themeConfig.atmosphere) || ATMOSPHERES[0];

  return (
    <>
      <div className="hidden">
        {AMBIENCE_TRACKS.map(track => (
          <audio key={track.id} id={`audio-${track.id}`} src={track.url} loop preload="auto" />
        ))}
      </div>

      <DashboardCard className="bg-slate-900 dark:bg-indigo-900/10 text-white relative overflow-hidden group border-none shadow-indigo-500/5 h-full flex flex-col justify-between">
        <div className={`absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br ${currentAtmosphere.color.replace('bg-', 'from-')}/20 to-transparent rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity`} />
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/80">Focus Session</span>
             <div className="flex gap-1">
                <button 
                  onClick={() => setShowThemePicker(!showThemePicker)}
                  className={`p-2 rounded-xl transition-all ${showThemePicker ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                  <Palette className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsZenMode(true)}
                  className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
             </div>
          </div>

          <div className="text-6xl font-display font-black tracking-tighter mb-10 tabular-nums">
            {formatTime(timeLeft)}
          </div>
          
          <AnimatePresence mode="wait">
            {showThemePicker ? (
              <motion.div 
                key="picker"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-5 mb-10"
              >
                  <div className="flex gap-4 p-1 bg-white/5 rounded-xl">
                    <button onClick={() => setPickerTab('atm')} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${pickerTab === 'atm' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Atmosphere</button>
                    <button onClick={() => setPickerTab('wall')} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${pickerTab === 'wall' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Wallpaper</button>
                  </div>

                  <div className="flex gap-2 flex-wrap min-h-[40px]">
                    {pickerTab === 'atm' ? (
                      ATMOSPHERES.map(atm => {
                        const isLocked = userStats.level < atm.levelRequired;
                        const isPro = atm.isPremium && !userStats.isPremium;
                        return (
                          <button
                            key={atm.id}
                            onClick={() => handleCustomizationClick('atm', atm.id, atm.isPremium, atm.levelRequired)}
                            className={`w-7 h-7 rounded-full ${atm.color} border-2 transition-all relative flex items-center justify-center ${
                              themeConfig.atmosphere === atm.id 
                                ? 'border-white scale-110 shadow-xl' 
                                : (isLocked || isPro) 
                                  ? 'opacity-30 border-transparent' 
                                  : 'border-transparent opacity-40 hover:opacity-100'
                            }`}
                            title={isPro ? 'Flow Pro Feature' : isLocked ? `Unlocked at Level ${atm.levelRequired}` : atm.name}
                          >
                            {isPro ? <Crown className="w-2.5 h-2.5 text-white" /> : isLocked ? <Lock className="w-2.5 h-2.5 text-white" /> : null}
                          </button>
                        );
                      })
                    ) : (
                      WALLPAPERS.map(wall => {
                        const isPro = wall.isPremium && !userStats.isPremium;
                        return (
                          <button
                            key={wall.id}
                            onClick={() => handleCustomizationClick('wall', wall.id, wall.isPremium, 1)}
                            className={`px-3 py-1.5 rounded-lg bg-white/5 border transition-all text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                              themeConfig.wallpaper === wall.id 
                                ? 'border-white text-white bg-white/10' 
                                : isPro 
                                  ? 'border-transparent text-slate-500 opacity-40' 
                                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {isPro && <Crown className="w-2.5 h-2.5" />}
                            {wall.name}
                          </button>
                        );
                      })
                    )}
                  </div>
                  <button onClick={() => setShowThemePicker(false)} className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors">Done</button>
              </motion.div>
            ) : (
              <motion.div key="controls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 mb-10">
                <button 
                  onClick={toggleTimer}
                  className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${isActive ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20' : 'bg-white text-slate-900 hover:bg-slate-100 shadow-xl shadow-white/5'}`}
                >
                  {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  {isActive ? 'Pause' : 'Start'}
                </button>
                <button onClick={resetTimer} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/5">
                  <RotateCcw className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-6 border-t border-white/5">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Music className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ambience</span>
                </div>
                <div className="flex items-center gap-2 min-w-[80px]">
                  <Volume2 className="w-3 h-3 text-slate-600" />
                  <input 
                    type="range" min="0" max="1" step="0.01" 
                    value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none accent-indigo-500 cursor-pointer"
                  />
                </div>
             </div>
             <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {AMBIENCE_TRACKS.map(track => (
                  <button
                    key={track.id}
                    onClick={() => handleAmbienceToggle(track.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-bold transition-all whitespace-nowrap ${activeAmbience === track.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                  >
                    <track.icon className="w-3 h-3" />
                    {track.name}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </DashboardCard>

      {/* Cinematic Zen Mode Overlay */}
      <AnimatePresence>
        {isZenMode && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center transition-all duration-1000 ${
              themeConfig.atmosphere === 'indigo' ? 'bg-[#0a0c10]' :
              themeConfig.atmosphere === 'rose' ? 'bg-[#100a0a]' :
              themeConfig.atmosphere === 'emerald' ? 'bg-[#0a100b]' :
              themeConfig.atmosphere === 'violet' ? 'bg-[#0c0a10]' :
              themeConfig.atmosphere === 'amber' ? 'bg-[#100e0a]' :
              'bg-[#0f1115]'
            }`}
          >
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
               <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                 className={`absolute -top-1/4 -left-1/4 w-[70%] h-[70%] rounded-full blur-[160px] opacity-20 ${currentAtmosphere.color}`} 
               />
               <motion.div animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0], y: [0, 40, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                 className={`absolute -bottom-1/4 -right-1/4 w-[70%] h-[70%] rounded-full blur-[160px] opacity-20 ${currentAtmosphere.color}`} 
               />
            </div>

            <button onClick={() => setIsZenMode(false)} className="absolute top-10 right-10 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors text-slate-500 hover:text-white z-50">
              <X className="w-8 h-8" />
            </button>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10 w-full max-w-6xl flex flex-col items-center">
              <div className="mb-8">
                <AnimatePresence mode="wait">
                  {isActive ? (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                      className="text-white text-xs font-black uppercase tracking-[0.8em]"
                    >
                      Focusing
                    </motion.p>
                  ) : (
                    <p className="text-white opacity-20 text-xs font-black uppercase tracking-[0.8em]">Paused</p>
                  )}
                </AnimatePresence>
              </div>

              <div className="text-[12vw] md:text-[15vw] lg:text-[14rem] font-display font-thin tracking-tighter text-white tabular-nums leading-[1] select-none opacity-90 mb-12 flex items-center justify-center">
                {formatTime(timeLeft)}
              </div>
              
              <div className="flex justify-center items-center gap-12 mb-20">
                <button onClick={resetTimer} className="p-6 bg-white/5 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all">
                  <RotateCcw className="w-8 h-8" />
                </button>
                <button onClick={toggleTimer}
                  className={`w-32 h-32 rounded-full flex items-center justify-center transition-all shadow-2xl ${isActive ? 'bg-amber-500/90 text-white' : 'bg-white text-slate-950 scale-105'}`}
                >
                  {isActive ? <Pause className="w-12 h-12 fill-current" /> : <Play className="w-12 h-12 fill-current translate-x-1.5" />}
                </button>
                <button onClick={() => handleAmbienceToggle(activeAmbience || 'lofi')}
                  className={`p-6 rounded-full transition-all ${activeAmbience ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white/5 text-slate-500'}`}
                >
                  <Music className="w-8 h-8" />
                </button>
              </div>

              {/* Atmosphere Switcher */}
              <div className="flex gap-4 opacity-30 hover:opacity-100 transition-opacity">
                {ATMOSPHERES.map(atm => {
                  const isLocked = userStats.level < atm.levelRequired;
                  const isPro = atm.isPremium && !userStats.isPremium;
                  return (
                    <button 
                      key={atm.id} 
                      onClick={() => handleCustomizationClick('atm', atm.id, atm.isPremium, atm.levelRequired)}
                      className={`w-6 h-6 rounded-full ${atm.color} border-2 transition-all relative flex items-center justify-center ${
                        themeConfig.atmosphere === atm.id ? 'border-white scale-125' : 'border-transparent'
                      } ${(isLocked || isPro) ? 'opacity-20' : ''}`}
                    >
                      {isPro ? <Crown className="w-3 h-3 text-white" /> : isLocked ? <Lock className="w-3 h-3 text-white" /> : null}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {activeAmbience && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/20">
                <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">{currentTrack?.name}</span>
                <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
    </>
  );
};
