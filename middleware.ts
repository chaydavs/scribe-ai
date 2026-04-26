import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// In-memory rate limiter — catches accidental hammering within one instance.
// NOT shared across serverless instances (no Redis). For production-grade
// per-user limits on the heavy AI endpoints (resumelab, rewrite, export),
// add a DB-backed counter in each route handler (see quick-score for the pattern).
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute

const RATE_LIMITS: Record<string, number> = {
  '/api/tools/quick-score': 30,
  '/api/tools/resumelab': 10,
  '/api/tools/rewrite-resume': 10,
  '/api/tools/export-resume': 10,
}

function cleanStaleEntries(): void {
  if (rateLimitStore.size < 10_000) return
  const now = Date.now()
  Array.from(rateLimitStore.entries()).forEach(([key, entry]) => {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  })
}

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  cleanStaleEntries()
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false

  rateLimitStore.set(key, { count: entry.count + 1, resetAt: entry.resetAt })
  return true
}

export async function middleware(request: NextRequest) {
  // Rate limiting for AI tool endpoints
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/api/tools/')) {
    const limit = RATE_LIMITS[pathname]
    if (limit !== undefined) {
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
      const key = `${ip}:${pathname}`
      if (!checkRateLimit(key, limit, RATE_LIMIT_WINDOW_MS)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      }
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/resumelab', '/settings']
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ['/login', '/signup']
  const isAuthPath = authPaths.some(path => request.nextUrl.pathname === path)

  if (isAuthPath && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/resumelab'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
