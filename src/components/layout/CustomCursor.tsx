import { useEffect, useRef, useState } from 'react';
import { useReduceMotion } from '../../hooks/useReduceMotion';

interface CursorConfig {
  size: number;
  style: 'ring' | 'halo' | 'dot';
  color: 'accent' | 'white' | 'auto';
}

const DEFAULT_CONFIG: CursorConfig = { size: 32, style: 'ring', color: 'accent' };

const getConfig = (): CursorConfig => {
  try {
    const stored = localStorage.getItem('sf_cursor_config');
    if (stored) return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_CONFIG;
};

export const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReduceMotion();
  const requestRef = useRef<number>(0);
  const mouseRef = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  const [config, setConfig] = useState<CursorConfig>(getConfig);

  useEffect(() => {
    if (reduceMotion) return;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const getAccent = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--theme-accent').trim() || '#818cf8';

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -100, y: -100 };
      ringPos.current = { x: -100, y: -100 };
      const off = 'translate(-100px, -100px)';
      if (dotRef.current) dotRef.current.style.transform = off;
      if (ringRef.current) ringRef.current.style.transform = off;
      if (glowRef.current) {
        glowRef.current.style.transform = off;
        glowRef.current.style.opacity = '0';
      }
    };

    const handleHoverOn = () => {
      setHovered(true);
      if (ringRef.current) {
        const sz = config.size + 12;
        ringRef.current.style.width = `${sz}px`;
        ringRef.current.style.height = `${sz}px`;
        ringRef.current.style.marginLeft = `${-sz / 2}px`;
        ringRef.current.style.marginTop = `${-sz / 2}px`;
        ringRef.current.style.borderWidth = '2px';
        ringRef.current.style.opacity = '0.8';
      }
      if (dotRef.current) {
        dotRef.current.style.width = '4px';
        dotRef.current.style.height = '4px';
      }
    };

    const handleHoverOff = () => {
      setHovered(false);
      if (ringRef.current) {
        const sz = config.size;
        ringRef.current.style.width = `${sz}px`;
        ringRef.current.style.height = `${sz}px`;
        ringRef.current.style.marginLeft = `${-sz / 2}px`;
        ringRef.current.style.marginTop = `${-sz / 2}px`;
        ringRef.current.style.borderWidth = '1.5px';
        ringRef.current.style.opacity = '0.5';
      }
      if (dotRef.current) {
        dotRef.current.style.width = '8px';
        dotRef.current.style.height = '8px';
      }
    };

    const hoverTargets = 'a, button, [role="button"], input, select, textarea, label, [tabindex]:not([tabindex="-1"])';

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave, { passive: true });

    document.addEventListener('mouseover', (e) => {
      const target = (e.target as Element).closest(hoverTargets);
      if (target) handleHoverOn();
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
      const target = (e.target as Element).closest(hoverTargets);
      if (target) handleHoverOff();
    }, { passive: true });

    const animate = () => {
      const ease = hovered ? 0.18 : 0.1;
      ringPos.current.x += (mouseRef.current.x - ringPos.current.x) * ease;
      ringPos.current.y += (mouseRef.current.y - ringPos.current.y) * ease;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`;
      }
      if (glowRef.current) {
        const accent = getAccent();
        glowRef.current.style.background = `radial-gradient(40px circle at center, ${accent}33 0%, transparent 70%)`;
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    const handleConfigChange = () => setConfig(getConfig());
    window.addEventListener('storage', handleConfigChange as EventListener);
    document.addEventListener('cursorConfigChange', handleConfigChange as EventListener);

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('storage', handleConfigChange as EventListener);
      document.removeEventListener('cursorConfigChange', handleConfigChange as EventListener);
    };
  }, [reduceMotion, config.size, config.style, hovered]);

  if (reduceMotion) return null;

  const accentColor = config.color === 'white' ? '#ffffff' : 'var(--theme-accent, #818cf8)';
  const ringBorder = config.style === 'ring' ? `1.5px solid ${accentColor}` : 'none';
  const ringBg = config.style === 'halo' ? `${accentColor}1a` : 'transparent';
  const dotVisible = config.style !== 'dot' ? true : false;

  return (
    <>
      {config.style !== 'dot' && (
        <div
          ref={dotRef}
          className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999]"
          style={{
            width: dotVisible ? 8 : 0,
            height: dotVisible ? 8 : 0,
            backgroundColor: accentColor,
            transform: 'translate(-100px, -100px)',
            transition: 'width 0.15s, height 0.15s, background-color 0.3s, opacity 0.15s',
            willChange: 'transform',
            opacity: dotVisible ? 1 : 0,
            marginLeft: dotVisible ? -4 : 0,
            marginTop: dotVisible ? -4 : 0,
            boxShadow: `0 0 6px ${accentColor}66`,
          }}
        />
      )}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9998]"
        style={{
          width: config.size,
          height: config.size,
          marginLeft: -config.size / 2,
          marginTop: -config.size / 2,
          borderRadius: '50%',
          border: ringBorder,
          backgroundColor: ringBg,
          opacity: 0.5,
          transform: 'translate(-100px, -100px)',
          transition: 'width 0.2s, height 0.2s, margin 0.2s, border-color 0.3s, opacity 0.2s, background-color 0.3s',
          willChange: 'transform',
          backdropFilter: config.style === 'halo' ? 'blur(4px)' : 'none',
        }}
      />
      <div
        ref={glowRef}
        className="fixed top-0 left-0 pointer-events-none z-[9997]"
        style={{
          width: 80,
          height: 80,
          marginLeft: -40,
          marginTop: -40,
          borderRadius: '50%',
          transform: 'translate(-100px, -100px)',
          opacity: 0.4,
          transition: 'opacity 0.3s',
          willChange: 'transform, background',
        }}
      />
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          body, a, button, [role="button"], input, select, textarea, label {
            cursor: none !important;
          }
        }
      `}</style>
    </>
  );
};
