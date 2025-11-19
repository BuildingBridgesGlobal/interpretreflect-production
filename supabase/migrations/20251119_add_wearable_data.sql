-- Raw wearable data storage for ingestion and baseline calculations
CREATE TABLE IF NOT EXISTS wearable_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  heart_rate_bpm NUMERIC(6,2),
  hrv_ms NUMERIC(8,2),
  resting_hr_bpm NUMERIC(6,2),
  source TEXT NOT NULL, -- 'oura', 'whoop', 'apple_watch', 'import'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wearable_data_user_time ON wearable_data(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_wearable_data_source ON wearable_data(source);

ALTER TABLE wearable_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wearable data"
  ON wearable_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wearable data"
  ON wearable_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert wearable data"
  ON wearable_data FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own wearable data"
  ON wearable_data FOR UPDATE
  USING (auth.uid() = user_id);