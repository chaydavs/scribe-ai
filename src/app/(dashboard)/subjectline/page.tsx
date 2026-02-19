'use client'

import { useState } from 'react'
import { getTool } from '@/types'

const tool = getTool('subjectline')!

export default function SubjectLinePage() {
  const [subjectLine, setSubjectLine] = useState('')
  const [emailType, setEmailType] = useState('newsletter')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!subjectLine.trim()) {
      setError('Please enter a subject line to analyze')
      return
    }

    setError(null)
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/tools/subjectline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectLine, emailType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze subject line')
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
        <p className="mt-2 text-sm text-gray-500">Cost: {tool.creditCost} credit per analysis</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Your Subject Line</h2>
            <input
              type="text"
              value={subjectLine}
              onChange={(e) => setSubjectLine(e.target.value)}
              placeholder="Enter your email subject line..."
              className="input"
              disabled={loading}
            />
            <p className="mt-2 text-xs text-gray-500">
              {subjectLine.length} characters (ideal: 30-50)
            </p>
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Email Type</h2>
            <select
              value={emailType}
              onChange={(e) => setEmailType(e.target.value)}
              className="input"
              disabled={loading}
            >
              <option value="newsletter">Newsletter</option>
              <option value="promotional">Promotional/Sale</option>
              <option value="followup">Follow-up</option>
              <option value="coldoutreach">Cold Outreach</option>
              <option value="transactional">Transactional</option>
              <option value="welcome">Welcome Email</option>
            </select>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || !subjectLine.trim()}
            className="btn-primary w-full"
          >
            {loading ? 'Analyzing...' : `Analyze & Improve (${tool.creditCost} credit)`}
          </button>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Analysis & Suggestions</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
          ) : result ? (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">{result}</div>
          ) : (
            <p className="py-12 text-center text-gray-500">Enter a subject line and click analyze</p>
          )}
        </div>
      </div>
    </div>
  )
}
