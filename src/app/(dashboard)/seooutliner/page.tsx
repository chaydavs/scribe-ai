'use client'

import { useState } from 'react'
import { getTool } from '@/types'

const tool = getTool('seooutliner')!

export default function SEOOutlinerPage() {
  const [keyword, setKeyword] = useState('')
  const [audience, setAudience] = useState('')
  const [intent, setIntent] = useState('informational')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!keyword.trim()) {
      setError('Please provide a target keyword')
      return
    }

    setError(null)
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/tools/seooutliner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, audience, intent }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate outline')
      }

      setResult(data.content)
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
        <p className="mt-2 text-sm text-gray-500">Cost: {tool.creditCost} credits per outline</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Target Keyword</h2>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., 'how to start a podcast'"
              className="input"
              disabled={loading}
            />
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Target Audience (Optional)</h2>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g., 'beginners looking to start their first podcast'"
              className="input"
              disabled={loading}
            />
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Search Intent</h2>
            <select
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              className="input"
              disabled={loading}
            >
              <option value="informational">Informational (How-to, guides)</option>
              <option value="commercial">Commercial (Reviews, comparisons)</option>
              <option value="transactional">Transactional (Buy, sign up)</option>
              <option value="navigational">Navigational (Find specific info)</option>
            </select>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !keyword.trim()}
            className="btn-primary w-full"
          >
            {loading ? 'Generating...' : `Generate Outline (${tool.creditCost} credits)`}
          </button>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Blog Outline</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
          ) : result ? (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">{result}</div>
          ) : (
            <p className="py-12 text-center text-gray-500">Enter a keyword and click generate</p>
          )}
        </div>
      </div>
    </div>
  )
}
