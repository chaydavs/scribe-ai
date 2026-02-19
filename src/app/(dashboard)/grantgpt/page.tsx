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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectInfo,
          grantInfo: grantInfo.trim() || undefined,
          outputType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate grant content')
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
        <p className="mt-2 text-sm text-gray-500">
          Cost: {tool.creditCost} credits per generation
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Output Type</h2>
            <select
              value={outputType}
              onChange={(e) => setOutputType(e.target.value)}
              className="input"
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

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Project Information</h2>
            <textarea
              value={projectInfo}
              onChange={(e) => setProjectInfo(e.target.value)}
              placeholder="Describe your project: what it does, who it helps, expected outcomes, timeline, team..."
              className="input min-h-[200px] resize-y"
              disabled={loading}
            />
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Grant/Funder Info (Optional)</h2>
            <textarea
              value={grantInfo}
              onChange={(e) => setGrantInfo(e.target.value)}
              placeholder="Grant name, funder priorities, requirements, word limits..."
              className="input min-h-[100px] resize-y"
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
            disabled={loading || !projectInfo.trim()}
            className="btn-primary w-full"
          >
            {loading ? 'Generating...' : `Generate (${tool.creditCost} credits)`}
          </button>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Generated Content</h2>
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
              Fill in your project details and click generate
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
