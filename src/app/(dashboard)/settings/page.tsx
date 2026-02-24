'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { creditPacks, type CreditPack } from '@/lib/paypal/credits'
import { formatCurrency } from '@/lib/utils'

type MessageType = { type: 'success' | 'error'; text: string } | null
type Tab = 'profile' | 'credits' | 'payments' | 'account'

interface CreditTransaction {
  id: string
  amount: number
  type: string
  description: string | null
  created_at: string
}

function SettingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [profile, setProfile] = useState<{ credits: number; email: string; full_name: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [claimingFree, setClaimingFree] = useState(false)
  const [hasClaimedFree, setHasClaimedFree] = useState(false)
  const [message, setMessage] = useState<MessageType>(null)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)

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

  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [pollingCredits, setPollingCredits] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    const canceled = searchParams.get('canceled')

    if (success) {
      setMessage({ type: 'success', text: 'Credits purchased successfully!' })
      setActiveTab('credits')
      // PayPal capture may still be processing — poll for updated credits
      setPollingCredits(true)
      const pollCredits = async () => {
        for (let i = 0; i < 5; i++) {
          await new Promise(r => setTimeout(r, 1500))
          await fetchProfile()
        }
        setPollingCredits(false)
        // Clean up URL params so refresh doesn't re-trigger
        router.replace('/settings', { scroll: false })
      }
      pollCredits()
    } else if (error) {
      setMessage({ type: 'error', text: `Payment issue: ${error.replace(/_/g, ' ')}` })
      setActiveTab('credits')
      router.replace('/settings', { scroll: false })
    } else if (canceled) {
      setMessage({ type: 'error', text: 'Purchase was canceled.' })
      setActiveTab('credits')
      router.replace('/settings', { scroll: false })
    }

    fetchProfile()
    checkFreeCreditsClaimed()
  }, [searchParams])

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchTransactions()
    }
  }, [activeTab])

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

  const fetchTransactions = async () => {
    setLoadingTransactions(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('credit_transactions')
        .select('id, amount, type, description, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      setTransactions(data || [])
    }
    setLoadingTransactions(false)
  }

  const checkFreeCreditsClaimed = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('credit_transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('description', 'Welcome bonus - 25 free credits')
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
      setMessage({ type: 'success', text: 'You claimed 25 free credits!' })
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
    setPurchaseError(null)
    setMessage(null)
    try {
      const response = await fetch('/api/paypal/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId: pack.id }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create checkout session')
      if (!data.url) throw new Error('No checkout URL returned')
      window.location.href = data.url
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to start checkout'
      console.error('Purchase error:', error)
      setPurchaseError(msg)
      setPurchasing(null)
    }
  }

  const handleSaveName = async () => {
    if (!newName.trim()) { setMessage({ type: 'error', text: 'Name cannot be empty' }); return }
    setSavingName(true); setMessage(null)
    try {
      const response = await fetch('/api/account/update-profile', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: newName.trim() }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to update name')
      setProfile(prev => prev ? { ...prev, full_name: data.full_name } : null)
      setEditingName(false)
      setMessage({ type: 'success', text: 'Name updated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update name' })
    } finally { setSavingName(false) }
  }

  const handleSaveEmail = async () => {
    if (!newEmail.trim()) { setMessage({ type: 'error', text: 'Email cannot be empty' }); return }
    setSavingEmail(true); setMessage(null)
    try {
      const response = await fetch('/api/account/update-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim() }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to update email')
      setEditingEmail(false)
      setMessage({ type: 'success', text: data.message })
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update email' })
    } finally { setSavingEmail(false) }
  }

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) { setMessage({ type: 'error', text: 'Passwords do not match' }); return }
    if (newPassword.length < 6) { setMessage({ type: 'error', text: 'Password must be at least 6 characters' }); return }
    setSavingPassword(true); setMessage(null)
    try {
      const response = await fetch('/api/account/update-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to update password')
      setChangingPassword(false); setNewPassword(''); setConfirmPassword('')
      setMessage({ type: 'success', text: 'Password updated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update password' })
    } finally { setSavingPassword(false) }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      setMessage({ type: 'error', text: 'Please type "DELETE MY ACCOUNT" to confirm' }); return
    }
    setDeleting(true); setMessage(null)
    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
      </div>
    )
  }

  const showFreeCreditsOffer = !hasClaimedFree && (profile?.credits || 0) === 0

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'profile', label: 'Personal Info',
      icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    },
    {
      id: 'credits', label: 'Credits',
      icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      id: 'payments', label: 'Payment History',
      icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    },
    {
      id: 'account', label: 'Account',
      icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-slate-600">Manage your account, credits, and payment history</p>
      </div>

      {/* Message */}
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
        <div className="rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <h2 className="text-xl font-bold">Welcome Gift</h2>
              </div>
              <p className="text-teal-100">Claim your 25 free credits to try every feature.</p>
            </div>
            <button
              onClick={handleClaimFreeCredits}
              disabled={claimingFree}
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-teal-600 shadow-lg transition-all hover:bg-teal-50 disabled:opacity-50"
            >
              {claimingFree ? 'Claiming...' : 'Claim 25 Free Credits'}
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-1" aria-label="Settings tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 rounded-t-lg px-4 py-3 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'border-b-2 border-teal-500 text-teal-600 bg-teal-50/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">

        {/* ── Personal Info Tab ── */}
        {activeTab === 'profile' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-6">
              {/* Avatar & Info */}
              <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-2xl font-semibold text-white">
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
                      type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                      className="mt-1 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <p className="mt-1 text-slate-900">{profile?.full_name || 'Not set'}</p>
                  )}
                </div>
                <div className="ml-4">
                  {editingName ? (
                    <div className="flex space-x-2">
                      <button onClick={handleSaveName} disabled={savingName} className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 disabled:opacity-50">
                        {savingName ? 'Saving...' : 'Save'}
                      </button>
                      <button onClick={() => { setEditingName(false); setNewName(profile?.full_name || '') }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingName(true)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Edit</button>
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
                        type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                        className="mt-1 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        placeholder="Enter new email"
                      />
                      <p className="mt-2 text-xs text-slate-500">A verification email will be sent to both your old and new email addresses.</p>
                    </div>
                  ) : (
                    <p className="mt-1 text-slate-900">{profile?.email}</p>
                  )}
                </div>
                <div className="ml-4">
                  {editingEmail ? (
                    <div className="flex space-x-2">
                      <button onClick={handleSaveEmail} disabled={savingEmail} className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 disabled:opacity-50">
                        {savingEmail ? 'Sending...' : 'Send Verification'}
                      </button>
                      <button onClick={() => { setEditingEmail(false); setNewEmail(profile?.email || '') }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingEmail(true)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Change</button>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-500">Password</label>
                  {changingPassword ? (
                    <div className="mt-2 space-y-3 max-w-md">
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        placeholder="New password (min 6 characters)" />
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        placeholder="Confirm new password" />
                    </div>
                  ) : (
                    <p className="mt-1 text-slate-900">••••••••</p>
                  )}
                </div>
                <div className="ml-4">
                  {changingPassword ? (
                    <div className="flex space-x-2">
                      <button onClick={handleSavePassword} disabled={savingPassword} className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 disabled:opacity-50">
                        {savingPassword ? 'Updating...' : 'Update'}
                      </button>
                      <button onClick={() => { setChangingPassword(false); setNewPassword(''); setConfirmPassword('') }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setChangingPassword(true)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Change</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Credits Tab ── */}
        {activeTab === 'credits' && (
          <div className="space-y-6">
            {/* Balance Card */}
            <div className="rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-200">Available Balance</p>
                  <p className="mt-1 text-4xl font-bold">
                    {pollingCredits ? (
                      <span className="inline-flex items-center gap-2">
                        {profile?.credits || 0}
                        <svg className="animate-spin h-6 w-6 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                      </span>
                    ) : (profile?.credits || 0)}
                  </p>
                  <p className="mt-1 text-sm text-teal-200">{pollingCredits ? 'Updating...' : 'credits'}</p>
                </div>
                <div className="text-right text-sm text-teal-200 space-y-1">
                  <p>5 credits per analysis</p>
                  <p>5 credits per rewrite</p>
                  <p>10-20 credits per export</p>
                </div>
              </div>
            </div>

            {/* Credit Packs */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Purchase More Credits</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {creditPacks.map((pack) => (
                  <div
                    key={pack.id}
                    className={`relative rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                      pack.popular ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {pack.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-500 px-3 py-0.5 text-xs font-medium text-white">
                        Best Value
                      </span>
                    )}
                    <h4 className="text-lg font-semibold text-slate-900">{pack.name}</h4>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(pack.price)}</p>
                    <p className="mt-1 text-sm text-slate-600">{pack.credits} credits</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatCurrency(Math.round(pack.price / pack.credits))}/credit
                    </p>
                    <p className="mt-2 text-xs text-slate-500">{pack.description}</p>
                    <button
                      onClick={() => handlePurchase(pack)}
                      disabled={purchasing !== null}
                      className={`mt-4 w-full rounded-lg py-2.5 text-sm font-medium transition-all ${
                        pack.popular
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      } disabled:opacity-50`}
                    >
                      {purchasing === pack.id ? 'Processing...' : 'Buy Now'}
                    </button>
                  </div>
                ))}
              </div>
              {purchaseError && (
                <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {purchaseError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Payment History Tab ── */}
        {activeTab === 'payments' && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Transaction History</h3>
              <p className="text-sm text-slate-500">All credit purchases and usage</p>
            </div>

            {loadingTransactions ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-2xl bg-slate-100 p-4 mb-4">
                  <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-700">No transactions yet</p>
                <p className="mt-1 text-xs text-slate-500">Your purchase and usage history will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2 text-right">Amount</div>
                  <div className="col-span-3 text-right">Date</div>
                </div>
                {transactions.map((tx) => (
                  <div key={tx.id} className="grid grid-cols-12 gap-4 px-6 py-4 text-sm hover:bg-slate-50 transition-colors">
                    <div className="col-span-5 flex items-center space-x-3">
                      <div className={`rounded-lg p-2 ${tx.amount > 0 ? 'bg-green-100' : 'bg-slate-100'}`}>
                        {tx.amount > 0 ? (
                          <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        )}
                      </div>
                      <span className="text-slate-700 truncate">{tx.description || 'Credit transaction'}</span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        tx.type === 'purchase' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {tx.type === 'purchase' ? 'Purchase' : 'Usage'}
                      </span>
                    </div>
                    <div className={`col-span-2 flex items-center justify-end font-semibold ${
                      tx.amount > 0 ? 'text-green-600' : 'text-slate-600'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} credits
                    </div>
                    <div className="col-span-3 flex items-center justify-end text-slate-500 text-xs">
                      {formatDate(tx.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Account Tab ── */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            {/* Account Info */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Account Information</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</p>
                    <p className="mt-0.5 text-sm text-slate-700">{profile?.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Credit Balance</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-700">{profile?.credits || 0} credits</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Plan</p>
                    <p className="mt-0.5 text-sm text-slate-700">Pay-as-you-go</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <h3 className="mb-2 text-lg font-semibold text-red-900">Danger Zone</h3>
              <p className="mb-4 text-sm text-red-700">
                Once you delete your account, there is no going back. All your data will be permanently removed.
              </p>

              {showDeleteConfirm ? (
                <div className="space-y-4 max-w-md">
                  <p className="text-sm text-red-800 font-medium">
                    Type <span className="font-mono bg-red-100 px-2 py-0.5 rounded">DELETE MY ACCOUNT</span> to confirm:
                  </p>
                  <input
                    type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)}
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
        )}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  )
}
