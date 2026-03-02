'use client'

import { CanvasResumePreview } from '@/components/tools/resumelab/canvas-resume-preview'
import { RewriteLoadingSkeleton } from '@/components/ui/skeleton'

interface RewriteTabProps {
  rewrite: string | null
  rewriteLoading: boolean
  analysis: string | null
  hasExported: boolean
  copied: boolean
  creditCost: number
  onHandleRewrite: () => void
  onCopyToClipboard: () => void
  onSetActiveTab: (tab: 'upload' | 'analysis' | 'rewrite' | 'preview') => void
}

export function RewriteTab({
  rewrite,
  rewriteLoading,
  analysis,
  hasExported,
  copied,
  creditCost,
  onHandleRewrite,
  onCopyToClipboard,
  onSetActiveTab,
}: RewriteTabProps) {
  return (
    <div className="animate-tab-enter bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
      {rewriteLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-slate-600">Rewriting your resume...</p>
          <p className="mt-2 mb-6 text-sm text-slate-400">Creating an optimized version</p>
          <RewriteLoadingSkeleton />
        </div>
      ) : rewrite ? (
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">AI-Optimized Resume</h2>
            {hasExported ? (
              <button
                onClick={onCopyToClipboard}
                className="flex items-center space-x-2 rounded-lg bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-200"
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
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Ready to preview and export?</h3>
                <p className="text-sm text-slate-600 mt-1">
                  See the changes, choose a template, and download as PDF
                </p>
              </div>
              <button
                onClick={() => onSetActiveTab('preview')}
                className="rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl"
              >
                Preview & Export →
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="rounded-full bg-primary-100 p-6 w-fit mx-auto">
            <svg className="h-12 w-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 className="mt-6 text-xl font-bold text-slate-900">AI Resume Rewrite</h2>
          <p className="mt-3 text-slate-600 max-w-md mx-auto">
            Transform your resume with AI-powered optimization. We&apos;ll improve structure,
            strengthen bullet points, and optimize for ATS systems.
          </p>
          <button
            onClick={onHandleRewrite}
            disabled={rewriteLoading || !analysis}
            className="mt-8 rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            Rewrite My Resume ({creditCost} credits)
          </button>
        </div>
      )}
    </div>
  )
}
