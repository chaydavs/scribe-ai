'use client'

import { useState } from 'react'
import { getTool } from '@/types'

const tool = getTool('linkedinwriter')!

export default function LinkedInWriterPage() {
  const [topic, setTopic] = useState('')
  const [context, setContext] = useState('')
  const [tone, setTone] = useState('professional')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please provide a topic for your post')
      return
    }

    setError(null)
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/tools/linkedinwriter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, context, tone }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to generate post')
      setResult(data.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{tool.name}</h1>
            <p className="mt-2 text-sky-100">{tool.description}</p>
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
              <div className="rounded-lg bg-sky-100 p-2">
                <svg className="h-5 w-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Post Topic</h2>
            </div>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What do you want to post about? (e.g., 'Why I left my $200k job to start a business')"
              className="w-full rounded-xl border border-slate-200 p-4 text-sm transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 min-h-[120px] resize-y"
              disabled={loading}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center space-x-2">
              <div className="rounded-lg bg-blue-100 p-2">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Context (Optional)</h2>
            </div>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Any specific points, stats, or personal experiences to include..."
              className="w-full rounded-xl border border-slate-200 p-4 text-sm transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 min-h-[80px] resize-y"
              disabled={loading}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center space-x-2">
              <div className="rounded-lg bg-indigo-100 p-2">
                <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Tone</h2>
            </div>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-4 text-sm transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              disabled={loading}
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual & Friendly</option>
              <option value="inspirational">Inspirational</option>
              <option value="controversial">Bold & Controversial</option>
              <option value="storytelling">Storytelling</option>
            </select>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">{error}</div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating viral posts...</span>
              </span>
            ) : 'Generate LinkedIn Posts'}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-h-[700px] overflow-y-auto">
          <div className="mb-4 flex items-center space-x-2">
            <div className="rounded-lg bg-green-100 p-2">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Generated Posts</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
              <p className="mt-4 text-sm text-slate-500">Writing engaging LinkedIn posts...</p>
            </div>
          ) : result ? (
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{
                __html: result
                  .replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-bold mt-6 mb-3 text-slate-900 border-b pb-2">$1</h2>')
                  .replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg font-semibold mt-4 mb-2 text-slate-800">$1</h3>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
                  .replace(/\n\n/g, '</p><p class="my-3 text-slate-600">')
                  .replace(/\n/g, '<br />')
              }} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-slate-100 p-4">
                <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="mt-4 text-slate-500">Enter a topic to generate viral LinkedIn posts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
