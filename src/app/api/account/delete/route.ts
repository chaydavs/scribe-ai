import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { confirmation } = await request.json()

    if (confirmation !== 'DELETE MY ACCOUNT') {
      return NextResponse.json({ error: 'Please type "DELETE MY ACCOUNT" to confirm' }, { status: 400 })
    }

    // Delete user data from profiles table (RLS will ensure they can only delete their own)
    await supabase.from('usage_logs').delete().eq('user_id', user.id)
    await supabase.from('credit_transactions').delete().eq('user_id', user.id)
    await supabase.from('profiles').delete().eq('id', user.id)

    // Sign out the user
    await supabase.auth.signOut()

    // Note: To fully delete the user from auth.users, you'd need admin privileges
    // For now, we delete all their data and sign them out
    // The auth user will remain but be orphaned (no profile data)

    return NextResponse.json({
      success: true,
      message: 'Your account data has been deleted. You will be redirected to the home page.'
    })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
