'use client'

import { useState } from 'react'
import { getTool } from '@/types'

const tool = getTool('coldcraft')!

export default function ColdCraftPage() {
  const [recipientInfo, setRecipientInfo] = useState('')
  const [senderInfo, setSenderInfo] = useState('')
  const [purpose, setPurpose] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!recipientInfo.trim() || !purpose.trim()) {
      setError('Please provide recipient information and purpose')
      return
    }

    setError(null)
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/tools/coldcraft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientInfo,
          senderInfo: senderInfo.trim() || undefined,
          purpose,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to generate email')
      setResult(data.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{tool.name}</h1>
            <p className="mt-2 text-blue-100">{tool.description}</p>
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
              <div className="rounded-lg bg-blue-100 p-2">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">About the Recipient</h2>
            </div>
            <textarea
              value={recipientInfo}
              onChange={(e) => setRecipientInfo(e.target.value)}
              placeholder="Name, company, role, recent achievements, LinkedIn info..."
              className="w-full rounded-xl border border-slate-200 p-4 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[150px] resize-y"
              disabled={loading}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center space-x-2">
              <div className="rounded-lg bg-cyan-100 p-2">
                <svg className="h-5 w-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">About You (Optional)</h2>
            </div>
            <textarea
              value={senderInfo}
              onChange={(e) => setSenderInfo(e.target.value)}
              placeholder="Your name, role, company, relevant achievements..."
              className="w-full rounded-xl border border-slate-200 p-4 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px] resize-y"
              disabled={loading}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center space-x-2">
              <div className="rounded-lg bg-indigo-100 p-2">
                <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Your Goal</h2>
            </div>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="What do you want? (schedule a call, pitch a service, get advice...)"
              className="w-full rounded-xl border border-slate-200 p-4 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px] resize-y"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">{error}</div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !recipientInfo.trim() || !purpose.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Crafting your emails...</span>
              </span>
            ) : 'Generate Cold Emails'}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center space-x-2">
            <div className="rounded-lg bg-green-100 p-2">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Generated Emails</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <p className="mt-4 text-sm text-slate-500">Writing personalized emails...</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="mt-4 text-slate-500">Add recipient details to generate personalized cold emails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
