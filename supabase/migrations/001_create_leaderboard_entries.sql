-- Create leaderboard_entries table for global focus-time rankings
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  user_id      UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url   TEXT,
  daily_focus_seconds   BIGINT DEFAULT 0,
  weekly_focus_seconds  BIGINT DEFAULT 0,
  monthly_focus_seconds BIGINT DEFAULT 0,
  daily_date   TEXT,  -- YYYY-MM-DD, last daily reset date
  weekly_date  TEXT,  -- YYYY-MM-DD (Monday), last weekly reset date
  monthly_date TEXT,  -- YYYY-MM, last monthly reset date
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast top-N queries per period
CREATE INDEX IF NOT EXISTS idx_leaderboard_daily   ON leaderboard_entries(daily_focus_seconds DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_weekly  ON leaderboard_entries(weekly_focus_seconds DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_monthly ON leaderboard_entries(monthly_focus_seconds DESC);

-- Row-level security: users can upsert their own row, everyone can read
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can upsert their own entry"
  ON leaderboard_entries
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Everyone can read leaderboard"
  ON leaderboard_entries
  FOR SELECT
  USING (true);
