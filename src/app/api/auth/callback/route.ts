import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Validate redirect to prevent open redirect attacks
  let redirect = searchParams.get('redirect') || '/resumelab'
  if (!redirect.startsWith('/') || redirect.startsWith('//')) {
    redirect = '/resumelab'
  }

  if (code) {
    // Build the redirect response FIRST so we can attach cookies to it
    const redirectUrl = `${origin}${redirect}`
    const response = NextResponse.redirect(redirectUrl)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.headers.get('cookie')
              ?.split('; ')
              .map((c) => {
                const [name, ...rest] = c.split('=')
                return { name, value: rest.join('=') }
              }) ?? []
          },
          setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return response
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
