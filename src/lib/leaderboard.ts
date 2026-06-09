import { supabase } from './supabase';

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly';

export interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  daily_focus_seconds: number;
  weekly_focus_seconds: number;
  monthly_focus_seconds: number;
  daily_date: string | null;
  weekly_date: string | null;
  monthly_date: string | null;
  updated_at: string;
}

function getPeriodDates() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const weekStr = monday.toISOString().split('T')[0];
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return { today, weekStr, monthStr };
}

export async function syncFocusSession(
  userId: string,
  displayName: string | null,
  avatarUrl: string | null,
  durationSeconds: number
): Promise<void> {
  if (!supabase) return;

  const { today, weekStr, monthStr } = getPeriodDates();

  const { data: existing } = await supabase
    .from('leaderboard_entries')
    .select('*')
    .eq('user_id', userId)
    .single();

  const prev = existing as LeaderboardEntry | null;

  const dailyFocus = prev && prev.daily_date === today
    ? prev.daily_focus_seconds + durationSeconds
    : durationSeconds;

  const weeklyFocus = prev && prev.weekly_date === weekStr
    ? prev.weekly_focus_seconds + durationSeconds
    : durationSeconds;

  const monthlyFocus = prev && prev.monthly_date === monthStr
    ? prev.monthly_focus_seconds + durationSeconds
    : durationSeconds;

  const { error } = await supabase
    .from('leaderboard_entries')
    .upsert({
      user_id: userId,
      display_name: displayName,
      avatar_url: avatarUrl,
      daily_focus_seconds: dailyFocus,
      weekly_focus_seconds: weeklyFocus,
      monthly_focus_seconds: monthlyFocus,
      daily_date: today,
      weekly_date: weekStr,
      monthly_date: monthStr,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) {
    console.error('[Leaderboard] Sync error:', error.message);
  }
}

export async function getTopUsers(
  period: LeaderboardPeriod,
  limit = 100
): Promise<LeaderboardEntry[]> {
  if (!supabase) return [];
  const column = period === 'daily' ? 'daily_focus_seconds'
    : period === 'weekly' ? 'weekly_focus_seconds'
    : 'monthly_focus_seconds';

  const { data } = await supabase
    .from('leaderboard_entries')
    .select('*')
    .order(column, { ascending: false })
    .limit(limit);

  return (data as LeaderboardEntry[]) ?? [];
}

export async function getUserRank(
  userId: string,
  period: LeaderboardPeriod
): Promise<{ rank: number; entry: LeaderboardEntry | null }> {
  if (!supabase) return { rank: 0, entry: null };

  const column = period === 'daily' ? 'daily_focus_seconds'
    : period === 'weekly' ? 'weekly_focus_seconds'
    : 'monthly_focus_seconds';

  const { data: entry } = await supabase
    .from('leaderboard_entries')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!entry) return { rank: 0, entry: null };

  const userValue = (entry as LeaderboardEntry)[
    period === 'daily' ? 'daily_focus_seconds'
    : period === 'weekly' ? 'weekly_focus_seconds'
    : 'monthly_focus_seconds'
  ];

  const { count } = await supabase
    .from('leaderboard_entries')
    .select('*', { count: 'exact', head: true })
    .gt(column, userValue);

  return { rank: (count ?? 0) + 1, entry: entry as LeaderboardEntry };
}

export function formatFocusTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
