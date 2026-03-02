'use client'

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import ResumeAnnotator, { parseSections, type Annotation } from './resume-annotator'
import { ScoreCard } from './score-card'

// Types matching the StructuredAnalysis in page.tsx
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

interface InteractiveAnalysisProps {
  structuredAnalysis: StructuredAnalysis
  resumeText: string
  onRequestRewrite: () => void
  onFixApplied?: (newText: string) => void
}

type SeverityFilter = 'all' | 'critical' | 'important' | 'nice-to-have'

export default function InteractiveAnalysis({
  structuredAnalysis,
  resumeText,
  onRequestRewrite,
  onFixApplied,
}: InteractiveAnalysisProps) {
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null)
  const [appliedFixes, setAppliedFixes] = useState<Set<string>>(new Set())
  const [workingText, setWorkingText] = useState(resumeText)
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showShareCard, setShowShareCard] = useState(false)

  const sidebarFixRefs = useRef<Record<string, HTMLElement>>({})
  const documentRef = useRef<HTMLDivElement>(null)

  // Derive annotations from structured analysis
  const annotations: Annotation[] = useMemo(() => {
    const result: Annotation[] = []

    structuredAnalysis.fixes.forEach((fix, i) => {
      result.push({
        id: `fix-${i}`,
        text: fix.current,
        fixIndex: i,
        severity: fix.severity,
        isStrength: false,
      })
    })

    structuredAnalysis.strengths.forEach((s, i) => {
      result.push({
        id: `strength-${i}`,
        text: s.quote,
        fixIndex: i,
        severity: 'nice-to-have',
        isStrength: true,
      })
    })

    return result
  }, [structuredAnalysis])

  // Parse sections
  const sections = useMemo(
    () => parseSections(workingText, structuredAnalysis.sectionReviews),
    [workingText, structuredAnalysis.sectionReviews]
  )

  // Filter fixes by severity
  const filteredFixes = useMemo(() => {
    if (severityFilter === 'all') return structuredAnalysis.fixes.map((f, i) => ({ ...f, id: `fix-${i}`, index: i }))
    return structuredAnalysis.fixes
      .map((f, i) => ({ ...f, id: `fix-${i}`, index: i }))
      .filter(f => f.severity === severityFilter)
  }, [structuredAnalysis.fixes, severityFilter])

  // Counts
  const appliedCount = appliedFixes.size
  const totalFixes = structuredAnalysis.fixes.length
  const criticalCount = structuredAnalysis.fixes.filter(f => f.severity === 'critical').length
  const importantCount = structuredAnalysis.fixes.filter(f => f.severity === 'important').length

  // Handle annotation click from document
  const handleAnnotationClick = useCallback((id: string) => {
    setActiveAnnotationId(prev => prev === id ? null : id)
    setSidebarOpen(true)
    // Scroll sidebar to this fix
    setTimeout(() => {
      sidebarFixRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }, [])

  // Handle fix click from sidebar — scroll document to highlight
  const handleSidebarFixClick = useCallback((id: string) => {
    setActiveAnnotationId(prev => prev === id ? null : id)
    // Find the mark element in the document and scroll to it
    setTimeout(() => {
      const mark = documentRef.current?.querySelector(`[data-annotation-id="${id}"]`) as HTMLElement
      if (mark) mark.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }, [])

  // Apply a fix (with optional custom text)
  const applyFix = useCallback((fixId: string, fixIndex: number, customText?: string) => {
    const fix = structuredAnalysis.fixes[fixIndex]
    const replacement = customText || fix.fixed
    const newText = workingText.replace(fix.current, replacement)
    setWorkingText(newText)
    setAppliedFixes(prev => { const next = new Set(Array.from(prev)); next.add(fixId); return next })
    setActiveAnnotationId(null)
    onFixApplied?.(newText)
  }, [workingText, structuredAnalysis.fixes, onFixApplied])

  // Undo a fix
  const undoFix = useCallback((fixId: string, fixIndex: number) => {
    const fix = structuredAnalysis.fixes[fixIndex]
    const newText = workingText.replace(fix.fixed, fix.current)
    setWorkingText(newText)
    setAppliedFixes(prev => {
      const next = new Set(prev)
      next.delete(fixId)
      return next
    })
    onFixApplied?.(newText)
  }, [workingText, structuredAnalysis.fixes, onFixApplied])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sidebarOpen && window.innerWidth < 1024) {
        const sidebar = document.getElementById('analysis-sidebar')
        if (sidebar && !sidebar.contains(e.target as Node)) {
          setSidebarOpen(false)
        }
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [sidebarOpen])

  const maxScores: Record<string, number> = { impact: 35, clarity: 25, ats: 25, structure: 15 }

  return (
    <div className="flex flex-col h-full">
      {/* Compact Score Band */}
      <div className="flex items-center gap-4 px-6 py-3 bg-slate-900 text-white rounded-t-xl">
        <div className="flex items-center gap-2.5">
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
              <circle
                cx="20" cy="20" r="16" fill="none"
                stroke={structuredAnalysis.score >= 80 ? '#22c55e' : structuredAnalysis.score >= 60 ? '#eab308' : structuredAnalysis.score >= 40 ? '#f97316' : '#ef4444'}
                strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${(structuredAnalysis.score / 100) * 100.5} 100.5`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-black">{structuredAnalysis.score}</span>
          </div>
          <span className="text-sm text-slate-300 hidden sm:block">{structuredAnalysis.verdict}</span>
        </div>

        <div className="flex-1" />

        {/* Mini breakdown */}
        <div className="hidden md:flex items-center gap-3">
          {Object.entries(structuredAnalysis.scoreBreakdown).map(([key, val]) => {
            const max = maxScores[key] || 25
            const pct = Math.round((val.score / max) * 100)
            return (
              <div key={key} className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">{val.label.split(' ')[0]}</span>
                <div className="w-12 bg-white/10 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${pct >= 70 ? 'bg-green-400' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold">{val.score}</span>
              </div>
            )
          })}
        </div>

        {/* Applied counter */}
        {appliedCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 rounded-full">
            <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-bold text-green-400">{appliedCount}/{totalFixes}</span>
          </div>
        )}

        {/* Share Score */}
        <button
          onClick={() => setShowShareCard(!showShareCard)}
          className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      </div>

      {/* Shareable Score Card Panel */}
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

      {/* Main Layout */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Document Pane */}
        <div ref={documentRef} className="flex-1 overflow-hidden">
          <ResumeAnnotator
            text={workingText}
            annotations={annotations}
            sections={sections}
            activeAnnotationId={activeAnnotationId}
            appliedFixes={appliedFixes}
            onAnnotationClick={handleAnnotationClick}
          />
        </div>

        {/* Sidebar — Desktop */}
        <div
          id="analysis-sidebar"
          className={`
            hidden lg:flex flex-col w-[340px] border-l border-slate-200 bg-slate-50
            overflow-y-auto max-h-[calc(100vh-240px)] scrollbar-thin
          `}
        >
          <SidebarContent
            structuredAnalysis={structuredAnalysis}
            filteredFixes={filteredFixes}
            appliedFixes={appliedFixes}
            activeAnnotationId={activeAnnotationId}
            severityFilter={severityFilter}
            criticalCount={criticalCount}
            importantCount={importantCount}
            totalFixes={totalFixes}
            appliedCount={appliedCount}
            sidebarFixRefs={sidebarFixRefs}
            onSeverityFilter={setSeverityFilter}
            onFixClick={handleSidebarFixClick}
            onApplyFix={applyFix}
            onUndoFix={undoFix}
            onRequestRewrite={onRequestRewrite}
          />
        </div>

        {/* Mobile — Floating button + Bottom sheet */}
        <div className="lg:hidden">
          {/* Floating button */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-full shadow-xl shadow-primary-500/30 hover:bg-primary-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span className="text-sm font-bold">{totalFixes - appliedCount} issues</span>
            </button>
          )}

          {/* Bottom sheet */}
          {sidebarOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[70vh] overflow-hidden flex flex-col">
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 bg-slate-300 rounded-full" />
                </div>
                <div className="overflow-y-auto flex-1 px-1">
                  <SidebarContent
                    structuredAnalysis={structuredAnalysis}
                    filteredFixes={filteredFixes}
                    appliedFixes={appliedFixes}
                    activeAnnotationId={activeAnnotationId}
                    severityFilter={severityFilter}
                    criticalCount={criticalCount}
                    importantCount={importantCount}
                    totalFixes={totalFixes}
                    appliedCount={appliedCount}
                    sidebarFixRefs={sidebarFixRefs}
                    onSeverityFilter={setSeverityFilter}
                    onFixClick={(id) => { handleSidebarFixClick(id); setSidebarOpen(false) }}
                    onApplyFix={applyFix}
                    onUndoFix={undoFix}
                    onRequestRewrite={onRequestRewrite}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-primary-50 to-indigo-50 border-t border-primary-100 rounded-b-xl">
        <div>
          <p className="text-sm font-bold text-slate-900">
            {appliedCount === 0 ? 'Want all fixes applied automatically?' : `${appliedCount} fixes applied manually. Want the rest?`}
          </p>
          <p className="text-xs text-slate-500">AI Rewrite applies every fix and optimizes the full resume</p>
        </div>
        <button
          onClick={onRequestRewrite}
          className="flex-shrink-0 rounded-lg bg-gradient-to-r from-primary-500 to-primary-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl"
        >
          AI Rewrite
        </button>
      </div>
    </div>
  )
}

// Sidebar content — shared between desktop sidebar and mobile bottom sheet
function SidebarContent({
  structuredAnalysis,
  filteredFixes,
  appliedFixes,
  activeAnnotationId,
  severityFilter,
  criticalCount,
  importantCount,
  totalFixes,
  appliedCount,
  sidebarFixRefs,
  onSeverityFilter,
  onFixClick,
  onApplyFix,
  onUndoFix,
  onRequestRewrite,
}: {
  structuredAnalysis: StructuredAnalysis
  filteredFixes: Array<{ id: string; index: number; title: string; severity: string; current: string; problem: string; fixed: string; impact: string }>
  appliedFixes: Set<string>
  activeAnnotationId: string | null
  severityFilter: SeverityFilter
  criticalCount: number
  importantCount: number
  totalFixes: number
  appliedCount: number
  sidebarFixRefs: React.MutableRefObject<Record<string, HTMLElement>>
  onSeverityFilter: (f: SeverityFilter) => void
  onFixClick: (id: string) => void
  onApplyFix: (fixId: string, fixIndex: number, customText?: string) => void
  onUndoFix: (fixId: string, fixIndex: number) => void
  onRequestRewrite: () => void
}) {
  const [editingFixId, setEditingFixId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  return (
    <div className="p-4 space-y-4">
      {/* Apply All / Filter Row */}
      <div className="flex items-center gap-2">
        {appliedCount < totalFixes && (
          <button
            onClick={() => {
              // Apply all unapplied fixes at once
              filteredFixes.forEach(fix => {
                if (!appliedFixes.has(fix.id)) {
                  onApplyFix(fix.id, fix.index)
                }
              })
            }}
            className="flex-1 px-3 py-2 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            Apply All AI Fixes ({totalFixes - appliedCount})
          </button>
        )}
        {appliedCount > 0 && appliedCount === totalFixes && (
          <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-bold text-green-700">All fixes applied!</span>
          </div>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { key: 'all' as SeverityFilter, label: `All (${totalFixes})` },
          { key: 'critical' as SeverityFilter, label: `Critical (${criticalCount})` },
          { key: 'important' as SeverityFilter, label: `Important (${importantCount})` },
        ].map(pill => (
          <button
            key={pill.key}
            onClick={() => onSeverityFilter(pill.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              severityFilter === pill.key
                ? 'bg-primary-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Progress */}
      {appliedCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
          <div className="flex-1 bg-green-200 rounded-full h-1.5">
            <div
              className="h-1.5 bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${(appliedCount / totalFixes) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-green-700">{appliedCount}/{totalFixes}</span>
        </div>
      )}

      {/* Fix Cards — ALL expanded, showing before/after at once */}
      <div className="space-y-2">
        {filteredFixes.map(fix => {
          const isApplied = appliedFixes.has(fix.id)
          const isActive = activeAnnotationId === fix.id

          return (
            <div
              key={fix.id}
              ref={el => { if (el) sidebarFixRefs.current[fix.id] = el }}
              className={`rounded-lg border transition-all duration-200 overflow-hidden ${
                isApplied
                  ? 'border-green-200 bg-green-50/50'
                  : isActive
                    ? 'border-primary-400 bg-white shadow-md ring-1 ring-primary-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* Header */}
              <button
                onClick={() => onFixClick(fix.id)}
                className="w-full flex items-start gap-2 p-3 text-left"
              >
                <span className={`flex-shrink-0 mt-0.5 w-2 h-2 rounded-full ${
                  isApplied ? 'bg-green-500' :
                  fix.severity === 'critical' ? 'bg-red-500' :
                  fix.severity === 'important' ? 'bg-amber-500' : 'bg-blue-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isApplied ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {fix.title}
                  </p>
                </div>
                {isApplied && (
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* Always-visible before/after for unapplied fixes */}
              {!isApplied && (
                <div className="px-3 pb-3 space-y-2 border-t border-slate-100 pt-2">
                  {/* Before */}
                  <div className="rounded-md bg-red-50 border border-red-200 p-2">
                    <p className="text-[10px] font-bold text-red-500 uppercase mb-0.5">Current</p>
                    <p className="text-xs text-slate-700 italic">&ldquo;{fix.current}&rdquo;</p>
                  </div>

                  {/* After — textarea if editing, otherwise suggestion */}
                  {editingFixId === fix.id ? (
                    <div className="rounded-md bg-primary-50 border border-primary-200 p-2">
                      <p className="text-[10px] font-bold text-primary-600 uppercase mb-1">Your Version</p>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        rows={3}
                        className="w-full text-xs text-slate-800 bg-white border border-primary-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400 resize-y"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div className="rounded-md bg-green-50 border border-green-200 p-2">
                      <p className="text-[10px] font-bold text-green-600 uppercase mb-0.5">Suggested</p>
                      <p className="text-xs text-slate-700">&ldquo;{fix.fixed}&rdquo;</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {editingFixId === fix.id ? (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); onApplyFix(fix.id, fix.index, editText); setEditingFixId(null) }}
                          disabled={!editText.trim()}
                          className="flex-1 px-3 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                          Apply Your Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingFixId(null) }}
                          className="px-3 py-1.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-md hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); onApplyFix(fix.id, fix.index) }}
                          className="flex-1 px-3 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-md hover:bg-primary-700 transition-colors"
                        >
                          Apply Fix
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingFixId(fix.id); setEditText(fix.fixed) }}
                          className="px-3 py-1.5 text-xs font-medium text-primary-600 border border-primary-200 rounded-md hover:bg-primary-50 transition-colors"
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Undo for applied fixes */}
              {isApplied && (
                <div className="px-3 pb-2 border-t border-green-100 pt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onUndoFix(fix.id, fix.index) }}
                    className="text-xs text-slate-500 hover:text-slate-700 underline"
                  >
                    Undo fix
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Section Grades */}
      {structuredAnalysis.sectionReviews.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sections</p>
          <div className="space-y-1">
            {structuredAnalysis.sectionReviews.map((section, i) => {
              const gradeColors: Record<string, string> = {
                'A': 'bg-green-100 text-green-700',
                'B': 'bg-blue-100 text-blue-700',
                'C': 'bg-yellow-100 text-yellow-700',
                'D': 'bg-orange-100 text-orange-700',
                'F': 'bg-red-100 text-red-700',
              }
              return (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white">
                  <span className={`w-6 h-6 rounded text-xs font-black flex items-center justify-center ${gradeColors[section.grade] || 'bg-slate-100 text-slate-600'}`}>
                    {section.grade}
                  </span>
                  <span className="text-sm text-slate-700 flex-1">{section.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ATS Keywords */}
      {structuredAnalysis.atsAnalysis && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ATS Keywords</p>
          {structuredAnalysis.atsAnalysis.missingKeywords.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] text-red-500 font-bold mb-1">MISSING</p>
              <div className="flex flex-wrap gap-1">
                {structuredAnalysis.atsAnalysis.missingKeywords.map((kw, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px]">{kw}</span>
                ))}
              </div>
            </div>
          )}
          {structuredAnalysis.atsAnalysis.foundKeywords.length > 0 && (
            <div>
              <p className="text-[10px] text-green-600 font-bold mb-1">FOUND</p>
              <div className="flex flex-wrap gap-1">
                {structuredAnalysis.atsAnalysis.foundKeywords.map((kw, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px]">{kw}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Wins */}
      {structuredAnalysis.quickWins.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Wins</p>
          <div className="space-y-1.5">
            {structuredAnalysis.quickWins.map((win, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</span>
                <p className="text-xs text-slate-600">{win}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rewrite CTA */}
      <button
        onClick={onRequestRewrite}
        className="w-full rounded-lg bg-gradient-to-r from-primary-500 to-primary-700 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-shadow"
      >
        Fix All with AI Rewrite
      </button>
    </div>
  )
}
