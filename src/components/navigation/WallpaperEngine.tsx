import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { useStudy } from '../../context/StudyContext';
import { WALLPAPERS } from '../../lib/gamification';
import { MOOD_GRADIENTS, MOOD_ANIMATED } from '../../lib/wallpapers';
import { useReduceMotion } from '../../hooks/useReduceMotion';

const VIDEO_WALLPAPERS: Record<string, string> = {
  'aurora-cabin': 'https://files.catbox.moe/r1ghol.mp4',
};

export const WallpaperEngine = ({ visible = true, staticOnly = false }: { visible?: boolean, staticOnly?: boolean }) => {
  const { themeConfig } = useStudy();
  const reduceMotion = useReduceMotion();
  const shouldReduceMotion = reduceMotion || staticOnly;
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mouse Tracking for Interactive Parallax (disabled when reduceMotion is active)
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springX = useSpring(mouseX, { damping: reduceMotion ? 0 : 25, stiffness: reduceMotion ? 99999 : 150 });
  const springY = useSpring(mouseY, { damping: reduceMotion ? 0 : 25, stiffness: reduceMotion ? 99999 : 150 });

  // Transforms
  const meshX1 = useTransform(springX, [0, 1], [-100, 100]);
  const meshY1 = useTransform(springY, [0, 1], [-100, 100]);
  const meshX2 = useTransform(springX, [0, 1], [150, -150]);
  const meshY2 = useTransform(springY, [0, 1], [150, -150]);
  const meshX3 = useTransform(springX, [0, 1], [-50, 50]);
  const meshY3 = useTransform(springY, [0, 1], [50, -50]);
  
  const auroraX = useTransform(springX, [0, 1], [-250, 250]);
  const starX = useTransform(springX, [0, 1], [-45, 45]);
  const starY = useTransform(springY, [0, 1], [-45, 45]);
  const dotsX = useTransform(springX, [0, 1], [-20, 20]);
  const dotsY = useTransform(springY, [0, 1], [-20, 20]);

  const lensX = useTransform(springX, [0, 1], ["0%", "100%"]);
  const lensY = useTransform(springY, [0, 1], ["0%", "100%"]);

  // Parallax for Image Wallpapers
  const imageX = useTransform(springX, [0, 1], ["-2%", "2%"]);
  const imageY = useTransform(springY, [0, 1], ["-2%", "2%"]);

  // Pause/resume video wallpaper based on visibility and reduced motion
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!visible || reduceMotion) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  }, [visible, reduceMotion, themeConfig.wallpaper]);

  useEffect(() => {
    if (reduceMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, reduceMotion]);

  const baseBackgrounds: Record<string, string> = {
    indigo: 'bg-[#f8fafc] dark:bg-indigo-950',
    rose: 'bg-[#fff5f5] dark:bg-rose-950',
    emerald: 'bg-[#f2fcf5] dark:bg-emerald-950',
    violet: 'bg-[#f8f5ff] dark:bg-[#170a2e]',
    amber: 'bg-[#fffbf2] dark:bg-[#2d1505]',
    cyan: 'bg-[#f2fbff] dark:bg-cyan-950',
    pink: 'bg-[#fff2f9] dark:bg-pink-950',
    slate: 'bg-[#f8fafc] dark:bg-slate-950',
    neon: 'bg-[#0f0a1a] dark:bg-[#050010]',
  };

  const atmosphereGlows: Record<string, string> = {
    indigo: 'bg-indigo-500/20',
    rose: 'bg-rose-500/20',
    emerald: 'bg-emerald-500/20',
    violet: 'bg-purple-600/20',
    amber: 'bg-orange-500/20',
    cyan: 'bg-cyan-400/20',
    pink: 'bg-pink-400/20',
    neon: 'bg-fuchsia-600/30',
  };

  const currentWallpaper = WALLPAPERS.find(w => w.id === themeConfig.wallpaper) || WALLPAPERS[0];
  const staticFallback = WALLPAPERS.find(w => w.type === 'image' && w.id !== 'none') || currentWallpaper;
  
  // On mobile (staticOnly), we allow Photos (type: image), Moods, and video wallpapers
  const effectiveWallpaper = staticOnly
    ? (WALLPAPERS.find(w => (w.type === 'image' || w.category === 'Moods' || w.type === 'video') && w.id === themeConfig.wallpaper) || staticFallback)
    : currentWallpaper;
  const baseClass = baseBackgrounds[themeConfig.atmosphere] || baseBackgrounds.indigo;
  const currentGlow = atmosphereGlows[themeConfig.atmosphere] || atmosphereGlows.indigo;

  // Granular Filter String
  const filterStyle = `blur(${themeConfig.blur}px) brightness(${themeConfig.brightness / 100}) saturate(${themeConfig.saturation / 100})`;

  const renderWallpaper = () => {
    const isEnabled = themeConfig.wallpaper !== 'none';
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const rawUrl = themeConfig.wallpaper === 'custom' ? themeConfig.customWallpaperUrl : effectiveWallpaper.url;
    
    // Optimize Unsplash URLs for mobile - use 1080 for clarity on Retina screens
    const finalUrl = isMobile && rawUrl?.includes('unsplash.com') 
      ? rawUrl.replace('w=2000', 'w=1080') 
      : rawUrl;

    return (
      <div className={`fixed inset-0 pointer-events-none -z-20 transition-colors duration-400 ${baseClass}`} style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}>
        {!reduceMotion && (
          <style>
            {`
              @keyframes mobile-breathing {
                0%, 100% { transform: scale(1.05) translate(0%, 0%); }
                25% { transform: scale(1.08) translate(1%, 1%); }
                50% { transform: scale(1.1) translate(-1%, 0%); }
                75% { transform: scale(1.08) translate(0%, -1%); }
              }
              @keyframes aurora-wave-fast {
                0%, 100% { transform: skewX(-20deg) translateX(-10%); opacity: 0.4; }
                50% { transform: skewX(-15deg) translateX(10%); opacity: 0.8; }
              }
              @keyframes twinkle-star-vibrant {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.8); }
              }
              @keyframes neon-rain {
                0% { transform: translateY(-100vh); opacity: 0; }
                50% { opacity: 1; }
                100% { transform: translateY(100vh); opacity: 0; }
              }
              @keyframes zen-ripple {
                0% { transform: scale(0.8); opacity: 0; }
                50% { opacity: 0.5; }
                100% { transform: scale(1.5); opacity: 0; }
              }
              @keyframes mood-shift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              @keyframes cd-drift-1 {
                0%, 100% { transform: translate(0%, 0%) scale(1); }
                33% { transform: translate(12%, -8%) scale(1.1); }
                66% { transform: translate(-6%, 14%) scale(0.9); }
              }
              @keyframes cd-drift-2 {
                0%, 100% { transform: translate(0%, 0%) scale(1); }
                33% { transform: translate(-10%, 10%) scale(0.95); }
                66% { transform: translate(8%, -12%) scale(1.08); }
              }
              @keyframes cd-drift-3 {
                0%, 100% { transform: translate(0%, 0%) scale(1); }
                33% { transform: translate(-8%, -14%) scale(1.05); }
                66% { transform: translate(14%, 6%) scale(0.92); }
              }
              @keyframes cd-drift-4 {
                0%, 100% { transform: translate(0%, 0%) scale(1); }
                33% { transform: translate(6%, 12%) scale(0.93); }
                66% { transform: translate(-14%, -8%) scale(1.12); }
              }
            `}
          </style>
        )}

        {isEnabled && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ filter: filterStyle, willChange: 'filter' }}>
            {/* Image / Video Wallpaper Layer */}
            <AnimatePresence mode="wait">
              {(effectiveWallpaper.type === 'image' || themeConfig.wallpaper === 'custom') && (
                <motion.div
                  key={themeConfig.wallpaper === 'custom' ? themeConfig.customWallpaperUrl : effectiveWallpaper.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                  className="absolute inset-0"
                >
                  <motion.div
                    style={{ 
                      x: isMobile ? 0 : imageX, 
                      y: isMobile ? 0 : imageY,
                      scale: isMobile ? 1 : 1.1,
                      backgroundImage: `url(${finalUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                    className={`absolute inset-[-5%] ${isMobile && !shouldReduceMotion ? 'animate-[mobile-breathing_40s_infinite_linear]' : ''}`}
                  />
                  <div className="absolute inset-0 bg-black/5 dark:bg-black/20" />
                </motion.div>
              )}
              {effectiveWallpaper.type === 'video' && (
                <motion.div
                  key={themeConfig.wallpaper}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                  className="absolute inset-0"
                >
                  <video
                    ref={videoRef}
                    muted
                    autoPlay
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ objectFit: 'cover' }}
                  >
                    <source src={VIDEO_WALLPAPERS[themeConfig.wallpaper]} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/5 dark:bg-black/20" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dynamic Focus Lens */}
            {!staticOnly && !reduceMotion && effectiveWallpaper.type === 'animated' && (
              <motion.div 
                style={{ left: lensX, top: lensY, willChange: "transform" }}
                className={`absolute w-[40vw] h-[40vw] rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 opacity-30 ${currentGlow}`}
              />
            )}

            {/* Animated Mesh */}
            {!staticOnly && !reduceMotion && themeConfig.wallpaper === 'mesh' && (
              <div className="absolute inset-0 overflow-hidden opacity-80">
                <motion.div style={{ x: meshX1, y: meshY1 }} className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full blur-[140px] bg-indigo-500/40" />
                <motion.div style={{ x: meshX2, y: meshY2 }} className="absolute bottom-[-10%] right-[-10%] w-[90%] h-[90%] rounded-full blur-[160px] bg-violet-600/30" />
                <motion.div style={{ x: meshX3, y: meshY3 }} className="absolute top-[10%] right-[5%] w-[50%] h-[50%] rounded-full blur-[120px] bg-cyan-400/20" />
              </div>
            )}

            {/* Arctic Aurora */}
            {!staticOnly && !reduceMotion && themeConfig.wallpaper === 'aurora' && (
              <div className="absolute inset-0 overflow-hidden">
                <motion.div style={{ x: auroraX }} className="absolute inset-x-[-20%] inset-y-0 flex justify-around opacity-60 blur-[80px]">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-1/5 h-[140%] bg-gradient-to-b from-cyan-400/40 via-indigo-500/30 to-transparent"
                        style={{ animation: `aurora-wave-fast ${8 + i * 2}s infinite ease-in-out`, animationDelay: `${i * 1.5}s` }}
                      />
                    ))}
                </motion.div>
              </div>
            )}

            {/* Cyber Library */}
            {!staticOnly && !reduceMotion && themeConfig.wallpaper === 'cyberpunk' && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1]" style={{ backgroundImage: 'linear-gradient(#f0f 1px, transparent 1px), linear-gradient(90deg, #f0f 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="absolute w-[1px] h-32 bg-gradient-to-b from-fuchsia-500 to-transparent"
                    style={{ left: `${(i * 8.3) + 2}%` }}
                  />
                ))}
              </div>
            )}

            {/* Chroma Drift */}
            {!staticOnly && !reduceMotion && themeConfig.wallpaper === 'chroma-drift' && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-[50%] opacity-80" style={{ filter: 'blur(50px)' }}>
                  <div className="absolute w-[55%] h-[55%] top-[5%] left-[5%] rounded-full opacity-80"
                    style={{ background: '#DF437A', animation: 'cd-drift-1 14s ease-in-out infinite' }} />
                  <div className="absolute w-[45%] h-[45%] bottom-[5%] right-[5%] rounded-full opacity-70"
                    style={{ background: '#3d57d6', animation: 'cd-drift-2 18s ease-in-out infinite' }} />
                  <div className="absolute w-[40%] h-[40%] top-[25%] right-[15%] rounded-full opacity-70"
                    style={{ background: '#a117fd', animation: 'cd-drift-3 12s ease-in-out infinite' }} />
                  <div className="absolute w-[45%] h-[45%] bottom-[10%] left-[10%] rounded-full opacity-60"
                    style={{ background: '#ec634b', animation: 'cd-drift-4 16s ease-in-out infinite' }} />
                </div>
              </div>
            )}

            {/* Zen Garden */}
            {!staticOnly && !reduceMotion && themeConfig.wallpaper === 'zen' && (
              <div className="absolute inset-0 overflow-hidden">
                <svg className="absolute inset-0 w-full h-full opacity-[0.12] dark:opacity-[0.2]" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {[...Array(20)].map((_, i) => (
                    <line key={i} x1="0" y1={i * 5.3} x2="100" y2={i * 5.3 + 10} stroke="currentColor" strokeWidth="0.3" className="text-indigo-500" />
                  ))}
                  {[...Array(20)].map((_, i) => (
                    <line key={i} x1={i * 5.3} y1="0" x2={i * 5.3 + 10} y2="100" stroke="currentColor" strokeWidth="0.2" className="text-indigo-400" />
                  ))}
                </svg>
                <div className="absolute top-1/3 left-1/3 w-12 h-12 rounded-full bg-slate-400/15 dark:bg-slate-300/10" />
                <div className="absolute bottom-1/4 right-1/4 w-8 h-8 rounded-full bg-slate-400/10 dark:bg-slate-300/8" />
                <div className="absolute top-1/4 right-1/3 w-6 h-6 rounded-full bg-slate-400/8 dark:bg-slate-300/6" />
                <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="absolute rounded-full bg-indigo-500/8 dark:bg-indigo-400/10 border border-indigo-500/25 dark:border-indigo-400/30"
                      style={{
                        width: `${(i + 1) * 280}px`,
                        height: `${(i + 1) * 280}px`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Deep Space */}
            {!staticOnly && !reduceMotion && themeConfig.wallpaper === 'stardust' && (
              <motion.div style={{ x: starX, y: starY }} className="absolute inset-[-10%]">
                {[...Array(40)].map((_, i) => (
                  <div key={i} className="absolute w-1.5 h-1.5 bg-white rounded-full"
                    style={{ 
                      left: (Math.abs(Math.sin(i * 1337)) * 100) + "%", 
                      top: (Math.abs(Math.cos(i * 7331)) * 100) + "%",
                      boxShadow: '0 0 10px rgba(255,255,255,0.5)'
                    }}
                  />
                ))}
              </motion.div>
            )}

            {/* Focus Dots */}
            {!staticOnly && !reduceMotion && themeConfig.wallpaper === 'dots' && (
              <motion.div style={{ x: dotsX, y: dotsY, backgroundImage: `radial-gradient(circle at center, #6366f1 2px, transparent 2px)`, backgroundSize: '56px 56px' }}
                className="absolute inset-[-20%] opacity-[0.2] dark:opacity-[0.35]" 
              />
            )}

            {/* Clean Solid */}
            {!shouldReduceMotion && themeConfig.wallpaper === 'minimal' && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-indigo-500/8 dark:to-indigo-400/15" />
                <div className="absolute inset-0 bg-radial-[circle_at_center] from-transparent via-transparent to-slate-950/30 dark:to-black/50" />
              </div>
            )}

            {/* Moods (CSS Gradient Collection) — no parallax / no mouse tracking */}
            {effectiveWallpaper.category === 'Moods' && (
              <div
                className={`absolute inset-0 ${!staticOnly && MOOD_ANIMATED.has(themeConfig.wallpaper) ? 'animate-mood-shift' : ''}`}
                style={{
                  background: MOOD_GRADIENTS[themeConfig.wallpaper] || MOOD_GRADIENTS['ember-glow'],
                  backgroundSize: !staticOnly && MOOD_ANIMATED.has(themeConfig.wallpaper) ? '200% 200%' : '100% 100%',
                  animationDuration: '20s',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                }}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {useMemo(() => renderWallpaper(), [themeConfig, lensX, lensY, imageX, imageY])}
      {/* Theme-aware overlay — blends wallpaper with UI */}
      <div
        className="wallpaper-overlay"
        style={{
          opacity: visible && themeConfig.wallpaper !== 'none' ? 1 : 0,
          transition: 'opacity 1s ease',
        }}
      />
    </>
  );
};
