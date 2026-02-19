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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientInfo,
          senderInfo: senderInfo.trim() || undefined,
          purpose,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate email')
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
          Cost: {tool.creditCost} credits per email
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Recipient Info</h2>
            <textarea
              value={recipientInfo}
              onChange={(e) => setRecipientInfo(e.target.value)}
              placeholder="Name, company, role, background, anything relevant..."
              className="input min-h-[120px] resize-y"
              disabled={loading}
            />
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Your Info (Optional)</h2>
            <textarea
              value={senderInfo}
              onChange={(e) => setSenderInfo(e.target.value)}
              placeholder="Your name, role, company, relevant achievements..."
              className="input min-h-[100px] resize-y"
              disabled={loading}
            />
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Purpose</h2>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="What do you want to achieve? (e.g., schedule a call, pitch a service, request advice)"
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
            disabled={loading || !recipientInfo.trim() || !purpose.trim()}
            className="btn-primary w-full"
          >
            {loading ? 'Generating...' : `Generate Email (${tool.creditCost} credits)`}
          </button>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Generated Emails</h2>
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
              Fill in the details and click generate to create cold emails
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
