'use client'

import React, { useRef, useCallback, useState } from 'react'

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

interface PreviewTabProps {
  rewrite: string | null
  resumeText: string
  editableResume: string
  setEditableResume: (text: string) => void
  pdfPreviewUrl: string | null
  previewLoading: boolean
  exportLoading: boolean
  saving: boolean
  saveSuccess: boolean
  currentAnalysisId: string | null
  analysisScore: number | null
  improvedScore: {
    score: number
    scoreBreakdown: {
      impact: { score: number; label: string }
      clarity: { score: number; label: string }
      ats: { score: number; label: string }
      structure: { score: number; label: string }
    }
    topImprovements: string[]
  } | null
  scoringRewrite: boolean
  structuredAnalysis: StructuredAnalysis | null
  hasExported: boolean
  onHandleExport: () => void
  onHandleSave: () => void
  onHandleRewrite: () => void
  onGeneratePreview: (text: string) => void
  onSetActiveTab: (tab: 'upload' | 'analysis' | 'rewrite' | 'preview') => void
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-[10px] text-blue-600 font-medium hover:bg-blue-100 transition-colors"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function NiceToHaveButton({ isClickable, applyFix, fixedText }: { isClickable: boolean; applyFix: () => void; fixedText: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        if (isClickable) {
          applyFix()
        } else {
          navigator.clipboard.writeText(fixedText)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }
      }}
      className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-200 transition-colors"
    >
      {copied ? 'Copied!' : isClickable ? 'Apply' : 'Copy'}
    </button>
  )
}

export function PreviewTab({
  rewrite,
  resumeText,
  editableResume,
  setEditableResume,
  pdfPreviewUrl,
  previewLoading,
  exportLoading,
  saving,
  saveSuccess,
  currentAnalysisId,
  analysisScore,
  improvedScore,
  scoringRewrite,
  structuredAnalysis,
  onHandleExport,
  onHandleSave,
  onHandleRewrite,
  onGeneratePreview,
  onSetActiveTab,
}: PreviewTabProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])

  // Track changes for undo/redo
  const updateWithUndo = useCallback((newText: string) => {
    setUndoStack(prev => [...prev, editableResume])
    setRedoStack([])
    setEditableResume(newText)
  }, [editableResume, setEditableResume])

  const undo = useCallback(() => {
    if (undoStack.length === 0) return
    const prev = undoStack[undoStack.length - 1]
    setRedoStack(r => [...r, editableResume])
    setUndoStack(s => s.slice(0, -1))
    setEditableResume(prev)
  }, [undoStack, editableResume, setEditableResume])

  const redo = useCallback(() => {
    if (redoStack.length === 0) return
    const next = redoStack[redoStack.length - 1]
    setUndoStack(s => [...s, editableResume])
    setRedoStack(r => r.slice(0, -1))
    setEditableResume(next)
  }, [redoStack, editableResume, setEditableResume])

  const wrapSelection = useCallback((before: string, after: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const text = editableResume
    const selected = text.slice(start, end)
    const newText = text.slice(0, start) + before + selected + after + text.slice(end)
    setEditableResume(newText)
    // Restore cursor position after the wrapped text
    requestAnimationFrame(() => {
      ta.focus()
      ta.selectionStart = start + before.length
      ta.selectionEnd = end + before.length
    })
  }, [editableResume, setEditableResume])

  const insertAtCursor = useCallback((insert: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const text = editableResume
    // Find the start of the current line
    const lineStart = text.lastIndexOf('\n', start - 1) + 1
    const newText = text.slice(0, lineStart) + insert + text.slice(lineStart)
    setEditableResume(newText)
    requestAnimationFrame(() => {
      ta.focus()
      ta.selectionStart = ta.selectionEnd = lineStart + insert.length
    })
  }, [editableResume, setEditableResume])

  const insertNewSection = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    const pos = ta.selectionStart
    const text = editableResume
    const insert = '\n\nNEW SECTION\n'
    const newText = text.slice(0, pos) + insert + text.slice(pos)
    setEditableResume(newText)
    requestAnimationFrame(() => {
      ta.focus()
      // Select "NEW SECTION" so user can type over it
      ta.selectionStart = pos + 2
      ta.selectionEnd = pos + 2 + 'NEW SECTION'.length
    })
  }, [editableResume, setEditableResume])

  return (
    <div className="animate-tab-enter bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
      {(rewrite || resumeText) ? (
        <div className="max-w-6xl mx-auto">
          {/* Header with action buttons */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Edit & Export</h2>
              <p className="text-sm text-slate-500 mt-1">
                {rewrite ? 'Edit your resume text, then export as PDF' : 'Apply suggested fixes, edit your resume, then export as PDF'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onHandleSave}
                disabled={!currentAnalysisId || saving}
                className={`flex items-center space-x-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                  saveSuccess
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {saving ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    <span>Save</span>
                  </>
                )}
              </button>
              <button
                onClick={onHandleExport}
                disabled={!editableResume || exportLoading}
                className="flex items-center space-x-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow-none hover:shadow-sm disabled:opacity-50"
              >
                {exportLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Score Card */}
          {(analysisScore || improvedScore || scoringRewrite) && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-6">
                {/* Animated Score Circle */}
                <div className="flex-shrink-0 relative">
                  {(() => {
                    const currentScore = improvedScore?.score ?? analysisScore ?? 0
                    const radius = 44
                    const circumference = 2 * Math.PI * radius
                    const progress = (currentScore / 100) * circumference
                    const scoreColor = currentScore >= 75 ? '#16a34a' : currentScore >= 55 ? '#d97706' : '#ef4444'
                    const bgColor = currentScore >= 75 ? '#dcfce7' : currentScore >= 55 ? '#fef3c7' : '#fee2e2'
                    return (
                      <div className="relative w-28 h-28">
                        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r={radius} fill="none" stroke={bgColor} strokeWidth="8" />
                          <circle
                            cx="50" cy="50" r={radius}
                            fill="none"
                            stroke={scoreColor}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference - progress}
                            style={{ transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease' }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          {scoringRewrite ? (
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                          ) : (
                            <>
                              <span className="text-2xl font-bold" style={{ color: scoreColor, transition: 'color 0.5s ease' }}>
                                {currentScore}
                              </span>
                              <span className="text-[10px] text-slate-400 -mt-0.5">/100</span>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Score Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    {analysisScore && improvedScore && (
                      <>
                        <span className="text-sm text-slate-500">
                          <span className="line-through">{analysisScore}</span>
                        </span>
                        <svg className="h-4 w-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span className={`text-sm font-semibold ${improvedScore.score >= 75 ? 'text-green-600' : 'text-amber-600'}`}>
                          {improvedScore.score}
                        </span>
                        {improvedScore.score > analysisScore && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                            +{improvedScore.score - analysisScore}
                          </span>
                        )}
                      </>
                    )}
                    {scoringRewrite && (
                      <span className="text-xs text-slate-400 animate-pulse">Rescoring...</span>
                    )}
                  </div>

                  {/* Breakdown Bars */}
                  {improvedScore?.scoreBreakdown && (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                      {Object.entries(improvedScore.scoreBreakdown).map(([key, val]) => {
                        const maxScore = key === 'impact' ? 35 : key === 'structure' ? 15 : 25
                        const pct = Math.round((val.score / maxScore) * 100)
                        const barColor = pct >= 75 ? 'bg-green-500' : pct >= 55 ? 'bg-amber-500' : 'bg-red-500'
                        return (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 w-14 flex-shrink-0 capitalize">{key === 'ats' ? 'ATS' : key}</span>
                            <div className="flex-1 h-1.5 rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full ${barColor} animate-progress-fill`}
                                style={{ '--target-width': `${pct}%` } as React.CSSProperties}
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-700 w-8 text-right">{val.score}/{maxScore}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Top Improvements */}
                  {improvedScore?.topImprovements && improvedScore.topImprovements.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Areas to improve</span>
                      {improvedScore.topImprovements.map((imp, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <svg className="h-3.5 w-3.5 mt-0.5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span>{imp}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Suggested Fixes from Analysis */}
          {structuredAnalysis && structuredAnalysis.fixes.length > 0 && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <svg className="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Suggested Fixes
                </h3>
                <div className="flex items-center gap-2">
                  {/* Undo / Redo */}
                  <button
                    onClick={undo}
                    disabled={undoStack.length === 0}
                    className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Undo"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l4-4M3 10l4 4" />
                    </svg>
                  </button>
                  <button
                    onClick={redo}
                    disabled={redoStack.length === 0}
                    className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Redo"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a5 5 0 00-5 5v2m15-7l-4-4m4 4l-4 4" />
                    </svg>
                  </button>
                  <div className="w-px h-4 bg-slate-200" />
                  {/* Apply All critical+important */}
                  <button
                    onClick={() => {
                      const criticalAndImportant = structuredAnalysis.fixes.filter(f => f.severity !== 'nice-to-have')
                      let text = editableResume
                      const normalize = (s: string) => s.replace(/\s+/g, ' ').trim()
                      for (const fix of criticalAndImportant) {
                        if (normalize(text).includes(normalize(fix.current))) {
                          // Exact
                          if (text.includes(fix.current)) {
                            text = text.replace(fix.current, fix.fixed)
                          } else {
                            // Whitespace-normalized
                            const escaped = fix.current.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                            const pattern = escaped.replace(/\s+/g, '\\s+')
                            text = text.replace(new RegExp(pattern), fix.fixed)
                          }
                        }
                      }
                      if (text !== editableResume) updateWithUndo(text)
                    }}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Apply All Fixes
                  </button>
                  {!rewrite && (
                    <button
                      onClick={() => { onSetActiveTab('rewrite'); onHandleRewrite() }}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      AI Rewrite &rarr;
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {structuredAnalysis.fixes.map((fix, i) => {
                  // Normalize whitespace for fuzzy matching (handles line breaks from PDF parsing)
                  const normalize = (s: string) => s.replace(/\s+/g, ' ').trim()
                  const normalizedResume = normalize(editableResume)
                  const isApplied = normalizedResume.includes(normalize(fix.fixed)) && !normalizedResume.includes(normalize(fix.current))
                  const canApply = normalizedResume.includes(normalize(fix.current))

                  // Aggressive fuzzy: match first 5+ significant words from fix.current
                  const keyWords = fix.current.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2).slice(0, 5)
                  const canFuzzyApply = !canApply && !isApplied && keyWords.length >= 3 && (() => {
                    const fuzzyRe = new RegExp(keyWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\\s\\S]{0,30}'), 'i')
                    return fuzzyRe.test(editableResume)
                  })()

                  const applyFix = () => {
                    updateWithUndo((() => {
                      const prev = editableResume
                      // 1. Exact match
                      if (prev.includes(fix.current)) {
                        return prev.replace(fix.current, fix.fixed)
                      }
                      // 2. Whitespace-normalized regex
                      const escaped = fix.current.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                      const fuzzyPattern = escaped.replace(/\s+/g, '\\s+')
                      const wsResult = prev.replace(new RegExp(fuzzyPattern), fix.fixed)
                      if (wsResult !== prev) return wsResult
                      // 3. Key-word fuzzy match (find the span containing those words and replace it)
                      if (keyWords.length >= 3) {
                        const fuzzyRe = new RegExp(keyWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\\s\\S]{0,30}'), 'i')
                        const match = prev.match(fuzzyRe)
                        if (match && match[0]) {
                          return prev.replace(match[0], fix.fixed)
                        }
                      }
                      return prev
                    })())
                  }

                  const isNiceToHave = fix.severity === 'nice-to-have'
                  const isClickable = !isApplied && (canApply || canFuzzyApply)

                  return (
                    <div
                      key={i}
                      className={`rounded-lg border p-3 transition-colors ${
                        isApplied
                          ? 'border-green-200 bg-green-50'
                          : isClickable && !isNiceToHave
                            ? 'border-slate-200 hover:border-primary-300 hover:bg-primary-50/30 cursor-pointer'
                            : 'border-slate-100 bg-slate-50'
                      }`}
                      onClick={() => { if (isClickable && !isNiceToHave) applyFix() }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                              fix.severity === 'critical' ? 'bg-red-100 text-red-700' :
                              fix.severity === 'important' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {fix.severity}
                            </span>
                            <span className="text-xs font-medium text-slate-800 truncate">{fix.title}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mb-1.5">{fix.problem}</div>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-red-400 font-medium">Before:</span>
                              <p className="text-slate-600 line-through mt-0.5 break-words">{fix.current.length > 120 ? fix.current.slice(0, 120) + '...' : fix.current}</p>
                            </div>
                            <div>
                              <span className="text-green-500 font-medium">After:</span>
                              <p className="text-slate-700 mt-0.5 break-words">{fix.fixed.length > 120 ? fix.fixed.slice(0, 120) + '...' : fix.fixed}</p>
                            </div>
                          </div>
                          {/* Copy button for truly unmatched fixes */}
                          {!isApplied && !canApply && !canFuzzyApply && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigator.clipboard.writeText(fix.fixed)
                                const btn = e.currentTarget
                                btn.textContent = 'Copied!'
                                setTimeout(() => { btn.textContent = 'Copy suggestion to clipboard' }, 1500)
                              }}
                              className="mt-2 text-[10px] text-primary-600 hover:text-primary-700 font-medium underline"
                            >
                              Copy suggestion to clipboard
                            </button>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {isApplied ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-[10px] font-semibold text-green-700">
                              <svg className="h-3 w-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Applied
                            </span>
                          ) : isNiceToHave ? (
                            <NiceToHaveButton isClickable={isClickable} applyFix={applyFix} fixedText={fix.fixed} />
                          ) : isClickable ? (
                            <span className="inline-flex items-center rounded-full bg-black px-2.5 py-1 text-[10px] font-semibold text-white">
                              Apply
                            </span>
                          ) : (
                            <CopyButton text={fix.fixed} />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Editable Resume + PDF Preview side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editable textarea */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 flex items-center">
                  <svg className="h-4 w-4 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Your Resume
                </h3>
                {editableResume !== (rewrite || resumeText) && (
                  <button
                    onClick={() => {
                      const base = rewrite || resumeText
                      setEditableResume(base)
                      onGeneratePreview(base)
                    }}
                    className="text-xs text-slate-500 hover:text-slate-700 underline"
                  >
                    {rewrite ? 'Reset to AI version' : 'Reset to original'}
                  </button>
                )}
              </div>
              {/* Formatting toolbar */}
              <div className="flex items-center gap-1 mb-2 p-1.5 rounded-lg border border-slate-200 bg-slate-50 w-fit">
                <button
                  type="button"
                  onClick={() => wrapSelection('**', '**')}
                  className="px-2.5 py-1.5 rounded text-sm font-bold text-slate-600 hover:bg-white hover:shadow-sm transition-all"
                  title="Bold (wrap in **)"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => wrapSelection('*', '*')}
                  className="px-2.5 py-1.5 rounded text-sm italic text-slate-600 hover:bg-white hover:shadow-sm transition-all"
                  title="Italic (wrap in *)"
                >
                  I
                </button>
                <div className="w-px h-5 bg-slate-200 mx-1" />
                <button
                  type="button"
                  onClick={() => insertAtCursor('• ')}
                  className="px-2.5 py-1.5 rounded text-sm text-slate-600 hover:bg-white hover:shadow-sm transition-all"
                  title="Bullet point"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() => insertAtCursor('– ')}
                  className="px-2.5 py-1.5 rounded text-sm text-slate-600 hover:bg-white hover:shadow-sm transition-all"
                  title="Dash bullet"
                >
                  – Dash
                </button>
                <div className="w-px h-5 bg-slate-200 mx-1" />
                <button
                  type="button"
                  onClick={insertNewSection}
                  className="px-2.5 py-1.5 rounded text-sm text-slate-600 hover:bg-white hover:shadow-sm transition-all"
                  title="Add new section header"
                >
                  + Section
                </button>
              </div>
              <textarea
                ref={textareaRef}
                value={editableResume}
                onChange={(e) => setEditableResume(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-4 text-sm font-mono leading-relaxed text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                style={{ minHeight: '600px' }}
                placeholder="Your resume text will appear here..."
              />
              <p className="text-xs text-slate-400 mt-2">
                Edit freely — the preview updates automatically after you stop typing
              </p>
            </div>

            {/* PDF Preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 flex items-center">
                  <svg className="h-4 w-4 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  PDF Preview
                </h3>
                <button
                  onClick={() => onGeneratePreview(editableResume)}
                  disabled={previewLoading || !editableResume}
                  className="flex items-center space-x-1 text-xs text-primary-600 hover:text-primary-700 disabled:opacity-50"
                >
                  <svg className={`h-3.5 w-3.5 ${previewLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </button>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-100 min-h-[600px] flex items-center justify-center">
                {previewLoading ? (
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
                    <p className="mt-4 text-slate-600">Generating preview...</p>
                  </div>
                ) : pdfPreviewUrl ? (
                  <iframe
                    src={pdfPreviewUrl}
                    className="w-full h-[600px] rounded-xl"
                    title="Resume Preview"
                  />
                ) : (
                  <div className="text-center text-slate-500">
                    <svg className="mx-auto h-16 w-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-4">Preview loading...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="rounded-full bg-slate-100 p-6 w-fit mx-auto">
            <svg className="h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="mt-6 text-xl font-bold text-slate-900">Edit & Export</h2>
          <p className="mt-3 text-slate-600">
            Analyze your resume first to get suggestions and export.
          </p>
          <button
            onClick={() => onSetActiveTab('upload')}
            className="mt-6 text-primary-600 font-medium hover:underline"
          >
            &larr; Go to Upload
          </button>
        </div>
      )}
    </div>
  )
}
