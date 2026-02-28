# Single Template + Edit Before Export

**Status:** Implemented
**Date:** 2026-02-28
**Commits:** `ebb7483`, `1242f8d`

## Goal

Simplify the export flow by removing the template picker, using only the Classic Professional template, and letting users edit their resume text before exporting as PDF.

## What Changed

### Export Tab Redesign (`src/app/(dashboard)/resumelab/page.tsx`)

**Before:**
- Toggle between "View Changes" (side-by-side diff) and "PDF Preview" (template picker + iframe)
- User had to pick a template before seeing a preview
- 5 templates available (classic-professional, modern-minimal, tech-focused, executive, creative-bold)

**After:**
- Single view: editable textarea (left) + live PDF preview (right)
- Pre-filled with AI-rewritten resume text
- Preview auto-generates on load using `classic-professional` template
- 1.5s debounced preview regeneration when user edits text
- "Reset to AI version" link appears when text is modified
- Export PDF button downloads using `classic-professional`

### Create from Scratch Mode

- Removed `TemplatePicker` component from sidebar
- Replaced with a static "Classic Professional" card showing the template info
- Hardcoded `templateId: 'classic-professional'` in the export API call
- Removed template selection validation gate

### Removed State

- `selectedTemplateId` — no longer needed
- `selectedTemplate` — no longer needed
- `viewMode` (`'changes' | 'preview'`) — single view now

### Added State

- `editableResume` — user-editable text, initialized from `rewrite`

### Template Files Preserved

Template source files (`src/lib/latex/templates/*.ts`) remain in the codebase untouched. Only the picker UI was removed. Templates can be re-enabled later.

## Stripe Build Fix

Also committed missing Stripe library files that were causing Vercel build failures:
- `src/lib/stripe/client.ts`
- `src/lib/stripe/credits.ts`
- `src/app/api/stripe/webhook/route.ts`

## Architecture Decisions

- **1.5s debounce** on textarea edits before regenerating preview — balances responsiveness vs API load
- **No template deletion** — template code stays in codebase for potential future use
- **`editableResume` decoupled from `rewrite`** — user edits don't overwrite the AI output, and "Reset to AI version" restores the original
