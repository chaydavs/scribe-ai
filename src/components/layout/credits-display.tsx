'use client'

import Link from 'next/link'
import { useCredits } from '@/hooks/use-credits'

export function CreditsDisplay() {
  const { credits, loading } = useCredits()

  if (loading) {
    return (
      <div className="flex items-center rounded-lg bg-primary-50 px-3 py-1.5">
        <div className="h-4 w-16 animate-pulse rounded bg-primary-200" />
      </div>
    )
  }

  return (
    <Link
      href="/settings"
      className="flex items-center rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100"
    >
      <span className="mr-1">Credits:</span>
      <span className="font-bold">{credits}</span>
    </Link>
  )
}
