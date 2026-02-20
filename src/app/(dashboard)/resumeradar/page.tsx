'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getTool } from '@/types'
import { TemplatePicker } from '@/components/tools/resumeradar/template-picker'
import { TemplatePreview } from '@/types/templates'

const tool = getTool('resumeradar')!

type TabId = 'upload' | 'analysis' | 'rewrite' | 'preview'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
  disabled?: boolean
}

// Wrapper component to handle Suspense for useSearchParams
export default function ResumeRadarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-2 border-transparent border-r-amber-300/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </div>
    }>
      <ResumeRadarContent />
    </Suspense>
  )
}

function ResumeRadarContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const analysisId = searchParams.get('id')

  // Tab state
  const [activeTab, setActiveTab] = useState<TabId>('upload')

  // Resume state
  const [resumeText, setResumeText] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [analysisTitle, setAnalysisTitle] = useState<string>('')

  // Analysis state
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [analysisScore, setAnalysisScore] = useState<number | null>(null)
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null)

  // Rewrite state
  const [rewrite, setRewrite] = useState<string | null>(null)

  // Preview state
  const [viewMode, setViewMode] = useState<'changes' | 'preview'>('changes')
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  // Loading states
  const [loading, setLoading] = useState(false)
  const [rewriteLoading, setRewriteLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [savingTitle, setSavingTitle] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // UI state
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>()
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePreview | null>(null)
  const [userCredits, setUserCredits] = useState(0)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load analysis from URL parameter
  useEffect(() => {
    const loadAnalysis = async (id: string) => {
      setLoadingAnalysis(true)
      setError(null)

      try {
        const res = await fetch(`/api/analyses/${id}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load analysis')
        }

        const analysisData = data.analysis

        setResumeText(analysisData.resume_text || '')
        setJobDescription(analysisData.job_description || '')
        setAnalysis(analysisData.analysis_result || null)
        setAnalysisScore(analysisData.score || null)
        setRewrite(analysisData.rewrite_result || null)
        setAnalysisTitle(analysisData.title || '')
        setCurrentAnalysisId(id)

        if (analysisData.rewrite_result) {
          setActiveTab('preview')
        } else if (analysisData.analysis_result) {
          setActiveTab('analysis')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analysis')
      } finally {
        setLoadingAnalysis(false)
      }
    }

    if (analysisId && analysisId !== currentAnalysisId) {
      loadAnalysis(analysisId)
    }
  }, [analysisId, currentAnalysisId])

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
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
    },
    {
      id: 'analysis',
      label: 'Analysis',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      disabled: !analysis,
    },
    {
      id: 'rewrite',
      label: 'Rewrite',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      disabled: !analysis,
    },
    {
      id: 'preview',
      label: 'Export',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      disabled: !rewrite,
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
    setIsDragging(false)
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
      if (data.analysisId) {
        setCurrentAnalysisId(data.analysisId)
      }
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
    setPdfPreviewUrl(null)
    setCurrentAnalysisId(null)
    setAnalysisTitle('')
    setJobDescription('')
    setSelectedTemplateId(undefined)
    setSelectedTemplate(null)
    setActiveTab('upload')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    router.push('/resumeradar')
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
    setSelectedTemplate(template)
    generatePreview(template)
  }

  const generatePreview = async (template: TemplatePreview) => {
    if (!rewrite) return

    setPreviewLoading(true)
    try {
      const response = await fetch('/api/tools/export-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: rewrite,
          templateId: template.id,
          previewOnly: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate preview')
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
        setPdfPreviewUrl(url)
      }
    } catch (err) {
      console.error('Preview error:', err)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleExport = async () => {
    if (!rewrite || !selectedTemplate) return

    setError(null)
    setExportLoading(true)

    try {
      const response = await fetch('/api/tools/export-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: rewrite,
          templateId: selectedTemplate.id,
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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export resume')
    } finally {
      setExportLoading(false)
    }
  }

  const handleSave = async () => {
    if (!rewrite) {
      setError('No rewrite to save')
      return
    }

    if (!currentAnalysisId) {
      setError('No analysis ID found. Try analyzing again.')
      return
    }

    setError(null)
    setSaving(true)
    setSaveSuccess(false)

    try {
      const response = await fetch(`/api/analyses/${currentAnalysisId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rewriteResult: rewrite,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleRenameAnalysis = async () => {
    if (!currentAnalysisId || !editedTitle.trim()) return

    setSavingTitle(true)
    try {
      const response = await fetch(`/api/analyses/${currentAnalysisId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedTitle.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to rename')
      }

      setAnalysisTitle(editedTitle.trim())
      setIsEditingTitle(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename')
    } finally {
      setSavingTitle(false)
    }
  }

  const getChangeSummary = () => {
    if (!resumeText || !rewrite) return null

    const originalLines = resumeText.split('\n').filter(l => l.trim())
    const rewriteLines = rewrite.split('\n').filter(l => l.trim())

    return {
      originalCount: originalLines.length,
      rewriteCount: rewriteLines.length,
      originalWords: resumeText.split(/\s+/).length,
      rewriteWords: rewrite.split(/\s+/).length,
    }
  }

  const changeSummary = getChangeSummary()

  // Score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-amber-400'
    return 'text-red-400'
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGM5Ljk0MSAwIDE4LTguMDU5IDE4LTE4cy04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              {currentAnalysisId && isEditingTitle ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xl font-light text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-colors"
                    placeholder="Enter title..."
                    autoFocus
                  />
                  <button
                    onClick={handleRenameAnalysis}
                    disabled={savingTitle}
                    className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    {savingTitle ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingTitle(false)
                      setEditedTitle(analysisTitle)
                    }}
                    className="text-white/40 hover:text-white/60 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-extralight tracking-tight">
                    {analysisTitle || 'Resume Analysis'}
                  </h1>
                  {currentAnalysisId && (
                    <button
                      onClick={() => {
                        setEditedTitle(analysisTitle)
                        setIsEditingTitle(true)
                      }}
                      className="p-2 text-white/30 hover:text-white/60 transition-colors"
                      title="Rename"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
              <p className="text-white/40 font-light">AI-powered career optimization</p>
            </div>

            <div className="flex items-center gap-4">
              {(analysis || activeTab !== 'upload') && (
                <button
                  onClick={clearFile}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/60 hover:text-white transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  New
                </button>
              )}
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                <span className="text-white/40 text-sm">Credits</span>
                <span className="text-amber-400 font-medium">{userCredits}</span>
              </div>
              {analysisScore && (
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                  <span className="text-white/40 text-sm">Score</span>
                  <span className={`text-2xl font-light ${getScoreColor(analysisScore)}`}>{analysisScore}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="mb-8">
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl w-fit">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`
                  relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
                  ${activeTab === tab.id
                    ? 'bg-white/10 text-white shadow-lg'
                    : tab.disabled
                      ? 'text-white/20 cursor-not-allowed'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.id === 'analysis' && analysis && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
                {tab.id === 'rewrite' && rewrite && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {/* Main Content */}
        <main className="relative">
          {/* Loading State */}
          {loadingAnalysis && (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
              </div>
              <p className="mt-8 text-white/40 font-light">Loading analysis...</p>
            </div>
          )}

          {/* Upload Tab */}
          {!loadingAnalysis && activeTab === 'upload' && (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Upload Area */}
              <div className="space-y-4">
                <label className="block text-sm text-white/40 uppercase tracking-wider">Resume</label>

                {fileName ? (
                  <div className="group relative p-6 bg-white/5 border border-white/10 rounded-2xl transition-all hover:border-amber-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl">
                          <svg className="h-6 w-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-white">{fileName}</p>
                          <p className="text-sm text-white/40">
                            {resumeText.length > 0 ? `${resumeText.split(' ').length} words` : 'Processing...'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={clearFile}
                        className="p-2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`
                      relative p-12 border-2 border-dashed rounded-2xl text-center transition-all duration-300 cursor-pointer
                      ${isDragging
                        ? 'border-amber-500 bg-amber-500/5'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                      }
                    `}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
                        <p className="mt-4 text-white/40">Processing...</p>
                      </div>
                    ) : (
                      <>
                        <div className="inline-flex p-4 bg-white/5 rounded-2xl mb-4">
                          <svg className="h-8 w-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <p className="text-white/60 font-light">
                          Drop your resume here or <span className="text-amber-400">browse</span>
                        </p>
                        <p className="mt-2 text-sm text-white/30">PDF or TXT</p>
                      </>
                    )}
                  </div>
                )}

                {/* Paste text option */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-[#0a0a0b] text-sm text-white/30">or paste text</span>
                  </div>
                </div>

                <textarea
                  value={resumeText}
                  onChange={(e) => {
                    setResumeText(e.target.value)
                    setFileName(null)
                  }}
                  placeholder="Paste your resume content here..."
                  className="w-full h-48 p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 font-light resize-none focus:outline-none focus:border-amber-500/30 transition-colors"
                  disabled={loading || uploading}
                />
              </div>

              {/* Job Description */}
              <div className="space-y-4">
                <label className="block text-sm text-white/40 uppercase tracking-wider">
                  Target Role <span className="text-white/20">(Optional)</span>
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste job description for tailored analysis..."
                  className="w-full h-32 p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 font-light resize-none focus:outline-none focus:border-amber-500/30 transition-colors"
                  disabled={loading}
                />
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={loading || uploading || !resumeText.trim()}
                className="group relative w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-medium text-black overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-500/20"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Resume
                      <span className="text-black/60">({tool.creditCost} credits)</span>
                    </>
                  )}
                </span>
              </button>
            </div>
          )}

          {/* Analysis Tab */}
          {!loadingAnalysis && activeTab === 'analysis' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
                  </div>
                  <p className="mt-8 text-white/40 font-light">Analyzing your resume...</p>
                  <p className="mt-2 text-sm text-white/20">This may take 10-15 seconds</p>
                </div>
              ) : analysis ? (
                <div className="max-w-3xl mx-auto">
                  {/* Score Card */}
                  {analysisScore && (
                    <div className="mb-8 p-8 bg-white/5 border border-white/10 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white/40 uppercase tracking-wider mb-2">Resume Score</p>
                          <p className={`text-6xl font-extralight ${getScoreColor(analysisScore)}`}>
                            {analysisScore}<span className="text-2xl text-white/20">/100</span>
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab('rewrite')}
                          className="px-6 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl font-medium transition-colors"
                        >
                          Improve with AI →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Analysis Content */}
                  <div className="prose prose-invert prose-lg max-w-none">
                    <div
                      className="space-y-6 text-white/70 font-light leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: analysis
                          .replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-medium text-white mt-10 mb-4 pb-2 border-b border-white/10">$1</h2>')
                          .replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg font-medium text-white/90 mt-6 mb-3">$1</h3>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-medium text-white">$1</strong>')
                          .replace(/- (.*?)(\n|$)/g, '<li class="ml-4 text-white/60 my-1">$1</li>')
                          .replace(/→/g, '<span class="text-amber-400">→</span>')
                          .replace(/\n\n/g, '</p><p class="my-4">')
                      }}
                    />
                  </div>

                  {/* Actions */}
                  <div className="mt-12 pt-8 border-t border-white/10 flex gap-4">
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 hover:text-white font-medium transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('rewrite')
                        if (!rewrite) handleRewrite()
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-medium text-black transition-all hover:shadow-lg hover:shadow-amber-500/20"
                    >
                      Get AI Rewrite ({tool.creditCost} credits) →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="p-6 bg-white/5 rounded-2xl mb-6">
                    <svg className="h-12 w-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-xl text-white/60 font-light">No analysis yet</p>
                  <p className="mt-2 text-white/30">Upload your resume to get started</p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="mt-6 text-amber-400 hover:text-amber-300 font-medium transition-colors"
                  >
                    ← Go to Upload
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Rewrite Tab */}
          {!loadingAnalysis && activeTab === 'rewrite' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {rewriteLoading ? (
                <div className="flex flex-col items-center justify-center py-32">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                  </div>
                  <p className="mt-8 text-white/40 font-light">Rewriting your resume...</p>
                  <p className="mt-2 text-sm text-white/20">Creating an optimized version</p>
                </div>
              ) : rewrite ? (
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-light text-white">AI-Optimized Resume</h2>
                    <button
                      onClick={copyToClipboard}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        copied
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      {copied ? (
                        <>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl max-h-[600px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-white/70 font-mono leading-relaxed">
                      {rewrite}
                    </pre>
                  </div>

                  <div className="mt-8 p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white">Ready to export?</h3>
                        <p className="text-sm text-white/40 mt-1">Choose a template and download as PDF</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('preview')}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-medium text-black transition-all hover:shadow-lg hover:shadow-amber-500/20"
                      >
                        Preview & Export →
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-xl mx-auto text-center py-16">
                  <div className="inline-flex p-6 bg-emerald-500/10 rounded-2xl mb-6">
                    <svg className="h-12 w-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-light text-white mb-4">AI Resume Rewrite</h2>
                  <p className="text-white/40 mb-8 max-w-md mx-auto font-light">
                    Transform your resume with AI-powered optimization. Improve structure, strengthen bullet points, and optimize for ATS.
                  </p>
                  <button
                    onClick={handleRewrite}
                    disabled={rewriteLoading || !analysis}
                    className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-medium text-black transition-all hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50"
                  >
                    Rewrite My Resume ({tool.creditCost} credits)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Preview & Export Tab */}
          {!loadingAnalysis && activeTab === 'preview' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {rewrite ? (
                <div className="max-w-6xl mx-auto">
                  {/* View Toggle & Actions */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl">
                      <button
                        onClick={() => setViewMode('changes')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          viewMode === 'changes'
                            ? 'bg-white/10 text-white'
                            : 'text-white/40 hover:text-white/60'
                        }`}
                      >
                        Changes
                      </button>
                      <button
                        onClick={() => setViewMode('preview')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          viewMode === 'preview'
                            ? 'bg-white/10 text-white'
                            : 'text-white/40 hover:text-white/60'
                        }`}
                      >
                        Preview
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSave}
                        disabled={!currentAnalysisId || saving}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          saveSuccess
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white'
                        } disabled:opacity-50`}
                      >
                        {saving ? (
                          <>
                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Saving...
                          </>
                        ) : saveSuccess ? (
                          <>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Saved!
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleExport}
                        disabled={!selectedTemplate || exportLoading}
                        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-sm font-medium text-black transition-all hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50"
                      >
                        {exportLoading ? (
                          <>
                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Exporting...
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export PDF
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {viewMode === 'changes' ? (
                    <>
                      {changeSummary && (
                        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                          <div className="grid grid-cols-4 gap-6 text-center">
                            <div>
                              <p className="text-2xl font-light text-white">{changeSummary.originalCount}</p>
                              <p className="text-xs text-white/40 uppercase tracking-wider">Original Lines</p>
                            </div>
                            <div>
                              <p className="text-2xl font-light text-white">{changeSummary.rewriteCount}</p>
                              <p className="text-xs text-white/40 uppercase tracking-wider">New Lines</p>
                            </div>
                            <div>
                              <p className="text-2xl font-light text-white">{changeSummary.originalWords}</p>
                              <p className="text-xs text-white/40 uppercase tracking-wider">Original Words</p>
                            </div>
                            <div>
                              <p className="text-2xl font-light text-white">{changeSummary.rewriteWords}</p>
                              <p className="text-xs text-white/40 uppercase tracking-wider">New Words</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-2 h-2 rounded-full bg-red-400" />
                            <h3 className="text-sm text-white/40 uppercase tracking-wider">Original</h3>
                          </div>
                          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl max-h-[500px] overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-sm text-white/60 font-mono leading-relaxed">
                              {resumeText}
                            </pre>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <h3 className="text-sm text-white/40 uppercase tracking-wider">Rewritten</h3>
                          </div>
                          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl max-h-[500px] overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-sm text-white/60 font-mono leading-relaxed">
                              {rewrite}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <h3 className="text-sm text-white/40 uppercase tracking-wider mb-3">Template</h3>
                        <TemplatePicker
                          onSelect={handleTemplateSelect}
                          onExport={() => {}}
                          selectedTemplateId={selectedTemplateId}
                          loading={false}
                          userCredits={userCredits}
                          compact
                        />
                      </div>
                      <div className="col-span-2">
                        <h3 className="text-sm text-white/40 uppercase tracking-wider mb-3">Preview</h3>
                        <div className="bg-white/5 border border-white/10 rounded-xl min-h-[600px] flex items-center justify-center overflow-hidden">
                          {previewLoading ? (
                            <div className="flex flex-col items-center">
                              <div className="h-10 w-10 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
                              <p className="mt-4 text-white/40">Generating preview...</p>
                            </div>
                          ) : pdfPreviewUrl ? (
                            <iframe
                              src={pdfPreviewUrl}
                              className="w-full h-[600px] rounded-xl"
                              title="Resume Preview"
                            />
                          ) : (
                            <div className="text-center">
                              <svg className="mx-auto h-16 w-16 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="mt-4 text-white/30">Select a template to preview</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="p-6 bg-white/5 rounded-2xl mb-6">
                    <svg className="h-12 w-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-xl text-white/60 font-light">Preview & Export</p>
                  <p className="mt-2 text-white/30">Get your AI-rewritten resume first</p>
                  <button
                    onClick={() => setActiveTab('rewrite')}
                    className="mt-6 text-amber-400 hover:text-amber-300 font-medium transition-colors"
                  >
                    ← Go to Rewrite
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
