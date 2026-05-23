import React, { useState, useEffect, useMemo } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'motion/react';
import { useStudy } from '../../context/StudyContext';

export const WallpaperEngine = () => {
  const { themeConfig } = useStudy();

  // Snappier Mouse Tracking (Reduced damping, higher stiffness)
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springX = useSpring(mouseX, { damping: 25, stiffness: 150 });
  const springY = useSpring(mouseY, { damping: 25, stiffness: 150 });

  // Drastically increased displacement ranges for dramatic "World Class" feel
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

  // High-intensity cursor lens
  const lensX = useTransform(springX, [0, 1], ["0%", "100%"]);
  const lensY = useTransform(springY, [0, 1], ["0%", "100%"]);

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
  };

  const atmosphereGlows: Record<string, string> = {
    indigo: 'bg-indigo-500/20',
    rose: 'bg-rose-500/20',
    emerald: 'bg-emerald-500/20',
    violet: 'bg-violet-600/20',
    amber: 'bg-amber-500/20',
    cyan: 'bg-cyan-400/20',
    pink: 'bg-pink-400/20',
  };

  const baseClass = baseBackgrounds[themeConfig.atmosphere] || baseBackgrounds.indigo;
  const currentGlow = atmosphereGlows[themeConfig.atmosphere] || atmosphereGlows.indigo;

  const renderWallpaper = () => {
    return (
      <div className={`fixed inset-0 pointer-events-none -z-20 transition-colors duration-1000 ${baseClass}`}>
        <style>
          {`
            @keyframes aurora-wave-fast {
              0%, 100% { transform: skewX(-20deg) translateX(-10%); opacity: 0.4; }
              50% { transform: skewX(-15deg) translateX(10%); opacity: 0.8; }
            }
            @keyframes twinkle-star-vibrant {
              0%, 100% { opacity: 0.3; transform: scale(1) shadow(0 0 2px white); }
              50% { opacity: 1; transform: scale(1.8) shadow(0 0 12px white); }
            }
          `}
        </style>

        {/* Dynamic Focus Lens (Always present, subtle but reactive) */}
        <motion.div 
          style={{ left: lensX, top: lensY, willChange: "transform" }}
          className={`absolute w-[40vw] h-[40vw] rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 opacity-30 ${currentGlow}`}
        />

        {/* Animated Mesh: High-displace Interactive Blobs */}
        {themeConfig.wallpaper === 'mesh' && (
          <div className="absolute inset-0 overflow-hidden opacity-80">
            <motion.div 
              style={{ x: meshX1, y: meshY1, willChange: "transform" }}
              className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full blur-[140px] bg-indigo-500/40 animate-pulse"
            />
            <motion.div 
              style={{ x: meshX2, y: meshY2, willChange: "transform" }}
              className="absolute bottom-[-10%] right-[-10%] w-[90%] h-[90%] rounded-full blur-[160px] bg-violet-600/30"
            />
            <motion.div 
              style={{ x: meshX3, y: meshY3, willChange: "transform" }}
              className="absolute top-[10%] right-[5%] w-[50%] h-[50%] rounded-full blur-[120px] bg-cyan-400/20"
            />
          </div>
        )}

        {/* Arctic Aurora: High-energy Shifting Panels */}
        {themeConfig.wallpaper === 'aurora' && (
          <div className="absolute inset-0 overflow-hidden">
             <motion.div 
               style={{ x: auroraX, willChange: "transform" }}
               className="absolute inset-x-[-20%] inset-y-0 flex justify-around opacity-60 blur-[80px]"
             >
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1/5 h-[140%] bg-gradient-to-b from-cyan-400/40 via-indigo-500/30 to-transparent"
                    style={{ 
                      animation: `aurora-wave-fast ${8 + i * 2}s infinite ease-in-out`,
                      animationDelay: `${i * 1.5}s`
                    }}
                  />
                ))}
             </motion.div>
             <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        )}

        {/* Deep Space: Extreme 3D Parallax */}
        {themeConfig.wallpaper === 'stardust' && (
          <motion.div 
            style={{ x: starX, y: starY, willChange: "transform" }}
            className="absolute inset-[-10%]"
          >
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 bg-white rounded-full"
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

        {/* Focus Dots: Dramatic Grid Tilt */}
        {themeConfig.wallpaper === 'dots' && (
          <motion.div 
            style={{ 
              x: dotsX, 
              y: dotsY,
              willChange: "transform",
              backgroundImage: `radial-gradient(circle at center, #6366f1 2px, transparent 2px)`,
              backgroundSize: '56px 56px'
            }}
            className="absolute inset-[-20%] opacity-[0.2] dark:opacity-[0.35]" 
          />
        )}

        {/* Clean Solid: Immersive Corner Glows */}
        {themeConfig.wallpaper === 'minimal' && (
          <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/5 dark:from-black/40 dark:to-white/5" />
        )}
      </div>
    );
  };

  return renderWallpaper();
};
