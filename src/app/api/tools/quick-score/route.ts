import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWithClaude } from '@/lib/claude/client'

const SCORE_PROMPT = `You are the #1 resume consultant in the world. You think like a recruiter with a stack of 200 resumes and 30 seconds each. Score this resume with EXACTLY the same strictness you would use for a full analysis.

Your output MUST be valid JSON wrapped in \`\`\`json ... \`\`\` fences. No text outside the JSON block.

=== SCORING CALIBRATION (follow exactly) ===

Score = impact + clarity + ats + structure. VERIFY the math adds up.

**Score anchors — use these as reference points:**

90-100: Exceptional. Quantified results on most bullets, strong action verbs throughout, perfect ATS keywords, clean structure. Top 5% of resumes.
Example bullet at this level: "Reduced API latency by 40% serving 2M daily requests by implementing Redis caching layer"

75-89: Strong. Some quantified results, mostly good verbs, relevant keywords present, clean format. Top 20%.
Example bullet: "Built real-time dashboard using React and D3.js, adopted by 50+ analysts across 3 departments"

60-74: Decent foundation. Clear job titles and structure, but bullets describe tasks instead of results. Average resume.
Example bullet: "Developed features for the customer portal using React and Node.js"

45-59: Needs significant work. Vague bullets, weak verbs, missing keywords. Below average.
Example bullet: "Responsible for working on various frontend tasks and helping the team"

Below 45: Major issues. Missing sections, no clear structure, very vague content.
Example bullet: "Worked on projects" or "Did programming stuff"

**Subscores:**
- Impact (0-35): Count bullets with numbers/metrics. 0 metrics = max 12. 1-2 metrics = 15-22. 3+ metrics = 23-35.
- Clarity (0-25): Starts with strong verb? Concise (under 2 lines)? No jargon without context? Each YES = +6-8.
- ATS (0-25): Standard headers? Relevant keywords for their field? No images/tables? Each YES = +6-8.
- Structure (0-15): Consistent formatting? Logical section order? Appropriate length? Each YES = +4-5.

Score the resume AS IT IS — not its potential. Be consistent: the same resume always gets the same score. When a single bullet improves, the score should increase proportionally (not drop). Do NOT inflate scores — a mediocre resume with one improved bullet is still mediocre.

\`\`\`json
{
  "score": <number 0-100, must equal sum of subscores>,
  "scoreBreakdown": {
    "impact": { "score": <0-35>, "label": "<one line>" },
    "clarity": { "score": <0-25>, "label": "<one line>" },
    "ats": { "score": <0-25>, "label": "<one line>" },
    "structure": { "score": <0-15>, "label": "<one line>" }
  },
  "topImprovements": ["<specific actionable improvement referencing a line from the resume>", "<another specific improvement>", "<third improvement>", "<fourth improvement if score < 85>", "<fifth improvement if score < 75>"]
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
