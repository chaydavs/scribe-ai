# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

ResumeLab — a resume analysis and optimization tool for college students. Built by a student founder. The vibe is "Linear meets Duolingo": clean, modern, encouraging. NOT corporate SaaS.

## Commands

```bash
npx next dev          # Dev server on :3000
npx next build        # Production build (use to verify changes)
npx next lint         # ESLint
```

No test suite currently. Verify changes with `npx next build`.

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY` — powers all AI features via `claude-sonnet-4-20250514`
- `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` — credit pack purchases
- `NEXT_PUBLIC_APP_URL` — used for OAuth redirects

## Architecture

### Route Groups (Next.js App Router)

- `(marketing)/` — Landing page (public)
- `(auth)/` — Login, signup, password reset (redirects to `/resumelab` if already authed)
- `(dashboard)/` — Main tool, analytics, settings (protected by middleware)

Middleware (`middleware.ts`) handles auth redirects using Supabase SSR cookie management.

### Core User Flow

1. **Upload** — PDF (parsed via `unpdf`) or paste text, optional job description
2. **Analyze** — AI scores resume (0-100), returns fixes with exact before/after text
3. **Fix** — User applies individual fixes (fuzzy text matching), undo/redo supported
4. **Rewrite** — Optional full AI rewrite preserving all facts
5. **Export** — Choose LaTeX template → compile via `latex.ytotech.com` → download PDF

Alternative: **Create from Scratch** → fill form → Preview & Edit (same editor as step 3) → Export.

### AI Integration

All AI calls funnel through `src/lib/claude/client.ts` → `generateWithClaude(systemPrompt, userMessage, maxTokens)`. Returns `{ content, inputTokens, outputTokens }`.

Three prompt types in `toolPrompts`:
- `resumelab` — Full analysis: score breakdown, fixes with exact `current`/`fixed` text, section grades, ATS analysis
- `resumeRewrite` — Full resume rewrite preserving all facts
- `keywordExtraction` — Job description → keyword JSON

All prompts return JSON in `` ```json ``` `` fences, parsed with regex: `response.content.match(/```json\s*([\s\S]*?)\s*```/)`.

### Scoring System

Score = impact(0-35) + clarity(0-25) + ats(0-25) + structure(0-15) = 0-100. The quick-score API (`api/tools/quick-score`) uses the same calibration as the full analysis prompt — keep them in sync. Score bars must divide by the actual max (35/25/25/15), NOT by 100.

### Main Tool Page (`resumelab/`)

The page (`page.tsx`) is the state orchestrator. It holds all state and passes props to 5 tab components in `resumelab/components/`:
- `upload-tab.tsx` — File upload + job description
- `analysis-tab.tsx` — Score display, fix cards, section reviews
- `preview-tab.tsx` — Edit with formatting toolbar, apply fixes (undo/redo), template picker, export
- `rewrite-tab.tsx` — AI rewrite flow
- `create-tab.tsx` — Build resume from scratch → transitions to preview-tab for editing

### Fix Application (CRITICAL — read carefully)

Fixes use 3-tier fuzzy matching in both `interactive-analysis.tsx` and `preview-tab.tsx`:
1. Exact string match
2. Whitespace-normalized regex (handles line break differences from PDF parsing)
3. Keyword-based fuzzy match (first 5-6 significant words)

**Known pitfall — substring containment:** When `fix.fixed` contains `fix.current` as a substring (e.g. appending details to a line), naive detection fails because `fix.current` is still found inside the applied `fix.fixed` text. The correct approach:
- `isApplied` = resume contains `fix.fixed` (don't also check that `fix.current` is absent)
- `canApply` = `!isApplied && resume contains fix.current`
- Guard `applyFix()` with `if (isApplied) return` to prevent double-clicks
- "Apply All" must skip fixes where `fix.fixed` is already present

Nice-to-have fixes show separate Apply + Copy buttons (not a single ambiguous button).

### LaTeX Export Pipeline

`src/lib/latex/converter.ts` parses resume text into structured sections → template functions (`src/lib/latex/templates/`) generate LaTeX → `src/lib/latex/escape.ts` handles special chars + markdown formatting (`**bold**` → `\textbf{}`, `*italic*` → `\textit{}`). Currently only `classic-professional` template is used (hardcoded `classic-professional-1`).

**LaTeX overflow prevention:** All templates include `\sloppy` + `\emergencystretch=1em` after `\begin{document}`. The escape function adds `\allowbreak{}` after `/` characters to allow line breaks in long strings.

### Text Parser Gotchas (`converter.ts`)

- **`isBullet()` must match en-dash `–` (U+2013)** — not just hyphen `-`. Many resumes use en-dashes for bullets. Without this, lines like `– Refr.store` fall through to wrong code paths.
- **Projects section — bullet vs project name:** When a bullet is detected in the projects section, check if it's actually a short project name (no verb start, few words like "Refr.store") vs a description bullet ("Built Flask backend..."). Use verb-start heuristic.
- **Dot in project names:** `Refr.store` contains a dot but is NOT a sentence. Detect sentence periods as `. ` (dot+space) or ending `.` on lines with >3 words. Don't use `line.includes('.')`.
- Section detection is case-insensitive with substring matching for headers >4 chars.

### Database (Supabase)

Tables: `profiles` (credits, user info), `resume_analyses` (stored analyses), `credit_transactions`, `usage_logs`. All have RLS — users see only their own data. Credits: 5 per analysis, 5 per rewrite, 10-20 per export.

### Auth

Supabase auth with Google OAuth. The callback route (`api/auth/callback/route.ts`) sets cookies directly on the redirect response object (not via `cookies()` from next/headers — that doesn't work with `NextResponse.redirect()`).

## Design System

- **Palette**: Indigo-violet `primary-*` (NOT teal/emerald). Coral `accent-*` for celebrations. Black/white with borders, no gradients.
- **Font**: Futura (with Century Gothic / AppleGothic fallbacks)
- **Sidebar**: Frosted glass (`bg-white/80 backdrop-blur-xl border-r border-slate-200/60`)
- **Buttons**: `rounded-xl`, hover lift (`hover:-translate-y-0.5`), pill variant
- **Animations**: Defined in `tailwind.config.ts` — `card-enter`, `reveal-up`, `tab-enter`, `score-burst`, `toast-enter/exit`, `skeleton-shimmer`, etc.

## Parser Notes

- **PDF parser** (`src/lib/pdf-parser.ts`): Handles smart quotes, mojibake, 20+ bullet symbols, date recovery
- **Text parser** (`src/lib/latex/converter.ts`): Fuzzy section headers, comma guard for title/company, mid-line degrees, GPA slash format, season dates, en-dash bullets, project name vs bullet heuristic
