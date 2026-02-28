'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

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
  const [recentUsage, setRecentUsage] = useState<UsageLog[]>([])
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCreditsUsed, setTotalCreditsUsed] = useState(0)
  const [rewriteCount, setRewriteCount] = useState(0)
  const [analysisCount, setAnalysisCount] = useState(0)

  const supabase = createClient()

  useEffect(() => { fetchAnalytics() }, [])

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: usageLogs } = await supabase
        .from('usage_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      const { data: analysesData } = await supabase
        .from('resume_analyses')
        .select('id, title, score, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setTotalCreditsUsed(usageLogs?.reduce((s, l) => s + (l.credits_used || 0), 0) || 0)
      setAnalysisCount(usageLogs?.filter(l => l.tool === 'resumelab').length || 0)
      setRewriteCount(usageLogs?.filter(l => l.tool === 'resume-rewrite').length || 0)
      setRecentUsage(usageLogs || [])
      setAnalyses(analysesData || [])
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  const fmtShort = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    )
  }

  const scored = [...analyses].filter(a => a.score !== null).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  const avgScore = scored.length > 0 ? Math.round(scored.reduce((s, a) => s + a.score!, 0) / scored.length) : 0
  const bestScore = scored.length > 0 ? Math.max(...scored.map(a => a.score!)) : 0
  const latestScore = scored.length > 0 ? scored[scored.length - 1].score! : 0
  const prevScore = scored.length > 1 ? scored[scored.length - 2].score! : null
  const scoreDelta = prevScore !== null ? latestScore - prevScore : null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-900">Analytics</h1>
        <Link href="/resumelab" className="text-xs font-medium text-teal-600 hover:underline">
          New Analysis &rarr;
        </Link>
      </div>

      {/* Top row: Stats + Sparkline chart inline */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-6">
          {/* Left: Current score circle + stats */}
          <div className="flex items-center gap-5 flex-shrink-0">
            {/* Score circle */}
            {latestScore > 0 ? (
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                  <circle
                    cx="40" cy="40" r="34"
                    fill="none"
                    stroke={latestScore >= 75 ? '#16a34a' : latestScore >= 55 ? '#d97706' : '#ef4444'}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={2 * Math.PI * 34 * (1 - latestScore / 100)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-slate-900">{latestScore}</span>
                  <span className="text-[9px] text-slate-400 -mt-0.5">latest</span>
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                <span className="text-xs text-slate-400">--</span>
              </div>
            )}

            {/* Mini stats */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900">{avgScore > 0 ? avgScore : '--'}</span>
                <span className="text-xs text-slate-400">avg</span>
                {scoreDelta !== null && scoreDelta !== 0 && (
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${scoreDelta > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                    {scoreDelta > 0 ? '+' : ''}{scoreDelta}
                  </span>
                )}
              </div>
              <div className="flex gap-4 text-[11px] text-slate-500">
                <span><strong className="text-teal-600">{analysisCount}</strong> analyses</span>
                <span><strong className="text-emerald-600">{rewriteCount}</strong> rewrites</span>
                <span><strong className="text-amber-600">{totalCreditsUsed}</strong> credits</span>
              </div>
            </div>
          </div>

          {/* Right: Sparkline chart */}
          <div className="flex-1 min-w-0">
            {scored.length >= 2 ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400">Score trend</span>
                  <span className="text-[10px] text-slate-400">
                    Best: <span className="font-semibold text-emerald-600">{bestScore}</span>
                  </span>
                </div>
                <svg viewBox="0 0 300 60" className="w-full" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {(() => {
                    const minS = Math.max(0, Math.min(...scored.map(a => a.score!)) - 10)
                    const maxS = Math.min(100, Math.max(...scored.map(a => a.score!)) + 10)
                    const range = maxS - minS || 1
                    const px = 8, py = 4, w = 300 - px * 2, h = 60 - py * 2
                    const toX = (i: number) => px + (i / (scored.length - 1)) * w
                    const toY = (s: number) => py + h - ((s - minS) / range) * h

                    const line = scored.map((a, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(a.score!).toFixed(1)}`).join(' ')
                    const area = `${line} L${toX(scored.length - 1).toFixed(1)},${(py + h).toFixed(1)} L${toX(0).toFixed(1)},${(py + h).toFixed(1)} Z`

                    return (
                      <>
                        <path d={area} fill="url(#sparkFill)" />
                        <path d={line} fill="none" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        {/* Only show first and last point */}
                        <circle cx={toX(0)} cy={toY(scored[0].score!)} r="2" fill="#14b8a6" />
                        <circle cx={toX(scored.length - 1)} cy={toY(scored[scored.length - 1].score!)} r="2.5" fill="white" stroke="#14b8a6" strokeWidth="1.5" />
                        {/* First and last labels */}
                        <text x={toX(0)} y={toY(scored[0].score!) - 5} textAnchor="start" fill="#94a3b8" fontSize="8">{scored[0].score}</text>
                        <text x={toX(scored.length - 1)} y={toY(scored[scored.length - 1].score!) - 5} textAnchor="end" fill="#0f766e" fontSize="8" fontWeight="600">{scored[scored.length - 1].score}</text>
                      </>
                    )
                  })()}
                </svg>
                <div className="flex justify-between text-[9px] text-slate-300 px-2 -mt-0.5">
                  <span>{fmtShort(scored[0].created_at)}</span>
                  <span>{fmtShort(scored[scored.length - 1].created_at)}</span>
                </div>
              </div>
            ) : scored.length === 1 ? (
              <div className="flex items-center justify-center h-16 text-xs text-slate-400">
                Run another analysis to see your trend
              </div>
            ) : (
              <div className="flex items-center justify-center h-16 text-xs text-slate-400">
                No scores yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity + History */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-800 mb-3">Recent Activity</p>
          {recentUsage.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No activity yet</p>
          ) : (
            <div className="space-y-0.5 max-h-[240px] overflow-y-auto">
              {recentUsage.slice(0, 8).map(log => (
                <div key={log.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className={`rounded-md p-1.5 ${log.tool === 'resumelab' ? 'bg-teal-50 text-teal-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {log.tool === 'resumelab' ? (
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      ) : (
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-700">{log.tool === 'resumelab' ? 'Analysis' : log.tool === 'resume-rewrite' ? 'Rewrite' : log.tool === 'resume-export' ? 'Export' : log.tool}</p>
                      <p className="text-[10px] text-slate-400">{fmt(log.created_at)}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-400">-{log.credits_used}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analysis History */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-800 mb-3">Analysis History</p>
          {analyses.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No analyses yet</p>
          ) : (
            <div className="space-y-0.5 max-h-[240px] overflow-y-auto">
              {analyses.slice(0, 8).map(a => (
                <Link
                  key={a.id}
                  href={`/resumelab?id=${a.id}`}
                  className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-slate-50 group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-700 group-hover:text-teal-600">{a.title}</p>
                    <p className="text-[10px] text-slate-400">{fmt(a.created_at)}</p>
                  </div>
                  {a.score && (
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      a.score >= 80 ? 'bg-emerald-50 text-emerald-700' :
                      a.score >= 60 ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {a.score}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
