'use client'

import { useState } from 'react'
import { getTool } from '@/types'

const tool = getTool('feedbackloop')!

export default function FeedbackLoopPage() {
  const [content, setContent] = useState('')
  const [contentType, setContentType] = useState('general')
  const [context, setContext] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!content.trim()) {
      setError('Please provide content to analyze')
      return
    }

    setError(null)
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/tools/feedbackloop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          contentType,
          context: context.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze content')
      }

      setResult(data.feedback)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{tool.name}</h1>
        <p className="mt-1 text-gray-600">{tool.description}</p>
        <p className="mt-2 text-sm text-gray-500">
          Cost: {tool.creditCost} credits per feedback
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Content Type</h2>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="input"
              disabled={loading}
            >
              <option value="general">General Writing</option>
              <option value="email">Email</option>
              <option value="blog">Blog Post</option>
              <option value="report">Report</option>
              <option value="proposal">Proposal</option>
              <option value="creative">Creative Writing</option>
            </select>
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Your Content</h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your content here for feedback..."
              className="input min-h-[250px] resize-y"
              disabled={loading}
            />
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Context (Optional)</h2>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Any additional context? (audience, purpose, constraints)"
              className="input min-h-[80px] resize-y"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || !content.trim()}
            className="btn-primary w-full"
          >
            {loading ? 'Analyzing...' : `Get Feedback (${tool.creditCost} credits)`}
          </button>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Feedback</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
          ) : result ? (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {result}
            </div>
          ) : (
            <p className="py-12 text-center text-gray-500">
              Paste your content and click analyze to get feedback
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
