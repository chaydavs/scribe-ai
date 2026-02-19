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
      if (!response.ok) throw new Error(data.error || 'Failed to generate template')
      setResult(data.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{tool.name}</h1>
            <p className="mt-2 text-orange-100">{tool.description}</p>
          </div>
          <div className="rounded-xl bg-white/20 px-4 py-2 backdrop-blur">
            <span className="text-sm font-medium">{tool.creditCost} credits</span>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-white/10 p-4 backdrop-blur">
          <p className="text-sm font-medium">Sell templates on Etsy/Gumroad for $19-$49. One sale covers many generations.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center space-x-2">
              <div className="rounded-lg bg-orange-100 p-2">
                <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Template Idea</h2>
            </div>
            <input
              type="text"
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value)}
              placeholder="e.g., 'Debt Snowball Calculator', 'Weekly Meal Planner', 'Content Calendar'"
              className="w-full rounded-xl border border-slate-200 p-4 text-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              disabled={loading}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center space-x-2">
                <div className="rounded-lg bg-pink-100 p-2">
                  <svg className="h-5 w-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Category</h2>
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                disabled={loading}
              >
                {templateCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center space-x-2">
                <div className="rounded-lg bg-amber-100 p-2">
                  <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Price Tier</h2>
              </div>
              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                disabled={loading}
              >
                <option value="simple">Simple ($9-$15)</option>
                <option value="standard">Standard ($19-$29)</option>
                <option value="premium">Premium ($39-$49)</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center space-x-2">
              <div className="rounded-lg bg-purple-100 p-2">
                <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Must-Have Features (Optional)</h2>
            </div>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="e.g., 'progress charts, recurring tasks, mobile-friendly views'"
              className="w-full rounded-xl border border-slate-200 p-4 text-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 min-h-[80px] resize-y"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">{error}</div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !templateType.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating sellable template...</span>
              </span>
            ) : 'Generate Template Blueprint'}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-h-[800px] overflow-y-auto">
          <div className="mb-4 flex items-center space-x-2">
            <div className="rounded-lg bg-green-100 p-2">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Your Template Blueprint</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
              <p className="mt-4 text-sm text-slate-500">Creating your sellable template...</p>
            </div>
          ) : result ? (
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{
                __html: result
                  .replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-bold mt-6 mb-3 text-slate-900 border-b pb-2">$1</h2>')
                  .replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg font-semibold mt-4 mb-2 text-slate-800">$1</h3>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
                  .replace(/\|(.*?)\|/g, '<code class="bg-slate-100 px-1 rounded">$1</code>')
                  .replace(/- (.*?)(\n|$)/g, '<li class="ml-4 text-slate-600">$1</li>')
                  .replace(/\n\n/g, '</p><p class="my-3 text-slate-600">')
                  .replace(/\n/g, '<br />')
              }} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-slate-100 p-4">
                <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="mt-4 text-slate-500">Describe your template idea to get a complete blueprint</p>
              <p className="mt-2 text-xs text-slate-400">Ready to recreate in Notion and sell online</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
