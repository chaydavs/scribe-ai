'use client'

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getTool } from '@/types'
import { useToast } from '@/components/ui/toast'
import { AnalysisLoadingSkeleton } from '@/components/ui/skeleton'
import { UploadTab } from './components/upload-tab'
import { AnalysisTab } from './components/analysis-tab'
import { RewriteTab } from './components/rewrite-tab'
import { PreviewTab } from './components/preview-tab'
import { CreateTab } from './components/create-tab'

const tool = getTool('resumelab')!

// Structured analysis types
interface StructuredAnalysis {
  score: number
  verdict: string
  scoreBreakdown: {
    impact: { score: number; label: string }
    clarity: { score: number; label: string }
    ats: { score: number; label: string }
    structure: { score: number; label: string }
  }
  strengths: Array<{ title: string; quote: string; why: string }>
  fixes: Array<{
    title: string
    severity: 'critical' | 'important' | 'nice-to-have'
    current: string
    problem: string
    fixed: string
    impact: string
  }>
  sectionReviews: Array<{
    name: string
    grade: string
    summary: string
    issues: string[]
  }>
  atsAnalysis: {
    score: number
    risks: string[]
    missingKeywords: string[]
    foundKeywords: string[]
  }
  quickWins: string[]
  nextStep: string
}

type TabId = 'upload' | 'analysis' | 'rewrite' | 'preview'

// Wrapper component to handle Suspense for useSearchParams
export default function ResumeLabPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <AnalysisLoadingSkeleton />
      </div>
    }>
      <ResumeLabContent />
    </Suspense>
  )
}

function ResumeLabContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const analysisId = searchParams.get('id')
  const { toast } = useToast()

  // Tab state
  const [activeTab, setActiveTab] = useState<TabId>('upload')

  // Resume state
  const [resumeText, setResumeText] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [analysisTitle, setAnalysisTitle] = useState<string>('')

  // Analysis state
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [structuredAnalysis, setStructuredAnalysis] = useState<StructuredAnalysis | null>(null)
  const [analysisScore, setAnalysisScore] = useState<number | null>(null)
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null)

  // Rewrite state
  const [rewrite, setRewrite] = useState<string | null>(null)

  // Improved score state (after rewrite)
  const [improvedScore, setImprovedScore] = useState<{
    score: number
    scoreBreakdown: {
      impact: { score: number; label: string }
      clarity: { score: number; label: string }
      ats: { score: number; label: string }
      structure: { score: number; label: string }
    }
    topImprovements: string[]
  } | null>(null)
  const [scoringRewrite, setScoringRewrite] = useState(false)

  // Preview state
  const [editableResume, setEditableResume] = useState<string>('')
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  // Loading states
  const [loading, setLoading] = useState(false)
  const [rewriteLoading, setRewriteLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [savingTitle, setSavingTitle] = useState(false)

  // Countdown timer for analysis
  const [countdown, setCountdown] = useState(0)

  // UI state
  const [copied, setCopied] = useState(false)
  const [userCredits, setUserCredits] = useState(0)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')

  // Copy protection state
  const [hasExported, setHasExported] = useState(false)

  // Mode state - analyze existing or create from scratch
  const [mode, setMode] = useState<'analyze' | 'create'>('analyze')
  const [createdFromScratch, setCreatedFromScratch] = useState(false)

  // Create from scratch form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    summary: '',
    experience: [{ title: '', company: '', location: '', startDate: '', endDate: '', bullets: [''] }],
    education: [{ school: '', degree: '', graduationDate: '', gpa: '' }],
    skills: [''],
    projects: [{ name: '', description: '', technologies: [''] }],
  })
  const [creatingPdf, setCreatingPdf] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load analysis from URL parameter
  useEffect(() => {
    const loadAnalysis = async (id: string) => {
      setLoadingAnalysis(true)

      try {
        const res = await fetch(`/api/analyses/${id}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load analysis')
        }

        const analysisData = data.analysis

        // Populate state with loaded data
        setResumeText(analysisData.resume_text || '')
        setJobDescription(analysisData.job_description || '')
        setAnalysis(analysisData.analysis_result || null)
        setAnalysisScore(analysisData.score || null)
        setRewrite(analysisData.rewrite_result || null)
        setAnalysisTitle(analysisData.title || '')
        setCurrentAnalysisId(id)

        // Try to parse structured JSON from saved analysis
        if (analysisData.analysis_result) {
          const jsonMatch = analysisData.analysis_result.match(/```json\s*([\s\S]*?)\s*```/)
          if (jsonMatch) {
            try {
              setStructuredAnalysis(JSON.parse(jsonMatch[1]))
            } catch {
              // Non-structured analysis, will use fallback rendering
            }
          }
        }

        // Check if user has previously exported this specific analysis
        try {
          const exportsRes = await fetch('/api/tools/export-resume')
          const exportsData = await exportsRes.json()
          if (exportsData.exports?.some((exp: { id: string; analysis_id?: string }) => exp.analysis_id === id)) {
            setHasExported(true)
          }
        } catch {
          // Ignore - default to not exported
        }

        // Switch to appropriate tab
        if (analysisData.rewrite_result) {
          setActiveTab('preview')
        } else if (analysisData.analysis_result) {
          setActiveTab('analysis')
        }
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Failed to load analysis', 'error')
      } finally {
        setLoadingAnalysis(false)
      }
    }

    if (analysisId && analysisId !== currentAnalysisId) {
      loadAnalysis(analysisId)
    }
  }, [analysisId, currentAnalysisId, toast])

  // Countdown timer effect
  useEffect(() => {
    if (!loading) {
      setCountdown(0)
      return
    }
    setCountdown(30)
    const interval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [loading])

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

  // Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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
      toast(err instanceof Error ? err.message : 'Failed to upload file', 'error')
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
      toast('Please upload a resume or paste your resume text', 'error')
      return
    }

    setLoading(true)
    setAnalysis(null)

    try {
      const response = await fetch('/api/tools/resumelab', {
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
      setStructuredAnalysis(data.structured || null)
      setAnalysisScore(data.score)
      if (data.analysisId) {
        setCurrentAnalysisId(data.analysisId)
      }
      setActiveTab('analysis')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'An error occurred', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRewrite = async () => {
    if (!resumeText.trim()) {
      toast('No resume text available for rewrite', 'error')
      return
    }

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
      toast(err instanceof Error ? err.message : 'An error occurred', 'error')
    } finally {
      setRewriteLoading(false)
    }
  }

  const clearFile = () => {
    setFileName(null)
    setResumeText('')
    setAnalysis(null)
    setStructuredAnalysis(null)
    setRewrite(null)
    setImprovedScore(null)
    setAnalysisScore(null)
    setPdfPreviewUrl(null)
    setCurrentAnalysisId(null)
    setAnalysisTitle('')
    setJobDescription('')
    setEditableResume('')
    setHasExported(false)
    setActiveTab('upload')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    router.push('/resumelab')
  }

  const copyToClipboard = async () => {
    if (!rewrite) return
    try {
      await navigator.clipboard.writeText(rewrite)
      setCopied(true)
      toast('Copied!', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast('Failed to copy to clipboard', 'error')
    }
  }

  const generatePreview = async (text: string) => {
    if (!text) return

    setPreviewLoading(true)
    try {
      const response = await fetch('/api/tools/export-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: text,
          templateId: 'classic-professional-1',
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

  // Score the resume text via quick-score API
  const scoreAbortRef = useRef<AbortController | null>(null)
  const scoreResume = useCallback(async (text: string) => {
    if (scoreAbortRef.current) scoreAbortRef.current.abort()
    const controller = new AbortController()
    scoreAbortRef.current = controller

    setScoringRewrite(true)
    try {
      const res = await fetch('/api/tools/quick-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text }),
        signal: controller.signal,
      })
      const data = await res.json()
      if (data.score !== undefined) {
        setImprovedScore(data)
      }
    } catch {
      // Aborted or failed — ignore
    } finally {
      setScoringRewrite(false)
    }
  }, [])

  // Initialize editableResume from rewrite
  useEffect(() => {
    if (rewrite) {
      setEditableResume(rewrite)
      generatePreview(rewrite)
      scoreResume(rewrite)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewrite])

  // When entering export tab without rewrite
  useEffect(() => {
    if (activeTab === 'preview' && !rewrite && resumeText && !editableResume) {
      setEditableResume(resumeText)
      generatePreview(resumeText)
      scoreResume(resumeText)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, rewrite, resumeText])

  // Debounce preview + re-score when user edits
  useEffect(() => {
    if (!editableResume || editableResume === rewrite || editableResume === resumeText) return
    const timer = setTimeout(() => {
      generatePreview(editableResume)
      scoreResume(editableResume)
    }, 2500)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editableResume])

  const handleExport = async () => {
    if (!editableResume) return

    setExportLoading(true)

    try {
      const response = await fetch('/api/tools/export-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: editableResume,
          templateId: 'classic-professional-1',
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

        setHasExported(true)
        toast('PDF exported successfully!', 'success')
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to export resume', 'error')
    } finally {
      setExportLoading(false)
    }
  }

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = async () => {
    const textToSave = editableResume || rewrite
    if (!textToSave) {
      toast('No resume text to save', 'error')
      return
    }

    if (!currentAnalysisId) {
      toast('No analysis ID found. Try analyzing again.', 'error')
      return
    }

    setSaving(true)
    setSaveSuccess(false)

    try {
      const response = await fetch(`/api/analyses/${currentAnalysisId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rewriteResult: textToSave,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      setSaveSuccess(true)
      toast('Saved!', 'success')
      setTimeout(() => setSaveSuccess(false), 2000)
      // Re-score so the displayed score updates to reflect edits
      scoreResume(textToSave)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save', 'error')
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
      toast(err instanceof Error ? err.message : 'Failed to rename', 'error')
    } finally {
      setSavingTitle(false)
    }
  }

  // Form helpers for Create from Scratch
  const updateFormField = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { title: '', company: '', location: '', startDate: '', endDate: '', bullets: [''] }]
    }))
  }

  const updateExperience = (index: number, field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => i === index ? { ...exp, [field]: value } : exp)
    }))
  }

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { school: '', degree: '', graduationDate: '', gpa: '' }]
    }))
  }

  const updateEducation = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => i === index ? { ...edu, [field]: value } : edu)
    }))
  }

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  const handleCreatePreview = () => {
    if (!formData.fullName.trim()) {
      toast('Please enter your full name', 'error')
      return
    }

    const generatedText = formatResumeForExport(formData)
    setResumeText(generatedText)
    setEditableResume(generatedText)
    setCreatedFromScratch(true)
    setMode('analyze')
    setActiveTab('preview')
  }

  const formatResumeForExport = (data: typeof formData): string => {
    let text = `${data.fullName}\n`
    if (data.email) text += `${data.email}`
    if (data.phone) text += ` | ${data.phone}`
    if (data.location) text += ` | ${data.location}`
    if (data.linkedin) text += ` | ${data.linkedin}`
    text += '\n\n'

    if (data.summary) {
      text += `SUMMARY\n${data.summary}\n\n`
    }

    if (data.experience.some(e => e.title || e.company)) {
      text += 'EXPERIENCE\n'
      data.experience.forEach(exp => {
        if (exp.title || exp.company) {
          text += `${exp.title}${exp.company ? ` | ${exp.company}` : ''}${exp.location ? ` | ${exp.location}` : ''}\n`
          if (exp.startDate || exp.endDate) {
            text += `${exp.startDate} - ${exp.endDate || 'Present'}\n`
          }
          exp.bullets.filter(b => b.trim()).forEach(bullet => {
            text += `• ${bullet}\n`
          })
          text += '\n'
        }
      })
    }

    if (data.education.some(e => e.school || e.degree)) {
      text += 'EDUCATION\n'
      data.education.forEach(edu => {
        if (edu.school || edu.degree) {
          text += `${edu.degree}${edu.school ? ` | ${edu.school}` : ''}${edu.graduationDate ? ` | ${edu.graduationDate}` : ''}\n`
          if (edu.gpa) text += `GPA: ${edu.gpa}\n`
          text += '\n'
        }
      })
    }

    const skills = data.skills.filter(s => s.trim())
    if (skills.length > 0) {
      text += `SKILLS\n${skills.join(', ')}\n\n`
    }

    if (data.projects.some(p => p.name || p.description)) {
      text += 'PROJECTS\n'
      data.projects.forEach(proj => {
        if (proj.name || proj.description) {
          text += `${proj.name}\n`
          if (proj.description) text += `${proj.description}\n`
          const techs = proj.technologies.filter(t => t.trim())
          if (techs.length > 0) text += `Technologies: ${techs.join(', ')}\n`
          text += '\n'
        }
      })
    }

    return text
  }

  const switchToAnalyze = () => {
    setMode('analyze')
    clearFile()
  }

  const switchToCreate = () => {
    setMode('create')
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      summary: '',
      experience: [{ title: '', company: '', location: '', startDate: '', endDate: '', bullets: [''] }],
      education: [{ school: '', degree: '', graduationDate: '', gpa: '' }],
      skills: [''],
      projects: [{ name: '', description: '', technologies: [''] }],
    })
  }

  // Stepper state
  const stepperSteps = [
    { id: 'upload' as const, label: 'Upload', shortLabel: 'Upload', done: !!resumeText },
    { id: 'analysis' as const, label: 'Analyze', shortLabel: 'Analyze', done: !!analysis },
    { id: 'rewrite' as const, label: 'AI Rewrite', shortLabel: 'Rewrite', done: !!rewrite },
    { id: 'preview' as const, label: 'Edit & Export', shortLabel: 'Export', done: false },
  ]

  return (
    <div className="min-h-screen">
      {/* Compact Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          {currentAnalysisId && isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRenameAnalysis(); if (e.key === 'Escape') setIsEditingTitle(false) }}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="Enter title..."
                autoFocus
              />
              <button onClick={handleRenameAnalysis} disabled={savingTitle} className="text-sm font-medium text-primary-600 hover:text-primary-800">
                {savingTitle ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => { setIsEditingTitle(false); setEditedTitle(analysisTitle) }} className="text-sm text-slate-400 hover:text-slate-600">
                Cancel
              </button>
            </div>
          ) : (
            <h1 className="text-xl font-bold text-slate-900 truncate">
              {currentAnalysisId ? (analysisTitle || 'Resume Analysis') : mode === 'create' ? 'Create Resume' : 'ResumeLab'}
              {currentAnalysisId && (
                <button
                  onClick={() => { setEditedTitle(analysisTitle); setIsEditingTitle(true) }}
                  className="ml-2 text-slate-400 hover:text-slate-600 align-middle"
                  title="Rename"
                >
                  <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {createdFromScratch && activeTab === 'preview' && (
            <button
              onClick={() => { setMode('create'); setCreatedFromScratch(false); setActiveTab('upload') }}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Form
            </button>
          )}
          {mode === 'analyze' && !createdFromScratch && (analysis || activeTab !== 'upload') && (
            <button onClick={clearFile} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New
            </button>
          )}
          {mode === 'analyze' && activeTab === 'upload' && !analysis && (
            <button onClick={switchToCreate} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Create from Scratch
            </button>
          )}
          {mode === 'create' && (
            <button onClick={switchToAnalyze} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Analyze Existing
            </button>
          )}
          {analysisScore && (
            <div className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700">
              Score: {analysisScore}/100
            </div>
          )}
          <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
            {userCredits} credits
          </div>
        </div>
      </div>

      {/* Progress Stepper - only in analyze mode */}
      {mode === 'analyze' && (
        <div className="mb-6">
          <div className="flex items-center overflow-x-auto scrollbar-none -mx-1 px-1">
            {stepperSteps.map((step, i) => {
              const isActive = activeTab === step.id
              const isClickable = step.id === 'upload' || (step.id === 'analysis' && !!analysis) || (step.id === 'rewrite' && !!analysis) || (step.id === 'preview' && !!analysis)

              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none min-w-0">
                  <button
                    onClick={() => isClickable && setActiveTab(step.id)}
                    disabled={!isClickable}
                    className={`flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-black text-white shadow-sm'
                        : step.done
                          ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                          : isClickable
                            ? 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                    }`}
                  >
                    {step.done && !isActive ? (
                      <svg className="w-4 h-4 animate-score-count" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        isActive ? 'bg-white/20' : 'bg-slate-200/50'
                      }`}>
                        {i + 1}
                      </span>
                    )}
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="sm:hidden">{step.shortLabel || step.label}</span>
                  </button>
                  {i < stepperSteps.length - 1 && (
                    <div className={`flex-1 h-px mx-1 sm:mx-2 ${step.done ? 'bg-green-300' : 'bg-slate-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab Content - Analyze Mode */}
      {mode === 'analyze' && (
        <div>
          {/* Loading State for Past Analysis */}
          {loadingAnalysis && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <AnalysisLoadingSkeleton />
            </div>
          )}

          {/* Upload Tab */}
          {!loadingAnalysis && activeTab === 'upload' && (
            <UploadTab
              key="upload"
              resumeText={resumeText}
              setResumeText={setResumeText}
              fileName={fileName}
              setFileName={setFileName}
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              loading={loading}
              uploading={uploading}
              countdown={countdown}
              userCredits={userCredits}
              creditCost={tool.creditCost}
              fileInputRef={fileInputRef}
              onFileUpload={handleFileUpload}
              onDrop={handleDrop}
              onAnalyze={handleAnalyze}
              onClearFile={clearFile}
            />
          )}

          {/* Analysis Tab */}
          {!loadingAnalysis && activeTab === 'analysis' && (
            <AnalysisTab
              key="analysis"
              loading={loading}
              countdown={countdown}
              analysis={analysis}
              structuredAnalysis={structuredAnalysis}
              analysisScore={analysisScore}
              resumeText={resumeText}
              rewrite={rewrite}
              creditCost={tool.creditCost}
              onRequestRewrite={() => {
                setActiveTab('rewrite')
                if (!rewrite) handleRewrite()
              }}
              onFixApplied={(newText) => setResumeText(newText)}
              onSetActiveTab={setActiveTab}
              onSetEditableResume={setEditableResume}
              onHandleRewrite={handleRewrite}
            />
          )}

          {/* Rewrite Tab */}
          {!loadingAnalysis && activeTab === 'rewrite' && (
            <RewriteTab
              key="rewrite"
              rewrite={rewrite}
              rewriteLoading={rewriteLoading}
              analysis={analysis}
              hasExported={hasExported}
              copied={copied}
              creditCost={tool.creditCost}
              onHandleRewrite={handleRewrite}
              onCopyToClipboard={copyToClipboard}
              onSetActiveTab={setActiveTab}
            />
          )}

          {/* Preview & Export Tab */}
          {!loadingAnalysis && activeTab === 'preview' && (
            <PreviewTab
              key="preview"
              rewrite={rewrite}
              resumeText={resumeText}
              editableResume={editableResume}
              setEditableResume={setEditableResume}
              pdfPreviewUrl={pdfPreviewUrl}
              previewLoading={previewLoading}
              exportLoading={exportLoading}
              saving={saving}
              saveSuccess={saveSuccess}
              currentAnalysisId={currentAnalysisId}
              analysisScore={analysisScore}
              improvedScore={improvedScore}
              scoringRewrite={scoringRewrite}
              structuredAnalysis={structuredAnalysis}
              hasExported={hasExported}
              onHandleExport={handleExport}
              onHandleSave={handleSave}
              onHandleRewrite={handleRewrite}
              onGeneratePreview={generatePreview}
              onSetActiveTab={setActiveTab}
            />
          )}
        </div>
      )}

      {/* Create Mode */}
      {mode === 'create' && (
        <CreateTab
          formData={formData}
          creatingPdf={creatingPdf}
          userCredits={userCredits}
          onUpdateFormField={updateFormField}
          onAddExperience={addExperience}
          onUpdateExperience={updateExperience}
          onRemoveExperience={removeExperience}
          onAddEducation={addEducation}
          onUpdateEducation={updateEducation}
          onRemoveEducation={removeEducation}
          onCreateResume={handleCreatePreview}
        />
      )}
    </div>
  )
}
