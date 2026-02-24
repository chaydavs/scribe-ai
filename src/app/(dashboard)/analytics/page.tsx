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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    )
  }

  // Chart data
  const scored = [...analyses].filter(a => a.score !== null).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  const avgScore = scored.length > 0 ? Math.round(scored.reduce((s, a) => s + a.score!, 0) / scored.length) : 0
  const bestScore = scored.length > 0 ? Math.max(...scored.map(a => a.score!)) : 0

  // SVG chart (compact)
  const W = 400, H = 120, PL = 30, PR = 10, PT = 15, PB = 20
  const cW = W - PL - PR, cH = H - PT - PB
  const toX = (i: number) => PL + (scored.length === 1 ? cW / 2 : (i / (scored.length - 1)) * cW)
  const toY = (s: number) => PT + cH - (s / 100) * cH

  const linePath = scored.map((a, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(a.score!)}`).join(' ')
  const areaPath = scored.length > 1
    ? `${linePath} L${toX(scored.length - 1)},${toY(0)} L${toX(0)},${toY(0)} Z`
    : ''

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-900">Analytics</h1>
        <Link href="/resumelab" className="text-xs font-medium text-teal-600 hover:underline">
          New Analysis &rarr;
        </Link>
      </div>

      {/* Compact stat row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Analyses', value: analysisCount, color: 'text-teal-600' },
          { label: 'Rewrites', value: rewriteCount, color: 'text-emerald-600' },
          { label: 'Avg Score', value: avgScore > 0 ? `${avgScore}` : '-', color: 'text-slate-900' },
          { label: 'Credits Used', value: totalCreditsUsed, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Score chart — compact */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-800">Score Progress</p>
          {bestScore > 0 && (
            <p className="text-xs text-slate-400">
              Best: <span className={`font-bold ${bestScore >= 85 ? 'text-emerald-600' : bestScore >= 70 ? 'text-amber-600' : 'text-red-500'}`}>{bestScore}</span>
            </p>
          )}
        </div>

        {scored.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-center">
            <p className="text-xs text-slate-400">Run an analysis to see your score chart</p>
          </div>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Horizontal grid — just 3 lines */}
            {[25, 50, 75].map(t => (
              <g key={t}>
                <line x1={PL} y1={toY(t)} x2={W - PR} y2={toY(t)} stroke="#f1f5f9" strokeWidth="1" />
                <text x={PL - 6} y={toY(t) + 3} textAnchor="end" fill="#cbd5e1" fontSize="9">{t}</text>
              </g>
            ))}

            {/* Target line at 85 */}
            <line x1={PL} y1={toY(85)} x2={W - PR} y2={toY(85)} stroke="#10b981" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.5" />

            {/* Area */}
            {scored.length > 1 && <path d={areaPath} fill="url(#areaFill)" />}

            {/* Line */}
            {scored.length > 1 && (
              <path d={linePath} fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            )}

            {/* Points */}
            {scored.map((a, i) => (
              <g key={a.id}>
                <circle cx={toX(i)} cy={toY(a.score!)} r="3.5" fill="white" stroke="#14b8a6" strokeWidth="2" />
                <text x={toX(i)} y={toY(a.score!) - 7} textAnchor="middle" fill="#0f766e" fontSize="9" fontWeight="600">
                  {a.score}
                </text>
              </g>
            ))}

            {/* X-axis dates */}
            {scored.map((a, i) => {
              const step = Math.max(1, Math.floor(scored.length / 5))
              if (i % step !== 0 && i !== scored.length - 1) return null
              return (
                <text key={`d-${a.id}`} x={toX(i)} y={H - 4} textAnchor="middle" fill="#94a3b8" fontSize="9">
                  {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </text>
              )
            })}
          </svg>
        )}

        {/* Inline legend */}
        {scored.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-1 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500" /> Score</span>
            <span className="flex items-center gap-1"><span className="inline-block h-px w-3 border-t border-dashed border-emerald-400" /> Target 85</span>
          </div>
        )}
      </div>

      {/* Activity + History side by side */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-800 mb-3">Recent Activity</p>
          {recentUsage.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No activity yet</p>
          ) : (
            <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
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
                      <p className="text-xs font-medium text-slate-700">{log.tool === 'resumelab' ? 'Analysis' : 'Rewrite'}</p>
                      <p className="text-[10px] text-slate-400">{fmt(log.created_at)}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-500">-{log.credits_used}</span>
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
            <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
              {analyses.slice(0, 8).map(a => (
                <Link
                  key={a.id}
                  href={`/resumelab?id=${a.id}`}
                  className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-700">{a.title}</p>
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
