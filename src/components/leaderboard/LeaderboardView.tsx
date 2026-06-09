import { useState, useEffect, useCallback } from 'react';
import { Trophy, Users, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LeaderboardRow } from './LeaderboardRow';
import { getTopUsers, getUserRank, formatFocusTime, type LeaderboardEntry, type LeaderboardPeriod } from '../../lib/leaderboard';

type Tab = LeaderboardPeriod | 'friends';

const TABS: { key: Tab; label: string; disabled?: boolean }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'friends', label: 'Friends', disabled: true },
];

export const LeaderboardView = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('daily');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<{ rank: number; entry: LeaderboardEntry | null }>({ rank: 0, entry: null });
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    if (activeTab === 'friends') return;
    setLoading(true);
    const period = activeTab as LeaderboardPeriod;
    const top = await getTopUsers(period, 100);
    setEntries(top);

    if (user) {
      const rank = await getUserRank(user.uid, period);
      setUserRank(rank);
    }

    setLoading(false);
  }, [activeTab, user]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const isAuthed = !!user && !!profile;

  const topEntry = entries[0];
  const topFocusSeconds = topEntry
    ? topEntry[
        activeTab === 'daily' ? 'daily_focus_seconds'
        : activeTab === 'weekly' ? 'weekly_focus_seconds'
        : 'monthly_focus_seconds'
      ]
    : 0;

  const getFocusSeconds = (entry: LeaderboardEntry) =>
    entry[
      activeTab === 'daily' ? 'daily_focus_seconds'
      : activeTab === 'weekly' ? 'weekly_focus_seconds'
      : 'monthly_focus_seconds'
    ];

  // Check if current user is already in the top list
  const userInTop = user && entries.some(e => e.user_id === user.uid);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Leaderboard</h1>
          <p className="text-xs text-slate-400">Top focus times this period</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/[0.04] rounded-xl p-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => !tab.disabled && setActiveTab(tab.key)}
            disabled={tab.disabled}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === tab.key
                ? 'bg-brand text-white shadow-sm'
                : tab.disabled
                  ? 'text-slate-600 cursor-not-allowed opacity-50'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            title={tab.disabled ? 'Coming soon' : undefined}
          >
            {tab.label}
            {tab.disabled && <span className="ml-1 text-[9px] opacity-60">∞</span>}
          </button>
        ))}
      </div>

      {/* Unauthenticated banner */}
      {!isAuthed && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-brand/10 to-violet-500/10 border border-brand/20">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-brand shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">Sign in to track your rank</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Create an account to appear on the global leaderboard and compete with others.
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-400">No entries yet</p>
          <p className="text-xs text-slate-500 mt-1">Complete a focus session to be the first!</p>
        </div>
      ) : (
        <>
          {/* Your rank card (authed + not in top 100) */}
          {isAuthed && userRank.entry && !userInTop && (
            <div className="mb-4 p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Your Rank</p>
              <LeaderboardRow
                entry={userRank.entry}
                rank={userRank.rank}
                focusSeconds={getFocusSeconds(userRank.entry)}
                topFocusSeconds={topFocusSeconds}
                isCurrentUser
              />
            </div>
          )}

          {/* Top 100 list */}
          <div className="space-y-0.5">
            {entries.map((entry, i) => {
              const rank = i + 1;
              const isCurrentUser = user?.uid === entry.user_id;
              return (
                <LeaderboardRow
                  key={entry.user_id}
                  entry={entry}
                  rank={rank}
                  focusSeconds={getFocusSeconds(entry)}
                  topFocusSeconds={topFocusSeconds}
                  isCurrentUser={isCurrentUser}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
