# ResumeLab USP Strategy & Product Changes

**Date**: 2026-02-26
**Status**: Approved

## USP Positioning

**Tagline**: "Fix your resume right here. Not somewhere else."

**One-liner**: ResumeLab is the only AI resume tool where you edit, fix, and export in one place — no reports to read, no scores to interpret, no other tools needed.

### Three Pillars

| Pillar | What it means | How competitors fail |
|--------|--------------|---------------------|
| **Edit-in-place** | AI suggestions appear inline on your actual resume. Click to apply. | Jobscan/Rezi give you a report. You still go to Word/Google Docs to make changes. |
| **Pay once, not monthly** | Credits, not subscriptions. Use what you need during your job search. | Teal $9/wk, Jobscan $50/mo, Rezi $29/mo — ongoing cost for a temporary need. |
| **Your voice, not AI slop** | Rewrites use only facts from YOUR resume. No hallucinated metrics. | Other tools generate generic corporate-speak that recruiters are learning to spot. |

## Changes

### 1. Landing Page Messaging Overhaul

**Hero headline**: "Fix your resume right here — not in another tab"
**Hero sub**: "Upload → see exactly what's wrong → fix it inline → export as PDF. 60 seconds. No subscription."
**Hero badge**: "The only resume editor with built-in AI fixes"

Replace "How It's Different" before/after section with a **3-column comparison table**:
- Column 1: "Other tools" (give you a report, charge monthly, generic rewrites)
- Column 2: "ResumeLab" (edit inline, pay per use, your voice preserved)

**Pricing section**: Reframe around "No subscription" messaging. Add competitor price comparison: "Jobscan: $50/mo. Teal: $36/mo. ResumeLab: $10 total."

### 2. Shareable Score Card (Viral Loop)

After analysis, users get a visually striking score card they can share.

**Score card contains**:
- Overall score (e.g., 78/100) with circular progress ring
- 4 sub-scores: Impact, Clarity, ATS-Ready, Structure
- Before/after improvement delta if fixes applied ("58 → 87")
- Branded footer: "Checked with ResumeLab — resumelab.com"

**Implementation**:
- "Share Score" button on analysis results page
- Canvas-rendered PNG image (reuse existing canvas rendering approach)
- One-click copy to clipboard or download

**Not building**: No leaderboards, no percentile rankings, no social login.

### 3. Free Job Description Match Checker (Top-of-Funnel)

Let users paste a job description + resume text **without signing up** to see keyword match score.

**Flow**:
1. Section on landing page or separate `/match` page
2. Two text areas: paste resume + paste job description
3. Instant result: match percentage + missing keywords list
4. CTA: "Sign up free to see full analysis with inline fixes"

**Implementation**: Client-side keyword extraction (no AI credits burned). Compare job description keywords against resume text.

**Why**: Jobscan charges $50/mo for this. Making it free is a differentiator and top-of-funnel hook.

### 4. Dashboard Changes

- **Share Score button**: On analysis results, generates PNG score card
- **Score improvement tracking**: Analytics page shows score deltas on re-analysis
- No changes to the core 4-step flow (Upload → Analysis → Rewrite → Preview)

### 5. SEO

- Free match checker targets "resume job description match" keywords
- Landing page title: "ResumeLab — Fix Your Resume Inline with AI"

## What We're NOT Building

- No job tracker, Chrome extension, or LinkedIn integration
- No leaderboards or gamification beyond the score card
- No blog/content platform
- No free tier expansion — 25 credits is already generous

## Effort Estimates

| Change | Effort | Impact |
|--------|--------|--------|
| Landing page messaging overhaul | Medium | High |
| Shareable score card (PNG) | Medium | High |
| Free keyword match checker | Medium | High |
| Competitor comparison section | Low | Medium |
| Pricing reframe (anti-subscription) | Low | Medium |
| Share button in dashboard | Low | Medium |
