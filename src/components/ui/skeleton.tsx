'use client'

import React from 'react'

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return <div className={`skeleton rounded-lg ${className}`} style={style} />
}

/** Skeleton for analysis history items in the sidebar */
export function AnalysisHistorySkeleton() {
  return (
    <div className="space-y-3 px-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg p-2">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Skeleton for the upload / initial page state */
export function UploadPageSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-8 animate-fade-in">
      <Skeleton className="mx-auto h-6 w-48" />
      <Skeleton className="mx-auto h-4 w-72" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="flex gap-3 justify-center">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>
  )
}

/** Skeleton for loading analysis results */
export function AnalysisLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Score band */}
      <div className="flex items-center gap-6 rounded-xl border border-slate-200 p-6">
        <Skeleton className="h-20 w-20 rounded-full shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-full rounded-full" />
          <div className="flex gap-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
      {/* Fix cards */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Skeleton for rewrite loading */
export function RewriteLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      <Skeleton className="h-5 w-36" />
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-3.5 w-full" style={{ width: `${85 + Math.random() * 15}%` }} />
      ))}
      <Skeleton className="mt-4 h-3.5 w-5/6" />
      {[...Array(4)].map((_, i) => (
        <Skeleton key={`b-${i}`} className="h-3.5 w-full" style={{ width: `${80 + Math.random() * 20}%` }} />
      ))}
    </div>
  )
}
