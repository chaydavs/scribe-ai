import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateWithClaude, toolPrompts } from '@/lib/claude/client'
import { getToolCreditCost } from '@/lib/stripe/credits'
import { NextResponse } from 'next/server'

const TOOL_NAME = 'notiontemplate'
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

    const { templateType, category, features, complexity } = await request.json()

    if (!templateType) {
      return NextResponse.json({ error: 'Template type is required' }, { status: 400 })
    }

    let userMessage = `Create a Notion template for: ${templateType}

Category: ${category || 'productivity'}
Complexity Level: ${complexity || 'standard'}
${complexity === 'simple' ? 'Price Range: $9-$15 (single page, basic)' : ''}
${complexity === 'standard' ? 'Price Range: $19-$29 (multiple pages, databases)' : ''}
${complexity === 'premium' ? 'Price Range: $39-$49 (full system, automations)' : ''}`

    if (features) {
      userMessage += `\n\nRequired Features:\n${features}`
    }

    userMessage += `\n\nMake this template SELLABLE - it should look professional and provide real value that people will pay for.`

    const response = await generateWithClaude(toolPrompts.notiontemplate, userMessage, 6000)

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
      description: `Notion template: ${templateType}`,
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
    console.error('Notion Template error:', error)
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 })
  }
}
