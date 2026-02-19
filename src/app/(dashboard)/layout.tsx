import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits, full_name')
    .eq('id', user.id)
    .single()

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-slate-200 px-6">
            <Link href="/resumeradar" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ResumeRadar
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tools
            </p>
            <Link
              href="/resumeradar"
              className="group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100"
            >
              <svg className="mr-3 h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Resume Analysis
              <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-600">
                5
              </span>
            </Link>

            <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Account
            </p>
            <Link
              href="/settings"
              className="group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50"
            >
              <svg className="mr-3 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings & Credits
            </Link>
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-slate-200 p-4">
            {/* Credits Card */}
            <Link
              href="/settings"
              className="mb-3 block rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white transition-transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-indigo-100">Credits</p>
                  <p className="text-2xl font-bold">{profile?.credits || 0}</p>
                </div>
                <div className="rounded-full bg-white/20 p-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-xs text-indigo-100">Click to buy more</p>
            </Link>

            {/* User Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-sm font-medium text-white">
                  {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                </div>
                <div className="max-w-[120px]">
                  <p className="truncate text-sm font-medium text-slate-700">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {user.email}
                  </p>
                </div>
              </div>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  title="Sign out"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64">
        <div className="mx-auto max-w-4xl px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
