CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  topics JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own subjects"
  ON subjects FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subjects"
  ON subjects FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subjects"
  ON subjects FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own subjects"
  ON subjects FOR DELETE USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);
