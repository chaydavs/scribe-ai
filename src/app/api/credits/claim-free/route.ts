import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already claimed free credits
    const { data: existingClaim } = await supabase
      .from('credit_transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('description', 'Welcome bonus - 25 free credits')
      .single()

    if (existingClaim) {
      return NextResponse.json({ error: 'Free credits already claimed' }, { status: 400 })
    }

    // Add 25 free credits (enough to try analysis + rewrite + export)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: 25 })
      .eq('id', user.id)
      .eq('credits', 0) // Only if they have 0 credits

    if (updateError) {
      throw updateError
    }

    // Log the transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: 25,
        type: 'purchase',
        description: 'Welcome bonus - 25 free credits'
      })

    if (transactionError) {
      throw transactionError
    }

    return NextResponse.json({ success: true, credits: 25 })
  } catch (error) {
    console.error('Claim free credits error:', error)
    return NextResponse.json(
      { error: 'Failed to claim free credits' },
      { status: 500 }
    )
  }
}
