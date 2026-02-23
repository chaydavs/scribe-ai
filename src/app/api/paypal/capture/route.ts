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
    const { status, metadata } = await capturePayPalOrder(token)

    if (status !== 'COMPLETED') {
      return NextResponse.redirect(`${baseUrl}/settings?error=payment_failed`)
    }

    const userId = metadata.userId
    const credits = parseInt(metadata.credits || '0', 10)
    const packId = metadata.packId

    if (!userId || !credits) {
      console.error('Missing metadata in PayPal order:', { metadata, token })
      return NextResponse.redirect(`${baseUrl}/settings?error=invalid_metadata`)
    }

    const supabase = getAdminClient()

    // Check for duplicate capture (idempotency)
    const { data: existingTx } = await supabase
      .from('credit_transactions')
      .select('id')
      .eq('stripe_session_id', token)
      .single()

    if (existingTx) {
      // Already processed this payment — just redirect
      return NextResponse.redirect(`${baseUrl}/settings?success=true`)
    }

    // Get current credits and add new ones
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Failed to fetch profile:', profileError)
      return NextResponse.redirect(`${baseUrl}/settings?error=profile_not_found`)
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: profile.credits + credits })
      .eq('id', userId)

    if (updateError) {
      console.error('Failed to update credits:', updateError)
      return NextResponse.redirect(`${baseUrl}/settings?error=credit_update_failed`)
    }

    // Log the transaction
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: credits,
      type: 'purchase',
      stripe_session_id: token,
      description: `Purchased ${packId} pack (${credits} credits)`,
    })

    return NextResponse.redirect(`${baseUrl}/settings?success=true`)
  } catch (error) {
    console.error('PayPal capture error:', error)
    return NextResponse.redirect(`${baseUrl}/settings?error=capture_failed`)
  }
}
