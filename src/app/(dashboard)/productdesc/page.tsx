'use client'

import { useState } from 'react'
import { getTool } from '@/types'

const tool = getTool('productdesc')!

export default function ProductDescPage() {
  const [productName, setProductName] = useState('')
  const [features, setFeatures] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!productName.trim() || !features.trim()) {
      setError('Please provide product name and features')
      return
    }

    setError(null)
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/tools/productdesc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, features, targetAudience }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate description')
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
        <p className="mt-2 text-sm text-gray-500">Cost: {tool.creditCost} credits per description</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Product Name</h2>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g., 'Wireless Noise-Canceling Headphones'"
              className="input"
              disabled={loading}
            />
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Features & Specs</h2>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="List key features, materials, dimensions, specs..."
              className="input min-h-[150px] resize-y"
              disabled={loading}
            />
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Target Audience (Optional)</h2>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., 'remote workers, commuters, audiophiles'"
              className="input"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !productName.trim() || !features.trim()}
            className="btn-primary w-full"
          >
            {loading ? 'Generating...' : `Generate Description (${tool.creditCost} credits)`}
          </button>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Product Copy</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
          ) : result ? (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">{result}</div>
          ) : (
            <p className="py-12 text-center text-gray-500">Enter product details and click generate</p>
          )}
        </div>
      </div>
    </div>
  )
}
