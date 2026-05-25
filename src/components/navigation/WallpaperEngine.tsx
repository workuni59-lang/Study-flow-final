import React, { useState, useEffect, useMemo } from 'react';
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { useStudy } from '../../context/StudyContext';
import { WALLPAPERS } from '../../lib/gamification';

export const WallpaperEngine = () => {
  const { themeConfig } = useStudy();

  // Mouse Tracking for Interactive Parallax
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springX = useSpring(mouseX, { damping: 25, stiffness: 150 });
  const springY = useSpring(mouseY, { damping: 25, stiffness: 150 });

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const baseBackgrounds: Record<string, string> = {
    indigo: 'bg-[#f8fafc] dark:bg-slate-950',
    rose: 'bg-[#fff5f5] dark:bg-[#1a0f0f]',
    emerald: 'bg-[#f2fcf5] dark:bg-[#0f1a13]',
    violet: 'bg-[#f8f5ff] dark:bg-[#130f1a]',
    amber: 'bg-[#fffbf2] dark:bg-[#1a160f]',
    cyan: 'bg-[#f2fbff] dark:bg-[#0f181a]',
    pink: 'bg-[#fff2f9] dark:bg-[#1a0f16]',
    slate: 'bg-[#f8fafc] dark:bg-slate-950',
    neon: 'bg-[#0f0a1a] dark:bg-[#050010]',
  };

  const atmosphereGlows: Record<string, string> = {
    indigo: 'bg-indigo-500/20',
    rose: 'bg-rose-500/20',
    emerald: 'bg-emerald-500/20',
    violet: 'bg-violet-600/20',
    amber: 'bg-amber-500/20',
    cyan: 'bg-cyan-400/20',
    pink: 'bg-pink-400/20',
    neon: 'bg-fuchsia-600/30',
  };

  const currentWallpaper = WALLPAPERS.find(w => w.id === themeConfig.wallpaper) || WALLPAPERS[0];
  const baseClass = baseBackgrounds[themeConfig.atmosphere] || baseBackgrounds.indigo;
  const currentGlow = atmosphereGlows[themeConfig.atmosphere] || atmosphereGlows.indigo;

  // Granular Filter String
  const filterStyle = `blur(${themeConfig.blur}px) brightness(${themeConfig.brightness / 100}) saturate(${themeConfig.saturation / 100})`;

  const renderWallpaper = () => {
    const isEnabled = themeConfig.wallpaper !== 'none';
    const finalUrl = themeConfig.wallpaper === 'custom' ? themeConfig.customWallpaperUrl : currentWallpaper.url;

    return (
      <div className={`fixed inset-0 pointer-events-none -z-20 transition-colors duration-1000 ${baseClass}`}>
        <style>
          {`
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
          `}
        </style>

        {isEnabled && (
          <div className="absolute inset-0 overflow-hidden" style={{ filter: filterStyle, willChange: 'filter' }}>
            {/* Image Wallpaper Layer */}
            <AnimatePresence mode="wait">
              {(currentWallpaper.type === 'image' || themeConfig.wallpaper === 'custom') && (
                <motion.div
                  key={themeConfig.wallpaper === 'custom' ? themeConfig.customWallpaperUrl : currentWallpaper.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                  className="absolute inset-0"
                >
                  <motion.div
                    style={{ 
                      x: imageX, 
                      y: imageY,
                      scale: 1.1,
                      backgroundImage: `url(${finalUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                    className="absolute inset-[-5%]"
                  />
                  <div className="absolute inset-0 bg-black/5 dark:bg-black/20" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dynamic Focus Lens */}
            {currentWallpaper.type === 'animated' && (
              <motion.div 
                style={{ left: lensX, top: lensY, willChange: "transform" }}
                className={`absolute w-[40vw] h-[40vw] rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 opacity-30 ${currentGlow}`}
              />
            )}

            {/* Animated Mesh */}
            {themeConfig.wallpaper === 'mesh' && (
              <div className="absolute inset-0 overflow-hidden opacity-80">
                <motion.div style={{ x: meshX1, y: meshY1 }} className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full blur-[140px] bg-indigo-500/40 animate-pulse" />
                <motion.div style={{ x: meshX2, y: meshY2 }} className="absolute bottom-[-10%] right-[-10%] w-[90%] h-[90%] rounded-full blur-[160px] bg-violet-600/30" />
                <motion.div style={{ x: meshX3, y: meshY3 }} className="absolute top-[10%] right-[5%] w-[50%] h-[50%] rounded-full blur-[120px] bg-cyan-400/20" />
              </div>
            )}

            {/* Arctic Aurora */}
            {themeConfig.wallpaper === 'aurora' && (
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
            {themeConfig.wallpaper === 'cyberpunk' && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1]" style={{ backgroundImage: 'linear-gradient(#f0f 1px, transparent 1px), linear-gradient(90deg, #f0f 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="absolute w-[1px] h-32 bg-gradient-to-b from-fuchsia-500 to-transparent"
                    style={{ left: `${(i * 8.3) + 2}%`, animation: `neon-rain ${2 + (i % 3)}s infinite linear`, animationDelay: `${i * 0.4}s` }}
                  />
                ))}
              </div>
            )}

            {/* Zen Garden */}
            {themeConfig.wallpaper === 'zen' && (
              <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
                 {[...Array(5)].map((_, i) => (
                   <div key={i} className="absolute border border-indigo-500/10 rounded-full"
                    style={{ width: `${(i + 1) * 300}px`, height: `${(i + 1) * 300}px`, animation: `zen-ripple ${10}s infinite ease-out`, animationDelay: `${i * 2}s` }}
                   />
                 ))}
              </div>
            )}

            {/* Deep Space */}
            {themeConfig.wallpaper === 'stardust' && (
              <motion.div style={{ x: starX, y: starY }} className="absolute inset-[-10%]">
                {[...Array(40)].map((_, i) => (
                  <div key={i} className="absolute w-1.5 h-1.5 bg-white rounded-full"
                    style={{ 
                      left: (Math.abs(Math.sin(i * 1337)) * 100) + "%", 
                      top: (Math.abs(Math.cos(i * 7331)) * 100) + "%",
                      animation: `twinkle-star-vibrant ${2 + (i % 4)}s infinite ease-in-out`,
                      animationDelay: `${i * 0.1}s`,
                      boxShadow: '0 0 10px rgba(255,255,255,0.5)'
                    }}
                  />
                ))}
              </motion.div>
            )}

            {/* Focus Dots */}
            {themeConfig.wallpaper === 'dots' && (
              <motion.div style={{ x: dotsX, y: dotsY, backgroundImage: `radial-gradient(circle at center, #6366f1 2px, transparent 2px)`, backgroundSize: '56px 56px' }}
                className="absolute inset-[-20%] opacity-[0.2] dark:opacity-[0.35]" 
              />
            )}
          </div>
        )}
      </div>
    );
  };

  return useMemo(() => renderWallpaper(), [themeConfig, lensX, lensY, imageX, imageY]);
};
