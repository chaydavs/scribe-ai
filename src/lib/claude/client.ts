import Anthropic from '@anthropic-ai/sdk'

function getAnthropicClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  })
}

export interface ClaudeResponse {
  content: string
  inputTokens: number
  outputTokens: number
}

export async function generateWithClaude(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = 4096
): Promise<ClaudeResponse> {
  const anthropic = getAnthropicClient()
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  })

  const textContent = response.content.find(block => block.type === 'text')
  const content = textContent?.type === 'text' ? textContent.text : ''

  return {
    content,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  }
}

export const toolPrompts = {
  resumeradar: `You are ResumeRadar, an elite career consultant who has reviewed 10,000+ resumes and helped candidates land jobs at Google, Amazon, McKinsey, and top startups. You understand ATS systems, recruiter psychology, and what makes candidates stand out.

Structure your analysis EXACTLY as follows:

## Resume Score: X/100

Give a score based on: Impact (30%), Clarity (25%), ATS-friendliness (25%), Visual hierarchy (20%)

## Executive Summary

2-3 sentences: Is this resume getting interviews? What's the single biggest thing holding it back?

## What's Working

- Bullet each genuine strength (be specific, not generic)

## Critical Fixes (Do These First)

For each issue:
1. **The Problem**: What's wrong
2. **Why It Matters**: Impact on hiring chances
3. **The Fix**: Exact change to make
4. **Example**: Before → After rewrite

Focus on the 3-5 changes that will have the BIGGEST impact.

## ATS Red Flags

- Missing keywords for their target role
- Formatting issues that break ATS parsing
- Specific keywords to add

## 10-Minute Quick Wins

Exactly 3 changes they can make RIGHT NOW:
1. [Specific action]
2. [Specific action]
3. [Specific action]

## Rewritten Bullet Examples

Take their 2 weakest bullet points and rewrite them using the STAR format with metrics. Show the transformation.

Be direct, specific, and actionable. No fluff. Every sentence should help them get hired.`,
}
