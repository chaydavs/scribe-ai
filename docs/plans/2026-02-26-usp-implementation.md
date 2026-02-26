# ResumeLab USP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the USP strategy — new landing page messaging, shareable score cards, and free keyword match checker — to differentiate ResumeLab as "the only resume editor with built-in AI fixes."

**Architecture:** Three independent features: (1) Landing page copy/layout overhaul, (2) canvas-rendered shareable score card with download/copy, (3) client-side keyword match checker on landing page. All client-side, no new API routes needed.

**Tech Stack:** Next.js 14, React, Tailwind CSS, HTML5 Canvas API, TypeScript

---

### Task 1: Landing Page — Hero Section Messaging

**Files:**
- Modify: `src/app/(marketing)/page.tsx:132-175` (hero section)

**Step 1: Update hero badge, headline, subtext, and CTA**

Replace the hero section content:

```tsx
{/* Hero badge */}
<div className="inline-flex items-center rounded-full bg-teal-50 border border-teal-200 px-4 py-1.5 text-sm font-medium text-teal-700 mb-6">
  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
  The only resume editor with built-in AI fixes
</div>

{/* Headline */}
<h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
  Fix your resume{' '}
  <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
    right here
  </span>
  {' '}&mdash; not in another tab
</h1>

{/* Subtext */}
<p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed">
  Upload your resume, see exactly what&apos;s wrong with inline highlights, fix it with one click, and export as PDF. 60 seconds. No subscription.
</p>

{/* CTA */}
<Link href="/signup" className="group rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-teal-500/30 transition-all hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5">
  Fix My Resume Now
  <svg className="inline-block ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
</Link>
```

**Step 2: Verify the landing page renders correctly**

Run: `npx next build`
Expected: Build passes clean.

**Step 3: Commit**

```bash
git add src/app/(marketing)/page.tsx
git commit -m "feat: update hero messaging to USP positioning"
```

---

### Task 2: Landing Page — Competitor Comparison Section

**Files:**
- Modify: `src/app/(marketing)/page.tsx:177-207` (replace "How It's Different" before/after section)

**Step 1: Replace the BeforeAfter section with a comparison table**

Replace the entire "How It's Different" section with a two-column comparison:

```tsx
<section className="py-20 bg-white/70">
  <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        Why ResumeLab is different
      </h2>
      <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
        Other tools give you a report. We give you an editor.
      </p>
    </div>

    <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
      {/* Other tools column */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
            <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-500">Other resume tools</h3>
        </div>
        <ul className="space-y-4">
          {[
            { text: 'Give you a score and a report', detail: 'You still have to open Word/Docs to make changes' },
            { text: 'Charge $29-50/month', detail: 'Subscription for a tool you need for 2 weeks' },
            { text: 'Generate generic AI rewrites', detail: 'Same corporate-speak for everyone' },
            { text: 'Require Chrome extensions & job trackers', detail: 'Feature bloat you didn\'t ask for' },
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{item.text}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ResumeLab column */}
      <div className="rounded-2xl border-2 border-teal-500 bg-gradient-to-br from-teal-50 to-emerald-50 p-6 relative">
        <div className="absolute -top-3 left-6 rounded-full bg-teal-500 px-3 py-0.5 text-xs font-medium text-white">
          ResumeLab
        </div>
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100">
            <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-teal-700">A better way</h3>
        </div>
        <ul className="space-y-4">
          {[
            { text: 'Edit and fix directly on your resume', detail: 'Inline highlights + one-click apply, like Google Docs suggestions' },
            { text: 'Pay $10 once, not $50/month', detail: 'Credits for your job search — no recurring charge' },
            { text: 'Rewrites using YOUR real experience', detail: 'Nothing fabricated — your voice, stronger impact' },
            { text: 'One tool that does the whole job', detail: 'Upload → fix → export PDF. That\'s it.' },
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{item.text}</p>
                <p className="text-xs text-slate-600 mt-0.5">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
</section>
```

Keep the `BeforeAfter` component definition — it's no longer used in the new section but remove it to keep the file clean.

**Step 2: Build and verify**

Run: `npx next build`
Expected: Build passes clean.

**Step 3: Commit**

```bash
git add src/app/(marketing)/page.tsx
git commit -m "feat: replace before/after with competitor comparison section"
```

---

### Task 3: Landing Page — Pricing Anti-Subscription Reframe

**Files:**
- Modify: `src/app/(marketing)/page.tsx:418-537` (pricing section)

**Step 1: Add competitor price comparison above pricing cards**

Add this between the section header and the grid:

```tsx
<div className="flex items-center justify-center gap-6 mb-10 flex-wrap">
  <div className="flex items-center gap-2 text-sm text-slate-400">
    <span className="line-through">Jobscan: $50/mo</span>
  </div>
  <div className="flex items-center gap-2 text-sm text-slate-400">
    <span className="line-through">Teal: $36/mo</span>
  </div>
  <div className="flex items-center gap-2 text-sm text-slate-400">
    <span className="line-through">Rezi: $29/mo</span>
  </div>
  <div className="flex items-center gap-2 text-sm font-semibold text-teal-600">
    ResumeLab: $10 total
  </div>
</div>
```

**Step 2: Update section subtitle**

Change pricing subtitle from:
```
Every plan includes full analysis, inline fixes, AI rewrite, and PDF export
```
to:
```
No subscription. Buy credits, use them when you need them. They never expire.
```

**Step 3: Build and verify**

Run: `npx next build`
Expected: Build passes clean.

**Step 4: Commit**

```bash
git add src/app/(marketing)/page.tsx
git commit -m "feat: add competitor pricing comparison and anti-subscription messaging"
```

---

### Task 4: Shareable Score Card Component

**Files:**
- Create: `src/components/tools/resumelab/score-card.tsx`

**Step 1: Create the ScoreCard component**

This component renders a score card as a canvas element and provides download/copy functionality.

```tsx
'use client'

import { useRef, useEffect, useCallback } from 'react'

interface ScoreCardProps {
  score: number
  scoreBreakdown: {
    impact: { score: number; label: string }
    clarity: { score: number; label: string }
    ats: { score: number; label: string }
    structure: { score: number; label: string }
  }
  previousScore?: number | null
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#059669' // green
  if (score >= 60) return '#d97706' // amber
  if (score >= 40) return '#ea580c' // orange
  return '#dc2626' // red
}

export function ScoreCard({ score, scoreBreakdown, previousScore }: ScoreCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const W = 600
    const H = 340
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, '#0f172a') // slate-900
    bg.addColorStop(1, '#1e293b') // slate-800
    ctx.fillStyle = bg
    ctx.beginPath()
    ctx.roundRect(0, 0, W, H, 16)
    ctx.fill()

    // Score circle
    const cx = 120, cy = 130, r = 60
    // Background ring
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = '#334155' // slate-700
    ctx.lineWidth = 10
    ctx.stroke()
    // Score ring
    const angle = (score / 100) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + angle)
    ctx.strokeStyle = getScoreColor(score)
    ctx.lineWidth = 10
    ctx.lineCap = 'round'
    ctx.stroke()
    // Score text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${score}`, cx, cy - 6)
    ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillStyle = '#94a3b8' // slate-400
    ctx.fillText('out of 100', cx, cy + 22)

    // Improvement delta
    if (previousScore != null && previousScore !== score) {
      const delta = score - previousScore
      const deltaText = `${delta > 0 ? '+' : ''}${delta} from ${previousScore}`
      ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.fillStyle = delta > 0 ? '#34d399' : '#f87171'
      ctx.fillText(deltaText, cx, cy + 80)
    }

    // Sub-scores
    const categories = [
      { label: 'Impact', score: scoreBreakdown.impact.score },
      { label: 'Clarity', score: scoreBreakdown.clarity.score },
      { label: 'ATS-Ready', score: scoreBreakdown.ats.score },
      { label: 'Structure', score: scoreBreakdown.structure.score },
    ]
    const startX = 260
    const barW = 280
    const barH = 8

    categories.forEach((cat, i) => {
      const y = 70 + i * 52

      // Label
      ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.fillStyle = '#94a3b8'
      ctx.textAlign = 'left'
      ctx.fillText(cat.label, startX, y)

      // Score value
      ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'right'
      ctx.fillText(`${cat.score}`, startX + barW, y)

      // Bar background
      const barY = y + 8
      ctx.fillStyle = '#334155'
      ctx.beginPath()
      ctx.roundRect(startX, barY, barW, barH, 4)
      ctx.fill()

      // Bar fill
      const fillW = (cat.score / 100) * barW
      ctx.fillStyle = getScoreColor(cat.score)
      ctx.beginPath()
      ctx.roundRect(startX, barY, fillW, barH, 4)
      ctx.fill()
    })

    // Branding footer
    ctx.fillStyle = '#475569' // slate-600
    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Checked with ResumeLab \u2014 resumelab.com', W / 2, H - 20)

    // Teal accent line at top
    ctx.fillStyle = '#14b8a6' // teal-500
    ctx.beginPath()
    ctx.roundRect(0, 0, W, 4, [16, 16, 0, 0])
    ctx.fill()
  }, [score, scoreBreakdown, previousScore])

  useEffect(() => { draw() }, [draw])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `resumelab-score-${score}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleCopy = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      }
    } catch {
      // Fallback: download instead
      handleDownload()
    }
  }

  return (
    <div className="space-y-3">
      <canvas ref={canvasRef} className="w-full max-w-[600px] rounded-2xl" />
      <div className="flex items-center gap-2">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Image
        </button>
      </div>
    </div>
  )
}
```

**Step 2: Build and verify**

Run: `npx next build`
Expected: Build passes clean.

**Step 3: Commit**

```bash
git add src/components/tools/resumelab/score-card.tsx
git commit -m "feat: add shareable score card canvas component"
```

---

### Task 5: Add Share Score Button to Analysis UI

**Files:**
- Modify: `src/components/tools/resumelab/interactive-analysis.tsx`

**Step 1: Add share button and score card modal**

At the top of the component, add state:
```tsx
const [showShareCard, setShowShareCard] = useState(false)
```

Add import:
```tsx
import { ScoreCard } from './score-card'
```

Find the score display area (the compact score band at the top of the component). Add a "Share Score" button next to the existing score display:

```tsx
<button
  onClick={() => setShowShareCard(!showShareCard)}
  className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 transition-colors"
>
  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
  Share Score
</button>
```

Add the collapsible score card panel below the score band:

```tsx
{showShareCard && (
  <div className="border-b border-slate-200 bg-slate-50 p-4">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-medium text-slate-700">Share your score</p>
      <button
        onClick={() => setShowShareCard(false)}
        className="text-slate-400 hover:text-slate-600"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <ScoreCard
      score={structuredAnalysis.score}
      scoreBreakdown={structuredAnalysis.scoreBreakdown}
    />
  </div>
)}
```

**Step 2: Build and verify**

Run: `npx next build`
Expected: Build passes clean.

**Step 3: Commit**

```bash
git add src/components/tools/resumelab/interactive-analysis.tsx
git commit -m "feat: add share score button to analysis UI"
```

---

### Task 6: Free Keyword Match Checker on Landing Page

**Files:**
- Modify: `src/app/(marketing)/page.tsx` (add new section before pricing)

**Step 1: Add the KeywordMatcher component**

Add this component definition at the top of the file (after the existing `BeforeAfter` component or replacing it):

```tsx
'use client'
// Note: page.tsx may need 'use client' at top if not already present.
// The page is a server component by default — if it doesn't have 'use client',
// extract KeywordMatcher into a separate file:
// src/components/tools/resumelab/keyword-matcher.tsx

function KeywordMatcher() {
  const [resumeText, setResumeText] = useState('')
  const [jobText, setJobText] = useState('')
  const [result, setResult] = useState<{
    matchPercent: number
    found: string[]
    missing: string[]
  } | null>(null)

  const analyze = () => {
    if (!resumeText.trim() || !jobText.trim()) return

    // Extract meaningful keywords from job description
    const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','need','must','that','this','these','those','it','its','we','our','you','your','they','their','them','he','she','him','her','who','which','what','where','when','how','all','each','every','both','few','more','most','other','some','such','no','not','only','same','so','than','too','very','just','about','above','after','again','also','as','because','before','between','from','here','into','over','then','there','through','under','until','up','while','if','any','new','work','working','experience','including','ability','using','across','within','well','strong','ensure','within','role','team','join','looking','ideal','candidate','required','preferred','qualifications','responsibilities','requirements','etc','per','via'])

    const extractKeywords = (text: string): Set<string> => {
      const words = text.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, ' ').split(/\s+/)
      const keywords = new Set<string>()

      // Single words (3+ chars, not stop words)
      words.forEach(w => {
        if (w.length >= 3 && !stopWords.has(w)) keywords.add(w)
      })

      // Two-word phrases
      for (let i = 0; i < words.length - 1; i++) {
        const phrase = `${words[i]} ${words[i + 1]}`
        if (!stopWords.has(words[i]) && !stopWords.has(words[i + 1]) && words[i].length >= 2 && words[i + 1].length >= 2) {
          keywords.add(phrase)
        }
      }

      return keywords
    }

    const jobKeywords = extractKeywords(jobText)
    const resumeLower = resumeText.toLowerCase()

    const found: string[] = []
    const missing: string[] = []

    jobKeywords.forEach(kw => {
      if (resumeLower.includes(kw)) {
        found.push(kw)
      } else {
        missing.push(kw)
      }
    })

    // Sort missing by likely importance (longer phrases first, then alphabetical)
    missing.sort((a, b) => {
      const aWords = a.split(' ').length
      const bWords = b.split(' ').length
      if (aWords !== bWords) return bWords - aWords
      return a.localeCompare(b)
    })

    // Limit to top 20 missing to avoid noise
    const topMissing = missing.slice(0, 20)

    const total = found.length + topMissing.length
    const matchPercent = total > 0 ? Math.round((found.length / total) * 100) : 0

    setResult({ matchPercent, found: found.slice(0, 15), missing: topMissing })
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Paste your resume text
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume content here..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
            rows={6}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Paste the job description
          </label>
          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Paste the job posting here..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
            rows={6}
          />
        </div>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={analyze}
          disabled={!resumeText.trim() || !jobText.trim()}
          className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Check Match
        </button>
        <p className="mt-2 text-xs text-slate-500">Free — no signup required</p>
      </div>

      {result && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Keyword Match</p>
              <p className={`text-3xl font-bold ${result.matchPercent >= 70 ? 'text-green-600' : result.matchPercent >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                {result.matchPercent}%
              </p>
            </div>
            <Link
              href="/signup"
              className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 transition-colors"
            >
              Get full analysis with inline fixes
            </Link>
          </div>

          {result.missing.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-red-700 mb-2">Missing keywords ({result.missing.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {result.missing.map((kw, i) => (
                  <span key={i} className="rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs text-red-700">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.found.length > 0 && (
            <div>
              <p className="text-sm font-medium text-green-700 mb-2">Found keywords ({result.found.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {result.found.map((kw, i) => (
                  <span key={i} className="rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs text-green-700">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

**Important:** Since the landing page (`page.tsx`) is currently a server component (no `'use client'` at top), extract `KeywordMatcher` into a separate client component file: `src/components/tools/resumelab/keyword-matcher.tsx` with `'use client'` at top, and import it in the landing page.

**Step 2: Add the match checker section to the landing page**

Insert before the pricing section (before `{/* Pricing */}`):

```tsx
{/* Free Keyword Match Checker */}
<section className="py-20 bg-white/70" id="match">
  <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-10">
      <div className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-4 py-1.5 text-sm font-medium text-green-700 mb-4">
        Free tool — no signup needed
      </div>
      <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        Does your resume match the job?
      </h2>
      <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
        Paste your resume and a job description to instantly see which keywords you&apos;re missing.
        Other tools charge $50/month for this.
      </p>
    </div>
    <KeywordMatcher />
  </div>
</section>
```

**Step 3: Build and verify**

Run: `npx next build`
Expected: Build passes clean.

**Step 4: Commit**

```bash
git add src/components/tools/resumelab/keyword-matcher.tsx src/app/(marketing)/page.tsx
git commit -m "feat: add free keyword match checker on landing page"
```

---

### Task 7: Final Build, Push, and Verify

**Step 1: Full build check**

Run: `npx next build`
Expected: Build passes clean with no errors or warnings.

**Step 2: Push all changes**

```bash
git push
```

Expected: Auto-deploys to Vercel.

**Step 3: Verify deployment**

Check that the landing page loads with:
- New hero messaging
- Competitor comparison section
- Free keyword match checker
- Updated pricing with competitor prices

---

## Task Dependencies

```
Task 1 (Hero) ─────────────┐
Task 2 (Comparison) ────────┤
Task 3 (Pricing) ──────────┼── Task 7 (Build & Push)
Task 4 (Score Card) ────────┤
Task 5 (Share Button) ──────┤  (depends on Task 4)
Task 6 (Match Checker) ─────┘
```

Tasks 1-4 and 6 are independent and can be parallelized. Task 5 depends on Task 4.
