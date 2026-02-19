import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateWithClaude, toolPrompts } from '@/lib/claude/client'
import { getToolCreditCost } from '@/lib/stripe/credits'
import { NextResponse } from 'next/server'

const TOOL_NAME = 'resumeradar'
const CREDIT_COST = getToolCreditCost(TOOL_NAME)

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile and check credits
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (!profile || profile.credits < CREDIT_COST) {
      return NextResponse.json(
        { error: `Insufficient credits. You need ${CREDIT_COST} credits for this analysis.` },
        { status: 402 }
      )
    }

    const { resumeText, jobDescription } = await request.json()

    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      )
    }

    // Build the user message
    let userMessage = `Please analyze this resume:\n\n${resumeText}`
    if (jobDescription) {
      userMessage += `\n\n---\n\nTarget Job Description:\n${jobDescription}`
    }

    // Generate analysis with Claude
    const response = await generateWithClaude(
      toolPrompts.resumeradar,
      userMessage
    )

    // Deduct credits using service client
    const serviceClient = await createServiceClient()

    await serviceClient
      .from('profiles')
      .update({ credits: profile.credits - CREDIT_COST })
      .eq('id', user.id)

    // Log the transaction
    await serviceClient.from('credit_transactions').insert({
      user_id: user.id,
      amount: -CREDIT_COST,
      type: 'usage',
      tool: TOOL_NAME,
      description: `Resume analysis`,
    })

    // Log usage for analytics
    await serviceClient.from('usage_logs').insert({
      user_id: user.id,
      tool: TOOL_NAME,
      credits_used: CREDIT_COST,
      input_tokens: response.inputTokens,
      output_tokens: response.outputTokens,
    })

    return NextResponse.json({
      analysis: response.content,
      creditsUsed: CREDIT_COST,
      remainingCredits: profile.credits - CREDIT_COST,
    })
  } catch (error) {
    console.error('ResumeRadar error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze resume' },
      { status: 500 }
    )
  }
}
