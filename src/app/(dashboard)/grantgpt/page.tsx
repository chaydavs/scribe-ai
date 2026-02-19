'use client'

import { useState } from 'react'
import { getTool } from '@/types'

const tool = getTool('grantgpt')!

export default function GrantGPTPage() {
  const [projectInfo, setProjectInfo] = useState('')
  const [grantInfo, setGrantInfo] = useState('')
  const [outputType, setOutputType] = useState('full')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!projectInfo.trim()) {
      setError('Please provide project information')
      return
    }

    setError(null)
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/tools/grantgpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectInfo,
          grantInfo: grantInfo.trim() || undefined,
          outputType,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to generate grant content')
      setResult(data.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{tool.name}</h1>
            <p className="mt-2 text-emerald-100">{tool.description}</p>
          </div>
          <div className="rounded-xl bg-white/20 px-4 py-2 backdrop-blur">
            <span className="text-sm font-medium">{tool.creditCost} credits</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center space-x-2">
              <div className="rounded-lg bg-emerald-100 p-2">
                <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Output Type</h2>
            </div>
            <select
              value={outputType}
              onChange={(e) => setOutputType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-4 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              disabled={loading}
            >
              <option value="full">Full Grant Proposal</option>
              <option value="summary">Project Summary</option>
              <option value="problem">Problem Statement</option>
              <option value="objectives">Goals & Objectives</option>
              <option value="impact">Impact Statement</option>
              <option value="budget">Budget Narrative</option>
            </select>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center space-x-2">
              <div className="rounded-lg bg-teal-100 p-2">
                <svg className="h-5 w-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Your Project</h2>
            </div>
            <textarea
              value={projectInfo}
              onChange={(e) => setProjectInfo(e.target.value)}
              placeholder="Describe your project: what it does, who it helps, expected outcomes, timeline, team..."
              className="w-full rounded-xl border border-slate-200 p-4 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[200px] resize-y"
              disabled={loading}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center space-x-2">
              <div className="rounded-lg bg-green-100 p-2">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Grant/Funder Info (Optional)</h2>
            </div>
            <textarea
              value={grantInfo}
              onChange={(e) => setGrantInfo(e.target.value)}
              placeholder="Grant name, funder priorities, requirements, word limits..."
              className="w-full rounded-xl border border-slate-200 p-4 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[100px] resize-y"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">{error}</div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !projectInfo.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Writing your grant...</span>
              </span>
            ) : 'Generate Grant Content'}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-h-[800px] overflow-y-auto">
          <div className="mb-4 flex items-center space-x-2">
            <div className="rounded-lg bg-amber-100 p-2">
              <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Generated Content</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              <p className="mt-4 text-sm text-slate-500">Crafting compelling grant content...</p>
            </div>
          ) : result ? (
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{
                __html: result
                  .replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-bold mt-6 mb-3 text-slate-900">$1</h2>')
                  .replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg font-semibold mt-4 mb-2 text-slate-800">$1</h3>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
                  .replace(/- (.*?)(\n|$)/g, '<li class="ml-4 text-slate-600">$1</li>')
                  .replace(/\n\n/g, '</p><p class="my-3 text-slate-600">')
                  .replace(/\n/g, '<br />')
              }} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-slate-100 p-4">
                <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="mt-4 text-slate-500">Describe your project to generate grant-winning content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
