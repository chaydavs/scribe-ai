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

      // Redirect to Stripe Checkout
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600">Manage your account and credits</p>
      </div>

      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Account Info */}
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Account</h2>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Email:</span> {profile?.email}
          </p>
          {profile?.full_name && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Name:</span> {profile.full_name}
            </p>
          )}
        </div>
      </div>

      {/* Credits */}
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Credits</h2>
        <div className="mb-6">
          <p className="text-3xl font-bold text-primary-600">{profile?.credits || 0}</p>
          <p className="text-sm text-gray-500">Available credits</p>
        </div>

        <h3 className="mb-4 text-sm font-medium text-gray-700">Purchase Credits</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {creditPacks.map((pack) => (
            <div
              key={pack.id}
              className={`relative rounded-lg border-2 p-4 ${
                pack.popular
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-3 py-0.5 text-xs font-medium text-white">
                  Popular
                </span>
              )}
              <h4 className="text-lg font-semibold text-gray-900">{pack.name}</h4>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatCurrency(pack.price)}
              </p>
              <p className="mt-1 text-sm text-gray-600">{pack.credits} credits</p>
              <p className="mt-2 text-xs text-gray-500">{pack.description}</p>
              <button
                onClick={() => handlePurchase(pack)}
                disabled={purchasing !== null}
                className={`mt-4 w-full ${pack.popular ? 'btn-primary' : 'btn-secondary'}`}
              >
                {purchasing === pack.id ? 'Processing...' : 'Buy Now'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Credit Costs */}
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Credit Costs</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tool
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Credits per Use
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">ResumeRadar</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">5</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">ColdCraft</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">3</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">FeedbackLoop</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">4</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">DataBrief</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">5</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">GrantGPT</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">6</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">LinkedIn Writer</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">2</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">SEO Outliner</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">4</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">Product Descriptions</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">2</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">Subject Line Tester</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">1</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">Meeting Notes</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">3</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">Notion Templates</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">6</td>
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  )
}
