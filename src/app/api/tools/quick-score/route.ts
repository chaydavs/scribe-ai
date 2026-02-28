import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWithClaude } from '@/lib/claude/client'

const SCORE_PROMPT = `You are a resume scoring expert. Score this resume 0-100 and provide a brief breakdown.

Your output MUST be valid JSON wrapped in \`\`\`json ... \`\`\` fences. No text outside the JSON block.

CALIBRATION:
- A resume with clear job titles, some bullet points, and decent structure scores 55-70
- Only truly bare or disorganized resumes score below 40
- Resumes with quantified results, strong action verbs, and good keyword coverage score 75+
- Score the resume AS IT IS. Do not mentally "fix" it first
- CONSISTENCY: If given the same resume again, give the same score

\`\`\`json
{
  "score": <number 0-100>,
  "scoreBreakdown": {
    "impact": { "score": <0-100>, "label": "<one line>" },
    "clarity": { "score": <0-100>, "label": "<one line>" },
    "ats": { "score": <0-100>, "label": "<one line>" },
    "structure": { "score": <0-100>, "label": "<one line>" }
  },
  "topImprovements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
}
\`\`\``

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { resumeText } = await request.json()

    if (!resumeText) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 })
    }

    const response = await generateWithClaude(
      SCORE_PROMPT,
      `Score this resume:\n\n${resumeText}`,
      1024
    )

    const jsonMatch = response.content.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1])
      return NextResponse.json(parsed)
    }

    return NextResponse.json({ error: 'Failed to parse score' }, { status: 500 })
  } catch (error) {
    console.error('Quick score error:', error)
    return NextResponse.json({ error: 'Failed to score resume' }, { status: 500 })
  }
}
