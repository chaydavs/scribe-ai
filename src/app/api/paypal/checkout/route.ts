import { createClient } from '@/lib/supabase/server'
import { createPayPalOrder } from '@/lib/paypal/client'
import { getCreditPack } from '@/lib/paypal/credits'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { packId } = await request.json()
    const pack = getCreditPack(packId)

    if (!pack) {
      return NextResponse.json({ error: 'Invalid pack' }, { status: 400 })
    }

    const amount = (pack.price / 100).toFixed(2) // Convert cents to dollars
    const { approvalUrl } = await createPayPalOrder(
      amount,
      `${pack.name} Credit Pack - ${pack.credits} credits`,
      {
        userId: user.id,
        packId: pack.id,
        credits: pack.credits.toString(),
      }
    )

    return NextResponse.json({ url: approvalUrl })
  } catch (error) {
    console.error('PayPal checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
