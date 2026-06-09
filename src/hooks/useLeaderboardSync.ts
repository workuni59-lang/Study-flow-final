import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { syncFocusSession } from '../lib/leaderboard';

export function useLeaderboardSync() {
  const { user, profile } = useAuth();

  const syncSession = useCallback(async (durationSeconds: number) => {
    if (!user || !profile) return;
    await syncFocusSession(
      user.uid,
      profile.display_name ?? user.displayName ?? 'Anonymous',
      profile.avatar_url,
      durationSeconds,
    );
  }, [user, profile]);

  return { syncSession };
}
