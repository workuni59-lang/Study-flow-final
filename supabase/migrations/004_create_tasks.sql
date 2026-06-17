CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  category TEXT,
  priority TEXT,
  due_date TEXT,
  estimated_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own tasks"
  ON tasks FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own tasks"
  ON tasks FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
