import { useState } from 'react';
import { Trophy } from 'lucide-react';
import type { LeaderboardEntry } from '../../lib/leaderboard';
import { formatFocusTime } from '../../lib/leaderboard';

interface LeaderboardRowProps {
  key?: string | number;
  entry: LeaderboardEntry;
  rank: number;
  focusSeconds: number;
  topFocusSeconds: number;
  isCurrentUser?: boolean;
  onClick?: () => void;
}

const MEDAL: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

export const LeaderboardRow = ({ entry, rank, focusSeconds, topFocusSeconds, isCurrentUser, onClick }: LeaderboardRowProps) => {
  const [avatarError, setAvatarError] = useState(false);
  const barWidth = topFocusSeconds > 0 ? (focusSeconds / topFocusSeconds) * 100 : 0;
  const initial = (entry.display_name ?? 'A').charAt(0).toUpperCase();

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      aria-label={onClick ? `View ${entry.display_name ?? 'Anonymous'}'s profile` : undefined}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        onClick ? 'cursor-pointer' : ''
      } ${
        isCurrentUser
          ? 'bg-brand/10 ring-1 ring-brand/20'
          : 'hover:bg-white/[0.06]'
      }`}>
      {/* Rank */}
      <div className="w-8 text-center shrink-0">
        {rank <= 3 ? (
          <span className="text-lg">{MEDAL[rank]}</span>
        ) : (
          <span className={`text-xs font-bold ${isCurrentUser ? 'text-brand' : 'text-slate-500 dark:text-slate-500'}`}>
            #{rank}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
        {entry.avatar_url && !avatarError ? (
          <img src={entry.avatar_url} alt="" onError={() => setAvatarError(true)} className="w-full h-full rounded-full object-cover" />
        ) : (
          initial
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isCurrentUser ? 'text-brand' : 'text-slate-200 dark:text-slate-200'}`}>
          {entry.display_name ?? 'Anonymous'}
          {isCurrentUser && <span className="text-[10px] font-medium text-brand/60 ml-1.5">(you)</span>}
        </p>
      </div>

      {/* Focus time */}
      <div className="text-right shrink-0 min-w-[80px]">
        <p className="text-sm font-bold text-white/90">{formatFocusTime(focusSeconds)}</p>
      </div>

      {/* Progress bar */}
      <div className="hidden sm:block w-24 h-2 bg-white/[0.06] rounded-full overflow-hidden shrink-0">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-violet-500 transition-all duration-500"
          style={{ width: `${Math.min(barWidth, 100)}%` }}
        />
      </div>
    </div>
  );
};
