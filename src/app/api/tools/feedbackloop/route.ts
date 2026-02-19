import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateWithClaude, toolPrompts } from '@/lib/claude/client'
import { getToolCreditCost } from '@/lib/stripe/credits'
import { NextResponse } from 'next/server'

const TOOL_NAME = 'feedbackloop'
const CREDIT_COST = getToolCreditCost(TOOL_NAME)

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (!profile || profile.credits < CREDIT_COST) {
      return NextResponse.json(
        { error: `Insufficient credits. You need ${CREDIT_COST} credits.` },
        { status: 402 }
      )
    }

    const { content, contentType, context } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    let userMessage = `Content Type: ${contentType || 'general'}\n\nContent to review:\n${content}`
    if (context) {
      userMessage += `\n\nAdditional Context:\n${context}`
    }

    const response = await generateWithClaude(
      toolPrompts.feedbackloop,
      userMessage
    )

    const serviceClient = await createServiceClient()

    await serviceClient
      .from('profiles')
      .update({ credits: profile.credits - CREDIT_COST })
      .eq('id', user.id)

    await serviceClient.from('credit_transactions').insert({
      user_id: user.id,
      amount: -CREDIT_COST,
      type: 'usage',
      tool: TOOL_NAME,
      description: 'Content feedback',
    })

    await serviceClient.from('usage_logs').insert({
      user_id: user.id,
      tool: TOOL_NAME,
      credits_used: CREDIT_COST,
      input_tokens: response.inputTokens,
      output_tokens: response.outputTokens,
    })

    return NextResponse.json({
      feedback: response.content,
      creditsUsed: CREDIT_COST,
      remainingCredits: profile.credits - CREDIT_COST,
    })
  } catch (error) {
    console.error('FeedbackLoop error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    )
  }
}
