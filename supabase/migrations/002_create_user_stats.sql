-- Add bio to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL;

-- Create user_stats table (canonical public stats, never resets)
CREATE TABLE IF NOT EXISTS user_stats (
  user_id      UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_focus_seconds BIGINT DEFAULT 0,
  total_sessions      INTEGER DEFAULT 0,
  current_streak      INTEGER DEFAULT 0,
  longest_streak      INTEGER DEFAULT 0,
  game_level          INTEGER DEFAULT 1,
  game_xp             BIGINT DEFAULT 0,
  badges_earned       TEXT[] DEFAULT '{}',
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: public read, owner write
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user_stats"
  ON user_stats FOR SELECT USING (true);

CREATE POLICY "Users can upsert their own stats"
  ON user_stats FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- Add all_time_focus_seconds to leaderboard_entries for all-time leaderboard tab
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS all_time_focus_seconds BIGINT DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_leaderboard_all_time ON leaderboard_entries(all_time_focus_seconds DESC);
