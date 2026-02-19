-- Resume templates table
CREATE TABLE IF NOT EXISTS public.resume_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  style TEXT NOT NULL, -- 'modern-minimal', 'classic-professional', 'tech-focused', 'creative-bold', 'executive'
  latex_template TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  credit_cost INTEGER DEFAULT 10,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resume exports tracking
CREATE TABLE IF NOT EXISTS public.resume_exports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  analysis_id UUID REFERENCES public.resume_analyses(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.resume_templates(id) ON DELETE SET NULL,
  resume_data JSONB, -- Parsed resume data used for export
  export_url TEXT, -- URL to the generated PDF (stored in Supabase storage)
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resume_templates_style ON public.resume_templates(style);
CREATE INDEX IF NOT EXISTS idx_resume_exports_user_id ON public.resume_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_exports_created_at ON public.resume_exports(created_at DESC);

-- RLS for templates (public read, admin write)
ALTER TABLE public.resume_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view templates" ON public.resume_templates
  FOR SELECT USING (true);

-- RLS for exports (user owns their exports)
ALTER TABLE public.resume_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exports" ON public.resume_exports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exports" ON public.resume_exports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON public.resume_templates TO authenticated;
GRANT SELECT ON public.resume_templates TO anon;
GRANT SELECT, INSERT ON public.resume_exports TO authenticated;

-- Insert default templates
INSERT INTO public.resume_templates (id, name, description, style, latex_template, is_premium, credit_cost, sort_order) VALUES
(
  'a1b2c3d4-0001-0001-0001-000000000001',
  'Clean Modern',
  'Minimalist design with clean lines. Perfect for tech roles.',
  'modern-minimal',
  'TEMPLATE_PLACEHOLDER',
  false,
  10,
  1
),
(
  'a1b2c3d4-0002-0002-0002-000000000002',
  'Executive Classic',
  'Traditional professional layout. Ideal for corporate positions.',
  'classic-professional',
  'TEMPLATE_PLACEHOLDER',
  false,
  10,
  2
),
(
  'a1b2c3d4-0003-0003-0003-000000000003',
  'Tech Stack',
  'Skills-first layout with prominent tech stack display.',
  'tech-focused',
  'TEMPLATE_PLACEHOLDER',
  true,
  15,
  3
),
(
  'a1b2c3d4-0004-0004-0004-000000000004',
  'Creative Bold',
  'Stand out with a unique, eye-catching design.',
  'creative-bold',
  'TEMPLATE_PLACEHOLDER',
  true,
  15,
  4
),
(
  'a1b2c3d4-0005-0005-0005-000000000005',
  'Senior Executive',
  'Refined layout for leadership and C-suite positions.',
  'executive',
  'TEMPLATE_PLACEHOLDER',
  true,
  20,
  5
)
ON CONFLICT (id) DO NOTHING;
