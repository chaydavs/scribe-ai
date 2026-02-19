'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ResumeFormProps {
  onAnalyze: (data: { resumeText: string; jobDescription?: string }) => Promise<void>
  loading?: boolean
  creditCost: number
}

export function ResumeForm({ onAnalyze, loading, creditCost }: ResumeFormProps) {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!resumeText.trim()) {
      setError('Please paste your resume text')
      return
    }

    setError(null)

    try {
      await onAnalyze({
        resumeText,
        jobDescription: jobDescription.trim() || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Resume</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here..."
            className="min-h-[300px] resize-y"
            disabled={loading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job Description (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description for tailored feedback..."
            className="min-h-[150px] resize-y"
            disabled={loading}
          />
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !resumeText.trim()}
        className="w-full"
      >
        {loading ? 'Analyzing...' : `Analyze Resume (${creditCost} credits)`}
      </Button>
    </form>
  )
}
