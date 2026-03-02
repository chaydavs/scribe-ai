'use client'

import { useState, useEffect } from 'react'
import InteractiveAnalysis from '@/components/tools/resumelab/interactive-analysis'
import { AnalysisLoadingSkeleton } from '@/components/ui/skeleton'

interface StructuredAnalysis {
  score: number
  verdict: string
  scoreBreakdown: {
    impact: { score: number; label: string }
    clarity: { score: number; label: string }
    ats: { score: number; label: string }
    structure: { score: number; label: string }
  }
  strengths: Array<{ title: string; quote: string; why: string }>
  fixes: Array<{
    title: string
    severity: 'critical' | 'important' | 'nice-to-have'
    current: string
    problem: string
    fixed: string
    impact: string
  }>
  sectionReviews: Array<{
    name: string
    grade: string
    summary: string
    issues: string[]
  }>
  atsAnalysis: {
    score: number
    risks: string[]
    missingKeywords: string[]
    foundKeywords: string[]
  }
  quickWins: string[]
  nextStep: string
}

interface AnalysisTabProps {
  loading: boolean
  countdown: number
  analysis: string | null
  structuredAnalysis: StructuredAnalysis | null
  analysisScore: number | null
  resumeText: string
  rewrite: string | null
  creditCost: number
  onRequestRewrite: () => void
  onFixApplied: (newText: string) => void
  onSetActiveTab: (tab: 'upload' | 'analysis' | 'rewrite' | 'preview') => void
  onSetEditableResume: (text: string) => void
  onHandleRewrite: () => void
}

export function AnalysisTab({
  loading,
  countdown,
  analysis,
  structuredAnalysis,
  analysisScore,
  resumeText,
  rewrite,
  creditCost,
  onRequestRewrite,
  onFixApplied,
  onSetActiveTab,
  onSetEditableResume,
  onHandleRewrite,
}: AnalysisTabProps) {
  const [showBurst, setShowBurst] = useState(false)

  useEffect(() => {
    if (structuredAnalysis) {
      setShowBurst(true)
      const timeout = setTimeout(() => setShowBurst(false), 600)
      return () => clearTimeout(timeout)
    }
  }, [structuredAnalysis])

  return (
    <div className="animate-tab-enter">
      {loading ? (
        countdown > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20">
            {/* Countdown circle */}
            <div className="relative w-24 h-24 mb-4">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (countdown / 30)}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">{countdown > 0 ? countdown : '...'}</span>
              </div>
            </div>
            <p className="text-slate-700 font-medium">Analyzing your resume...</p>
            <p className="mt-1 text-sm text-slate-400">
              {countdown > 20 ? 'Reading every line like a recruiter would' :
               countdown > 10 ? 'Scoring impact, clarity, and ATS compatibility' :
               countdown > 0 ? 'Almost done — generating your detailed report' :
               'Finishing up...'}
            </p>
          </div>
        ) : (
          <AnalysisLoadingSkeleton />
        )
      ) : analysis && structuredAnalysis ? (
        <div className={showBurst ? 'animate-score-burst' : ''}>
          <InteractiveAnalysis
            structuredAnalysis={structuredAnalysis}
            resumeText={resumeText}
            onRequestRewrite={() => {
              onSetActiveTab('rewrite')
              if (!rewrite) onHandleRewrite()
            }}
            onFixApplied={(newText) => onFixApplied(newText)}
          />
          {/* Direct to Edit & Export CTA */}
          <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Ready to apply fixes and export?</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Edit your resume with suggested fixes, then download as PDF
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    onSetEditableResume(resumeText)
                    onSetActiveTab('preview')
                  }}
                  className="rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl"
                >
                  Edit &amp; Export &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : analysis ? (
        /* Fallback for non-structured analysis (old format) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-3xl mx-auto">
          {analysisScore && (
            <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-600">Resume Score</p>
                  <p className="text-4xl font-bold text-slate-900">{analysisScore}/100</p>
                </div>
                <button
                  onClick={() => { onSetActiveTab('rewrite'); if (!rewrite) onHandleRewrite() }}
                  className="text-primary-600 font-medium hover:underline"
                >
                  Get AI Rewrite
                </button>
              </div>
            </div>
          )}
          <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
              {analysis.replace(/```json[\s\S]*?```/g, '').trim()}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => onSetActiveTab('upload')}
              className="flex-1 rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Back to Upload
            </button>
            <button
              onClick={() => { onSetActiveTab('rewrite'); if (!rewrite) onHandleRewrite() }}
              className="flex-1 rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl"
            >
              Get AI Rewrite ({creditCost} credits)
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-slate-100 p-5">
            <svg className="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="mt-5 text-base font-medium text-slate-700">No analysis yet</p>
          <p className="mt-1 text-sm text-slate-500">Upload your resume first to get detailed feedback</p>
          <button onClick={() => onSetActiveTab('upload')} className="mt-5 text-sm text-primary-600 font-medium hover:underline">
            Go to Upload
          </button>
        </div>
      )}
    </div>
  )
}
