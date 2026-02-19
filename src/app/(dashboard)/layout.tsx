import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { tools } from '@/types'

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
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <Link href="/resumeradar" className="flex items-center">
                <span className="text-xl font-bold text-gray-900">Scribe AI</span>
              </Link>
              <div className="ml-10 flex items-center space-x-4">
                {tools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    {tool.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/settings"
                className="flex items-center rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700"
              >
                <span className="mr-1">Credits:</span>
                <span className="font-bold">{profile?.credits || 0}</span>
              </Link>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {profile?.full_name || user.email}
                </span>
                <form action={handleSignOut}>
                  <button
                    type="submit"
                    className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
