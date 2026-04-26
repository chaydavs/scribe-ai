'use client'

import React from 'react'
import { AnalysisLoadingSkeleton } from '@/components/ui/skeleton'

interface UploadTabProps {
  resumeText: string
  setResumeText: (text: string) => void
  fileName: string | null
  setFileName: (name: string | null) => void
  jobDescription: string
  setJobDescription: (text: string) => void
  loading: boolean
  uploading: boolean
  countdown: number
  userCredits: number
  creditCost: number
  fileInputRef: React.RefObject<HTMLInputElement>
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDrop: (e: React.DragEvent) => void
  onAnalyze: () => void
  onClearFile: () => void
}

export function UploadTab({
  resumeText,
  setResumeText,
  fileName,
  setFileName,
  jobDescription,
  setJobDescription,
  loading,
  uploading,
  countdown,
  userCredits,
  creditCost,
  fileInputRef,
  onFileUpload,
  onDrop,
  onAnalyze,
  onClearFile,
}: UploadTabProps) {
  return (
    <div className="animate-tab-enter grid grid-cols-1 lg:grid-cols-5 gap-6">
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
              <button onClick={onClearFile} className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="relative rounded-xl border-2 border-dashed border-slate-200 p-8 text-center transition-all hover:border-primary-400 hover:bg-primary-50/30 mb-6 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={onFileUpload}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={uploading}
            />
            {uploading ? (
              <div className="flex flex-col items-center py-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
                <p className="mt-3 text-sm text-slate-600">Processing file...</p>
              </div>
            ) : (
              <>
                <div className="mx-auto w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <svg className="h-6 w-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="mt-3 text-sm font-medium text-slate-700">
                  Drop your resume here or <span className="text-primary-600">browse</span>
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
          className="w-full rounded-xl border border-slate-200 p-4 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 min-h-[180px] resize-y"
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
            className="w-full rounded-lg border border-slate-200 p-3 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 min-h-[140px] resize-y"
            disabled={loading}
          />
        </div>

        <button
          onClick={onAnalyze}
          disabled={loading || uploading || !resumeText.trim()}
          className="w-full rounded-xl bg-black px-6 py-4 text-base font-semibold text-white shadow-none transition-all hover:shadow-sm hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? (
            <span className="flex flex-col items-center gap-1">
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...{countdown > 0 ? ` ~${countdown}s` : ''}
              </span>
              <div className="w-full h-1 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white/60"
                  style={{
                    width: `${((30 - countdown) / 30) * 100}%`,
                    transition: 'width 1s linear',
                  }}
                />
              </div>
            </span>
          ) : (
            `Analyze Resume (${creditCost} credits)`
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
              <span>Each analysis costs {creditCost} credits — you have {userCredits}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
