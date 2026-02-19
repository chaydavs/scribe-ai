'use client'

import { useState } from 'react'
import { getTool } from '@/types'

const tool = getTool('meetingnotes')!

export default function MeetingNotesPage() {
  const [transcript, setTranscript] = useState('')
  const [meetingType, setMeetingType] = useState('general')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSummarize = async () => {
    if (!transcript.trim()) {
      setError('Please paste your meeting transcript or notes')
      return
    }

    setError(null)
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/tools/meetingnotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, meetingType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to summarize meeting')
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
        <p className="mt-2 text-sm text-gray-500">Cost: {tool.creditCost} credits per summary</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Meeting Type</h2>
            <select
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value)}
              className="input"
              disabled={loading}
            >
              <option value="general">General Meeting</option>
              <option value="standup">Daily Standup</option>
              <option value="planning">Sprint Planning</option>
              <option value="review">Project Review</option>
              <option value="sales">Sales Call</option>
              <option value="interview">Interview</option>
            </select>
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Transcript / Notes</h2>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste your meeting transcript, notes, or recording summary here..."
              className="input min-h-[300px] resize-y"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
          )}

          <button
            onClick={handleSummarize}
            disabled={loading || !transcript.trim()}
            className="btn-primary w-full"
          >
            {loading ? 'Summarizing...' : `Summarize Meeting (${tool.creditCost} credits)`}
          </button>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Meeting Summary</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
          ) : result ? (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">{result}</div>
          ) : (
            <p className="py-12 text-center text-gray-500">Paste your transcript and click summarize</p>
          )}
        </div>
      </div>
    </div>
  )
}
