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

    // Check for duplicate capture (idempotency)
    const { data: existingTx, error: idempotencyError } = await supabase
      .from('credit_transactions')
      .select('id')
      .eq('stripe_session_id', token)
      .single()

    if (idempotencyError && idempotencyError.code !== 'PGRST116') {
      // PGRST116 = "no rows found" which is expected for new transactions
      console.error('[PayPal Capture] Idempotency check error:', idempotencyError)
    }

    if (existingTx) {
      console.log('[PayPal Capture] Already processed token:', token)
      return NextResponse.redirect(`${baseUrl}/settings?success=true`)
    }

    // Get current credits and add new ones
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('[PayPal Capture] Profile fetch failed:', profileError)
      return NextResponse.redirect(`${baseUrl}/settings?error=profile_not_found`)
    }

    console.log('[PayPal Capture] Current credits:', profile.credits, '+ adding:', credits)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: profile.credits + credits })
      .eq('id', userId)

    if (updateError) {
      console.error('[PayPal Capture] Credit update failed:', updateError)
      return NextResponse.redirect(`${baseUrl}/settings?error=credit_update_failed`)
    }

    // Log the transaction
    const { error: txError } = await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: credits,
      type: 'purchase',
      stripe_session_id: token,
      description: `Purchased ${packId} pack (${credits} credits)`,
    })

    if (txError) {
      console.error('[PayPal Capture] Transaction log failed (credits already added):', txError)
      // Don't fail the redirect — credits were already added successfully
    }

    console.log('[PayPal Capture] Success! User:', userId, 'new balance:', profile.credits + credits)
    return NextResponse.redirect(`${baseUrl}/settings?success=true`)
  } catch (error) {
    console.error('[PayPal Capture] Unexpected error:', error)
    return NextResponse.redirect(`${baseUrl}/settings?error=capture_failed`)
  }
}
