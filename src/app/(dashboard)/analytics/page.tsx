'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UsageStats {
  totalAnalyses: number
  totalCreditsUsed: number
  averageScore: number
  rewritesGenerated: number
}

interface UsageLog {
  id: string
  tool: string
  credits_used: number
  created_at: string
}

interface Analysis {
  id: string
  title: string
  score: number | null
  created_at: string
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<UsageStats>({
    totalAnalyses: 0,
    totalCreditsUsed: 0,
    averageScore: 0,
    rewritesGenerated: 0,
  })
  const [recentUsage, setRecentUsage] = useState<UsageLog[]>([])
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch usage logs
      const { data: usageLogs } = await supabase
        .from('usage_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      // Fetch analyses
      const { data: analysesData } = await supabase
        .from('resume_analyses')
        .select('id, title, score, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Calculate stats
      const totalCreditsUsed = usageLogs?.reduce((sum, log) => sum + (log.credits_used || 0), 0) || 0
      const totalAnalyses = usageLogs?.filter(log => log.tool === 'resumelab').length || 0
      const rewritesGenerated = usageLogs?.filter(log => log.tool === 'resume-rewrite').length || 0

      const scoresWithValues = analysesData?.filter(a => a.score) || []
      const averageScore = scoresWithValues.length > 0
        ? Math.round(scoresWithValues.reduce((sum, a) => sum + (a.score || 0), 0) / scoresWithValues.length)
        : 0

      setStats({
        totalAnalyses,
        totalCreditsUsed,
        averageScore,
        rewritesGenerated,
      })

      setRecentUsage(usageLogs || [])
      setAnalyses(analysesData || [])
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this analysis? This cannot be undone.')) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/analyses/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      setAnalyses(prev => prev.filter(a => a.id !== id))
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-1 text-slate-600">Track your resume analysis usage and progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-teal-100 p-3">
              <svg className="h-6 w-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Analyses</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalAnalyses}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-emerald-100 p-3">
              <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500">Rewrites Generated</p>
              <p className="text-2xl font-bold text-slate-900">{stats.rewritesGenerated}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-emerald-100 p-3">
              <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500">Average Score</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.averageScore > 0 ? `${stats.averageScore}/100` : '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-amber-100 p-3">
              <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500">Credits Used</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalCreditsUsed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Score Progress Chart */}
      {(() => {
        const scoredAnalyses = [...analyses]
          .filter(a => a.score !== null)
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        const TARGET_SCORE = 85
        const highestScore = scoredAnalyses.length > 0
          ? Math.max(...scoredAnalyses.map(a => a.score!))
          : 0
        const highestIndex = scoredAnalyses.findIndex(a => a.score === highestScore)

        // Chart dimensions
        const W = 600
        const H = 260
        const PAD_L = 45
        const PAD_R = 20
        const PAD_T = 30
        const PAD_B = 50
        const chartW = W - PAD_L - PAD_R
        const chartH = H - PAD_T - PAD_B

        const toX = (i: number) => PAD_L + (scoredAnalyses.length === 1 ? chartW / 2 : (i / (scoredAnalyses.length - 1)) * chartW)
        const toY = (score: number) => PAD_T + chartH - (score / 100) * chartH

        const linePath = scoredAnalyses
          .map((a, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(a.score!)}`)
          .join(' ')
        const areaPath = scoredAnalyses.length > 0
          ? `${linePath} L${toX(scoredAnalyses.length - 1)},${toY(0)} L${toX(0)},${toY(0)} Z`
          : ''

        const yTicks = [0, 25, 50, 75, 100]

        return (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Score Progress</h2>
                <p className="text-sm text-slate-500">Track your resume score improvement over time</p>
              </div>
              {highestScore > 0 && (
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Highest Score</p>
                  <p className={`text-2xl font-bold ${
                    highestScore >= TARGET_SCORE ? 'text-emerald-600' : highestScore >= 70 ? 'text-amber-600' : 'text-red-500'
                  }`}>{highestScore}/100</p>
                </div>
              )}
            </div>

            {scoredAnalyses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-2xl bg-slate-100 p-4 mb-4">
                  <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-700">No scored analyses yet</p>
                <p className="mt-1 text-xs text-slate-500">Run your first resume analysis to see your progress here</p>
              </div>
            ) : (
              <div className="relative">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Y-axis grid lines and labels */}
                  {yTicks.map(tick => (
                    <g key={tick}>
                      <line
                        x1={PAD_L} y1={toY(tick)} x2={W - PAD_R} y2={toY(tick)}
                        stroke="#e2e8f0" strokeWidth="1" strokeDasharray={tick === 0 ? '0' : '4 4'}
                      />
                      <text x={PAD_L - 8} y={toY(tick) + 4} textAnchor="end" className="text-[11px]" fill="#94a3b8">
                        {tick}
                      </text>
                    </g>
                  ))}

                  {/* Target score line at 85 */}
                  <line
                    x1={PAD_L} y1={toY(TARGET_SCORE)} x2={W - PAD_R} y2={toY(TARGET_SCORE)}
                    stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 4"
                  />
                  <rect x={W - PAD_R + 4} y={toY(TARGET_SCORE) - 10} width="48" height="20" rx="4" fill="#10b981" />
                  <text x={W - PAD_R + 28} y={toY(TARGET_SCORE) + 4} textAnchor="middle" fill="white" className="text-[10px] font-semibold">
                    Target
                  </text>

                  {/* Area fill */}
                  {scoredAnalyses.length > 1 && (
                    <path d={areaPath} fill="url(#scoreGradient)" />
                  )}

                  {/* Line */}
                  {scoredAnalyses.length > 1 && (
                    <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  )}

                  {/* Data points */}
                  {scoredAnalyses.map((a, i) => (
                    <g key={a.id}>
                      {/* Highlight ring on highest score */}
                      {i === highestIndex && (
                        <circle cx={toX(i)} cy={toY(a.score!)} r="10" fill="#6366f1" fillOpacity="0.15" />
                      )}
                      <circle
                        cx={toX(i)} cy={toY(a.score!)} r="5"
                        fill={i === highestIndex ? '#6366f1' : 'white'}
                        stroke="#6366f1" strokeWidth="2.5"
                      />
                      {/* Score label on each point */}
                      <text
                        x={toX(i)} y={toY(a.score!) - 12}
                        textAnchor="middle" fill="#6366f1"
                        className="text-[11px] font-semibold"
                      >
                        {a.score}
                      </text>
                    </g>
                  ))}

                  {/* X-axis date labels */}
                  {scoredAnalyses.map((a, i) => {
                    // Show max ~6 labels to avoid overlap
                    const step = Math.max(1, Math.floor(scoredAnalyses.length / 6))
                    if (i % step !== 0 && i !== scoredAnalyses.length - 1) return null
                    const d = new Date(a.created_at)
                    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    return (
                      <text key={`label-${a.id}`} x={toX(i)} y={H - 10} textAnchor="middle" fill="#94a3b8" className="text-[11px]">
                        {label}
                      </text>
                    )
                  })}
                </svg>

                {/* Legend */}
                <div className="mt-3 flex items-center justify-center space-x-6 text-xs text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                    <span>Your Score</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="h-0.5 w-4 rounded bg-emerald-500" style={{ borderTop: '2px dashed #10b981' }} />
                    <span>Target: 85+ (high interview chance)</span>
                  </div>
                  {highestScore > 0 && (
                    <div className="flex items-center space-x-1.5">
                      <div className="h-2.5 w-2.5 rounded-full border-2 border-teal-500 bg-teal-500" />
                      <span>Best: {highestScore}</span>
                    </div>
                  )}
                </div>

                {/* Motivational message */}
                {highestScore > 0 && highestScore < TARGET_SCORE && (
                  <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm">
                    <span className="font-medium text-amber-800">
                      {TARGET_SCORE - highestScore} points to go!
                    </span>
                    <span className="text-amber-700">
                      {' '}Resumes scoring 85+ are 3x more likely to land interviews. Use the AI rewrite to boost your score.
                    </span>
                  </div>
                )}
                {highestScore >= TARGET_SCORE && (
                  <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm">
                    <span className="font-medium text-emerald-800">You've hit the target!</span>
                    <span className="text-emerald-700">
                      {' '}Your resume is in the top tier. Export it with a professional template and start applying.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })()}

      {/* Recent Activity & Analyses */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent Activity</h2>
          {recentUsage.length === 0 ? (
            <p className="text-sm text-slate-500">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {recentUsage.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center space-x-3">
                    <div className={`rounded-lg p-2 ${
                      log.tool === 'resumelab' ? 'bg-teal-100' : 'bg-emerald-100'
                    }`}>
                      {log.tool === 'resumelab' ? (
                        <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {log.tool === 'resumelab' ? 'Resume Analysis' : 'Resume Rewrite'}
                      </p>
                      <p className="text-xs text-slate-500">{formatDate(log.created_at)}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    -{log.credits_used} credits
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analysis History */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Analysis History</h2>
          {analyses.length === 0 ? (
            <p className="text-sm text-slate-500">No analyses yet</p>
          ) : (
            <div className="space-y-3">
              {analyses.slice(0, 10).map((analysis) => (
                <div key={analysis.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 group">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {analysis.title}
                    </p>
                    <p className="text-xs text-slate-500">{formatDate(analysis.created_at)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {analysis.score && (
                      <div className={`rounded-full px-3 py-1 text-xs font-medium ${
                        analysis.score >= 80 ? 'bg-green-100 text-green-700' :
                        analysis.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {analysis.score}/100
                      </div>
                    )}
                    <button
                      onClick={() => handleDelete(analysis.id)}
                      disabled={deletingId === analysis.id}
                      className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 disabled:opacity-50"
                      title="Delete analysis"
                    >
                      {deletingId === analysis.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 p-6 text-white">
        <h3 className="text-lg font-semibold">Pro Tips</h3>
        <ul className="mt-3 space-y-2 text-sm text-teal-100">
          <li className="flex items-start">
            <svg className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Add a target job description for more tailored feedback
          </li>
          <li className="flex items-start">
            <svg className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Use the rewrite feature to get an optimized version instantly
          </li>
          <li className="flex items-start">
            <svg className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Aim for a score of 85+ for maximum interview chances
          </li>
        </ul>
      </div>
    </div>
  )
}
