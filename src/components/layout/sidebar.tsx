'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { tools } from '@/types'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-gray-200 bg-white lg:block">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href="/resumelab" className="text-xl font-bold text-gray-900">
          ResumeLab
        </Link>
      </div>
      <nav className="p-4">
        <ul className="space-y-1">
          {tools.map((tool) => (
            <li key={tool.id}>
              <Link
                href={tool.href}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname === tool.href
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <span className="mr-3">{tool.icon}</span>
                {tool.name}
              </Link>
            </li>
          ))}
          <li className="pt-4">
            <Link
              href="/settings"
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === '/settings'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              Settings
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  )
}
