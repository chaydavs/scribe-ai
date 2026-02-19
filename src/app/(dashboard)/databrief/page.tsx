'use client'

import { useState } from 'react'
import { getTool } from '@/types'

const tool = getTool('databrief')!

export default function DataBriefPage() {
  const [data, setData] = useState('')
  const [briefType, setBriefType] = useState('summary')
  const [audience, setAudience] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!data.trim()) {
      setError('Please provide data or document to analyze')
      return
    }

    setError(null)
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/tools/databrief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          briefType,
          audience: audience.trim() || undefined,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to generate brief')
      }

      setResult(responseData.brief)
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
          Cost: {tool.creditCost} credits per brief
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Brief Type</h2>
            <select
              value={briefType}
              onChange={(e) => setBriefType(e.target.value)}
              className="input"
              disabled={loading}
            >
              <option value="summary">Executive Summary</option>
              <option value="analysis">Detailed Analysis</option>
              <option value="insights">Key Insights</option>
              <option value="recommendations">Recommendations</option>
            </select>
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Data / Document</h2>
            <textarea
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="Paste your data, document, or text to summarize..."
              className="input min-h-[300px] resize-y"
              disabled={loading}
            />
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Target Audience (Optional)</h2>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g., executives, technical team, stakeholders"
              className="input"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !data.trim()}
            className="btn-primary w-full"
          >
            {loading ? 'Generating...' : `Generate Brief (${tool.creditCost} credits)`}
          </button>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Generated Brief</h2>
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
              Paste your data and click generate to create a brief
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
