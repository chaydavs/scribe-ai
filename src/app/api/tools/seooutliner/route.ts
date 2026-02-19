import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateWithClaude, toolPrompts } from '@/lib/claude/client'
import { getToolCreditCost } from '@/lib/stripe/credits'
import { NextResponse } from 'next/server'

const TOOL_NAME = 'seooutliner'
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

    const { keyword, audience, intent } = await request.json()

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
    }

    let userMessage = `Target Keyword: ${keyword}\nSearch Intent: ${intent || 'informational'}`
    if (audience) {
      userMessage += `\nTarget Audience: ${audience}`
    }

    const response = await generateWithClaude(toolPrompts.seooutliner, userMessage)

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
      description: 'SEO blog outline generation',
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
    console.error('SEO Outliner error:', error)
    return NextResponse.json({ error: 'Failed to generate outline' }, { status: 500 })
  }
}
