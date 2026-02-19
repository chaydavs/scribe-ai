import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    if (email === user.email) {
      return NextResponse.json({ error: 'This is already your current email' }, { status: 400 })
    }

    // Update email - Supabase will send verification to both old and new email
    const { error } = await supabase.auth.updateUser({
      email: email.trim()
    })

    if (error) {
      console.error('Email update error:', error)
      if (error.message.includes('already registered')) {
        return NextResponse.json({ error: 'This email is already registered to another account' }, { status: 400 })
      }
      return NextResponse.json({ error: error.message || 'Failed to update email' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent. Please check both your old and new email addresses to confirm the change.'
    })
  } catch (error) {
    console.error('Update email error:', error)
    return NextResponse.json({ error: 'Failed to update email' }, { status: 500 })
  }
}
