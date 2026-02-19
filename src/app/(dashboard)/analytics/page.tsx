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
      const totalAnalyses = usageLogs?.filter(log => log.tool === 'resumeradar').length || 0
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
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
            <div className="rounded-xl bg-indigo-100 p-3">
              <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="rounded-xl bg-purple-100 p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      log.tool === 'resumeradar' ? 'bg-indigo-100' : 'bg-emerald-100'
                    }`}>
                      {log.tool === 'resumeradar' ? (
                        <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        {log.tool === 'resumeradar' ? 'Resume Analysis' : 'Resume Rewrite'}
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
                <div key={analysis.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {analysis.title}
                    </p>
                    <p className="text-xs text-slate-500">{formatDate(analysis.created_at)}</p>
                  </div>
                  {analysis.score && (
                    <div className={`ml-3 rounded-full px-3 py-1 text-xs font-medium ${
                      analysis.score >= 80 ? 'bg-green-100 text-green-700' :
                      analysis.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {analysis.score}/100
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
        <h3 className="text-lg font-semibold">Pro Tips</h3>
        <ul className="mt-3 space-y-2 text-sm text-indigo-100">
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
