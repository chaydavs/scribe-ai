import { getStripe } from '@/lib/stripe/client'
import { createServiceClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  const stripe = getStripe()

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const userId = session.metadata?.userId
    const credits = parseInt(session.metadata?.credits || '0', 10)
    const packId = session.metadata?.packId

    if (!userId || !credits) {
      console.error('Missing metadata in checkout session')
      return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 })
    }

    try {
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
        stripe_session_id: session.id,
        description: `Purchased ${packId} pack (${credits} credits)`,
      })
    } catch (error) {
      console.error('Failed to update credits:', error)
      return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
