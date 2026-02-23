# Resume Templates Feature - TODO

## Overview
Premium resume template system with LaTeX export and copy protection.

## Phase 1: Template System
- [x] Research top 5 LinkedIn-viral resume templates
- [x] Create template data structure (`src/types/templates.ts`)
- [x] Store templates in Supabase (`resume_templates` table)
- [x] Build template selection UI component
- [x] Preview component showing template applied to user's resume

## Phase 2: LaTeX Integration
- [x] Set up LaTeX compilation service (options: Overleaf API, latex.js, or self-hosted)
- [x] Create LaTeX template files for each design (modern-minimal, classic-professional, tech-focused, creative-bold, executive)
- [x] Build resume-to-LaTeX converter function
- [x] Generate PDF from LaTeX on server-side

## Phase 3: Export & Monetization
- [x] Add PDF export endpoint (`/api/tools/export-resume`)
- [x] Set credit cost for export (suggest: 10-15 credits)
- [x] Implement payment flow for export
- [x] Generate watermarked preview (free) vs clean PDF (paid)

## Phase 4: Copy Protection
- [x] Disable text selection on rewritten resume preview
- [x] Add CSS `user-select: none` to preview component
- [x] Implement canvas-based rendering for preview (harder to copy)
- [x] Add watermark to preview text
- [x] Only allow plain text copy AFTER payment

## Database Changes Needed
```sql
CREATE TABLE public.resume_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  latex_template TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  credit_cost INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.resume_exports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES public.resume_analyses(id),
  template_id UUID REFERENCES public.resume_templates(id),
  export_url TEXT,
  credits_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Files to Create/Modify
- `src/types/templates.ts` - Template types
- `src/components/tools/resumeradar/template-picker.tsx` - Template selection
- `src/components/tools/resumeradar/resume-preview.tsx` - Protected preview
- `src/app/api/tools/export-resume/route.ts` - Export API
- `src/lib/latex/converter.ts` - Resume to LaTeX conversion
- `supabase/migrations/004_resume_templates.sql` - DB schema

## Priority Order
1. Copy protection (quick win)
2. Template selection UI
3. LaTeX integration
4. Export & payment
