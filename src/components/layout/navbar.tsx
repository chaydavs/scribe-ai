'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { tools } from '@/types'
import { cn } from '@/lib/utils'
import { CreditsDisplay } from './credits-display'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface NavbarProps {
  userName?: string | null
  userEmail?: string
}

export function Navbar({ userName, userEmail }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="border-b border-slate-200/60 bg-white/90 backdrop-blur-md shadow-sm shadow-slate-100/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link href="/resumelab" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">Scribe AI</span>
            </Link>
            <div className="ml-10 flex items-center space-x-1">
              {tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    pathname === tool.href
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <CreditsDisplay />
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {userName || userEmail}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
