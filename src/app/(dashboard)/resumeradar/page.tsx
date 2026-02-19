'use client'

import { useState, useRef } from 'react'
import { getTool } from '@/types'

const tool = getTool('resumeradar')!

export default function ResumeRadarPage() {
  const [resumeText, setResumeText] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [rewrite, setRewrite] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [rewriteLoading, setRewriteLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)
    setFileName(file.name)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse file')
      }

      setResumeText(data.text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file')
      setFileName(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    // Trigger the file input change handler
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files
      fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError('Please upload a resume or paste your resume text')
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

  const clearFile = () => {
    setFileName(null)
    setResumeText('')
    setAnalysis(null)
    setRewrite(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRewrite = async () => {
    if (!resumeText.trim()) {
      setError('No resume text available for rewrite')
      return
    }

    setError(null)
    setRewriteLoading(true)
    setRewrite(null)

    try {
      const response = await fetch('/api/tools/rewrite-resume', {
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
        throw new Error(data.error || 'Failed to rewrite resume')
      }

      setRewrite(data.rewrite)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setRewriteLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!rewrite) return
    try {
      await navigator.clipboard.writeText(rewrite)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white">
        <h1 className="text-3xl font-bold">Resume Analysis</h1>
        <p className="mt-2 text-indigo-100">
          Upload your resume for AI-powered feedback and optimization tips
        </p>
        <div className="mt-4 flex items-center space-x-4">
          <div className="rounded-lg bg-white/20 px-3 py-1.5 text-sm">
            {tool.creditCost} credits per analysis
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-6">
          {/* File Upload */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center space-x-2">
              <div className="rounded-lg bg-indigo-100 p-2">
                <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Upload Resume</h2>
            </div>

            {fileName ? (
              <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-indigo-100 p-2">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{fileName}</p>
                      <p className="text-sm text-slate-500">
                        {resumeText.length > 0 ? `${resumeText.split(' ').length} words extracted` : 'Processing...'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearFile}
                    className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-slate-600"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="relative rounded-xl border-2 border-dashed border-slate-300 p-8 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/50"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  disabled={uploading}
                />
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                    <p className="mt-3 text-sm text-slate-600">Processing file...</p>
                  </div>
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-3 text-sm font-medium text-slate-700">
                      Drop your resume here or click to upload
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      PDF or TXT (max 5MB)
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Or paste text */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-slate-500">or paste text</span>
              </div>
            </div>

            <textarea
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value)
                setFileName(null)
              }}
              placeholder="Paste your resume text here..."
              className="w-full rounded-xl border border-slate-200 p-4 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[150px] resize-y"
              disabled={loading || uploading}
            />
          </div>

          {/* Job Description */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center space-x-2">
              <div className="rounded-lg bg-purple-100 p-2">
                <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Target Job (Optional)</h2>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description for tailored analysis..."
              className="w-full rounded-xl border border-slate-200 p-4 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[100px] resize-y"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || uploading || !resumeText.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Analyzing your resume...</span>
              </span>
            ) : (
              `Analyze Resume (${tool.creditCost} credits)`
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-h-[600px] overflow-y-auto">
            <div className="mb-4 flex items-center space-x-2">
              <div className="rounded-lg bg-green-100 p-2">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Analysis Results</h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                <p className="mt-4 text-sm text-slate-500">Analyzing your resume...</p>
                <p className="mt-1 text-xs text-slate-400">This may take 10-15 seconds</p>
              </div>
            ) : analysis ? (
              <div className="prose prose-sm max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-strong:text-slate-900 prose-li:text-slate-600">
                <div
                  dangerouslySetInnerHTML={{
                    __html: analysis
                      .replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-bold mt-6 mb-3 text-slate-900 border-b border-slate-200 pb-2">$1</h2>')
                      .replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg font-semibold mt-4 mb-2 text-slate-800">$1</h3>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
                      .replace(/(\d+)\. \*\*/g, '<span class="text-indigo-600 font-bold">$1.</span> **')
                      .replace(/- (.*?)(\n|$)/g, '<li class="ml-4 text-slate-600 my-1">$1</li>')
                      .replace(/→/g, '<span class="text-indigo-500 font-bold">→</span>')
                      .replace(/\n\n/g, '</p><p class="my-3 text-slate-600">')
                      .replace(/\n/g, '<br />')
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-slate-100 p-4">
                  <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="mt-4 font-medium text-slate-700">Upload your resume to get started</p>
                <p className="mt-1 text-sm text-slate-500">You'll receive a detailed analysis with actionable improvements</p>
              </div>
            )}
          </div>

          {/* Rewrite Button - Only show after analysis */}
          {analysis && !rewrite && (
            <button
              onClick={handleRewrite}
              disabled={rewriteLoading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rewriteLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Rewriting your resume...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Rewrite My Resume ({tool.creditCost} credits)</span>
                </span>
              )}
            </button>
          )}

          {/* Rewritten Resume Section */}
          {(rewrite || rewriteLoading) && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="rounded-lg bg-emerald-100 p-2">
                    <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">Rewritten Resume</h2>
                </div>
                {rewrite && (
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-2 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-200"
                  >
                    {copied ? (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {rewriteLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                  <p className="mt-4 text-sm text-slate-500">Rewriting your resume...</p>
                  <p className="mt-1 text-xs text-slate-400">Creating an optimized version</p>
                </div>
              ) : rewrite ? (
                <div className="rounded-xl bg-white p-4 border border-emerald-100 max-h-[500px] overflow-y-auto">
                  {/* Copy protection: blur preview, require payment for full access */}
                  <div className="relative">
                    <pre
                      className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed select-none"
                      style={{
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        userSelect: 'none'
                      }}
                      onCopy={(e) => e.preventDefault()}
                      onCut={(e) => e.preventDefault()}
                    >
                      {rewrite}
                    </pre>
                    {/* Watermark overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03]">
                      <div className="text-6xl font-bold text-slate-900 rotate-[-30deg] whitespace-nowrap">
                        PREVIEW ONLY
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-center text-slate-400">
                    Use the Copy button above to copy this resume
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
