'use client'

import { useState } from 'react'
import { getTool } from '@/types'

const tool = getTool('resumeradar')!

export default function ResumeRadarPage() {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError('Please paste your resume text')
      return
    }

    setError(null)
    setLoading(true)
    setAnalysis(null)

    try {
      const response = await fetch('/api/tools/resumeradar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          jobDescription: jobDescription.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze resume')
      }

      setAnalysis(data.analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{tool.name}</h1>
            <p className="mt-2 text-indigo-100">{tool.description}</p>
          </div>
          <div className="rounded-xl bg-white/20 px-4 py-2 backdrop-blur">
            <span className="text-sm font-medium">{tool.creditCost} credits</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center space-x-2">
              <div className="rounded-lg bg-indigo-100 p-2">
                <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Your Resume</h2>
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              className="w-full rounded-xl border border-slate-200 p-4 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[280px] resize-y"
              disabled={loading}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center space-x-2">
              <div className="rounded-lg bg-purple-100 p-2">
                <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Target Job (Optional)</h2>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description for tailored analysis..."
              className="w-full rounded-xl border border-slate-200 p-4 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[120px] resize-y"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || !resumeText.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Analyzing your resume...</span>
              </span>
            ) : (
              `Analyze Resume`
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center space-x-2">
            <div className="rounded-lg bg-green-100 p-2">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Analysis Results</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
              <p className="mt-4 text-sm text-slate-500">Analyzing your resume...</p>
            </div>
          ) : analysis ? (
            <div className="prose prose-sm max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-strong:text-slate-900 prose-li:text-slate-600">
              <div
                dangerouslySetInnerHTML={{
                  __html: analysis
                    .replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-bold mt-6 mb-3 text-slate-900">$1</h2>')
                    .replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg font-semibold mt-4 mb-2 text-slate-800">$1</h3>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
                    .replace(/- (.*?)(\n|$)/g, '<li class="ml-4 text-slate-600">$1</li>')
                    .replace(/\n\n/g, '</p><p class="my-3 text-slate-600">')
                    .replace(/\n/g, '<br />')
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-slate-100 p-4">
                <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="mt-4 text-slate-500">Paste your resume and click analyze to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
