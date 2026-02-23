import { capturePayPalOrder } from '@/lib/paypal/client'
import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') // PayPal order ID

  if (!token) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=missing_token`
    )
  }

  try {
    const { status, metadata } = await capturePayPalOrder(token)

    if (status !== 'COMPLETED') {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=payment_failed`
      )
    }

    const userId = metadata.userId
    const credits = parseInt(metadata.credits || '0', 10)
    const packId = metadata.packId

    if (!userId || !credits) {
      console.error('Missing metadata in PayPal order')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=invalid_metadata`
      )
    }

    const supabase = await createServiceClient()

    // Update user credits
    const { error: updateError } = await supabase.rpc('increment_credits', {
      user_id: userId,
      amount: credits,
    })

    // If RPC doesn't exist, fall back to manual update
    if (updateError) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()

      await supabase
        .from('profiles')
        .update({ credits: (profile?.credits || 0) + credits })
        .eq('id', userId)
    }

    // Log the transaction
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: credits,
      type: 'purchase',
      stripe_session_id: token, // reusing column for PayPal order ID
      description: `Purchased ${packId} pack (${credits} credits)`,
    })

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true`
    )
  } catch (error) {
    console.error('PayPal capture error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=capture_failed`
    )
  }
}
