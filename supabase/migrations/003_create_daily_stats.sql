CREATE TABLE IF NOT EXISTS daily_stats (
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  sessions INTEGER DEFAULT 0,
  focus_seconds INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);

ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Public read for profiles
CREATE POLICY "Daily stats are publicly readable" ON daily_stats
  FOR SELECT USING (true);

-- Owner can upsert
CREATE POLICY "Users can upsert their own daily stats" ON daily_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily stats" ON daily_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Index for profile queries
CREATE INDEX idx_daily_stats_user_date ON daily_stats (user_id, date DESC);
