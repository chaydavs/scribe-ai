import { capturePayPalOrder } from '@/lib/paypal/client'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Use direct Supabase admin client (no cookies needed — this is a redirect from PayPal)
function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') // PayPal order ID
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/settings?error=missing_token`)
  }

  try {
    console.log('[PayPal Capture] Starting capture for token:', token)
    const { status, metadata } = await capturePayPalOrder(token)
    console.log('[PayPal Capture] Order status:', status, 'metadata:', metadata)

    if (status !== 'COMPLETED') {
      return NextResponse.redirect(`${baseUrl}/settings?error=payment_failed`)
    }

    const userId = metadata.userId
    const credits = parseInt(metadata.credits || '0', 10)
    const packId = metadata.packId

    if (!userId || !credits) {
      console.error('[PayPal Capture] Missing metadata:', { metadata, token })
      return NextResponse.redirect(`${baseUrl}/settings?error=invalid_metadata`)
    }

    const supabase = getAdminClient()

    const { error: rpcError } = await supabase.rpc('add_credits_for_purchase', {
      p_user_id:     userId,
      p_credits:     credits,
      p_token:       token,
      p_description: `Purchased ${packId} pack (${credits} credits)`,
    })

    if (rpcError) {
      if (rpcError.code === '23505') {
        // Unique constraint: this token was already processed
        console.log('[PayPal Capture] Duplicate token, already credited:', token)
        return NextResponse.redirect(`${baseUrl}/settings?success=true`)
      }
      console.error('[PayPal Capture] RPC failed:', rpcError)
      return NextResponse.redirect(`${baseUrl}/settings?error=credit_update_failed`)
    }

    return NextResponse.redirect(`${baseUrl}/settings?success=true`)
  } catch (error) {
    console.error('[PayPal Capture] Unexpected error:', error)
    return NextResponse.redirect(`${baseUrl}/settings?error=capture_failed`)
  }
}
