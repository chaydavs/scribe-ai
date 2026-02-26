'use client'

import { useState } from 'react'
import Link from 'next/link'

const STOP_WORDS = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','need','must','that','this','these','those','it','its','we','our','you','your','they','their','them','he','she','him','her','who','which','what','where','when','how','all','each','every','both','few','more','most','other','some','such','no','not','only','same','so','than','too','very','just','about','above','after','again','also','as','because','before','between','from','here','into','over','then','there','through','under','until','up','while','if','any','new','work','working','experience','including','ability','using','across','within','well','strong','ensure','role','team','join','looking','ideal','candidate','required','preferred','qualifications','responsibilities','requirements','etc','per','via'])

function extractKeywords(text: string): Set<string> {
  const words = text.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, ' ').split(/\s+/)
  const keywords = new Set<string>()

  words.forEach(w => {
    if (w.length >= 3 && !STOP_WORDS.has(w)) keywords.add(w)
  })

  // Two-word phrases
  for (let i = 0; i < words.length - 1; i++) {
    if (!STOP_WORDS.has(words[i]) && !STOP_WORDS.has(words[i + 1]) && words[i].length >= 2 && words[i + 1].length >= 2) {
      keywords.add(`${words[i]} ${words[i + 1]}`)
    }
  }

  return keywords
}

export function KeywordMatcher() {
  const [resumeText, setResumeText] = useState('')
  const [jobText, setJobText] = useState('')
  const [result, setResult] = useState<{
    matchPercent: number
    found: string[]
    missing: string[]
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

    // Sort missing: longer phrases first, then alphabetical
    missing.sort((a, b) => {
      const aWords = a.split(' ').length
      const bWords = b.split(' ').length
      if (aWords !== bWords) return bWords - aWords
      return a.localeCompare(b)
    })

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
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
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
