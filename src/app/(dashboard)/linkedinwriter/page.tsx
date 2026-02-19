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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate post')
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
        <p className="mt-2 text-sm text-gray-500">Cost: {tool.creditCost} credits per generation</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Post Topic</h2>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What do you want to post about? (e.g., 'Why I left my corporate job to start a business')"
              className="input min-h-[100px] resize-y"
              disabled={loading}
            />
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Additional Context (Optional)</h2>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Any specific points, stats, or personal experiences to include..."
              className="input min-h-[80px] resize-y"
              disabled={loading}
            />
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Tone</h2>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="input"
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
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="btn-primary w-full"
          >
            {loading ? 'Generating...' : `Generate Posts (${tool.creditCost} credits)`}
          </button>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Generated Posts</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
          ) : result ? (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">{result}</div>
          ) : (
            <p className="py-12 text-center text-gray-500">Enter a topic and click generate</p>
          )}
        </div>
      </div>
    </div>
  )
}
