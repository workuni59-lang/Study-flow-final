import { useState, useEffect } from 'react';
import { Clock, Zap, Flame, PenSquare, Target, Music, ArrowUpRight } from 'lucide-react';
import { useStudy, useFocus } from '../../context/StudyContext';
import { useAuth } from '../../context/AuthContext';
import { PROGRESSION_BADGES } from '../../lib/progression';
import { BadgeSvg, type BadgeTier } from '../progression/BadgeSvg';
import { getDailyQuote } from '../../lib/quotes';
import { getGreeting } from '../../lib/greetings';
import ClockRenderer from '../clock/ClockRenderer';

const BADGE_TIER: Record<string, BadgeTier> = {
  bronze: 'bronze', silver: 'silver', gold: 'gold', platinum: 'platinum', diamond: 'diamond', legend: 'legend',
};

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

const T_S = '0 1px 3px rgba(0,0,0,0.5)';

const ICON_BTN = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: 'rgba(0,0,0,0.45)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(255,255,255,0.85)',
  cursor: 'pointer',
  transition: 'transform 0.15s',
} as const;

export const HomeView = ({ onNotepadOpen, onQuestsOpen, onMusicOpen, onProgressionOpen, menuOpen }: {
  onNotepadOpen?: () => void;
  onQuestsOpen?: () => void;
  onMusicOpen?: () => void;
  onProgressionOpen?: () => void;
  menuOpen?: boolean;
}) => {
  const { user } = useAuth();
  const { focusSession } = useFocus();
  const { userStats, themeConfig, progression } = useStudy();
  const [time, setTime] = useState(new Date());
  const [quote] = useState(getDailyQuote());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
    }, []);

  return (
    <div style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '60px', paddingLeft: '16px', paddingRight: '16px' }}>
      {/* Badge — top-right corner */}
      {(() => {
        const hb = PROGRESSION_BADGES.filter(b => progression.level >= b.levelRequired).pop();
        const t = hb ? (BADGE_TIER[hb.id] ?? 'bronze') : 'bronze';
        return (
          <div
            onClick={onProgressionOpen}
            style={{
              position: 'absolute', top: '72px', right: '16px', zIndex: 20,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 10px 5px 6px', borderRadius: '10px',
              background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.35)'; }}
          >
            <BadgeSvg tier={t} size={24} unlocked={true} />
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', textShadow: T_S }}>
              Lv.{progression.level}
            </span>
            <ArrowUpRight style={{ width: '10px', height: '10px', color: 'rgba(255,255,255,0.3)' }} />
          </div>
        );
      })()}

      {/* Ambient gradient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
      </div>

      {/* ── Central content ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '20px 32px 16px', borderRadius: '24px',
        background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,0.05)',
        maxWidth: '420px', width: '100%',
      }}>
        {/* Greeting */}
        {themeConfig.showGreeting !== false && (
          <h2 style={{
            fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.7)',
            textShadow: T_S, marginBottom: '2px',
          }}>
            {getGreeting(user?.displayName?.split(' ')[0])}
          </h2>
        )}

        {/* Clock */}
        {themeConfig.showClock !== false && (
          <div style={{ marginBottom: '4px', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}>
            <ClockRenderer time={time} focusState={focusSession} />
          </div>
        )}

        {/* Focus time label */}
        <span style={{
          fontSize: '11px', color: 'rgba(255,255,255,0.5)',
          textShadow: T_S, marginBottom: '8px',
        }}>
          {userStats.totalFocusSeconds > 0
            ? `${formatTime(userStats.totalFocusSeconds)} focused today`
            : 'Ready for a focused session?'}
        </span>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px',
          width: '100%', maxWidth: '320px',
        }}>
          <StatCard icon={Clock} value={formatTime(userStats.totalFocusSeconds)} label="Focus" color="#818cf8" />
          <StatCard icon={Flame} value={String(userStats.currentStreak ?? 0)} label="Streak" color="#f59e0b" />
          <StatCard icon={Zap} value={String(userStats.totalXP ?? 0)} label="XP" color="#a78bfa" />
        </div>

        {/* Quote */}
        {themeConfig.showQuote !== false && (
          <div style={{
            marginTop: '8px', width: '100%', maxWidth: '320px',
            padding: '6px 12px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.04)',
          }}>
            <p style={{
              fontSize: '10px', color: 'rgba(255,255,255,0.45)',
              fontStyle: 'italic', textShadow: T_S,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              &ldquo;{quote.text}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* ── Bottom-left icon cluster ── */}
      {!menuOpen && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '24px',
          display: 'flex', flexDirection: 'row', gap: '12px', zIndex: 50,
        }}>
          {onNotepadOpen && (
            <button
              onClick={onNotepadOpen}
              style={ICON_BTN}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <PenSquare size={18} />
            </button>
          )}
          {onQuestsOpen && (
            <button
              onClick={onQuestsOpen}
              style={ICON_BTN}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Target size={18} />
            </button>
          )}
          {onMusicOpen && (
            <button
              onClick={onMusicOpen}
              style={ICON_BTN}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Music size={18} />
            </button>
          )}
        </div>
      )}
      </div>

      {/* Watermark */}
      <div style={{
        position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.12, pointerEvents: 'none', zIndex: 10,
      }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'linear-gradient(135deg, #818cf8, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Zap size={8} strokeWidth={2} />
        </div>
        <span style={{ fontSize: '9px', fontWeight: 700, color: '#fff', textShadow: T_S }}>StudyFlow</span>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, value, label, color }: { icon: typeof Clock; value: string; label: string; color: string }) => (
  <div style={{
    borderRadius: '12px', padding: '6px 4px', textAlign: 'center',
    background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(4px)',
    border: '1px solid rgba(255,255,255,0.04)',
  }}>
    <Icon size={14} style={{ color, margin: '0 auto 2px', display: 'block' }} />
    <p style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', textShadow: T_S, lineHeight: 1.2 }}>{value}</p>
    <p style={{ fontSize: '7px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', textShadow: T_S }}>{label}</p>
  </div>
);
