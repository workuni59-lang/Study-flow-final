import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { PawPrint } from 'lucide-react';
import { PET_SPECIES } from '../../lib/gamification';
import { PET_SKINS } from '../../lib/gamification';
import { useStudy } from '../../context/StudyContext';
import { storage } from '../../services/storage';
import PetSprite from '../ui/PetSprite';
import ReactionOverlay, { TextPopup } from '../ui/ReactionOverlay';
import { usePetReactions } from '../../hooks/usePetReactions';
import { PET_ANIMATIONS } from '../../config/pets';
import type { PetAnimationName } from '../../config/pets';
import {
  REACTION_ANIMATIONS,
  IDLE_VARIANTS,
} from '../../lib/petAnimations';

type PetSpeciesColors = { body: string; accent: string; eyes: string; glow: string };

/* ─── SVG CHARACTERS ─────────────────────────────────────────── */

function PixieSVG({ colors, isDormant, isWalking }: { colors: PetSpeciesColors; isDormant: boolean; isWalking: boolean }) {
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
      <circle cx="34" cy="47" r="3" fill={isDormant ? "#888" : colors.eyes} />
      <circle cx="46" cy="47" r="3" fill={isDormant ? "#888" : colors.eyes} />
      <circle cx="34" cy="46.5" r="1.5" fill="#1e1b4b" />
      <circle cx="46" cy="46.5" r="1.5" fill="#1e1b4b" />
      <path d="M37 55 C39 57, 41 57, 43 55" stroke={colors.accent} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity={isDormant ? 0.15 : 0.55} />
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

function EmberSVG({ colors, isDormant, isWalking }: { colors: PetSpeciesColors; isDormant: boolean; isWalking: boolean }) {
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
      <circle cx="35" cy="50" r="2.5" fill={isDormant ? "#666" : "#fff"} />
      <circle cx="45" cy="50" r="2.5" fill={isDormant ? "#666" : "#fff"} />
      <circle cx="35" cy="49.5" r="1.2" fill="#451a03" />
      <circle cx="45" cy="49.5" r="1.2" fill="#451a03" />
      {isWalking && (
        <>
          <ellipse cx="30" cy="74" rx="6" ry="3" fill={colors.accent} opacity={0.4}>
            <animate attributeName="rx" values="6;10;6" dur="0.3s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="50" cy="74" rx="6" ry="3" fill={colors.accent} opacity={0.4}>
            <animate attributeName="rx" values="6;10;6" dur="0.3s" repeatCount="indefinite" />
          </ellipse>
        </>
      )}
      {isDormant && (
        <circle cx="40" cy="78" r="2" fill={colors.body} opacity={0.3}>
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

function LuminaSVG({ colors, isDormant, isWalking }: { colors: PetSpeciesColors; isDormant: boolean; isWalking: boolean }) {
  return (
    <svg viewBox="0 0 80 100" fill="none" className="w-full h-full">
      <circle cx="40" cy="44" r="24" fill={colors.glow} opacity={isDormant ? 0.04 : 0.12}>
        <animate attributeName="r" values="22;26;22" dur="4s" repeatCount="indefinite" />
      </circle>
      <ellipse cx="40" cy="54" rx="16" ry="18" fill={colors.body} opacity={isDormant ? 0.25 : 1} />
      <circle cx="40" cy="34" r="13" fill={colors.body} opacity={isDormant ? 0.25 : 1} />
      <polygon points="28,26 22,14 34,24" fill={colors.accent} opacity={isDormant ? 0.15 : 0.6} />
      <polygon points="52,26 58,14 46,24" fill={colors.accent} opacity={isDormant ? 0.15 : 0.6} />
      <ellipse cx="34" cy="34" rx="3.5" ry="4" fill={isDormant ? "#666" : "#fff"} />
      <ellipse cx="46" cy="34" rx="3.5" ry="4" fill={isDormant ? "#666" : "#fff"} />
      <circle cx="34" cy="33.5" r="1.8" fill="#4a1a5e" />
      <circle cx="46" cy="33.5" r="1.8" fill="#4a1a5e" />
      <ellipse cx="40" cy="40" rx="2.5" ry="2" fill="#d8b4fe" />
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

function NimbusSVG({ colors, isDormant, isWalking }: { colors: PetSpeciesColors; isDormant: boolean; isWalking: boolean }) {
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
      <ellipse cx="34" cy="44" rx="3" ry="3.5" fill={isDormant ? "#666" : "#fff"} />
      <ellipse cx="46" cy="44" rx="3" ry="3.5" fill={isDormant ? "#666" : "#fff"} />
      <circle cx="34" cy="43.5" r="1.5" fill="#164e63" />
      <circle cx="46" cy="43.5" r="1.5" fill="#164e63" />
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
        <>
          <ellipse cx="20" cy="52" rx="1.5" ry="3" fill={colors.accent} opacity={0.5}>
            <animate attributeName="cy" values="52;70" dur="0.6s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="60" cy="52" rx="1.5" ry="3" fill={colors.accent} opacity={0.5}>
            <animate attributeName="cy" values="52;70" dur="0.8s" repeatCount="indefinite" />
          </ellipse>
        </>
      )}
    </svg>
  );
}

/* ─── CHARACTER SWITCH ────────────────────────────────────────── */

interface PetCharacterProps {
  species: string;
  animation: PetAnimationName;
  isDormant: boolean;
  isWalking: boolean;
  size: number;
  skin?: string;
  onAnimationComplete?: () => void;
}

function PetCharacter({ species, animation, isDormant, isWalking, size, skin, onAnimationComplete }: PetCharacterProps) {
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
        onAnimationComplete={onAnimationComplete}
      />
    );
  }

  const c = colors;
  switch (species) {
    case 'ember': return <EmberSVG colors={c} isDormant={isDormant} isWalking={isWalking} />;
    case 'lumina': return <LuminaSVG colors={c} isDormant={isDormant} isWalking={isWalking} />;
    case 'nimbus': return <NimbusSVG colors={c} isDormant={isDormant} isWalking={isWalking} />;
    default: return <PixieSVG colors={c} isDormant={isDormant} isWalking={isWalking} />;
  }
}

/* ─── DORMANT Zzz ──────────────────────────────────────────────── */

function SleepZzz() {
  return (
    <div className="absolute -top-6 -right-2 pointer-events-none">
      <motion.span
        initial={{ opacity: 0, x: 0, y: 0 }}
        animate={{ opacity: [0, 1, 0], x: [0, 10, 20], y: [0, -10, -20] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
        className="text-lg absolute"
      >
        💤
      </motion.span>
      <motion.span
        initial={{ opacity: 0, x: 0, y: 0 }}
        animate={{ opacity: [0, 0.7, 0], x: [0, 7, 14], y: [0, -7, -14] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
        className="text-sm absolute -top-3"
      >
        z
      </motion.span>
    </div>
  );
}

/* ─── AMBIENT SPARKLES ────────────────────────────────────────── */

function AmbientSparkles({ isDormant }: { isDormant: boolean }) {
  const particles = useRef(
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 10,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3,
      delay: Math.random() * 4,
    }))
  ).current;

  if (isDormant) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/30"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [0, -20 - Math.random() * 20],
            scale: [0.5, 1, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ─── GLOW AURA ────────────────────────────────────────────────── */

function GlowAura({ isDormant, health }: { isDormant: boolean; health: string }) {
  const hue = isDormant ? 0 : health === 'weak' ? 340 : health === 'happy' ? 240 : 220;
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none rounded-full"
      animate={{
        opacity: isDormant ? 0.06 : 0.18,
        scale: isDormant ? 0.7 : [1, 1.1, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        background: `radial-gradient(circle, hsla(${hue},70%,60%,0.35) 0%, transparent 70%)`,
        filter: 'blur(12px)',
      }}
    />
  );
}

/* ─── MAIN ENGINE ──────────────────────────────────────────────── */


interface PetEngineProps {
  onOpenPanel: () => void;
  feedTrigger?: number;
  overlayOpen?: boolean;
  petSize?: number;
}

export default function PetEngine({ onOpenPanel, feedTrigger = 0, overlayOpen = false, petSize = 180 }: PetEngineProps) {
  const { petState, petInteract, petEvent } = useStudy();
  const species = PET_SPECIES.find(s => s.id === petState.species) || PET_SPECIES[0];
  const isDormant = petState.health === 'dormant';

  const savedPos = storage.getPetPosition();
  const x = useMotionValue(savedPos?.x ?? 24);
  const y = useMotionValue(savedPos?.y ?? (typeof window !== 'undefined' ? window.innerHeight - 400 : 400));
  const springX = useSpring(x, { damping: 25, stiffness: 200 });
  const springY = useSpring(y, { damping: 25, stiffness: 200 });

  const [isDragging, setIsDragging] = useState(false);
  const recentlyDragged = useRef(false);
  const reactionKeyRef = useRef(0);
  const prevReacting = useRef(false);

  /* ── Reaction system ──────────────────────────────────────── */
  const {
    anim,
    preset,
    particles,
    isReacting,
    textPopup,
    handleEvent,
    resetToIdle,
  } = usePetReactions({ isDormant, onFeedTrigger: feedTrigger });

  useEffect(() => {
    handleEvent(petEvent);
  }, [petEvent, handleEvent]);

  // Increment reaction key to force re-mount on each new reaction
  useEffect(() => {
    if (isReacting && !prevReacting.current) {
      reactionKeyRef.current++;
    }
    prevReacting.current = isReacting;
  }, [isReacting]);

  const isWalking = anim === 'walk';

  const handleAnimComplete = useCallback(() => {
    if (anim === 'happy' || anim === 'feed') {
      resetToIdle();
    }
  }, [anim, resetToIdle]);

  const handleDragStart = () => {
    setIsDragging(true);
    recentlyDragged.current = true;
    resetToIdle();
  };

  const handleDragEnd = useCallback((_: any, info: any) => {
    const newX = x.get();
    const newY = y.get();
    setIsDragging(false);
    storage.savePetPosition({ x: newX, y: newY });
    setTimeout(() => { recentlyDragged.current = false; }, 300);
  }, [x, y]);

  const handleTap = () => {
    if (isDormant || recentlyDragged.current || isReacting) return;
    petInteract();
    onOpenPanel();
  };

  const handleDoubleClick = () => {
    if (isDormant) return;
  };

  const containerScale = species.scale;

  /* ── Idle animation variant ───────────────────────────────── */
  const idleVariant = isDormant
    ? IDLE_VARIANTS.float
    : IDLE_VARIANTS[species.idleAnim] ?? IDLE_VARIANTS.float;

  /* ── Reaction variant ─────────────────────────────────────── */
  const reactionKey = preset?.animation ?? '';
  const reactionVariant = reactionKey ? REACTION_ANIMATIONS[reactionKey] : undefined;

  return (
    <motion.div
      className="fixed select-none"
      style={{ top: 0, left: 0, x: springX, y: springY, width: petSize, height: petSize, zIndex: overlayOpen ? 60 : 40 }}
      drag
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
      onTap={handleTap}
      onDoubleClick={handleDoubleClick}
    >
      <GlowAura isDormant={isDormant} health={petState.health} />

      <AmbientSparkles isDormant={isDormant} />

      {/* Shadow */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-black/20 dark:bg-black/40"
        animate={{
          width: isWalking ? 48 : 32,
          height: isWalking ? 10 : 7,
          opacity: isDormant ? 0.12 : isWalking ? 0.35 : 0.2,
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Pet body with expressive animations */}
      <motion.div
        className="relative w-full"
        style={{ height: petSize - 24 }}
        key={isReacting ? `react-${reactionKeyRef.current}` : 'idle'}
        variants={isReacting && reactionVariant ? reactionVariant : idleVariant}
        initial={isReacting && reactionVariant ? 'hidden' : false}
        animate={isReacting && reactionVariant ? 'animate' : (isWalking ? undefined : Object.keys(idleVariant)[0] || 'float')}
        whileTap={!isDormant && !isReacting ? { scale: 1.05, transition: { duration: 0.1 } } : undefined}
      >
        <div style={{ transform: `scale(${containerScale})`, transformOrigin: 'center bottom' }}>
          <PetCharacter
            species={petState.species}
            animation={anim}
            isDormant={isDormant}
            isWalking={isWalking}
            size={petSize - 24}
            skin={petState.skin}
            onAnimationComplete={handleAnimComplete}
          />
        </div>

        {/* Reaction particles */}
        {particles && isReacting && (
          <ReactionOverlay particles={particles} />
        )}

        {/* Text popup */}
        <TextPopup text={textPopup?.text ?? ''} emoji={textPopup?.emoji} visible={!!textPopup} />

        {isDormant && !isReacting && <SleepZzz />}

        {/* Health bar */}
        <motion.div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full backdrop-blur-sm"
          style={{
            background: isDormant ? 'rgba(100,100,100,0.15)' :
              petState.health === 'weak' ? 'rgba(244,63,94,0.15)' :
              petState.hunger > 50 ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)',
          }}
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full"
            animate={{
              scale: petState.hunger > 50 ? [1, 1.3, 1] : 1,
            }}
            transition={{ duration: 2, repeat: Infinity }}
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
      <motion.div
        className="text-center mt-2"
        animate={{ opacity: isDormant ? 0.25 : 0.5 }}
      >
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
}
