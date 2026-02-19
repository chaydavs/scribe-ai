'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { creditPacks, type CreditPack } from '@/lib/stripe/credits'
import { formatCurrency } from '@/lib/utils'

function SettingsContent() {
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<{ credits: number; email: string; full_name: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [claimingFree, setClaimingFree] = useState(false)
  const [hasClaimedFree, setHasClaimedFree] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')

    if (success) {
      setMessage({ type: 'success', text: 'Credits purchased successfully!' })
    } else if (canceled) {
      setMessage({ type: 'error', text: 'Purchase was canceled.' })
    }

    fetchProfile()
    checkFreeCreditsClaimed()
  }, [searchParams])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('credits, email, full_name')
        .eq('id', user.id)
        .single()
      setProfile(data)
    }
    setLoading(false)
  }

  const checkFreeCreditsClaimed = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('credit_transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('description', 'Welcome bonus - 10 free credits')
        .single()
      setHasClaimedFree(!!data)
    }
  }

  const handleClaimFreeCredits = async () => {
    setClaimingFree(true)
    setMessage(null)

    try {
      const response = await fetch('/api/credits/claim-free', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim free credits')
      }

      setMessage({ type: 'success', text: 'You claimed 10 free credits!' })
      setHasClaimedFree(true)
      fetchProfile()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to claim free credits',
      })
    } finally {
      setClaimingFree(false)
    }
  }

  const handlePurchase = async (pack: CreditPack) => {
    setPurchasing(pack.id)
    setMessage(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packId: pack.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      window.location.href = data.url
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to start checkout',
      })
      setPurchasing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  const showFreeCreditsOffer = !hasClaimedFree && (profile?.credits || 0) === 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-slate-600">Manage your account and credits</p>
      </div>

      {message && (
        <div
          className={`rounded-xl p-4 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-100 text-green-700'
              : 'bg-red-50 border border-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Free Credits Offer */}
      {showFreeCreditsOffer && (
        <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <h2 className="text-xl font-bold">Welcome Gift</h2>
              </div>
              <p className="text-indigo-100">
                Claim your 10 free credits to try all our AI tools. No credit card required.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-indigo-100">
                <li>• 2 resume analyses</li>
                <li>• 3 cold emails</li>
                <li>• 5 LinkedIn posts</li>
              </ul>
            </div>
            <button
              onClick={handleClaimFreeCredits}
              disabled={claimingFree}
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-lg transition-all hover:bg-indigo-50 disabled:opacity-50"
            >
              {claimingFree ? (
                <span className="flex items-center space-x-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Claiming...</span>
                </span>
              ) : (
                'Claim 10 Free Credits'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Account Info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Account</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-sm font-medium text-white">
              {(profile?.full_name || profile?.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-slate-900">{profile?.full_name || 'User'}</p>
              <p className="text-sm text-slate-500">{profile?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Credits */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Credits</h2>
        <div className="mb-6 flex items-center space-x-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <span className="text-2xl font-bold text-white">{profile?.credits || 0}</span>
          </div>
          <div>
            <p className="text-sm text-slate-500">Available credits</p>
            {hasClaimedFree && (
              <p className="text-xs text-green-600">Welcome bonus claimed</p>
            )}
          </div>
        </div>

        <h3 className="mb-4 text-sm font-medium text-slate-700">Purchase More Credits</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {creditPacks.map((pack) => (
            <div
              key={pack.id}
              className={`relative rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                pack.popular
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-0.5 text-xs font-medium text-white">
                  Best Value
                </span>
              )}
              <h4 className="text-lg font-semibold text-slate-900">{pack.name}</h4>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {formatCurrency(pack.price)}
              </p>
              <p className="mt-1 text-sm text-slate-600">{pack.credits} credits</p>
              <p className="mt-2 text-xs text-slate-500">{pack.description}</p>
              <button
                onClick={() => handlePurchase(pack)}
                disabled={purchasing !== null}
                className={`mt-4 w-full rounded-lg py-2 text-sm font-medium transition-all ${
                  pack.popular
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                } disabled:opacity-50`}
              >
                {purchasing === pack.id ? 'Processing...' : 'Buy Now'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Credit Costs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Credit Costs</h2>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Tool
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                  Credits
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">Resume Analysis</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-indigo-600">5 credits</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  )
}
