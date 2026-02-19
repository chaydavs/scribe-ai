'use client'

import { useState, useRef, useEffect } from 'react'
import { getTool } from '@/types'
import { TemplatePicker } from '@/components/tools/resumeradar/template-picker'
import { TemplatePreview } from '@/types/templates'

const tool = getTool('resumeradar')!

type TabId = 'upload' | 'analysis' | 'rewrite' | 'export'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
  disabled?: boolean
  optional?: boolean
}

export default function ResumeRadarPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabId>('upload')

  // Resume state
  const [resumeText, setResumeText] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [jobDescription, setJobDescription] = useState('')

  // Analysis state
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [analysisScore, setAnalysisScore] = useState<number | null>(null)

  // Rewrite state
  const [rewrite, setRewrite] = useState<string | null>(null)

  // Loading states
  const [loading, setLoading] = useState(false)
  const [rewriteLoading, setRewriteLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  // UI state
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>()
  const [userCredits, setUserCredits] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch user credits
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await fetch('/api/user/credits')
        const data = await res.json()
        if (data.credits !== undefined) {
          setUserCredits(data.credits)
        }
      } catch {
        // Ignore errors
      }
    }
    fetchCredits()
  }, [analysis, rewrite])

  // Tab definitions
  const tabs: Tab[] = [
    {
      id: 'upload',
      label: 'Upload',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
    },
    {
      id: 'analysis',
      label: 'Analysis',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      disabled: !analysis,
    },
    {
      id: 'rewrite',
      label: 'Rewrite',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      disabled: !analysis,
      optional: true,
    },
    {
      id: 'export',
      label: 'Export PDF',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      disabled: !rewrite,
      optional: true,
    },
  ]

  // Handlers
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
        headers: { 'Content-Type': 'application/json' },
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
      setAnalysisScore(data.score)
      setActiveTab('analysis')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
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
        headers: { 'Content-Type': 'application/json' },
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

  const clearFile = () => {
    setFileName(null)
    setResumeText('')
    setAnalysis(null)
    setRewrite(null)
    setAnalysisScore(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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

  const handleTemplateSelect = (template: TemplatePreview) => {
    setSelectedTemplateId(template.id)
  }

  const handleExport = async (template: TemplatePreview) => {
    if (!rewrite) return

    setError(null)
    setExportLoading(true)

    try {
      const response = await fetch('/api/tools/export-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: rewrite,
          templateId: template.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to export resume')
      }

      if (data.format === 'pdf' && data.content) {
        const byteCharacters = atob(data.content)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = data.filename || 'resume.pdf'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        if (data.remainingCredits !== undefined) {
          setUserCredits(data.remainingCredits)
        }
      } else if (data.format === 'latex' && data.content) {
        const blob = new Blob([data.content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'resume.tex'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export resume')
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Resume Analysis</h1>
            <p className="mt-1 text-indigo-100 text-sm">
              AI-powered feedback and optimization
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-white/20 px-3 py-1.5 text-sm">
              {userCredits} credits
            </div>
            {analysisScore && (
              <div className="rounded-lg bg-white/20 px-3 py-1.5 text-sm font-semibold">
                Score: {analysisScore}/100
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="flex space-x-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`
                flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all
                ${activeTab === tab.id
                  ? 'bg-white border border-b-0 border-slate-200 text-indigo-600 -mb-px'
                  : tab.disabled
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.optional && (
                <span className="text-xs text-slate-400 ml-1">(optional)</span>
              )}
              {tab.id === 'analysis' && analysis && (
                <span className="w-2 h-2 rounded-full bg-green-500" />
              )}
              {tab.id === 'rewrite' && rewrite && (
                <span className="w-2 h-2 rounded-full bg-green-500" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="p-8">
            <div className="max-w-2xl mx-auto space-y-8">
              {/* File Upload */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Upload Your Resume</h2>

                {fileName ? (
                  <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="rounded-lg bg-indigo-100 p-3">
                          <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{fileName}</p>
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
                    className="relative rounded-xl border-2 border-dashed border-slate-300 p-12 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/50"
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
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                        <p className="mt-4 text-slate-600">Processing file...</p>
                      </div>
                    ) : (
                      <>
                        <svg className="mx-auto h-16 w-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mt-4 text-lg font-medium text-slate-700">
                          Drop your resume here or click to upload
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          PDF or TXT (max 5MB)
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Or paste text */}
                <div className="relative my-6">
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
                  className="w-full rounded-xl border border-slate-200 p-4 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[200px] resize-y"
                  disabled={loading || uploading}
                />
              </div>

              {/* Job Description */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Target Job Description <span className="text-slate-400 font-normal text-sm">(Optional)</span>
                </h2>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description for tailored analysis and keyword optimization..."
                  className="w-full rounded-xl border border-slate-200 p-4 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[120px] resize-y"
                  disabled={loading}
                />
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={loading || uploading || !resumeText.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Analyzing...</span>
                  </span>
                ) : (
                  `Analyze Resume (${tool.creditCost} credits)`
                )}
              </button>
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                <p className="mt-6 text-lg text-slate-600">Analyzing your resume...</p>
                <p className="mt-2 text-sm text-slate-400">This may take 10-15 seconds</p>
              </div>
            ) : analysis ? (
              <div className="max-w-3xl mx-auto">
                {/* Score Card */}
                {analysisScore && (
                  <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-indigo-600">Resume Score</p>
                        <p className="text-4xl font-bold text-slate-900">{analysisScore}/100</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Want to improve?</p>
                        <button
                          onClick={() => setActiveTab('rewrite')}
                          className="text-indigo-600 font-medium hover:underline"
                        >
                          Get AI Rewrite →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Analysis Content */}
                <div className="prose prose-slate max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: analysis
                        .replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-bold mt-8 mb-4 text-slate-900 border-b border-slate-200 pb-2">$1</h2>')
                        .replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg font-semibold mt-6 mb-3 text-slate-800">$1</h3>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
                        .replace(/- (.*?)(\n|$)/g, '<li class="ml-4 text-slate-600 my-2">$1</li>')
                        .replace(/→/g, '<span class="text-indigo-500 font-bold">→</span>')
                        .replace(/\n\n/g, '</p><p class="my-4 text-slate-600">')
                        .replace(/\n/g, '<br />')
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="flex-1 rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    ← Back to Upload
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('rewrite')
                      if (!rewrite) handleRewrite()
                    }}
                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl"
                  >
                    Get AI Rewrite ({tool.creditCost} credits) →
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="rounded-full bg-slate-100 p-6">
                  <svg className="h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="mt-6 text-lg font-medium text-slate-700">No analysis yet</p>
                <p className="mt-2 text-sm text-slate-500">Upload your resume first to get detailed feedback</p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="mt-6 text-indigo-600 font-medium hover:underline"
                >
                  ← Go to Upload
                </button>
              </div>
            )}
          </div>
        )}

        {/* Rewrite Tab */}
        {activeTab === 'rewrite' && (
          <div className="p-8">
            {rewriteLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                <p className="mt-6 text-lg text-slate-600">Rewriting your resume...</p>
                <p className="mt-2 text-sm text-slate-400">Creating an optimized version</p>
              </div>
            ) : rewrite ? (
              <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">AI-Optimized Resume</h2>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-2 rounded-lg bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-200"
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
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Rewritten Resume */}
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 max-h-[600px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
                    {rewrite}
                  </pre>
                </div>

                {/* Export CTA */}
                <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">Ready to export?</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Choose a professional template and download as PDF
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('export')}
                      className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl"
                    >
                      Choose Template →
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto text-center py-12">
                <div className="rounded-full bg-emerald-100 p-6 w-fit mx-auto">
                  <svg className="h-12 w-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="mt-6 text-xl font-bold text-slate-900">AI Resume Rewrite</h2>
                <p className="mt-3 text-slate-600 max-w-md mx-auto">
                  Transform your resume with AI-powered optimization. We'll improve structure,
                  strengthen bullet points, and optimize for ATS systems.
                </p>
                <button
                  onClick={handleRewrite}
                  disabled={rewriteLoading || !analysis}
                  className="mt-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  Rewrite My Resume ({tool.creditCost} credits)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="p-8">
            {rewrite ? (
              <TemplatePicker
                onSelect={handleTemplateSelect}
                onExport={handleExport}
                selectedTemplateId={selectedTemplateId}
                loading={exportLoading}
                userCredits={userCredits}
              />
            ) : (
              <div className="text-center py-20">
                <div className="rounded-full bg-slate-100 p-6 w-fit mx-auto">
                  <svg className="h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="mt-6 text-xl font-bold text-slate-900">Export as PDF</h2>
                <p className="mt-3 text-slate-600">
                  Get your AI-rewritten resume first, then export with a professional template.
                </p>
                <button
                  onClick={() => setActiveTab('rewrite')}
                  className="mt-6 text-indigo-600 font-medium hover:underline"
                >
                  ← Go to Rewrite
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
