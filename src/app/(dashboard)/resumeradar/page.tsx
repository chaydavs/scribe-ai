'use client'

import { useState } from 'react'
import { getTool } from '@/types'

const tool = getTool('resumeradar')!

export default function ResumeRadarPage() {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError('Please paste your resume text')
      return
    }

    setError(null)
    setLoading(true)
    setAnalysis(null)

    try {
      const response = await fetch('/api/tools/resumeradar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          jobDescription: jobDescription.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze resume')
      }

      setAnalysis(data.analysis)
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
          Cost: {tool.creditCost} credits per analysis
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Your Resume
            </h2>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              className="input min-h-[300px] resize-y"
              disabled={loading}
            />
          </div>

          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Job Description (Optional)
            </h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description for tailored feedback..."
              className="input min-h-[150px] resize-y"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || !resumeText.trim()}
            className="btn-primary w-full"
          >
            {loading ? 'Analyzing...' : `Analyze Resume (${tool.creditCost} credits)`}
          </button>
        </div>

        {/* Results Section */}
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Analysis Results
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
          ) : analysis ? (
            <div className="prose prose-sm max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: analysis
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br />')
                    .replace(/#{1,3} (.*?)(<br \/>|$)/g, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
                }}
              />
            </div>
          ) : (
            <p className="py-12 text-center text-gray-500">
              Paste your resume and click analyze to get started
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
