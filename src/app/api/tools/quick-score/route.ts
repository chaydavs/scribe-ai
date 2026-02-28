import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWithClaude } from '@/lib/claude/client'

const SCORE_PROMPT = `You are a resume scoring expert. Score this resume and provide a brief breakdown.

Your output MUST be valid JSON wrapped in \`\`\`json ... \`\`\` fences. No text outside the JSON block.

=== SCORING METHOD ===
Score = impact + clarity + ats + structure. VERIFY the math adds up to the total score.

**Subscores:**
- Impact (0-35): Count bullets with numbers/metrics. 0 metrics = max 12. 1-2 metrics = 15-22. 3+ metrics = 23-35.
- Clarity (0-25): Starts with strong verb? Concise (under 2 lines)? No jargon without context? Each YES = +6-8.
- ATS (0-25): Standard headers? Relevant keywords for their field? No images/tables? Each YES = +6-8.
- Structure (0-15): Consistent formatting? Logical section order? Appropriate length? Each YES = +4-5.

**Score anchors:**
- 90-100: Quantified results on most bullets, strong verbs, perfect keywords, clean structure. Top 5%.
- 75-89: Some quantified results, mostly good verbs, relevant keywords. Top 20%.
- 60-74: Clear titles and structure, but bullets describe tasks not results. Average.
- 45-59: Vague bullets, weak verbs, missing keywords. Below average.
- Below 45: Missing sections, no structure, very vague.

CRITICAL: Score the resume AS IT IS. Be CONSISTENT — the same text must always produce the same score. When a single bullet improves, the score should increase proportionally (not drop).

\`\`\`json
{
  "score": <number 0-100, must equal sum of subscores>,
  "scoreBreakdown": {
    "impact": { "score": <0-35>, "label": "<one line>" },
    "clarity": { "score": <0-25>, "label": "<one line>" },
    "ats": { "score": <0-25>, "label": "<one line>" },
    "structure": { "score": <0-15>, "label": "<one line>" }
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
