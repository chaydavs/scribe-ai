# ResumeLab - Claude Code Context

## What This Is
ResumeLab is a resume analysis and optimization tool for college students. Built by a student founder who wanted to make it easier for peers to create strong resumes. NOT corporate SaaS — designed to feel like Linear/Arc/Notion.

## Tech Stack
- **Framework**: Next.js 14 App Router (TypeScript)
- **Styling**: Tailwind CSS with custom indigo-violet palette (`primary-*`) + coral accent (`accent-*`)
- **AI**: Claude API (`claude-sonnet-4-20250514`) via `@anthropic-ai/sdk`
- **Auth + DB**: Supabase (auth, profiles, resume_analyses, usage_logs, credit_transactions)
- **Payments**: PayPal checkout for credit packs
- **PDF**: `unpdf` for PDF text extraction, LaTeX compilation via `latex.ytotech.com`

## Project Structure
```
src/
  app/
    (auth)/          - login, signup, reset-password, forgot-password
    (dashboard)/     - resumelab (main tool), analytics, settings
    (marketing)/     - landing page
    api/             - parse-resume, tools/resumelab, tools/rewrite-resume,
                       tools/quick-score, tools/export-resume, paypal/, account/, credits/
  components/
    layout/          - DashboardShell.tsx (frosted glass sidebar)
    tools/resumelab/ - interactive-analysis, score-card, resume-annotator,
                       canvas-resume-preview, template-picker, keyword-matcher
    ui/              - button, card, input (design system primitives)
  lib/
    claude/client.ts - generateWithClaude(), toolPrompts (analysis, rewrite, keywords)
    latex/converter.ts - Text parser: resumeText -> structured LaTeX sections
    pdf-parser.ts    - PDF text extraction + cleanup
    supabase/        - client.ts, server.ts, middleware.ts
    paypal/          - checkout.ts, credits.ts
```

## Design System
- **Palette**: Indigo-violet primary (NOT teal/emerald — those were removed). Coral accent for celebrations.
- **Sidebar**: Frosted glass (`bg-white/80 backdrop-blur-xl border-r border-slate-200/60`)
- **Buttons**: `rounded-xl` with hover lift (`hover:-translate-y-0.5`), pill variant available
- **Animations**: `score-pulse`, `card-enter`, `progress-fill`, `fade-in` in globals.css
- **Vibe**: "Linear meets Duolingo" — clean, modern, cool + encouraging. NOT corporate.

## Core User Flow
1. Upload resume (PDF or paste text) + optional job description
2. AI analyzes: score (0-100), fixes, section reviews, ATS analysis
3. User sees interactive analysis with clickable fix cards (apply individually)
4. Optional AI rewrite for full optimization
5. Export: choose LaTeX template, compile to PDF, download

## Scoring System
Score = impact(0-35) + clarity(0-25) + ats(0-25) + structure(0-15) = 0-100
Quick-score API uses same calibration. Both prompts in sync.

## Key Decisions
- Fixes are applied individually (not forced AI rewrite) — user choice matters
- Fuzzy text matching for fix application (whitespace normalization + regex)
- Canvas-based score card for sharing (PNG download/copy)
- Credits system: 5 per analysis, 5 per rewrite, 10-20 per export
- Templates: classic, modern, minimal, creative-bold, executive

## Commands
- `npx next build` - verify build passes
- `npx next dev` - local dev server on :3000
- No test suite currently

## Parser Notes
- PDF parser handles: smart quotes, mojibake, 20+ bullet symbols, date recovery
- Text parser handles: fuzzy section headers, comma guard for title/company, mid-line degrees, GPA slash format, season dates
- Section detection is case-insensitive with substring matching for headers >4 chars
