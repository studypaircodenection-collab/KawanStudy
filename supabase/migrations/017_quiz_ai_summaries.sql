-- Create quiz_ai_summaries table
CREATE TABLE IF NOT EXISTS quiz_ai_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL,
  summary_text TEXT NOT NULL,
  attempts_analyzed INTEGER NOT NULL DEFAULT 0,
  last_attempt_score DECIMAL(5,2),
  trend_analysis TEXT,
  strengths TEXT,
  weaknesses TEXT,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, quiz_id)
);

-- Add RLS policies
ALTER TABLE quiz_ai_summaries ENABLE ROW LEVEL SECURITY;

-- Users can only see their own summaries
CREATE POLICY "Users can view own quiz summaries" ON quiz_ai_summaries
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own summaries
CREATE POLICY "Users can insert own quiz summaries" ON quiz_ai_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own summaries
CREATE POLICY "Users can update own quiz summaries" ON quiz_ai_summaries
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_ai_summaries_user_quiz ON quiz_ai_summaries(user_id, quiz_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quiz_ai_summaries_updated_at
    BEFORE UPDATE ON quiz_ai_summaries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
