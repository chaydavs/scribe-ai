'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AnalysisHistorySkeleton } from '@/components/ui/skeleton'

interface Analysis {
  id: string
  title: string
  score: number | null
  created_at: string
}

interface DashboardShellProps {
  children: React.ReactNode
  user: { email: string }
  profile: { credits: number; full_name: string | null } | null
}

export default function DashboardShell({ children, user, profile }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loadingAnalyses, setLoadingAnalyses] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchAnalyses()
  }, [])

  const fetchAnalyses = async () => {
    try {
      const response = await fetch('/api/analyses')
      const data = await response.json()
      if (data.analyses) {
        setAnalyses(data.analyses)
      }
    } catch (error) {
      console.error('Failed to fetch analyses:', error)
    } finally {
      setLoadingAnalyses(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    setConfirmDeleteId(null)
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

  const handleRename = async (id: string) => {
    const trimmed = editingTitle.trim()
    if (!trimmed) {
      setEditingId(null)
      return
    }
    try {
      const response = await fetch(`/api/analyses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed }),
      })
      if (!response.ok) throw new Error('Failed to rename')
      setAnalyses(prev => prev.map(a => a.id === id ? { ...a, title: trimmed } : a))
    } catch (error) {
      console.error('Rename failed:', error)
    } finally {
      setEditingId(null)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-xl px-4 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/resumelab" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-bold text-slate-900">ResumeLab</span>
        </Link>
        <Link href="/settings" className="rounded-lg bg-primary-100 px-3 py-1.5 text-sm font-medium text-primary-600">
          {profile?.credits || 0}
        </Link>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/60
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-slate-200/60 px-4">
            <Link href="/resumelab" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-slate-900">
                ResumeLab
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* New Analysis Button */}
          <div className="p-3">
            <button
              onClick={() => {
                setSidebarOpen(false)
                if (pathname === '/resumelab' || pathname.startsWith('/resumelab?')) {
                  window.location.href = '/resumelab'
                } else {
                  router.push('/resumelab')
                }
              }}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-none transition-all hover:shadow-sm hover:-translate-y-0.5"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Analysis</span>
            </button>
          </div>

          {/* Analysis History */}
          <div className="flex-1 overflow-y-auto px-3">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              History
            </p>

            {loadingAnalyses ? (
              <AnalysisHistorySkeleton />
            ) : analyses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="mb-3 rounded-2xl bg-primary-50 p-4">
                  <svg className="h-10 w-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-700">No analyses yet</p>
                <p className="mt-1 text-xs text-slate-400">Upload a resume to get started</p>
              </div>
            ) : (
              <div className="space-y-1">
                {analyses.map((analysis) => (
                  <div key={analysis.id} className="group relative flex items-center rounded-lg text-sm text-slate-700 transition-all hover:bg-primary-50 hover:translate-x-0.5 border-l-2 border-transparent hover:border-primary-400">
                    {editingId === analysis.id ? (
                      <div className="flex w-full items-center px-3 py-2">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(analysis.id)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          onBlur={() => handleRename(analysis.id)}
                          autoFocus
                          className="w-full rounded border border-primary-500 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-primary-400"
                        />
                      </div>
                    ) : (
                      <>
                        <Link
                          href={`/resumelab?id=${analysis.id}`}
                          onClick={() => setSidebarOpen(false)}
                          className="flex min-w-0 flex-1 items-center px-3 py-2.5"
                        >
                          <svg className="mr-3 h-4 w-4 flex-shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-slate-700 group-hover:text-primary-600">
                              {analysis.title}
                            </p>
                            <p className="text-xs text-slate-400">
                              {formatDate(analysis.created_at)}
                              {analysis.score != null && (
                                <span className={`ml-2 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                                  analysis.score >= 75 ? 'bg-green-100 text-green-700' :
                                  analysis.score >= 50 ? 'bg-amber-100 text-amber-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {analysis.score}
                                </span>
                              )}
                            </p>
                          </div>
                        </Link>
                        {/* Hover actions */}
                        {confirmDeleteId === analysis.id ? (
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center space-x-1 bg-white rounded-lg shadow-sm border border-slate-200 px-2 py-1">
                            <span className="text-xs text-slate-500 mr-1">Delete?</span>
                            <button
                              onClick={(e) => { e.preventDefault(); handleDelete(analysis.id) }}
                              className="rounded px-2 py-0.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600"
                            >
                              Yes
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); setConfirmDeleteId(null) }}
                              className="rounded px-2 py-0.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center space-x-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                setEditingId(analysis.id)
                                setEditingTitle(analysis.title)
                              }}
                              className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              title="Rename"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                setConfirmDeleteId(analysis.id)
                              }}
                              disabled={deletingId === analysis.id}
                              className="rounded p-1.5 text-slate-500 hover:bg-red-900/30 hover:text-red-400 disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === analysis.id ? (
                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                              ) : (
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="border-t border-slate-200/60 px-3 py-3">
            <Link
              href="/analytics"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                pathname === '/analytics'
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-slate-600 hover:bg-primary-50 hover:text-slate-900'
              }`}
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </Link>
            <Link
              href="/settings"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                pathname === '/settings'
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-slate-600 hover:bg-primary-50 hover:text-slate-900'
              }`}
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-slate-200/60 p-3">
            {/* Credits Card */}
            <Link
              href="/settings"
              onClick={() => setSidebarOpen(false)}
              className={`mb-3 block rounded-xl bg-black p-3 text-white transition-transform hover:scale-[1.02] ${(profile?.credits || 0) < 10 ? 'animate-score-pulse' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-primary-100">Credits</p>
                  <p className="text-xl font-bold">{profile?.credits || 0}</p>
                </div>
                <div className="rounded-full bg-white/20 p-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* User Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-medium text-white">
                  {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                </div>
                <div className="max-w-[140px]">
                  <p className="truncate text-sm font-medium text-slate-700">
                    {profile?.full_name || 'User'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                title="Sign out"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pt-14 lg:pt-0 lg:pl-72">
        <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
