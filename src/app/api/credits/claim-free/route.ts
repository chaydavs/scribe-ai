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
      .eq('description', 'Welcome bonus - 10 free credits')
      .single()

    if (existingClaim) {
      return NextResponse.json({ error: 'Free credits already claimed' }, { status: 400 })
    }

    // Add 10 free credits
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: 10 })
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
        amount: 10,
        type: 'purchase',
        description: 'Welcome bonus - 10 free credits'
      })

    if (transactionError) {
      throw transactionError
    }

    return NextResponse.json({ success: true, credits: 10 })
  } catch (error) {
    console.error('Claim free credits error:', error)
    return NextResponse.json(
      { error: 'Failed to claim free credits' },
      { status: 500 }
    )
  }
}
