import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateWithClaude, toolPrompts } from '@/lib/claude/client'
import { getToolCreditCost } from '@/lib/paypal/credits'
import { NextResponse } from 'next/server'

const TOOL_NAME = 'resumelab'
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
      toolPrompts.resumelab,
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

    // Parse structured JSON from the response
    const jsonMatch = response.content.match(/```json\s*([\s\S]*?)\s*```/)
    let parsedAnalysis = null
    let score: number | null = null

    if (jsonMatch) {
      try {
        parsedAnalysis = JSON.parse(jsonMatch[1])
        score = parsedAnalysis.score || null

        // Post-process: strip bracket placeholders from "fixed" fields
        // This is a safety net — the prompt tells the AI not to use brackets,
        // but if any slip through, we clean them here so users never see them
        if (parsedAnalysis.fixes && Array.isArray(parsedAnalysis.fixes)) {
          for (const fix of parsedAnalysis.fixes) {
            if (fix.fixed && typeof fix.fixed === 'string') {
              // Remove bracket placeholders like [specific finding], [X hours], etc.
              fix.fixed = fix.fixed.replace(/\s*\[[^\]]*?\]/g, '').replace(/\s{2,}/g, ' ').trim()
              // If the fix became empty or too short after stripping, fall back to current
              if (fix.fixed.length < 10) {
                fix.fixed = fix.current || fix.fixed
              }
            }
          }
        }
      } catch {
        // Fall back to regex if JSON parsing fails
        const scoreMatch = response.content.match(/Resume Score:\s*(\d+)\/100/i)
        score = scoreMatch ? parseInt(scoreMatch[1], 10) : null
      }
    } else {
      const scoreMatch = response.content.match(/Resume Score:\s*(\d+)\/100/i)
      score = scoreMatch ? parseInt(scoreMatch[1], 10) : null
    }

    // Generate title from resume text
    const firstLine = resumeText.split('\n').find((l: string) => l.trim())?.trim() || ''
    const title = (firstLine.length < 50 && /^[A-Za-z\s.'-]+$/.test(firstLine))
      ? firstLine
      : `Resume Analysis - ${new Date().toLocaleDateString()}`

    // Save analysis to database
    const { data: savedAnalysis } = await serviceClient
      .from('resume_analyses')
      .insert({
        user_id: user.id,
        title,
        resume_text: resumeText,
        job_description: jobDescription || null,
        analysis_result: response.content,
        score,
        credits_used: CREDIT_COST,
      })
      .select('id')
      .single()

    return NextResponse.json({
      analysis: response.content,
      structured: parsedAnalysis,
      analysisId: savedAnalysis?.id,
      score,
      creditsUsed: CREDIT_COST,
      remainingCredits: profile.credits - CREDIT_COST,
    })
  } catch (error) {
    console.error('ResumeLab error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze resume' },
      { status: 500 }
    )
  }
}
