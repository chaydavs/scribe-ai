import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateWithClaude, toolPrompts } from '@/lib/claude/client'
import { getToolCreditCost } from '@/lib/stripe/credits'
import { NextResponse } from 'next/server'

const TOOL_NAME = 'meetingnotes'
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

    const { transcript, meetingType } = await request.json()

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 })
    }

    const userMessage = `Meeting Type: ${meetingType || 'general'}\n\nTranscript/Notes:\n${transcript}`

    const response = await generateWithClaude(toolPrompts.meetingnotes, userMessage)

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
      description: 'Meeting notes summarization',
    })

    await serviceClient.from('usage_logs').insert({
      user_id: user.id,
      tool: TOOL_NAME,
      credits_used: CREDIT_COST,
      input_tokens: response.inputTokens,
      output_tokens: response.outputTokens,
    })

    return NextResponse.json({
      content: response.content,
      creditsUsed: CREDIT_COST,
      remainingCredits: profile.credits - CREDIT_COST,
    })
  } catch (error) {
    console.error('Meeting Notes error:', error)
    return NextResponse.json({ error: 'Failed to summarize meeting' }, { status: 500 })
  }
}
