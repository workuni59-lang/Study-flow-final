import { supabase } from './supabase';
import { getUserRank } from './leaderboard';
import { getDailyActivity } from './dailyStats';

export interface PublicProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  country: string | null;
  created_at: string;
  is_premium: boolean;
}

export interface UserStats {
  total_focus_seconds: number;
  total_sessions: number;
  current_streak: number;
  longest_streak: number;
  game_level: number;
  game_xp: number;
  badges_earned: string[];
}

export interface ProfileWithStats {
  profile: PublicProfile;
  stats: UserStats;
  leaderboardRank: { daily: number; weekly: number; monthly: number; allTime: number };
  dailyActivity: Record<string, number>;
}

export async function getPublicProfile(userId: string): Promise<ProfileWithStats | null> {
  if (!supabase) return null;
  if (userId === 'demo-user-001') {
    return {
      profile: {
        id: 'demo-user-001',
        display_name: 'Demo Student',
        avatar_url: null,
        bio: 'Exploring StudyFlow in demo mode. Sign up to save your progress!',
        country: null,
        created_at: new Date().toISOString(),
        is_premium: false,
      },
      stats: {
        total_focus_seconds: 0, total_sessions: 0,
        current_streak: 0, longest_streak: 0,
        game_level: 1, game_xp: 0, badges_earned: [],
      },
      leaderboardRank: { daily: 0, weekly: 0, monthly: 0, allTime: 0 },
      dailyActivity: {},
    };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, bio, created_at, is_premium')
    .eq('id', userId)
    .single();

  if (!profile) return null;

  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  const [dailyRank, weeklyRank, monthlyRank, allTimeRank, dailyActivity] = await Promise.all([
    getUserRank(userId, 'daily'),
    getUserRank(userId, 'weekly'),
    getUserRank(userId, 'monthly'),
    getUserRank(userId, 'allTime'),
    getDailyActivity(userId),
  ]);

  const defaultStats: UserStats = {
    total_focus_seconds: 0, total_sessions: 0,
    current_streak: 0, longest_streak: 0,
    game_level: 1, game_xp: 0, badges_earned: [],
  };

  return {
    profile: profile as PublicProfile,
    stats: (stats as UserStats) ?? defaultStats,
    leaderboardRank: {
      daily: dailyRank.rank,
      weekly: weeklyRank.rank,
      monthly: monthlyRank.rank,
      allTime: allTimeRank.rank,
    },
    dailyActivity,
  };
}
