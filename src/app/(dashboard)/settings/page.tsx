'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { creditPacks, type CreditPack } from '@/lib/stripe/credits'
import { formatCurrency } from '@/lib/utils'

type MessageType = { type: 'success' | 'error'; text: string } | null

function SettingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [profile, setProfile] = useState<{ credits: number; email: string; full_name: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [claimingFree, setClaimingFree] = useState(false)
  const [hasClaimedFree, setHasClaimedFree] = useState(false)
  const [message, setMessage] = useState<MessageType>(null)

  // Edit states
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [savingName, setSavingName] = useState(false)

  const [editingEmail, setEditingEmail] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)

  const [changingPassword, setChangingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

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
      if (data?.full_name) setNewName(data.full_name)
      if (data?.email) setNewEmail(data.email)
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
      const response = await fetch('/api/credits/claim-free', { method: 'POST' })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to claim free credits')

      setMessage({ type: 'success', text: 'You claimed 10 free credits!' })
      setHasClaimedFree(true)
      fetchProfile()
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to claim free credits' })
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId: pack.id }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create checkout session')
      window.location.href = data.url
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to start checkout' })
      setPurchasing(null)
    }
  }

  const handleSaveName = async () => {
    if (!newName.trim()) {
      setMessage({ type: 'error', text: 'Name cannot be empty' })
      return
    }

    setSavingName(true)
    setMessage(null)

    try {
      const response = await fetch('/api/account/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: newName.trim() }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to update name')

      setProfile(prev => prev ? { ...prev, full_name: data.full_name } : null)
      setEditingName(false)
      setMessage({ type: 'success', text: 'Name updated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update name' })
    } finally {
      setSavingName(false)
    }
  }

  const handleSaveEmail = async () => {
    if (!newEmail.trim()) {
      setMessage({ type: 'error', text: 'Email cannot be empty' })
      return
    }

    setSavingEmail(true)
    setMessage(null)

    try {
      const response = await fetch('/api/account/update-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim() }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to update email')

      setEditingEmail(false)
      setMessage({ type: 'success', text: data.message })
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update email' })
    } finally {
      setSavingEmail(false)
    }
  }

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setSavingPassword(true)
    setMessage(null)

    try {
      const response = await fetch('/api/account/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to update password')

      setChangingPassword(false)
      setNewPassword('')
      setConfirmPassword('')
      setMessage({ type: 'success', text: 'Password updated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update password' })
    } finally {
      setSavingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      setMessage({ type: 'error', text: 'Please type "DELETE MY ACCOUNT" to confirm' })
      return
    }

    setDeleting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: deleteConfirmText }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to delete account')

      router.push('/')
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to delete account' })
      setDeleting(false)
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
        <div className={`rounded-xl p-4 ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-100 text-green-700'
            : 'bg-red-50 border border-red-100 text-red-700'
        }`}>
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
              <p className="text-indigo-100">Claim your 10 free credits to try ResumeLab.</p>
            </div>
            <button
              onClick={handleClaimFreeCredits}
              disabled={claimingFree}
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-lg transition-all hover:bg-indigo-50 disabled:opacity-50"
            >
              {claimingFree ? 'Claiming...' : 'Claim 10 Free Credits'}
            </button>
          </div>
        </div>
      )}

      {/* Personal Details */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">Personal Details</h2>

        <div className="space-y-6">
          {/* Profile Avatar & Basic Info */}
          <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-2xl font-semibold text-white">
              {(profile?.full_name || profile?.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-medium text-slate-900">{profile?.full_name || 'User'}</p>
              <p className="text-sm text-slate-500">{profile?.email}</p>
            </div>
          </div>

          {/* Name */}
          <div className="flex items-center justify-between py-4 border-b border-slate-100">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-500">Full Name</label>
              {editingName ? (
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Enter your name"
                />
              ) : (
                <p className="mt-1 text-slate-900">{profile?.full_name || 'Not set'}</p>
              )}
            </div>
            <div className="ml-4">
              {editingName ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
                  >
                    {savingName ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setNewName(profile?.full_name || '') }}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between py-4 border-b border-slate-100">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-500">Email Address</label>
              {editingEmail ? (
                <div>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="mt-1 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Enter new email"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    A verification email will be sent to both your old and new email addresses.
                  </p>
                </div>
              ) : (
                <p className="mt-1 text-slate-900">{profile?.email}</p>
              )}
            </div>
            <div className="ml-4">
              {editingEmail ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveEmail}
                    disabled={savingEmail}
                    className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
                  >
                    {savingEmail ? 'Sending...' : 'Send Verification'}
                  </button>
                  <button
                    onClick={() => { setEditingEmail(false); setNewEmail(profile?.email || '') }}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingEmail(true)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Change
                </button>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="flex items-center justify-between py-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-500">Password</label>
              {changingPassword ? (
                <div className="mt-2 space-y-3 max-w-md">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="New password (min 6 characters)"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Confirm new password"
                  />
                </div>
              ) : (
                <p className="mt-1 text-slate-900">••••••••</p>
              )}
            </div>
            <div className="ml-4">
              {changingPassword ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSavePassword}
                    disabled={savingPassword}
                    className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
                  >
                    {savingPassword ? 'Updating...' : 'Update'}
                  </button>
                  <button
                    onClick={() => { setChangingPassword(false); setNewPassword(''); setConfirmPassword('') }}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setChangingPassword(true)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Change
                </button>
              )}
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
            <p className="text-xs text-slate-400">5 credits per analysis or rewrite</p>
          </div>
        </div>

        <h3 className="mb-4 text-sm font-medium text-slate-700">Purchase More Credits</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {creditPacks.map((pack) => (
            <div
              key={pack.id}
              className={`relative rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                pack.popular ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-0.5 text-xs font-medium text-white">
                  Best Value
                </span>
              )}
              <h4 className="text-lg font-semibold text-slate-900">{pack.name}</h4>
              <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(pack.price)}</p>
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

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="mb-2 text-lg font-semibold text-red-900">Danger Zone</h2>
        <p className="mb-4 text-sm text-red-700">
          Once you delete your account, there is no going back. All your data will be permanently removed.
        </p>

        {showDeleteConfirm ? (
          <div className="space-y-4 max-w-md">
            <p className="text-sm text-red-800 font-medium">
              Type <span className="font-mono bg-red-100 px-2 py-0.5 rounded">DELETE MY ACCOUNT</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              placeholder="Type here to confirm"
            />
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText !== 'DELETE MY ACCOUNT'}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Permanently Delete Account'}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            Delete Account
          </button>
        )}
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
