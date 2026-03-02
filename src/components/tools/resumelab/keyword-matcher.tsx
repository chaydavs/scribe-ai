'use client'

import { useState } from 'react'
import Link from 'next/link'

const STOP_WORDS = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','need','must','that','this','these','those','it','its','we','our','you','your','they','their','them','he','she','him','her','who','which','what','where','when','how','all','each','every','both','few','more','most','other','some','such','no','not','only','same','so','than','too','very','just','about','above','after','again','also','as','because','before','between','from','here','into','over','then','there','through','under','until','up','while','if','any','new','work','working','experience','including','ability','using','across','within','well','strong','ensure','role','team','join','looking','ideal','candidate','required','preferred','qualifications','responsibilities','requirements','etc','per','via'])

// Common ATS keywords grouped by category
const ATS_KEYWORDS: Record<string, string[]> = {
  'Action Verbs': ['managed','led','developed','designed','implemented','created','built','delivered','achieved','improved','increased','reduced','optimized','launched','spearheaded','coordinated','analyzed','executed','streamlined','established'],
  'Results & Metrics': ['revenue','growth','efficiency','roi','kpi','budget','cost savings','performance','productivity','conversion','retention','engagement'],
  'Leadership': ['cross-functional','stakeholder','mentored','supervised','collaborated','strategic','initiative','ownership','leadership','team lead'],
  'Technical': ['agile','scrum','ci/cd','api','cloud','saas','data-driven','automation','scalable','microservices','devops','machine learning','full-stack'],
  'Soft Skills': ['communication','problem-solving','analytical','detail-oriented','self-starter','adaptable','proactive','results-oriented','deadline-driven'],
}

function extractKeywords(text: string): Set<string> {
  const lower = text.toLowerCase().replace(/[^a-z0-9+#./\s-]/g, ' ')
  const words = lower.split(/\s+/)
  const keywords = new Set<string>()

  // Single words (3+ chars, not stop words)
  words.forEach(w => {
    if (w.length >= 3 && !STOP_WORDS.has(w)) keywords.add(w)
  })

  // Two-word phrases
  for (let i = 0; i < words.length - 1; i++) {
    if (!STOP_WORDS.has(words[i]) && !STOP_WORDS.has(words[i + 1]) && words[i].length >= 2 && words[i + 1].length >= 2) {
      keywords.add(`${words[i]} ${words[i + 1]}`)
    }
  }

  // Three-word phrases for compound terms
  for (let i = 0; i < words.length - 2; i++) {
    const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`
    if (phrase.length >= 8 && !STOP_WORDS.has(words[i]) && !STOP_WORDS.has(words[i + 2])) {
      keywords.add(phrase)
    }
  }

  return keywords
}

function findATSGaps(resumeText: string, jobText: string): string[] {
  const resumeLower = resumeText.toLowerCase()
  const jobLower = jobText.toLowerCase()
  const gaps: string[] = []

  // Check which ATS keywords appear in the job description but not the resume
  for (const [, keywords] of Object.entries(ATS_KEYWORDS)) {
    for (const kw of keywords) {
      if (jobLower.includes(kw) && !resumeLower.includes(kw)) {
        gaps.push(kw)
      }
    }
  }

  return gaps
}

export function KeywordMatcher() {
  const [resumeText, setResumeText] = useState('')
  const [jobText, setJobText] = useState('')
  const [result, setResult] = useState<{
    matchPercent: number
    found: string[]
    missing: string[]
    atsGaps: string[]
  } | null>(null)

  const analyze = () => {
    if (!resumeText.trim() || !jobText.trim()) return

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

    // Sort missing: longer phrases first (more specific = more valuable), then alphabetical
    missing.sort((a, b) => {
      const aWords = a.split(' ').length
      const bWords = b.split(' ').length
      if (aWords !== bWords) return bWords - aWords
      return a.localeCompare(b)
    })

    // Filter out single-word keywords that are substrings of found multi-word keywords
    const filteredMissing = missing.filter(kw => {
      if (kw.split(' ').length > 1) return true
      return !found.some(f => f.includes(kw))
    })

    const atsGaps = findATSGaps(resumeText, jobText)

    const topMissing = filteredMissing.slice(0, 20)
    const total = found.length + topMissing.length
    const matchPercent = total > 0 ? Math.round((found.length / total) * 100) : 0

    setResult({ matchPercent, found: found.slice(0, 15), missing: topMissing, atsGaps })
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
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
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
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
            rows={6}
          />
        </div>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={analyze}
          disabled={!resumeText.trim() || !jobText.trim()}
          className="rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Check Match
        </button>
        <p className="mt-2 text-xs text-slate-500">Free — no signup required</p>
      </div>

      {result && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div>
              <p className="text-sm text-slate-500">Keyword Match</p>
              <p className={`text-3xl font-bold ${result.matchPercent >= 70 ? 'text-green-600' : result.matchPercent >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                {result.matchPercent}%
              </p>
            </div>
            <Link
              href="/signup"
              className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
            >
              Get full analysis with inline fixes
            </Link>
          </div>

          {result.atsGaps.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-amber-700 mb-2">
                Suggested ATS keywords to add ({result.atsGaps.length})
              </p>
              <p className="text-xs text-slate-500 mb-2">These keywords appear in the job description and are commonly tracked by ATS systems.</p>
              <div className="flex flex-wrap gap-1.5">
                {result.atsGaps.map((kw, i) => (
                  <span key={i} className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs text-amber-700 font-medium">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.missing.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-red-700 mb-2">Missing from your resume ({result.missing.length})</p>
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
              <p className="text-sm font-medium text-green-700 mb-2">Found in your resume ({result.found.length})</p>
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
