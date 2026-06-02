import { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { motion } from 'motion/react';
import { PawPrint } from 'lucide-react';
import { PET_SPECIES, PET_SKINS } from '../../lib/gamification';
import { useStudy, useFocus } from '../../context/StudyContext';
import type { ReactionEvent } from '../../lib/gamification';
import { storage } from '../../services/storage';
import PetSprite from '../ui/PetSprite';
import ReactionOverlay, { TextPopup } from '../ui/ReactionOverlay';
import { usePetReactions } from '../../hooks/usePetReactions';
import { PET_ANIMATIONS } from '../../config/pets';
import type { PetAnimationName } from '../../config/pets';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { useEyeTracking } from '../../hooks/useEyeTracking';
import { useDragFeel } from '../../hooks/useDragFeel';
import { useIdleLife } from '../../hooks/useIdleLife';
import type { MoodTier } from '../../hooks/useIdleLife';
import { usePetMood } from '../../hooks/usePetMood';
import {
  REACTION_ANIMATIONS,
  IDLE_VARIANTS,
  PARTICLE_BURSTS,
  TAP_REACTIONS,
  FEED_REACTIONS,
} from '../../lib/petAnimations';

type PetSpeciesColors = { body: string; accent: string; eyes: string; glow: string };

/* ─── ENHANCED SVG CHARACTERS ───────────────────────────────── */

interface PetSVGProps {
  colors: PetSpeciesColors;
  isDormant: boolean;
  isWalking: boolean;
  eyeDx: number;
  eyeDy: number;
  mood: MoodTier;
  blink: boolean;
}

function PixieSVG({ colors, isDormant, isWalking, eyeDx, eyeDy, mood, blink }: PetSVGProps) {
  return (
    <svg viewBox="0 0 80 100" fill="none" className="w-full h-full">
      <circle cx="40" cy="46" r="26" fill={colors.glow} opacity={isDormant ? 0.06 : 0.18}>
        <animate attributeName="r" values="24;28;24" dur="3s" repeatCount="indefinite" />
      </circle>
      <ellipse cx="40" cy="52" rx="16" ry="19" fill={colors.body} opacity={isDormant ? 0.3 : 1}>
        <animate attributeName="ry" values="19;20;19" dur="2.5s" repeatCount="indefinite" />
      </ellipse>
      <g opacity={isDormant ? 0.15 : 0.7}>
        <path d="M40 22 L42.5 28 L49 28 L44 32 L46 38 L40 34 L34 38 L36 32 L31 28 L37.5 28 Z" fill={colors.accent}>
          <animate attributeName="opacity" values="0.7;0.35;0.7" dur="2s" repeatCount="indefinite" />
        </path>
      </g>
      <g>
        <circle cx={34 + eyeDx * 0.3} cy={47 + eyeDy * 0.3} r="3" fill={isDormant ? "#888" : colors.eyes} />
        <circle cx={46 + eyeDx * 0.3} cy={47 + eyeDy * 0.3} r="3" fill={isDormant ? "#888" : colors.eyes} />
        {blink ? (
          <>
            <line x1={33 + eyeDx * 0.3} y1={47 + eyeDy * 0.3} x2={35 + eyeDx * 0.3} y2={47 + eyeDy * 0.3} stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round" />
            <line x1={45 + eyeDx * 0.3} y1={47 + eyeDy * 0.3} x2={47 + eyeDx * 0.3} y2={47 + eyeDy * 0.3} stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx={34 + eyeDx * 0.5} cy={46.5 + eyeDy * 0.5} r="1.5" fill="#1e1b4b" />
            <circle cx={46 + eyeDx * 0.5} cy={46.5 + eyeDy * 0.5} r="1.5" fill="#1e1b4b" />
          </>
        )}
      </g>
      {(mood === 'happy' || mood === 'excited') && (
        <path d="M37 55 C39 58, 41 58, 43 55" stroke={colors.accent} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity={0.7} />
      )}
      <g opacity={isDormant ? 0.1 : 0.4}>
        <ellipse cx="22" cy="52" rx="5" ry="3.5" fill={colors.accent} transform="rotate(-12 22 52)">
          <animate attributeName="rx" values={isWalking ? "5;3;5" : "5;5;5"} dur="0.35s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="58" cy="52" rx="5" ry="3.5" fill={colors.accent} transform="rotate(12 58 52)">
          <animate attributeName="rx" values={isWalking ? "5;3;5" : "5;5;5"} dur="0.35s" repeatCount="indefinite" />
        </ellipse>
      </g>
      <g opacity={isDormant ? 0.1 : 0.35}>
        <ellipse cx="32" cy="72" rx="5" ry="2.5" fill={colors.accent}>
          <animate attributeName="rx" values={isWalking ? "5;3;5" : "5;5;5"} dur="0.35s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="48" cy="72" rx="5" ry="2.5" fill={colors.accent}>
          <animate attributeName="rx" values={isWalking ? "5;3;5" : "5;5;5"} dur="0.35s" repeatCount="indefinite" />
        </ellipse>
      </g>
      {isWalking && (
        <>
          <circle cx="20" cy="74" r="2" fill={colors.accent} opacity={0.5}>
            <animate attributeName="cy" values="74;86" dur="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0" dur="0.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="60" cy="74" r="1.5" fill={colors.accent} opacity={0.5}>
            <animate attributeName="cy" values="74;86" dur="0.7s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0" dur="0.7s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </svg>
  );
}

function EmberSVG({ colors, isDormant, isWalking, eyeDx, eyeDy, mood, blink }: PetSVGProps) {
  return (
    <svg viewBox="0 0 80 100" fill="none" className="w-full h-full">
      <ellipse cx="40" cy="50" rx="22" ry="18" fill={colors.glow} opacity={isDormant ? 0.04 : 0.15}>
        <animate attributeName="rx" values="20;24;20" dur="2s" repeatCount="indefinite" />
      </ellipse>
      <path d="M40 20 C52 34 58 44 58 56 C58 66 50 72 40 72 C30 72 22 66 22 56 C22 44 28 34 40 20Z" fill={colors.body} opacity={isDormant ? 0.25 : 1}>
        <animate attributeName="d" values="M40 20 C52 34 58 44 58 56 C58 66 50 72 40 72 C30 72 22 66 22 56 C22 44 28 34 40 20Z;M40 18 C54 32 60 44 60 56 C60 66 50 74 40 74 C30 74 20 66 20 56 C20 44 26 32 40 18Z;M40 20 C52 34 58 44 58 56 C58 66 50 72 40 72 C30 72 22 66 22 56 C22 44 28 34 40 20Z" dur={isDormant ? "4s" : "1.5s"} repeatCount="indefinite" />
      </path>
      <path d="M40 32 C45 38 48 44 48 54 C48 60 44 64 40 64 C36 64 32 60 32 54 C32 44 35 38 40 32Z" fill={colors.accent} opacity={isDormant ? 0.1 : 0.4}>
        <animate attributeName="opacity" values={isDormant ? "0.1;0.08;0.1" : "0.4;0.2;0.4"} dur={isDormant ? "4s" : "1.2s"} repeatCount="indefinite" />
      </path>
      <circle cx={35 + eyeDx * 0.3} cy={50 + eyeDy * 0.3} r="2.5" fill={isDormant ? "#666" : "#fff"} />
      <circle cx={45 + eyeDx * 0.3} cy={50 + eyeDy * 0.3} r="2.5" fill={isDormant ? "#666" : "#fff"} />
      {blink ? (
        <>
          <line x1={34 + eyeDx * 0.3} y1={50 + eyeDy * 0.3} x2={36 + eyeDx * 0.3} y2={50 + eyeDy * 0.3} stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />
          <line x1={44 + eyeDx * 0.3} y1={50 + eyeDy * 0.3} x2={46 + eyeDx * 0.3} y2={50 + eyeDy * 0.3} stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={35 + eyeDx * 0.5} cy={49.5 + eyeDy * 0.5} r="1.2" fill="#451a03" />
          <circle cx={45 + eyeDx * 0.5} cy={49.5 + eyeDy * 0.5} r="1.2" fill="#451a03" />
        </>
      )}
      {(mood === 'happy' || mood === 'excited') && (
        <path d="M36 57 L40 60 L44 57" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity={0.6} />
      )}
      {isWalking && (
        <ellipse cx="30" cy="74" rx="6" ry="3" fill={colors.accent} opacity={0.4}>
          <animate attributeName="rx" values="6;10;6" dur="0.3s" repeatCount="indefinite" />
        </ellipse>
      )}
      {isDormant && (
        <circle cx="40" cy="78" r="2" fill={colors.body} opacity={0.3}>
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

function LuminaSVG({ colors, isDormant, isWalking, eyeDx, eyeDy, mood, blink }: PetSVGProps) {
  return (
    <svg viewBox="0 0 80 100" fill="none" className="w-full h-full">
      <circle cx="40" cy="44" r="24" fill={colors.glow} opacity={isDormant ? 0.04 : 0.12}>
        <animate attributeName="r" values="22;26;22" dur="4s" repeatCount="indefinite" />
      </circle>
      <ellipse cx="40" cy="54" rx="16" ry="18" fill={colors.body} opacity={isDormant ? 0.25 : 1} />
      <circle cx="40" cy="34" r="13" fill={colors.body} opacity={isDormant ? 0.25 : 1} />
      <polygon points="28,26 22,14 34,24" fill={colors.accent} opacity={isDormant ? 0.15 : 0.6} />
      <polygon points="52,26 58,14 46,24" fill={colors.accent} opacity={isDormant ? 0.15 : 0.6} />
      <ellipse cx={34 + eyeDx * 0.25} cy={34 + eyeDy * 0.25} rx="3.5" ry="4" fill={isDormant ? "#666" : "#fff"} />
      <ellipse cx={46 + eyeDx * 0.25} cy={34 + eyeDy * 0.25} rx="3.5" ry="4" fill={isDormant ? "#666" : "#fff"} />
      {blink ? (
        <>
          <line x1={33 + eyeDx * 0.25} y1={34 + eyeDy * 0.25} x2={35 + eyeDx * 0.25} y2={34 + eyeDy * 0.25} stroke="#4a1a5e" strokeWidth="1.8" strokeLinecap="round" />
          <line x1={45 + eyeDx * 0.25} y1={34 + eyeDy * 0.25} x2={47 + eyeDx * 0.25} y2={34 + eyeDy * 0.25} stroke="#4a1a5e" strokeWidth="1.8" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={34 + eyeDx * 0.5} cy={33.5 + eyeDy * 0.5} r="1.8" fill="#4a1a5e" />
          <circle cx={46 + eyeDx * 0.5} cy={33.5 + eyeDy * 0.5} r="1.8" fill="#4a1a5e" />
        </>
      )}
      {(mood === 'happy' || mood === 'excited') ? (
        <ellipse cx="40" cy="40" rx="3" ry="2.2" fill="#d8b4fe" opacity={0.8} />
      ) : (
        <ellipse cx="40" cy="40" rx="2.5" ry="2" fill="#d8b4fe" opacity={0.5} />
      )}
      <path d="M56 54 C64 46 68 38 62 30" stroke={colors.accent} strokeWidth="3.5" strokeLinecap="round" fill="none" opacity={isDormant ? 0.15 : 0.5}>
        <animate attributeName="d" values={isWalking ? "M56 54 C64 46 68 38 62 30;M56 54 C66 48 70 40 60 28;M56 54 C64 46 68 38 62 30" : "M56 54 C64 46 68 38 62 30;M56 54 C66 44 70 36 64 28;M56 54 C64 46 68 38 62 30"} dur={isWalking ? "0.4s" : "3s"} repeatCount="indefinite" />
      </path>
      <g opacity={isDormant ? 0.2 : 0.6}>
        <line x1="28" y1="70" x2="24" y2="84" stroke={colors.accent} strokeWidth="3" strokeLinecap="round">
          <animate attributeName="x2" values={isWalking ? "20;28;20" : "24;24;24"} dur="0.35s" repeatCount="indefinite" />
        </line>
        <line x1="52" y1="70" x2="56" y2="84" stroke={colors.accent} strokeWidth="3" strokeLinecap="round">
          <animate attributeName="x2" values={isWalking ? "60;52;60" : "56;56;56"} dur="0.35s" repeatCount="indefinite" />
        </line>
      </g>
      <ellipse cx="24" cy="85" rx="4" ry="2" fill={colors.accent} opacity={isDormant ? 0.1 : 0.4} />
      <ellipse cx="56" cy="85" rx="4" ry="2" fill={colors.accent} opacity={isDormant ? 0.1 : 0.4} />
    </svg>
  );
}

function NimbusSVG({ colors, isDormant, isWalking, eyeDx, eyeDy, mood, blink }: PetSVGProps) {
  return (
    <svg viewBox="0 0 80 100" fill="none" className="w-full h-full">
      <circle cx="40" cy="44" r="24" fill={colors.glow} opacity={isDormant ? 0.04 : 0.15}>
        <animate attributeName="r" values="22;26;22" dur="5s" repeatCount="indefinite" />
      </circle>
      <g opacity={isDormant ? 0.25 : 1}>
        <ellipse cx="40" cy="48" rx="20" ry="15" fill={colors.body} />
        <circle cx="28" cy="42" r="12" fill={colors.body} />
        <circle cx="52" cy="42" r="12" fill={colors.body} />
        <circle cx="40" cy="36" r="12" fill={colors.body} />
      </g>
      <polygon points="28,30 24,18 34,28" fill={colors.accent} opacity={isDormant ? 0.15 : 0.45} />
      <polygon points="52,30 56,18 46,28" fill={colors.accent} opacity={isDormant ? 0.15 : 0.45} />
      <ellipse cx={34 + eyeDx * 0.25} cy={44 + eyeDy * 0.25} rx="3" ry="3.5" fill={isDormant ? "#666" : "#fff"} />
      <ellipse cx={46 + eyeDx * 0.25} cy={44 + eyeDy * 0.25} rx="3" ry="3.5" fill={isDormant ? "#666" : "#fff"} />
      {blink ? (
        <>
          <line x1={33 + eyeDx * 0.25} y1={44 + eyeDy * 0.25} x2={35 + eyeDx * 0.25} y2={44 + eyeDy * 0.25} stroke="#164e63" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={45 + eyeDx * 0.25} y1={44 + eyeDy * 0.25} x2={47 + eyeDx * 0.25} y2={44 + eyeDy * 0.25} stroke="#164e63" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={34 + eyeDx * 0.5} cy={43.5 + eyeDy * 0.5} r="1.5" fill="#164e63" />
          <circle cx={46 + eyeDx * 0.5} cy={43.5 + eyeDy * 0.5} r="1.5" fill="#164e63" />
        </>
      )}
      {(mood === 'happy' || mood === 'excited') && (
        <path d="M36 47 L40 50 L44 47" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity={0.6} />
      )}
      <g opacity={isDormant ? 0.08 : 0.35}>
        <line x1="26" y1="48" x2="12" y2="46" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="26" y1="50" x2="12" y2="52" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="54" y1="48" x2="68" y2="46" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="54" y1="50" x2="68" y2="52" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g opacity={isDormant ? 0.15 : 0.5}>
        <line x1="28" y1="62" x2="24" y2="76" stroke={colors.accent} strokeWidth="2.5" strokeLinecap="round">
          <animate attributeName="x2" values={isWalking ? "20;28;20" : "24;24;24"} dur="0.4s" repeatCount="indefinite" />
        </line>
        <line x1="52" y1="62" x2="56" y2="76" stroke={colors.accent} strokeWidth="2.5" strokeLinecap="round">
          <animate attributeName="x2" values={isWalking ? "60;52;60" : "56;56;56"} dur="0.4s" repeatCount="indefinite" />
        </line>
      </g>
      {isWalking && (
        <ellipse cx="20" cy="52" rx="1.5" ry="3" fill={colors.accent} opacity={0.5}>
          <animate attributeName="cy" values="52;70" dur="0.6s" repeatCount="indefinite" />
        </ellipse>
      )}
    </svg>
  );
}

/* ─── CHARACTER SELECTOR ────────────────────────────────────── */

interface PetCharacterProps {
  species: string;
  animation: PetAnimationName;
  isDormant: boolean;
  isWalking: boolean;
  size: number;
  skin?: string;
  eyeDx: number;
  eyeDy: number;
  mood: MoodTier;
  blink: boolean;
  onAnimationComplete?: () => void;
}

function PetCharacter({ species, animation, isDormant, isWalking, size, skin, eyeDx, eyeDy, mood, blink }: PetCharacterProps) {
  const speciesData = PET_SPECIES.find(s => s.id === species);
  if (!speciesData) return null;

  const hasSprite = PET_ANIMATIONS[species]?.idle != null;
  const skinData = skin ? PET_SKINS.find(s => s.id === skin) : undefined;
  const colors = skinData?.colors ?? speciesData.colors;

  if (hasSprite) {
    return (
      <PetSprite
        species={species}
        animation={animation}
        size={size}
        float={!isWalking && !isDormant}
        isDormant={isDormant}
        skin={skin}
      />
    );
  }
  const c = colors;
  const svgProps = { colors: c, isDormant, isWalking, eyeDx, eyeDy, mood, blink };
  switch (species) {
    case 'ember': return <EmberSVG {...svgProps} />;
    case 'lumina': return <LuminaSVG {...svgProps} />;
    case 'nimbus': return <NimbusSVG {...svgProps} />;
    default: return <PixieSVG {...svgProps} />;
  }
}

/* ─── SUB-COMPONENTS ─────────────────────────────────────────── */

function SleepZzz() {
  return (
    <div className="absolute -top-6 -right-2 pointer-events-none">
      <motion.span
        initial={{ opacity: 0, x: 0, y: 0 }}
        animate={{ opacity: [0, 1, 0], x: [0, 10, 20], y: [0, -10, -20] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
        className="text-lg absolute"
      >💤</motion.span>
      <motion.span
        initial={{ opacity: 0, x: 0, y: 0 }}
        animate={{ opacity: [0, 0.7, 0], x: [0, 7, 14], y: [0, -7, -14] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
        className="text-sm absolute -top-3"
      >z</motion.span>
    </div>
  );
}

function AmbientSparkles({ isDormant }: { isDormant: boolean }) {
  const particles = useRef(
    Array.from({ length: 6 }, (_, i) => ({
      id: i, x: Math.random() * 100 - 10, y: Math.random() * 100,
      size: 2 + Math.random() * 3, delay: Math.random() * 4,
    }))
  ).current;
  if (isDormant) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/30"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{ opacity: [0, 0.6, 0], y: [0, -20 - Math.random() * 20], scale: [0.5, 1, 0.3] }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function GlowAura({ isDormant, health }: { isDormant: boolean; health: string }) {
  const hue = isDormant ? 0 : health === 'weak' ? 340 : health === 'happy' ? 240 : 220;
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none rounded-full"
      animate={{ opacity: isDormant ? 0.06 : 0.18, scale: isDormant ? 0.7 : [1, 1.1, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        background: `radial-gradient(circle, hsla(${hue},70%,60%,0.35) 0%, transparent 70%)`,
        filter: 'blur(12px)',
      }}
    />
  );
}

/* ─── FEEDING STATE MACHINE ──────────────────────────────────── */

type FeedStage = 'idle' | 'noticing' | 'approaching' | 'eating' | 'chewing' | 'swallowing' | 'reacting';

/* ─── HELPERS ────────────────────────────────────────────────── */

const TAP_ANIM_KEYS = ['tap_happy_bounce', 'tap_giggle', 'tap_curious', 'tap_excited_wiggle', 'tap_small_jump'] as const;
const FEED_REACT_KEYS = ['feed_happy_dance', 'feed_heart_burst', 'feed_spin', 'feed_belly_rub', 'feed_excited_hop'] as const;

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ─── MAIN ENGINE ────────────────────────────────────────────── */

interface PetEngineProps {
  onOpenPanel: () => void;
  feedTrigger?: number;
  overlayOpen?: boolean;
  petSize?: number;
}

const PetEngine = memo(function PetEngine({ onOpenPanel, feedTrigger = 0, overlayOpen = false, petSize = 180 }: PetEngineProps) {
  const { petState, petInteract, petEvent } = useStudy();
  const reduceMotion = useReduceMotion();
  const species = PET_SPECIES.find(s => s.id === petState.species) || PET_SPECIES[0];
  const isDormant = petState.health === 'dormant';

  // ── Eye tracking (via ref — no React state, zero lag) ───────
  const { petRef, getEyeOffset } = useEyeTracking();

  // ── Drag physics ──────────────────────────────────────────
  const savedPos = storage.getPetPosition();
  const initX = savedPos?.x ?? 24;
  const initY = savedPos?.y ?? (typeof window !== 'undefined' ? window.innerHeight - 400 : 400);
  const {
    x, y, springX, springY,
    scaleX, scaleY, rotate, isDragging: isDraggingRef,
    handleDragStart, handleDrag, handleDragEnd,
  } = useDragFeel(initX, initY);

  const [isDragging, setIsDragging] = useState(false);
  const recentlyDragged = useRef(false);
  const eyeOffsetRef = useRef({ dx: 0, dy: 0 });
  const blinkRef = useRef(false);

  // ── Reaction system ────────────────────────────────────────
  const {
    anim,
    preset,
    particles,
    isReacting,
    textPopup,
    handleEvent,
    resetToIdle,
    fireReaction,
  } = usePetReactions({ isDormant, onFeedTrigger: feedTrigger });

  const prevEventId = useRef(0);
  useEffect(() => {
    if (petEvent && petEvent.id !== prevEventId.current) {
      prevEventId.current = petEvent.id;
      handleEvent(petEvent);
    }
  }, [petEvent, handleEvent]);

  const reactionKeyRef = useRef(0);
  const prevReacting = useRef(false);
  useEffect(() => {
    if (isReacting && !prevReacting.current) reactionKeyRef.current++;
    prevReacting.current = isReacting;
  }, [isReacting]);

  // ── Mood system ────────────────────────────────────────────
  const { mood } = usePetMood({
    isDormant,
    hunger: petState.hunger,
    health: petState.health,
    isReacting,
    anim,
  });

  // ── Blink timer ────────────────────────────────────────────
  useEffect(() => {
    const schedule = () => {
      blinkRef.current = true;
      const t1 = setTimeout(() => { blinkRef.current = false; }, 120);
      const t2 = setTimeout(schedule, 1000 + Math.random() * 4000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    };
    const t = setTimeout(schedule, 1000 + Math.random() * 2000);
    return () => clearTimeout(t);
  }, []);

  // ── Idle life system ──────────────────────────────────────
  const { currentAction, isIdleAnimating } = useIdleLife({
    mood,
    isDormant,
    isReacting,
    isDragging,
  });

  // ── Focus progress reactive ──────────────────────────────
  const { focusSession } = useFocus();
  const focusProgress = focusSession && focusSession.totalTime > 0
    ? (focusSession.totalTime - focusSession.timeLeft) / focusSession.totalTime
    : 0;
  const prevProgressRef = useRef(0);
  useEffect(() => {
    if (isDormant || !focusSession?.isActive) { prevProgressRef.current = 0; return; }
    const prev = prevProgressRef.current;
    for (const t of [0.25, 0.50, 0.75]) {
      if (prev < t && focusProgress >= t) {
        const ev: ReactionEvent = { type: 'consecutive_task', id: Date.now(), metadata: { consecutiveCount: Math.round(t * 4) } };
        handleEvent(ev);
      }
    }
    prevProgressRef.current = focusProgress;
  }, [focusProgress, isDormant, focusSession?.isActive, handleEvent]);

  // ── Feeding state machine ──────────────────────────────────
  const [feedStage, setFeedStage] = useState<FeedStage>('idle');
  const prevFeed = useRef(feedTrigger);
  const feedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runFeedSequence = useCallback(() => {
    const stages: FeedStage[] = ['noticing', 'approaching', 'eating', 'chewing', 'swallowing', 'reacting'];
    const durations = [400, 500, 400, 800, 350, 1000];
    let i = 0;
    const advance = () => {
      if (i < stages.length) {
        setFeedStage(stages[i]);
        feedTimer.current = setTimeout(advance, durations[i]);
        i++;
      } else {
        setFeedStage('idle');
        const reactKey = pickRandom(FEED_REACT_KEYS);
        fireReaction({
          animation: reactKey,
          spriteAnim: reactKey,
          duration: 1200,
          particles: PARTICLE_BURSTS.heart_big,
          moodShift: 'happy',
          intensity: 'medium' as any,
          priority: 5,
        });
      }
    };
    advance();
  }, [fireReaction]);

  useEffect(() => {
    if (feedTrigger !== prevFeed.current) {
      prevFeed.current = feedTrigger;
      if (!isDormant) runFeedSequence();
    }
  }, [feedTrigger, isDormant, runFeedSequence]);

  const isWalking = anim === 'walk';

  // ── Eye offset read from ref (no re-render) ───────────────
  const eyeOff = getEyeOffset();
  eyeOffsetRef.current = eyeOff;
  const compEyeDx = isDragging ? eyeOff.dx * 0.5 : eyeOff.dx;

  // ── Animation variant selection ──────────────────────────
  const activeAnimKey = useMemo(() => {
    if (feedStage !== 'idle') return `feed_${feedStage}`;
    if (isReacting && preset?.animation) return preset.animation;
    if (isIdleAnimating && currentAction) return currentAction;
    return null;
  }, [feedStage, isReacting, preset?.animation, isIdleAnimating, currentAction]);

  const activeVariant = activeAnimKey ? REACTION_ANIMATIONS[activeAnimKey] : undefined;
  const idleVariant = isDormant ? IDLE_VARIANTS.float : IDLE_VARIANTS[species.idleAnim] ?? IDLE_VARIANTS.float;
  const containerScale = species.scale;

  // Tap handler
  const handleTap = useCallback(() => {
    if (isDormant || isReacting || isDragging) return;
    petInteract();
    onOpenPanel();
    const tapKey = pickRandom(TAP_ANIM_KEYS);
    fireReaction({
      animation: tapKey,
      spriteAnim: tapKey,
      duration: 700,
      particles: PARTICLE_BURSTS.sparkle,
      moodShift: 'happy',
      intensity: 'light' as any,
      priority: 5,
    });
  }, [isDormant, isReacting, isDragging, petInteract, onOpenPanel, fireReaction]);

  // Native capture-phase tap listener
  useEffect(() => {
    const el = petRef.current;
    if (!el) return;
    let startX = 0, startY = 0;
    const onDown = (e: PointerEvent) => { startX = e.clientX; startY = e.clientY; };
    const onUp = (e: PointerEvent) => {
      if (isDormant) return;
      if (Math.abs(e.clientX - startX) < 8 && Math.abs(e.clientY - startY) < 8) {
        handleTap();
      }
    };
    el.addEventListener('pointerdown', onDown, { capture: true });
    el.addEventListener('pointerup', onUp, { capture: true });
    return () => { el.removeEventListener('pointerdown', onDown, { capture: true }); el.removeEventListener('pointerup', onUp, { capture: true }); };
  }, [isDormant, isReacting, handleTap, petRef]);

  // Drag event handlers
  const onPetDragStart = useCallback(() => {
    setIsDragging(true);
    handleDragStart();
  }, [handleDragStart]);

  const onPetDrag = useCallback((_: any, info: any) => {
    handleDrag(_, info);
  }, [handleDrag]);

  const onPetDragEnd = useCallback((_: any, info: any) => {
    handleDragEnd(_, info);
    setIsDragging(false);
    storage.savePetPosition({ x: x.get(), y: y.get() });
    setTimeout(() => { recentlyDragged.current = false; }, 500);
  }, [handleDragEnd, x, y]);

  return (
    <motion.div
      ref={petRef}
      className="pet-panel fixed select-none touch-none"
      style={{
        top: 0, left: 0, x: springX, y: springY,
        scaleX, scaleY, rotate,
        width: petSize, height: petSize,
        zIndex: overlayOpen ? 60 : 40,
        willChange: 'transform',
      }}
      drag
      dragMomentum={false}
      onDragStart={onPetDragStart}
      onDrag={onPetDrag}
      onDragEnd={onPetDragEnd}
      whileTap={{ cursor: 'grabbing' }}
    >
      <GlowAura isDormant={isDormant} health={petState.health} />
      {!reduceMotion && <AmbientSparkles isDormant={isDormant} />}

      {/* Shadow */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-black/20 dark:bg-black/40"
        animate={{
          width: isWalking || isDragging ? 48 : 32,
          height: isWalking || isDragging ? 10 : 7,
          opacity: isDormant ? 0.12 : isWalking || isDragging ? 0.35 : 0.2,
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Pet body */}
      <motion.div
        className="relative w-full"
        style={{ height: petSize - 24 }}
        key={isReacting ? `react-${reactionKeyRef.current}` : feedStage !== 'idle' ? `feed-${feedStage}` : isIdleAnimating ? `idle-${currentAction}` : 'idle'}
        variants={activeVariant ?? idleVariant}
        initial={activeVariant ? 'hidden' : false}
        animate={activeVariant ? 'animate' : species.idleAnim || 'float'}
        whileTap={!isDormant && !isReacting && feedStage === 'idle' ? { scale: 1.05, transition: { duration: 0.1 } } : undefined}
      >
        <div style={{ transform: `scale(${containerScale})`, transformOrigin: 'center bottom' }}>
          <PetCharacter
            species={petState.species}
            animation={anim}
            isDormant={isDormant}
            isWalking={isWalking}
            size={petSize - 24}
            skin={petState.skin}
            eyeDx={compEyeDx}
            eyeDy={eyeOff.dy}
            mood={mood}
            blink={blinkRef.current}
          />
        </div>

        {/* Reaction particles */}
        {particles && isReacting && <ReactionOverlay particles={particles} />}

        {/* Text popup */}
        <TextPopup text={textPopup?.text ?? ''} emoji={textPopup?.emoji} visible={!!textPopup} />

        {isDormant && !isReacting && !reduceMotion && <SleepZzz />}

        {/* Health bar */}
        <motion.div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full backdrop-blur-sm"
          style={{
            background: isDormant ? 'rgba(100,100,100,0.15)' :
              petState.health === 'weak' ? 'rgba(244,63,94,0.15)' :
              petState.hunger > 50 ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: isDormant ? '#94a3b8' :
                petState.health === 'weak' ? '#fb7185' :
                petState.hunger > 50 ? '#34d399' : '#fbbf24',
            }}
          />
          <span className="text-[7px] font-bold uppercase tracking-wider text-white/40">
            {isDormant ? 'ASLEEP' : `${Math.round(petState.hunger)}%`}
          </span>
        </motion.div>
      </motion.div>

      {/* Name tag */}
      <motion.div className="text-center mt-2" animate={{ opacity: isDormant ? 0.25 : 0.5 }}>
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 drop-shadow-lg">
          {petState.name}
        </span>
      </motion.div>

      {/* Drag hint */}
      <motion.div
        className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white/10 backdrop-blur flex items-center justify-center"
        animate={{ opacity: isDragging ? 0 : 0.3, scale: isDragging ? 0.5 : 1 }}
      >
        <PawPrint className="w-3.5 h-3.5 text-white/50" />
      </motion.div>
    </motion.div>
  );
});

export default PetEngine;
