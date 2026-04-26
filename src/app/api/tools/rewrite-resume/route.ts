import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateWithClaude, toolPrompts } from '@/lib/claude/client'

export const maxDuration = 60

const CREDIT_COST = 5

interface ExtractedKeywords {
  required_skills: string[]
  preferred_skills: string[]
  key_responsibilities: string[]
  industry_keywords: string[]
}

async function extractKeywordsFromJobDescription(jobDescription: string): Promise<ExtractedKeywords | null> {
  try {
    const response = await generateWithClaude(
      toolPrompts.keywordExtraction,
      jobDescription,
      1024
    )

    // Parse the JSON response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ExtractedKeywords
    }
    return null
  } catch {
    // If keyword extraction fails, continue without keywords
    return null
  }
}

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

    const { resumeText, jobDescription, analysisId } = await request.json()

    if (!resumeText) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 })
    }

    if (typeof resumeText === 'string' && resumeText.length > 50_000) {
      return NextResponse.json(
        { error: 'Resume text is too long. Please keep it under 50,000 characters.' },
        { status: 400 }
      )
    }

    // Build prompt with optional keyword injection
    let userMessage = `Here is the resume to rewrite:\n\n${resumeText}`

    if (jobDescription) {
      // Extract keywords from job description
      const keywords = await extractKeywordsFromJobDescription(jobDescription)

      if (keywords) {
        const allKeywords = [
          ...keywords.required_skills,
          ...keywords.preferred_skills,
          ...keywords.industry_keywords
        ].filter((k, i, arr) => arr.indexOf(k) === i) // dedupe

        userMessage += `\n\n---\nTARGET JOB KEYWORDS (include naturally where they match existing experience):\n${allKeywords.join(', ')}`
        userMessage += `\n\nKey responsibilities to highlight if relevant:\n${keywords.key_responsibilities.join('\n- ')}`
      } else {
        userMessage += `\n\nTarget job description (optimize keywords for this role):\n${jobDescription}`
      }
    }

    // Generate rewrite
    const response = await generateWithClaude(
      toolPrompts.resumeRewrite,
      userMessage,
      4096
    )

    // Atomically deduct credits via RPC (prevents race condition double-spend)
    const serviceClient = await createServiceClient()
    const { data: newCredits, error: creditError } = await serviceClient
      .rpc('deduct_credits', { p_user_id: user.id, p_cost: CREDIT_COST })

    if (creditError || newCredits === null) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please try again.' },
        { status: 402 }
      )
    }

    // Log transaction and usage in parallel
    await Promise.all([
      serviceClient.from('credit_transactions').insert({
        user_id: user.id,
        amount: -CREDIT_COST,
        type: 'usage',
        tool: 'resume-rewrite',
        description: 'Resume rewrite',
      }),
      serviceClient.from('usage_logs').insert({
        user_id: user.id,
        tool: 'resume-rewrite',
        credits_used: CREDIT_COST,
        input_tokens: response.inputTokens,
        output_tokens: response.outputTokens,
      }),
    ])

    // Update analysis with rewrite result if analysisId provided
    if (analysisId) {
      await supabase
        .from('resume_analyses')
        .update({
          rewrite_result: response.content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', analysisId)
        .eq('user_id', user.id)
    }

    return NextResponse.json({ rewrite: response.content })
  } catch (error) {
    console.error('Resume rewrite error:', error)
    return NextResponse.json(
      { error: 'Failed to rewrite resume' },
      { status: 500 }
    )
  }
}
