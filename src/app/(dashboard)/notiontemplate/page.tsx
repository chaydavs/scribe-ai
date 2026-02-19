'use client'

import { useState } from 'react'
import { getTool } from '@/types'

const tool = getTool('notiontemplate')!

const templateCategories = [
  { value: 'productivity', label: 'Productivity & Planning' },
  { value: 'finance', label: 'Finance & Budgeting' },
  { value: 'health', label: 'Health & Fitness' },
  { value: 'student', label: 'Student & Education' },
  { value: 'business', label: 'Business & Freelance' },
  { value: 'creative', label: 'Creative & Content' },
  { value: 'habit', label: 'Habit Tracking' },
  { value: 'project', label: 'Project Management' },
]

export default function NotionTemplatePage() {
  const [templateType, setTemplateType] = useState('')
  const [category, setCategory] = useState('productivity')
  const [features, setFeatures] = useState('')
  const [complexity, setComplexity] = useState('standard')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!templateType.trim()) {
      setError('Please describe what template you want to create')
      return
    }

    setError(null)
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/tools/notiontemplate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateType, category, features, complexity }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate template')
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
        <p className="mt-2 text-sm text-gray-500">Cost: {tool.creditCost} credits per template</p>
        <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">
          <strong>Sell these on Etsy/Gumroad!</strong> Templates sell for $9-$49. One sale pays for many generations.
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Template Type</h2>
            <input
              type="text"
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value)}
              placeholder="e.g., 'Debt Snowball Calculator', 'Weekly Meal Planner', 'Content Calendar'"
              className="input"
              disabled={loading}
            />
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Category</h2>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
              disabled={loading}
            >
              {templateCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Complexity</h2>
            <select
              value={complexity}
              onChange={(e) => setComplexity(e.target.value)}
              className="input"
              disabled={loading}
            >
              <option value="simple">Simple ($9-$15) - Single page, basic tracking</option>
              <option value="standard">Standard ($19-$29) - Multiple pages, databases</option>
              <option value="premium">Premium ($39-$49) - Full system, automations</option>
            </select>
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Must-Have Features (Optional)</h2>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="Any specific features? e.g., 'progress charts, recurring tasks, mobile-friendly views'"
              className="input min-h-[80px] resize-y"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !templateType.trim()}
            className="btn-primary w-full"
          >
            {loading ? 'Generating Template...' : `Generate Sellable Template (${tool.creditCost} credits)`}
          </button>
        </div>

        <div className="card max-h-[800px] overflow-y-auto">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Your Template Blueprint</h2>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
              <p className="mt-4 text-sm text-gray-500">Creating your sellable template...</p>
            </div>
          ) : result ? (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">{result}</div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <p>Describe your template idea above</p>
              <p className="mt-2 text-xs">You'll get a complete blueprint to recreate in Notion and sell online</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
