'use client'

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getTool } from '@/types'
import { CanvasResumePreview } from '@/components/tools/resumelab/canvas-resume-preview'
import InteractiveAnalysis from '@/components/tools/resumelab/interactive-analysis'

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
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
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

  // UI state
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [userCredits, setUserCredits] = useState(0)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')

  // Copy protection state
  const [hasExported, setHasExported] = useState(false)

  // Mode state - analyze existing or create from scratch
  const [mode, setMode] = useState<'analyze' | 'create'>('analyze')

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
      setError(null)

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

        // Check if user has previously exported this analysis
        try {
          const exportsRes = await fetch('/api/tools/export-resume')
          const exportsData = await exportsRes.json()
          if (exportsData.exports?.some((exp: { id: string }) => exp.id)) {
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
    // Clear URL params
    router.push('/resumelab')
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

  const generatePreview = async (text: string) => {
    if (!text) return

    setPreviewLoading(true)
    try {
      const response = await fetch('/api/tools/export-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: text,
          templateId: 'classic-professional',
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
    // Cancel any in-flight scoring request
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

  // Initialize editableResume from rewrite and auto-generate preview + score
  useEffect(() => {
    if (rewrite) {
      setEditableResume(rewrite)
      generatePreview(rewrite)
      scoreResume(rewrite)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewrite])

  // Debounce preview + re-score when user edits the resume
  useEffect(() => {
    if (!editableResume || editableResume === rewrite) return
    const timer = setTimeout(() => {
      generatePreview(editableResume)
      scoreResume(editableResume)
    }, 2500)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editableResume])

  const handleExport = async () => {
    if (!editableResume) return

    setError(null)
    setExportLoading(true)

    try {
      const response = await fetch('/api/tools/export-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: editableResume,
          templateId: 'classic-professional',
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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export resume')
    } finally {
      setExportLoading(false)
    }
  }

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

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

      // Show success feedback
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

  // Helper to get word-level diff highlights
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

  const handleCreateResume = async () => {
    if (!formData.fullName.trim()) {
      setError('Please enter your full name')
      return
    }

    setError(null)
    setCreatingPdf(true)

    try {
      // Format the resume data as text for the export API
      const resumeText = formatResumeForExport(formData)

      const response = await fetch('/api/tools/export-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          templateId: 'classic-professional',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create resume')
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
        a.download = `${formData.fullName.replace(/\s+/g, '_')}_Resume.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        if (data.remainingCredits !== undefined) {
          setUserCredits(data.remainingCredits)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create resume')
    } finally {
      setCreatingPdf(false)
    }
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
    { id: 'upload' as const, label: 'Upload', done: !!resumeText },
    { id: 'analysis' as const, label: 'Analyze', done: !!analysis },
    { id: 'rewrite' as const, label: 'Rewrite', done: !!rewrite },
    { id: 'preview' as const, label: 'Export', done: false },
  ]

  return (
    <div className="min-h-screen">
      {/* Compact Header Bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3 min-w-0">
          {currentAnalysisId && isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRenameAnalysis(); if (e.key === 'Escape') setIsEditingTitle(false) }}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                placeholder="Enter title..."
                autoFocus
              />
              <button onClick={handleRenameAnalysis} disabled={savingTitle} className="text-sm font-medium text-teal-600 hover:text-teal-800">
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
        <div className="flex items-center gap-2 flex-shrink-0">
          {mode === 'analyze' && (analysis || activeTab !== 'upload') && (
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
            <div className="rounded-lg bg-teal-50 border border-teal-100 px-3 py-1.5 text-sm font-semibold text-teal-700">
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
          <div className="flex items-center">
            {stepperSteps.map((step, i) => {
              const isActive = activeTab === step.id
              const isClickable = step.id === 'upload' || (step.id === 'analysis' && analysis) || (step.id === 'rewrite' && analysis) || (step.id === 'preview' && rewrite)

              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                  <button
                    onClick={() => isClickable && setActiveTab(step.id)}
                    disabled={!isClickable}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-500/25'
                        : step.done
                          ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                          : isClickable
                            ? 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                    }`}
                  >
                    {step.done && !isActive ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        isActive ? 'bg-white/20' : 'bg-slate-200/50'
                      }`}>
                        {i + 1}
                      </span>
                    )}
                    {step.label}
                  </button>
                  {i < stepperSteps.length - 1 && (
                    <div className={`flex-1 h-px mx-2 ${step.done ? 'bg-green-300' : 'bg-slate-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Tab Content - Analyze Mode */}
      {mode === 'analyze' && (
        <div>
          {/* Loading State for Past Analysis */}
          {loadingAnalysis && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
            <p className="mt-6 text-slate-600">Loading analysis...</p>
          </div>
        )}

        {/* Upload Tab */}
        {!loadingAnalysis && activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Main upload area */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Upload Your Resume</h2>
              <p className="text-sm text-slate-500 mb-6">Drop a PDF or paste your resume text to get started</p>

              {fileName ? (
                <div className="rounded-xl border-2 border-green-200 bg-green-50 p-5 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-green-100 p-2.5">
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{fileName}</p>
                        <p className="text-xs text-slate-500">
                          {resumeText.length > 0 ? `${resumeText.split(' ').length} words extracted` : 'Processing...'}
                        </p>
                      </div>
                    </div>
                    <button onClick={clearFile} className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="relative rounded-xl border-2 border-dashed border-slate-200 p-8 text-center transition-all hover:border-teal-400 hover:bg-teal-50/30 mb-6 group"
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
                    <div className="flex flex-col items-center py-4">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
                      <p className="mt-3 text-sm text-slate-600">Processing file...</p>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                        <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="mt-3 text-sm font-medium text-slate-700">
                        Drop your resume here or <span className="text-teal-600">browse</span>
                      </p>
                      <p className="mt-1 text-xs text-slate-400">PDF or TXT, max 5MB</p>
                    </>
                  )}
                </div>
              )}

              {/* Or paste text */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-400 uppercase tracking-wider">or paste text</span>
                </div>
              </div>

              <textarea
                value={resumeText}
                onChange={(e) => { setResumeText(e.target.value); setFileName(null) }}
                placeholder="Paste your resume text here..."
                className="w-full rounded-xl border border-slate-200 p-4 text-sm transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 min-h-[180px] resize-y"
                disabled={loading || uploading}
              />
            </div>

            {/* Sidebar: Job description + analyze */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Target Job Description</h3>
                <p className="text-xs text-slate-400 mb-3">Optional — get keyword-matched analysis</p>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 min-h-[140px] resize-y"
                  disabled={loading}
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading || uploading || !resumeText.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-teal-500/30 transition-all hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  `Analyze Resume (${tool.creditCost} credits)`
                )}
              </button>

              {/* Quick tips */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">Tips for best results</h4>
                <ul className="space-y-1.5 text-xs text-amber-700">
                  <li className="flex items-start gap-1.5">
                    <span className="mt-0.5">•</span>
                    <span>Upload a PDF for best formatting preservation</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mt-0.5">•</span>
                    <span>Add a job description for keyword-specific scoring</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mt-0.5">•</span>
                    <span>Each analysis costs {tool.creditCost} credits — you have {userCredits}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {!loadingAnalysis && activeTab === 'analysis' && (
          <div>
            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
                <p className="mt-6 text-slate-600">Analyzing your resume...</p>
                <p className="mt-2 text-sm text-slate-400">Our AI is reading every line like a recruiter would</p>
              </div>
            ) : analysis && structuredAnalysis ? (
              <InteractiveAnalysis
                structuredAnalysis={structuredAnalysis}
                resumeText={resumeText}
                onRequestRewrite={() => {
                  setActiveTab('rewrite')
                  if (!rewrite) handleRewrite()
                }}
                onFixApplied={(newText) => setResumeText(newText)}
              />
            ) : analysis ? (
              /* Fallback for non-structured analysis (old format) */
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-3xl mx-auto">
                {analysisScore && (
                  <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-teal-600">Resume Score</p>
                        <p className="text-4xl font-bold text-slate-900">{analysisScore}/100</p>
                      </div>
                      <button
                        onClick={() => { setActiveTab('rewrite'); if (!rewrite) handleRewrite() }}
                        className="text-teal-600 font-medium hover:underline"
                      >
                        Get AI Rewrite
                      </button>
                    </div>
                  </div>
                )}
                <div className="prose prose-slate max-w-none">
                  <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                    {analysis.replace(/```json[\s\S]*?```/g, '').trim()}
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="flex-1 rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Back to Upload
                  </button>
                  <button
                    onClick={() => { setActiveTab('rewrite'); if (!rewrite) handleRewrite() }}
                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl"
                  >
                    Get AI Rewrite ({tool.creditCost} credits)
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20 text-center">
                <div className="rounded-full bg-slate-100 p-5">
                  <svg className="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="mt-5 text-base font-medium text-slate-700">No analysis yet</p>
                <p className="mt-1 text-sm text-slate-500">Upload your resume first to get detailed feedback</p>
                <button onClick={() => setActiveTab('upload')} className="mt-5 text-sm text-teal-600 font-medium hover:underline">
                  Go to Upload
                </button>
              </div>
            )}
          </div>
        )}

        {/* Rewrite Tab */}
        {!loadingAnalysis && activeTab === 'rewrite' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
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
                  {hasExported ? (
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
                  ) : (
                    <div className="flex items-center space-x-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Export PDF to unlock copy</span>
                    </div>
                  )}
                </div>

                {/* Rewritten Resume */}
                {hasExported ? (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 max-h-[600px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
                      {rewrite}
                    </pre>
                  </div>
                ) : (
                  <CanvasResumePreview text={rewrite} />
                )}

                {/* Preview CTA */}
                <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">Ready to preview and export?</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        See the changes, choose a template, and download as PDF
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('preview')}
                      className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl"
                    >
                      Preview & Export →
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
                  Transform your resume with AI-powered optimization. We&apos;ll improve structure,
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

        {/* Preview & Export Tab */}
        {!loadingAnalysis && activeTab === 'preview' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
            {rewrite ? (
              <div className="max-w-6xl mx-auto">
                {/* Header with action buttons */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Edit & Export</h2>
                    <p className="text-sm text-slate-500 mt-1">Edit your resume text, then export as PDF</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSave}
                      disabled={!currentAnalysisId || saving}
                      className={`flex items-center space-x-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                        saveSuccess
                          ? 'border-green-300 bg-green-50 text-green-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {saving ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Saving...</span>
                        </>
                      ) : saveSuccess ? (
                        <>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Saved!</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                          <span>Save</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleExport}
                      disabled={!editableResume || exportLoading}
                      className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      {exportLoading ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Exporting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Export PDF</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Live Score Card */}
                {(analysisScore || improvedScore || scoringRewrite) && (
                  <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-6">
                      {/* Animated Score Circle */}
                      <div className="flex-shrink-0 relative">
                        {(() => {
                          const currentScore = improvedScore?.score ?? analysisScore ?? 0
                          const radius = 44
                          const circumference = 2 * Math.PI * radius
                          const progress = (currentScore / 100) * circumference
                          const scoreColor = currentScore >= 75 ? '#16a34a' : currentScore >= 55 ? '#d97706' : '#ef4444'
                          const bgColor = currentScore >= 75 ? '#dcfce7' : currentScore >= 55 ? '#fef3c7' : '#fee2e2'
                          return (
                            <div className="relative w-28 h-28">
                              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r={radius} fill="none" stroke={bgColor} strokeWidth="8" />
                                <circle
                                  cx="50" cy="50" r={radius}
                                  fill="none"
                                  stroke={scoreColor}
                                  strokeWidth="8"
                                  strokeLinecap="round"
                                  strokeDasharray={circumference}
                                  strokeDashoffset={circumference - progress}
                                  style={{ transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease' }}
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                {scoringRewrite ? (
                                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
                                ) : (
                                  <>
                                    <span className="text-2xl font-bold" style={{ color: scoreColor, transition: 'color 0.5s ease' }}>
                                      {currentScore}
                                    </span>
                                    <span className="text-[10px] text-slate-400 -mt-0.5">/100</span>
                                  </>
                                )}
                              </div>
                            </div>
                          )
                        })()}
                      </div>

                      {/* Score Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          {analysisScore && improvedScore && (
                            <>
                              <span className="text-sm text-slate-500">
                                <span className="line-through">{analysisScore}</span>
                              </span>
                              <svg className="h-4 w-4 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                              <span className={`text-sm font-semibold ${improvedScore.score >= 75 ? 'text-green-600' : 'text-amber-600'}`}>
                                {improvedScore.score}
                              </span>
                              {improvedScore.score > analysisScore && (
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                  +{improvedScore.score - analysisScore}
                                </span>
                              )}
                            </>
                          )}
                          {scoringRewrite && (
                            <span className="text-xs text-slate-400 animate-pulse">Rescoring...</span>
                          )}
                        </div>

                        {/* Breakdown Bars */}
                        {improvedScore?.scoreBreakdown && (
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                            {Object.entries(improvedScore.scoreBreakdown).map(([key, val]) => {
                              const barColor = val.score >= 75 ? 'bg-green-500' : val.score >= 55 ? 'bg-amber-500' : 'bg-red-500'
                              return (
                                <div key={key} className="flex items-center gap-2">
                                  <span className="text-xs text-slate-500 w-14 flex-shrink-0 capitalize">{key === 'ats' ? 'ATS' : key}</span>
                                  <div className="flex-1 h-1.5 rounded-full bg-slate-100">
                                    <div
                                      className={`h-full rounded-full ${barColor}`}
                                      style={{ width: `${val.score}%`, transition: 'width 1s ease-in-out' }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium text-slate-700 w-6 text-right">{val.score}</span>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {/* Top Improvements */}
                        {improvedScore?.topImprovements && improvedScore.topImprovements.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {improvedScore.topImprovements.map((imp, i) => (
                              <span key={i} className="inline-flex items-center rounded-full bg-teal-50 border border-teal-100 px-2.5 py-0.5 text-[11px] text-teal-700">
                                <svg className="h-2.5 w-2.5 mr-1 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {imp}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Editable Resume + PDF Preview side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Editable textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-slate-900 flex items-center">
                        <svg className="h-4 w-4 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Your Resume
                      </h3>
                      {editableResume !== rewrite && (
                        <button
                          onClick={() => { setEditableResume(rewrite || ''); generatePreview(rewrite || '') }}
                          className="text-xs text-slate-500 hover:text-slate-700 underline"
                        >
                          Reset to AI version
                        </button>
                      )}
                    </div>
                    <textarea
                      value={editableResume}
                      onChange={(e) => setEditableResume(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-4 text-sm font-mono leading-relaxed text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
                      style={{ minHeight: '600px' }}
                      placeholder="Your resume text will appear here..."
                    />
                    <p className="text-xs text-slate-400 mt-2">
                      Edit freely — the preview updates automatically after you stop typing
                    </p>
                  </div>

                  {/* PDF Preview */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-slate-900 flex items-center">
                        <svg className="h-4 w-4 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        PDF Preview
                      </h3>
                      <button
                        onClick={() => generatePreview(editableResume)}
                        disabled={previewLoading || !editableResume}
                        className="flex items-center space-x-1 text-xs text-teal-600 hover:text-teal-700 disabled:opacity-50"
                      >
                        <svg className={`h-3.5 w-3.5 ${previewLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Refresh</span>
                      </button>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-100 min-h-[600px] flex items-center justify-center">
                      {previewLoading ? (
                        <div className="flex flex-col items-center">
                          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
                          <p className="mt-4 text-slate-600">Generating preview...</p>
                        </div>
                      ) : pdfPreviewUrl ? (
                        <iframe
                          src={pdfPreviewUrl}
                          className="w-full h-[600px] rounded-xl"
                          title="Resume Preview"
                        />
                      ) : (
                        <div className="text-center text-slate-500">
                          <svg className="mx-auto h-16 w-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="mt-4">Preview loading...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="rounded-full bg-slate-100 p-6 w-fit mx-auto">
                  <svg className="h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2 className="mt-6 text-xl font-bold text-slate-900">Preview & Export</h2>
                <p className="mt-3 text-slate-600">
                  Get your AI-rewritten resume first to preview and export.
                </p>
                <button
                  onClick={() => setActiveTab('rewrite')}
                  className="mt-6 text-teal-600 font-medium hover:underline"
                >
                  ← Go to Rewrite
                </button>
              </div>
            )}
          </div>
        )}
        </div>
      )}

      {/* Create Mode */}
      {mode === 'create' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Section */}
              <div className="lg:col-span-2 space-y-8">
                {/* Personal Info */}
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={formData.fullName}
                      onChange={(e) => updateFormField('fullName', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => updateFormField('email', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={(e) => updateFormField('phone', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                    <input
                      type="text"
                      placeholder="Location (City, State)"
                      value={formData.location}
                      onChange={(e) => updateFormField('location', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                    <input
                      type="url"
                      placeholder="LinkedIn URL"
                      value={formData.linkedin}
                      onChange={(e) => updateFormField('linkedin', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 md:col-span-2"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Professional Summary</h2>
                  <textarea
                    placeholder="Brief professional summary..."
                    value={formData.summary}
                    onChange={(e) => updateFormField('summary', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 min-h-[100px] resize-y"
                  />
                </div>

                {/* Experience */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">Experience</h2>
                    <button
                      onClick={addExperience}
                      className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                    >
                      + Add Experience
                    </button>
                  </div>
                  {formData.experience.map((exp, index) => (
                    <div key={index} className="mb-6 p-4 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-slate-500">Position {index + 1}</span>
                        {formData.experience.length > 1 && (
                          <button
                            onClick={() => removeExperience(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Job Title"
                          value={exp.title}
                          onChange={(e) => updateExperience(index, 'title', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-teal-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Company"
                          value={exp.company}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-teal-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Location"
                          value={exp.location}
                          onChange={(e) => updateExperience(index, 'location', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-teal-500 focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Start Date"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-teal-500 focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="End Date"
                            value={exp.endDate}
                            onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-teal-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="text-sm text-slate-500 mb-2 block">Key achievements (one per line)</label>
                        <textarea
                          placeholder="• Led team of 5 engineers...&#10;• Increased revenue by 20%..."
                          value={exp.bullets.join('\n')}
                          onChange={(e) => updateExperience(index, 'bullets', e.target.value.split('\n'))}
                          className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-teal-500 focus:outline-none min-h-[80px] resize-y"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Education */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">Education</h2>
                    <button
                      onClick={addEducation}
                      className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                    >
                      + Add Education
                    </button>
                  </div>
                  {formData.education.map((edu, index) => (
                    <div key={index} className="mb-4 p-4 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-slate-500">Education {index + 1}</span>
                        {formData.education.length > 1 && (
                          <button
                            onClick={() => removeEducation(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="School/University"
                          value={edu.school}
                          onChange={(e) => updateEducation(index, 'school', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-teal-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Degree"
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-teal-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Graduation Date"
                          value={edu.graduationDate}
                          onChange={(e) => updateEducation(index, 'graduationDate', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-teal-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="GPA (optional)"
                          value={edu.gpa}
                          onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Skills</h2>
                  <textarea
                    placeholder="JavaScript, React, Node.js, Python, SQL..."
                    value={formData.skills.join(', ')}
                    onChange={(e) => updateFormField('skills', e.target.value.split(',').map(s => s.trim()))}
                    className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 min-h-[60px] resize-y"
                  />
                  <p className="text-xs text-slate-400 mt-1">Separate skills with commas</p>
                </div>
              </div>

              {/* Export Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Export</h2>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-6">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                        <svg className="h-5 w-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">Classic Professional</p>
                        <p className="text-xs text-slate-500">Clean, ATS-friendly format</p>
                      </div>
                    </div>
                  </div>

                  {/* Create Button */}
                  <button
                    onClick={handleCreateResume}
                    disabled={creatingPdf || !formData.fullName.trim()}
                    className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-teal-500/30 transition-all hover:shadow-xl hover:shadow-teal-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingPdf ? (
                      <span className="flex items-center justify-center space-x-2">
                        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Creating...</span>
                      </span>
                    ) : (
                      `Create & Download PDF`
                    )}
                  </button>
                  <p className="text-center text-sm text-slate-500 mt-2">
                    1 credit
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
