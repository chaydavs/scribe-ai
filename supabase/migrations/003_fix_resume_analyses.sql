-- Run this in Supabase SQL Editor if resume_analyses table doesn't exist
-- This fixes the sidebar not showing past analyses

-- Create the resume_analyses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.resume_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  resume_text TEXT NOT NULL,
  job_description TEXT,
  analysis_result TEXT,
  rewrite_result TEXT,
  score INTEGER,
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_id ON public.resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_created_at ON public.resume_analyses(created_at DESC);

-- Enable RLS
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own analyses" ON public.resume_analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON public.resume_analyses;
DROP POLICY IF EXISTS "Users can update own analyses" ON public.resume_analyses;
DROP POLICY IF EXISTS "Users can delete own analyses" ON public.resume_analyses;

-- Create RLS policies
CREATE POLICY "Users can view own analyses" ON public.resume_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON public.resume_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON public.resume_analyses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON public.resume_analyses
  FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at (uses existing function from 001_initial_schema.sql)
DROP TRIGGER IF EXISTS update_resume_analyses_updated_at ON public.resume_analyses;
CREATE TRIGGER update_resume_analyses_updated_at
  BEFORE UPDATE ON public.resume_analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resume_analyses TO authenticated;

-- Verify the table was created
SELECT 'resume_analyses table created successfully!' as status;
