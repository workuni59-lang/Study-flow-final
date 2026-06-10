import { supabase } from './supabase';

export async function syncDailyStats(
  userId: string,
  date: string,
  sessions: number,
  focusSeconds: number,
  xpEarned: number
): Promise<void> {
  if (!supabase) return;

  const { data: existing } = await supabase
    .from('daily_stats')
    .select('sessions, focus_seconds, xp_earned')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();

  await supabase.from('daily_stats').upsert({
    user_id: userId,
    date,
    sessions: (existing?.sessions ?? 0) + sessions,
    focus_seconds: (existing?.focus_seconds ?? 0) + focusSeconds,
    xp_earned: (existing?.xp_earned ?? 0) + xpEarned,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,date' });
}

export async function getDailyActivity(userId: string): Promise<Record<string, number>> {
  if (!supabase) return {};

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 364);

  const { data } = await supabase
    .from('daily_stats')
    .select('date, sessions, xp_earned')
    .eq('user_id', userId)
    .gte('date', cutoff.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (!data) return {};

  const result: Record<string, number> = {};
  for (const row of data) {
    result[row.date] = Math.max(row.sessions, Math.round(row.xp_earned / 10));
  }
  return result;
}
