import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import type { PetMood, PetPerformanceTier, PetColors } from '../../lib/pets/types';
import { useStudy } from '../../context/StudyContext';

// ── Color Helpers ──

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.min(255, r + amount)},${Math.min(255, g + amount)},${Math.min(255, b + amount)})`;
}

function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.max(0, r - amount)},${Math.max(0, g - amount)},${Math.max(0, b - amount)})`;
}

// ── Web Audio SFX Engine ──
// Uses raw AudioContext with simple setValueAtTime + linearRampToValueAtTime
// to avoid StrictMode/autoplay issues.

function createAudioEngine() {
  let ctx: AudioContext | null = null;

  function getCtx(): AudioContext {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(
    freq: number,
    freqEnd: number | null,
    duration: number,
    volume: number,
    type: OscillatorType = 'sine',
  ) {
    const c = getCtx();
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (freqEnd !== null) osc.frequency.linearRampToValueAtTime(freqEnd, now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.linearRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + duration + 0.001);
  }

  return {
    jump() {
      tone(400, 1200, 0.15, 0.25);
    },
    land() {
      tone(120, 40, 0.12, 0.30);
    },
    purr(volume = 0.02) {
      const c = getCtx();
      const now = c.currentTime;
      const osc = c.createOscillator();
      const gain = c.createGain();
      const lfo = c.createOscillator();
      const lfoGain = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, now);
      lfo.type = 'triangle';
      lfo.frequency.setValueAtTime(3.8, now);
      lfoGain.gain.setValueAtTime(0.5, now);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.linearRampToValueAtTime(volume * 0.7, now + 1.5);
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(now);
      lfo.start(now);
      return () => {
        gain.gain.linearRampToValueAtTime(0.001, c.currentTime + 0.3);
        setTimeout(() => { osc.stop(); lfo.stop(); }, 400);
      };
    },
    prime() {
      getCtx();
    },
    dispose() {
      if (ctx) { ctx.close(); }
      ctx = null;
    }
  };
}

// ── Breathing Variation Generator ──
// Returns a stable random seed, updates every 5-10s for subtle organic shifts

function useBreathingAmplitude() {
  const [amp, setAmp] = useState(1);

  useEffect(() => {
    function next() {
      const dur = 5000 + Math.random() * 5000;
      const target = 0.85 + Math.random() * 0.3;
      setAmp(target);
      return setTimeout(next, dur);
    }
    const t = setTimeout(next, 2000);
    return () => clearTimeout(t);
  }, []);

  return amp;
}

// ── Component ──

interface NovaMascotProps {
  mood: PetMood;
  tier: PetPerformanceTier;
  colors: PetColors;
}

export const NovaMascot = ({ mood, tier, colors }: NovaMascotProps) => {
  const { levelUpEvent } = useStudy();
  const isDormant = mood === 'asleep';
  const isStressed = mood === 'tired';
  const isFocused = mood === 'neutral';
  const isExcited = mood === 'excited';
  const uniqueId = useMemo(() => `nova_${mood}_${tier}`, [mood, tier]);
  const prevLevelUp = useRef(levelUpEvent);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [celebrationPhase, setCelebrationPhase] = useState<'idle' | 'anticipate' | 'takeoff' | 'landing'>('idle');
  const breatheAmp = useBreathingAmplitude();
  const audioRef = useRef<ReturnType<typeof createAudioEngine>>(null!);
  const purrCleanup = useRef<(() => void) | null>(null);

  // ── Audio Engine Lifecycle ──

  useEffect(() => {
    audioRef.current = createAudioEngine();
    function onFirstInteraction() {
      audioRef.current?.prime();
      document.removeEventListener('pointerdown', onFirstInteraction);
      document.removeEventListener('keydown', onFirstInteraction);
    }
    document.addEventListener('pointerdown', onFirstInteraction);
    document.addEventListener('keydown', onFirstInteraction);
    return () => {
      if (purrCleanup.current) purrCleanup.current();
      audioRef.current?.dispose();
      document.removeEventListener('pointerdown', onFirstInteraction);
      document.removeEventListener('keydown', onFirstInteraction);
    };
  }, []);

  // ── Sleep Purr ──

  useEffect(() => {
    if (isDormant) {
      const stop = audioRef.current?.purr(0.025);
      if (stop) purrCleanup.current = stop;
    } else if (purrCleanup.current) {
      purrCleanup.current();
      purrCleanup.current = null;
    }
    return () => {
      if (purrCleanup.current) {
        purrCleanup.current();
        purrCleanup.current = null;
      }
    };
  }, [isDormant]);

  // ── Blink (no audio — visual only, user heard beep from blink) ──

  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (isDormant) return;
    const baseInterval = isExcited ? 1800 : isFocused ? 5000 : 3500;
    const blinkLoop = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 100);
    }, baseInterval + Math.random() * 2000);
    return () => clearInterval(blinkLoop);
  }, [mood, isDormant, isExcited, isFocused]);

  // ── Level-Up → Celebration Cycle ──

  const celebrateTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (levelUpEvent !== null && levelUpEvent !== prevLevelUp.current) {
      prevLevelUp.current = levelUpEvent;
      startCelebration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelUpEvent]);

  const startCelebration = useCallback(() => {
    // Clear any stale timers from a previous celebration
    celebrateTimers.current.forEach(clearTimeout);
    celebrateTimers.current = [];

    setIsCelebrating(true);
    setCelebrationPhase('anticipate');
    audioRef.current?.jump();

    const t1 = setTimeout(() => setCelebrationPhase('takeoff'), 180);
    const t2 = setTimeout(() => {
      setCelebrationPhase('landing');
      audioRef.current?.land();
    }, 380);
    const t3 = setTimeout(() => {
      setCelebrationPhase('idle');
      setIsCelebrating(false);
    }, 950);

    celebrateTimers.current = [t1, t2, t3];
  }, []);

  // ── Inertial Parallax Motion Values ──

  const bodyY = useMotionValue(0);
  const springCrest = useSpring(bodyY, { stiffness: 160, damping: 8, mass: 1.4 });
  const springFace = useSpring(bodyY, { stiffness: 220, damping: 14, mass: 0.8 });
  const crestY = useTransform(springCrest, (v) => v * 0.6);
  const faceY = useTransform(springFace, (v) => v * -0.4);

  // ── Phase-based animation targets ──
  // Container handles Y only; body group handles scale (no SVG distortion)

  const containerCelebrateY =
    celebrationPhase === 'takeoff' ? -22 :
    celebrationPhase === 'landing' ? [-22, 3, -3, 0] :
    0;

  const bodyCelebrateScaleY =
    celebrationPhase === 'anticipate' ? 0.90 :
    celebrationPhase === 'takeoff' ? 1.12 :
    celebrationPhase === 'landing' ? [1.12, 0.90, 0.97, 1.0] :
    undefined;

  const bodyCelebrateScaleX =
    celebrationPhase === 'anticipate' ? 1.10 :
    celebrationPhase === 'takeoff' ? 0.91 :
    celebrationPhase === 'landing' ? [0.91, 1.10, 1.02, 1.0] :
    undefined;

  // ── Memoised variants ──

  const breathDur = useRef(isDormant ? 4.5 : isStressed ? 3.5 : 2.8);
  const breathDelay = useRef(0);

  const containerVariants = useMemo(() => ({
    idle: {
      y: [0, -2.5 * breatheAmp, 0],
      transition: {
        duration: breathDur.current,
        ease: 'easeInOut',
        repeat: Infinity,
        delay: breathDelay.current,
      }
    },
    celebrate: {
      y: containerCelebrateY,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 28,
        mass: 0.6,
      },
    },
  }), [breatheAmp, containerCelebrateY, isDormant, isStressed]);

  const bodyVariants = useMemo(() => ({
    base: { scaleY: 1, scaleX: 1 },
    asleep: {
      scaleY: [0.96, 1.01, 0.96],
      scaleX: [1.02, 0.99, 1.02],
      transition: { duration: 4.5, ease: 'easeInOut', repeat: Infinity },
    },
    excited: {
      scaleY: [0.97 * breatheAmp, 1.06 * breatheAmp, 0.97 * breatheAmp],
      scaleX: [1.03 / breatheAmp, 0.95 / breatheAmp, 1.03 / breatheAmp],
      transition: { duration: 1.2, ease: 'easeInOut', repeat: Infinity },
    },
    neutral: {
      scaleY: 1.01,
      scaleX: 0.99,
      transition: { duration: 0.4 },
    },
    tired: {
      scaleY: [0.94, 0.97 * breatheAmp, 0.94],
      scaleX: [1.04, 1.01 / breatheAmp, 1.04],
      y: [0, 1.5 * breatheAmp, 0],
      transition: { duration: 3.5, ease: 'easeInOut', repeat: Infinity },
    },
    celebrate: {
      scaleY: bodyCelebrateScaleY,
      scaleX: bodyCelebrateScaleX,
      transition: {
        type: 'spring',
        stiffness: 600,
        damping: 30,
        mass: 0.5,
      },
    },
  }), [breatheAmp, bodyCelebrateScaleX, bodyCelebrateScaleY]);

  const crestVariants = useMemo(() => ({
    idle: {
      rotate: [0, 3 * breatheAmp, -2 * breatheAmp, 0],
      transition: { duration: 4, ease: 'easeInOut', repeat: Infinity },
    },
    excited: {
      rotate: [0, 8 * breatheAmp, -6 * breatheAmp, 0],
      transition: { duration: 1.2, ease: 'easeInOut', repeat: Infinity },
    },
    asleep: { rotate: -3, opacity: 0.4 },
  }), [breatheAmp]);

  const faceVariants = useMemo(() => ({
    idle: { y: 0, scale: 1 },
    excited: { y: -0.5 * breatheAmp, scale: 1.01 },
    tired: { y: 1 * breatheAmp, scale: 0.99 },
    asleep: { y: 1.5, opacity: 0.3 },
  }), [breatheAmp]);

  const glowVariants = useMemo(() => ({
    animate: {
      opacity: isCelebrating
        ? [0.4, 0.9, 0.4]
        : isExcited
        ? [0.3, 0.55 * breatheAmp, 0.3]
        : [0.15, 0.28 * breatheAmp, 0.15],
      scale: isCelebrating
        ? [1, 1.3, 1]
        : isExcited
        ? [1, 1.08 * breatheAmp, 1]
        : [1, 1.03 * breatheAmp, 1],
      transition: {
        duration: isCelebrating ? 0.35 : 2.5 * breatheAmp,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }), [breatheAmp, isCelebrating, isExcited]);

  const bodyAnimate = isCelebrating
    ? 'celebrate'
    : isDormant
    ? 'asleep'
    : mood;

  const crestAnimate = isCelebrating
    ? 'idle'
    : isExcited
    ? 'excited'
    : isDormant
    ? 'asleep'
    : 'idle';

  const faceAnimate = isCelebrating
    ? 'idle'
    : isDormant
    ? 'asleep'
    : mood;

  // ── Render ──

  return (
    <motion.div
      className="relative w-full h-full select-none"
      variants={containerVariants}
      animate={isCelebrating ? 'celebrate' : 'idle'}
      onUpdate={(latest: any) => {
        if (latest.y !== undefined) bodyY.set(latest.y);
      }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id={`novaBodyGrad_${uniqueId}`} x1="50" y1="13" x2="50" y2="88" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={lighten(colors.body, 120)} />
            <stop offset="35%" stopColor={colors.body} />
            <stop offset="100%" stopColor={darken(colors.accent, 40)} />
          </linearGradient>

          <linearGradient id={`novaFaceGrad_${uniqueId}`} x1="50" y1="38" x2="50" y2="83" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF9D7" />
            <stop offset="65%" stopColor={lighten(colors.body, 60)} />
            <stop offset="100%" stopColor={darken(colors.body, 20)} />
          </linearGradient>

          <radialGradient id={`novaHighlightGrad_${uniqueId}`} cx="50" cy="30" r="60">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`novaBlushGrad_${uniqueId}`} cx="50" cy="50" r="50">
            <stop offset="0%" stopColor={colors.accent} stopOpacity="0.45" />
            <stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`novaShadowGrad_${uniqueId}`} cx="50" cy="88" r="50">
            <stop offset="0%" stopColor="#1E0A00" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1E0A00" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* LAYER 0: Ground Shadow */}
        <motion.ellipse
          cx="50"
          cy="88"
          rx="26"
          ry="6.5"
          fill={`url(#novaShadowGrad_${uniqueId})`}
          animate={{
            scaleX: isCelebrating
              ? [1, 0.7, 1.15, 0.95, 1]
              : isExcited
              ? [0.96, 1.04, 0.96]
              : [1, 1.03, 1],
            opacity: isCelebrating
              ? [0.6, 0.2, 0.7, 0.5, 0.6]
              : isDormant
              ? 0.2
              : 0.45,
          }}
          transition={{ duration: isCelebrating ? 0.8 : 2.8, ease: 'easeInOut', repeat: isCelebrating ? 0 : Infinity }}
        />

        {/* LAYER 1: Flame Crest (parallax) */}
        <motion.g style={{ y: crestY }}>
          <motion.path
            d="M54,13C62,6 70,12 68,24C66,32 58,38 55,42C58,32 58,20 54,13Z"
            fill={darken(colors.accent, 60)}
            style={{ originX: '54px', originY: '42px' }}
            variants={crestVariants}
            animate={crestAnimate}
          />
        </motion.g>

        {/* LAYER 2: Main Body (scale applied here, not on container) */}
        <motion.g
          style={{ originX: '50px', originY: '88px' }}
          variants={bodyVariants}
          animate={bodyAnimate}
        >
          <path
            d="M54,13C42,18 21,36 21,63C21,84 37,88 50,88C63,88 79,84 79,63C79,38 65,18 54,13Z"
            fill={`url(#novaBodyGrad_${uniqueId})`}
            opacity={isDormant ? 0.35 : 1}
          />

          <path
            d="M54,13C42,18 21,36 21,63C21,84 37,88 50,88C63,88 79,84 79,63C79,38 65,18 54,13Z"
            fill={`url(#novaHighlightGrad_${uniqueId})`}
          />

          {/* Face Mask (parallax) */}
          <motion.g style={{ y: faceY, originX: '50px', originY: '83px' }}>
            <motion.path
              d="M50,38C34,38 26,48 26,65C26,79 37,83 50,83C63,83 74,79 74,65C74,48 66,38 50,38Z"
              fill={`url(#novaFaceGrad_${uniqueId})`}
              variants={faceVariants}
              animate={faceAnimate}
            />
          </motion.g>

          {/* Blush + Forehead Spark */}
          <AnimatePresence>
            {!isDormant && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: isExcited ? 0.95 : 0.75 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <ellipse cx="33.5" cy="62" rx="4.5" ry="3" fill={`url(#novaBlushGrad_${uniqueId})`} />
                <ellipse cx="66.5" cy="62" rx="4.5" ry="3" fill={`url(#novaBlushGrad_${uniqueId})`} />
                <path d="M64,28Q64,31 66,32Q64,33 64,36Q64,33 62,32Q64,31 64,28Z" fill="#FFFFFF" opacity="0.55" />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Mouth */}
          <g fill="#2D1A11">
            <AnimatePresence mode="wait">
              {isDormant && (
                <motion.path
                  key="mouth_asleep"
                  d="M47,62 Q50,64 53,62"
                  fill="none"
                  stroke="#2D1A11"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  exit={{ pathLength: 0 }}
                />
              )}

              {!isDormant && isExcited && (
                <motion.path
                  key="mouth_excited"
                  d="M44,59.5Q50,67 56,59.5Z"
                  initial={{ scale: 0.3, y: 1 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.3, y: 1 }}
                />
              )}

              {!isDormant && mood === 'happy' && (
                <motion.path
                  key="mouth_happy"
                  d="M44.5,60Q47.25,62.5 50,60Q52.75,62.5 55.5,60"
                  fill="none"
                  stroke="#2D1A11"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}

              {!isDormant && isFocused && (
                <motion.path
                  key="mouth_focused"
                  d="M45,61.5 L55,61.5"
                  fill="none"
                  stroke="#2D1A11"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0 }}
                  style={{ originX: '50px' }}
                />
              )}

              {!isDormant && isStressed && (
                <motion.circle
                  key="mouth_tired"
                  cx="50"
                  cy="61.5"
                  r="2.2"
                  fill="none"
                  stroke="#2D1A11"
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                />
              )}
            </AnimatePresence>
          </g>

          {/* Eyes */}
          <g fill="#2D1A11">
            <AnimatePresence mode="flatten">
              {isDormant ? (
                <g stroke="#2D1A11" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.75">
                  <path d="M38,53 Q41,56 44,53" />
                  <path d="M56,53 Q59,56 62,53" />
                </g>
              ) : isBlinking ? (
                <g stroke="#2D1A11" strokeWidth="2.5" strokeLinecap="round" fill="none">
                  <line x1="38" y1="54" x2="44" y2="54" />
                  <line x1="56" y1="54" x2="62" y2="54" />
                </g>
              ) : isFocused ? (
                <g>
                  <path d="M38,51C37.5,51 37,51.5 37,52L37,55C37,56.5 38,57.5 39.5,57.5L42.5,57.5C44,57.5 45,56.5 45,55L45,52C45,51.5 44.5,51 44,51L38,51Z" />
                  <path d="M56,51C55.5,51 55,51.5 55,52L55,55C55,56.5 56,57.5 57.5,57.5L60.5,57.5C62,57.5 63,56.5 63,55L63,52C63,51.5 62.5,51 62,51L56,51Z" />
                  <path d="M36,47.5 L45,50" stroke="#2D1A11" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M64,47.5 L55,50" stroke="#2D1A11" strokeWidth="2.2" strokeLinecap="round" />
                </g>
              ) : (
                <g>
                  <motion.path
                    d="M41,49C39.5,49 38.5,50 38.5,51.5L38.5,56.5C38.5,58 39.5,59 41,59L42,59C43.5,59 44.5,58 44.5,56.5L44.5,51.5C44.5,50 43.5,49 42,49L41,49Z"
                    layoutId="left_eye"
                  />
                  <motion.path
                    d="M59,49C57.5,49 56.5,50 56.5,51.5L56.5,56.5C56.5,58 57.5,59 59,59L60,59C61.5,59 62.5,58 62.5,56.5L62.5,51.5C62.5,50 61.5,49 60,49L59,49Z"
                    layoutId="right_eye"
                  />
                </g>
              )}
            </AnimatePresence>
          </g>

          {/* Accessory Mount Points */}
          <g id="nova-head-anchor" transform="translate(54, 13)" />
          <g id="nova-face-anchor" transform="translate(50, 54)" />
          <g id="nova-neck-anchor" transform="translate(50, 78)" />
        </motion.g>
      </svg>

      {/* Ambient Glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-full"
        variants={glowVariants}
        animate="animate"
        style={{
          background: `radial-gradient(circle, ${colors.glow || '#FFD500'}44 0%, transparent 72%)`,
          filter: 'blur(16px)',
          zIndex: -1
        }}
      />
    </motion.div>
  );
};
