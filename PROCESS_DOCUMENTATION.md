# ResumeLab — Full Build Process Documentation

## Overview

ResumeLab is a premium resume optimization tool built into the Clawking platform. It provides AI-powered resume analysis, rewriting, and professional PDF export using LaTeX templates. The feature was built across 4 phases: Template System, LaTeX Integration, Export & Monetization, and Copy Protection.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (auth + DB), Stripe (payments), LaTeX (PDF generation via latex.ytotech.com API).

---

## Phase 1: Template System

### Goal
Create a type-safe template architecture and a picker UI for users to browse and select resume templates.

### Implementation

**1. Type definitions** — `src/types/templates.ts`

Defined core interfaces:
- `ParsedResume` — structured resume data (name, experience, education, skills, projects, certifications)
- `ExperienceEntry`, `EducationEntry`, `ProjectEntry` — sub-types for resume sections
- `TemplateStyle` — union type of 5 template styles: `modern-minimal`, `classic-professional`, `tech-focused`, `creative-bold`, `executive`
- `TemplatePreview` — metadata for the picker UI (id, name, description, tags, credit cost, premium flag)
- `AVAILABLE_TEMPLATES` — hardcoded array of 5 template definitions with pricing (10-20 credits)

**2. Template Picker UI** — `src/components/tools/resumelab/template-picker.tsx`

A responsive card grid that displays all 5 templates. Each card shows:
- Template name and description
- Tags (e.g., "tech", "corporate", "creative")
- Credit cost badge
- Premium indicator
- Selected state highlight

The picker accepts `onSelect`, `selectedTemplateId`, `userCredits`, and a `compact` prop for sidebar usage.

**3. Supabase tables**

Two tables support the feature:
- `resume_templates` — stores template metadata (not actively used yet; templates are hardcoded in `AVAILABLE_TEMPLATES`)
- `resume_exports` — logs every PDF export with user_id, analysis_id, template_id, and credits_used

### Key Decisions
- Templates are hardcoded in TypeScript rather than fetched from Supabase. This avoids an extra network round-trip and keeps the picker instant. Can be migrated to DB later if we need admin CRUD.
- 5 templates were chosen to cover major career demographics: tech (modern-minimal, tech-focused), corporate (classic-professional), creative (creative-bold), and leadership (executive).

---

## Phase 2: LaTeX Integration

### Goal
Convert structured resume data into professionally typeset PDFs using LaTeX.

### Architecture

```
User's resume text
       ↓
parseResumeText()     →  ParsedResume (structured data)
       ↓
generateLatex()       →  LaTeX source string (template-specific)
       ↓
latex.ytotech.com API →  Compiled PDF binary
```

### Implementation

**1. Resume parser** — `src/lib/latex/converter.ts` → `parseResumeText()`

A ~270-line state-machine parser that handles diverse resume formats:
- Detects section headers by matching against known patterns (e.g., "EXPERIENCE", "PROFESSIONAL EXPERIENCE", "WORK HISTORY" all map to `experience`)
- Parses job headers with pipe-separated fields: `Title | Company | Date Range`
- Extracts bullets, education entries, skills (comma/semicolon separated, with optional category prefixes)
- Deduplicates skills
- Handles edge cases: missing dates, GPA extraction, multi-format contact lines

**2. Template-specific LaTeX generators** — `src/lib/latex/templates/`

Each template is a standalone TypeScript file exporting a single function that takes `ParsedResume` and returns a LaTeX string.

All 5 templates share common patterns:
- `escapeTex()` — escapes LaTeX special characters (`&`, `%`, `$`, `#`, `_`, `{`, `}`, `~`, `^`, `|`, `\`)
- `limitBullets()` — caps bullets per job to fit on one page
- Experience/education entry limits for one-page optimization
- ATS-friendly settings (`glyphtounicode`, `pdfgentounicode=1`)
- Charter font at 10pt with tight margins

**Template-specific design details:**

| Template | Accent Color | Name Style | Bullets/Job | Experience Limit | Special Features |
|----------|-------------|------------|-------------|-----------------|------------------|
| `modern-minimal` | Black (none) | 20pt centered | 4 | 4 jobs | Two-column date layout, `paracol` package |
| `classic-professional` | Black | 20pt centered | 4 | 4 jobs | Traditional corporate feel |
| `tech-focused` | Black | 20pt centered | 4 | 4 jobs | Prominent skills section |
| `creative-bold` | Teal `RGB(0,128,128)` | 22pt bold teal | 4 | 4 jobs | Colored left rules, bold skill tags, colored bullets |
| `executive` | Navy `RGB(25,25,75)` | 18pt small caps | 3 | 5 jobs | "Executive Summary", "Core Competencies", no projects |

**3. Template router** — `src/lib/latex/converter.ts` → `generateLatex()`

A switch statement that routes `TemplateStyle` to the correct generator function. The `convertResumeToLatex()` convenience function chains parsing → generation.

**4. PDF compilation**

Uses the free `latex.ytotech.com/builds/sync` API:
- Sends LaTeX source as JSON with `compiler: 'pdflatex'`
- Receives compiled PDF as binary
- Falls back to returning raw LaTeX source if compilation fails (user can compile locally)

### Key Decisions
- External LaTeX API vs self-hosted: Chose `latex.ytotech.com` for zero infrastructure. Trade-off: dependency on external service, but it's free and reliable.
- One function per template vs parameterized template: Chose separate functions for maximum flexibility — each template can have completely different LaTeX structure.
- All templates optimized for single page: tight margins (`0.5cm` top/bottom), reduced spacing, entry limits.

---

## Phase 3: Export & Monetization

### Goal
Create a paid PDF export flow with credit-based pricing, preview watermarks, and Stripe integration.

### Implementation

**1. Export API** — `src/app/api/tools/export-resume/route.ts`

`POST` endpoint handles both preview and paid export:

```
Request: { resumeText, templateId, analysisId?, previewOnly? }

Flow:
1. Authenticate user via Supabase
2. Look up template by ID → get credit cost
3. If !previewOnly: check user has enough credits
4. Generate LaTeX from resume text
5. If previewOnly: inject PREVIEW watermark into LaTeX
6. Compile to PDF via latex.ytotech.com
7. If !previewOnly: deduct credits, log transaction, save export record
8. Return base64-encoded PDF
```

`GET` endpoint returns the user's export history (last 20 exports).

**2. Watermark injection**

For preview PDFs, a diagonal "PREVIEW" watermark is injected after `\begin{document}`:
```latex
\AddToShipoutPictureBG*{%
  \AtPageCenter{%
    \rotatebox{45}{%
      \scalebox{5}{%
        \textcolor[gray]{0.85}{PREVIEW}%
      }%
    }%
  }%
}
```
Uses the `eso-pic` package (already included in all templates). Gray at 0.85 is light enough to not obscure content but clearly marks it as a preview.

**3. Credit system**

- Template costs: 10 credits (free templates), 15 credits (premium), 20 credits (executive)
- Credits deducted atomically after successful PDF generation
- Transaction logged in `credit_transactions` table
- Usage logged in `usage_logs` table
- Export record saved in `resume_exports` table

**4. Client-side export flow** — `src/app/(dashboard)/resumelab/page.tsx`

- Preview: triggered automatically when user selects a template → free, watermarked
- Export: triggered by "Export PDF" button → deducts credits, downloads clean PDF
- PDF displayed in an `<iframe>` for preview, triggered as download for export

### Key Decisions
- Watermark in LaTeX vs post-processing: Injecting into LaTeX source is simpler and more reliable than manipulating the PDF binary after compilation.
- Base64 transport: PDF is base64-encoded in JSON response rather than streamed as binary. Simpler client-side handling at the cost of ~33% larger payload.

---

## Phase 4: Copy Protection

### Goal
Prevent users from copying the AI-rewritten resume text without paying for an export. Multiple layers of protection, each increasing the difficulty.

### Implementation — 4 Layers

**Layer 1: UI gating** — Hidden copy button

The "Copy Text" button is replaced with a locked indicator ("Export PDF to unlock copy") when `hasExported === false`. After a successful paid export, `hasExported` is set to `true` and the copy button appears.

State persistence: on analysis load, we check the user's export history via `GET /api/tools/export-resume` to restore `hasExported`.

**Layer 2: CSS protection** — `select-none`

The `<pre>` element rendering the rewrite has Tailwind's `select-none` class applied when `!hasExported`, preventing text selection via mouse/keyboard.

**Layer 3: Right-click block**

`onContextMenu={(e) => e.preventDefault()}` prevents the browser context menu, blocking "Copy" from the right-click menu.

**Layer 4: Canvas rendering** — `src/components/tools/resumelab/canvas-resume-preview.tsx`

The strongest protection layer. When `!hasExported`, the rewritten resume is rendered onto an HTML `<canvas>` element instead of a DOM text node:

- Text is painted as pixels using `CanvasRenderingContext2D.fillText()`
- No text exists in the DOM — browser dev tools show only a `<canvas>` element
- Word-wrapping implemented via `ctx.measureText()` for proper line breaks
- Section headers (ALL CAPS lines) rendered in bold with darker color
- Canvas auto-sizes height to fit content
- Retina display support via `devicePixelRatio` scaling
- Right-click blocked on the container

After export (`hasExported === true`), the canvas is swapped back to a regular `<pre>` element so text is selectable and copyable.

### Protection Summary

| Layer | Blocks | Bypassed By |
|-------|--------|-------------|
| Hidden copy button | Casual "Copy" click | Dev tools |
| `select-none` CSS | Mouse/keyboard selection | Dev tools style override |
| Right-click block | Context menu copy | Keyboard shortcut (Ctrl+C) — but nothing is selected |
| Canvas rendering | ALL DOM-based extraction | Screenshot + OCR (extreme) |

### Key Decisions
- Canvas only for protected state: After payment, we switch to `<pre>` for good UX — users who paid should be able to copy freely.
- Not using Web Workers or obfuscation: Kept it simple. Canvas rendering is the strongest practical protection for web content without going into DRM territory.

---

## File Structure

```
src/
├── types/
│   └── templates.ts                          # Type definitions + AVAILABLE_TEMPLATES
├── lib/
│   └── latex/
│       ├── converter.ts                      # parseResumeText() + generateLatex() router
│       └── templates/
│           ├── index.ts                      # Barrel exports
│           ├── modern-minimal.ts             # Clean, ATS-optimized
│           ├── classic-professional.ts       # Traditional corporate
│           ├── tech-focused.ts               # Skills-first layout
│           ├── creative-bold.ts              # Teal accents, bold tags
│           └── executive.ts                  # Navy small-caps, 5 jobs
├── components/
│   └── tools/
│       └── resumelab/
│           ├── template-picker.tsx           # Template selection grid
│           ├── canvas-resume-preview.tsx      # Canvas-based copy protection
│           └── resume-form.tsx               # Create-from-scratch form
├── app/
│   ├── (dashboard)/
│   │   └── resumelab/
│   │       └── page.tsx                      # Main ResumeLab page (tabs, state, UI)
│   └── api/
│       └── tools/
│           ├── export-resume/
│           │   └── route.ts                  # PDF export + watermark + credits
│           ├── resumelab/
│           │   └── route.ts                  # Resume analysis API
│           └── rewrite-resume/
│               └── route.ts                  # Resume rewrite API
└── TODO_RESUME_TEMPLATES.md                  # Feature checklist (all items complete)
```

---

## User Flow

```
1. Upload resume (PDF/TXT or paste text)
2. Optionally add target job description
3. Click "Analyze Resume" → AI analysis + score (costs credits)
4. Click "Get AI Rewrite" → optimized resume text (costs credits)
   └── Text shown on canvas (copy-protected)
5. Go to "Preview & Export" tab
6. Select template from picker
   └── Preview generated automatically (free, watermarked)
7. Click "Export PDF" → credits deducted, clean PDF downloaded
   └── Copy protection unlocked — text becomes selectable
```

---

## Lessons & Trade-offs

1. **LaTeX over HTML-to-PDF**: LaTeX produces significantly better typesetting than browser-based PDF generation (html2pdf, puppeteer). The external API dependency is worth it.

2. **Canvas copy protection is not DRM**: A determined user can still screenshot + OCR. The goal is to make copying inconvenient enough that paying 10-20 credits is the easier path.

3. **One-page resume constraint**: All templates enforce one page via entry limits and tight spacing. This is intentional — recruiters spend ~7 seconds on a resume.

4. **Hardcoded templates**: Moving templates to Supabase would add admin flexibility but increases complexity. Current approach is simpler and faster to iterate on.

5. **Credit-based pricing over subscription**: Credits let users pay per-use, reducing commitment friction. Template pricing (10/15/20) creates a natural upsell from free to premium.
