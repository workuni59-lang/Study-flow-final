import React, { useMemo } from 'react';
import { useStudy } from '../../context/StudyContext';

export const WallpaperEngine = () => {
  const { themeConfig } = useStudy();

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

  const baseClass = baseBackgrounds[themeConfig.atmosphere] || baseBackgrounds.indigo;

  // Use pure CSS for animations to prevent JS thread lag
  const renderWallpaper = () => {
    return (
      <div className={`fixed inset-0 pointer-events-none -z-20 transition-colors duration-1000 ${baseClass}`}>
        <style>
          {`
            @keyframes drift {
              0% { transform: translate3d(0, 0, 0) scale(1); }
              50% { transform: translate3d(50px, 30px, 0) scale(1.1); }
              100% { transform: translate3d(0, 0, 0) scale(1); }
            }
            @keyframes pulse-slow {
              0%, 100% { opacity: 0.1; transform: scale(1); }
              50% { opacity: 0.3; transform: scale(1.2); }
            }
            @keyframes twinkle {
              0%, 100% { opacity: 0.1; }
              50% { opacity: 0.5; }
            }
            .animate-drift { animation: drift 20s infinite linear; }
            .animate-pulse-slow { animation: pulse-slow 10s infinite ease-in-out; }
            .animate-twinkle { animation: twinkle 4s infinite ease-in-out; }
          `}
        </style>

        {/* Mesh: High-performance CSS drift */}
        {themeConfig.wallpaper === 'mesh' && (
          <div className="absolute inset-0 overflow-hidden opacity-40">
            <div className="absolute -top-1/4 -left-1/4 w-full h-full rounded-full blur-[120px] bg-indigo-500/20 animate-drift" />
            <div className="absolute -bottom-1/4 -right-1/4 w-full h-full rounded-full blur-[120px] bg-violet-600/20 animate-drift" style={{ animationDirection: 'reverse', animationDuration: '25s' }} />
          </div>
        )}

        {/* Aurora: Pure CSS gradient pulses */}
        {themeConfig.wallpaper === 'aurora' && (
          <div className="absolute inset-0 overflow-hidden opacity-60">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyan-400/10 to-transparent blur-[120px] animate-pulse-slow" />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-indigo-400/10 to-transparent blur-[140px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
          </div>
        )}

        {/* Stardust: Static grid with twinkle for zero lag */}
        {themeConfig.wallpaper === 'stardust' && (
          <div className="absolute inset-0 opacity-60">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white] animate-twinkle"
                style={{ 
                  left: (Math.sin(i * 123) * 50 + 50) + "%", 
                  top: (Math.cos(i * 456) * 50 + 50) + "%",
                  animationDelay: (i * 0.5) + "s"
                }}
              />
            ))}
          </div>
        )}

        {/* Dots: Standard geometric grid */}
        {themeConfig.wallpaper === 'dots' && (
          <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.15]" 
            style={{ 
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} 
          />
        )}
      </div>
    );
  };

  return useMemo(() => renderWallpaper(), [themeConfig.wallpaper, themeConfig.atmosphere]);
};
