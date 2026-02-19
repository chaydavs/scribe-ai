import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWithClaude, toolPrompts } from '@/lib/claude/client'

const CREDIT_COST = 5

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check credits
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (!profile || profile.credits < CREDIT_COST) {
      return NextResponse.json(
        { error: `Insufficient credits. You need ${CREDIT_COST} credits for a rewrite.` },
        { status: 402 }
      )
    }

    const { resumeText, jobDescription } = await request.json()

    if (!resumeText) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 })
    }

    // Build prompt
    let userMessage = `Here is the resume to rewrite:\n\n${resumeText}`
    if (jobDescription) {
      userMessage += `\n\nTarget job description (optimize keywords for this role):\n${jobDescription}`
    }

    // Generate rewrite
    const response = await generateWithClaude(
      toolPrompts.resumeRewrite,
      userMessage,
      4096
    )

    // Deduct credits
    await supabase
      .from('profiles')
      .update({ credits: profile.credits - CREDIT_COST })
      .eq('id', user.id)

    // Log usage
    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      amount: -CREDIT_COST,
      type: 'usage',
      tool: 'resume-rewrite',
      description: 'Resume rewrite',
    })

    await supabase.from('usage_logs').insert({
      user_id: user.id,
      tool: 'resume-rewrite',
      credits_used: CREDIT_COST,
      input_tokens: response.inputTokens,
      output_tokens: response.outputTokens,
    })

    return NextResponse.json({ rewrite: response.content })
  } catch (error) {
    console.error('Resume rewrite error:', error)
    return NextResponse.json(
      { error: 'Failed to rewrite resume' },
      { status: 500 }
    )
  }
}
