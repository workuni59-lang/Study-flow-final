CREATE TABLE IF NOT EXISTS gamification_state (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  gold INTEGER DEFAULT 0,
  hp JSONB,
  quest_progress JSONB DEFAULT '{}'::jsonb,
  quest_resets JSONB DEFAULT '{}'::jsonb,
  shop_items JSONB DEFAULT '[]'::jsonb,
  sessions_today INTEGER DEFAULT 0,
  sessions_date TEXT,
  daily_quests JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gamification_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own gamification state"
  ON gamification_state FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can upsert their own gamification state"
  ON gamification_state FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
