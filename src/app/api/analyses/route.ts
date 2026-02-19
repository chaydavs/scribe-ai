import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch all analyses for the current user
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: analyses, error } = await supabase
      .from('resume_analyses')
      .select('id, title, score, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Fetch analyses error:', error)
      return NextResponse.json({ error: 'Failed to fetch analyses' }, { status: 500 })
    }

    return NextResponse.json({ analyses })
  } catch (error) {
    console.error('Analyses API error:', error)
    return NextResponse.json({ error: 'Failed to fetch analyses' }, { status: 500 })
  }
}

// POST - Create a new analysis
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, resumeText, jobDescription, analysisResult, rewriteResult, score, creditsUsed } = body

    // Generate title from resume if not provided
    const autoTitle = title || generateTitle(resumeText)

    const { data: analysis, error } = await supabase
      .from('resume_analyses')
      .insert({
        user_id: user.id,
        title: autoTitle,
        resume_text: resumeText,
        job_description: jobDescription || null,
        analysis_result: analysisResult || null,
        rewrite_result: rewriteResult || null,
        score: score || null,
        credits_used: creditsUsed || 0,
      })
      .select('id, title, created_at')
      .single()

    if (error) {
      console.error('Create analysis error:', error)
      return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 })
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Create analysis API error:', error)
    return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 })
  }
}

function generateTitle(resumeText: string): string {
  // Try to extract name from resume
  const lines = resumeText.split('\n').filter(l => l.trim())
  if (lines.length > 0) {
    const firstLine = lines[0].trim()
    // If first line looks like a name (2-4 words, no special chars)
    if (firstLine.length < 50 && /^[A-Za-z\s.'-]+$/.test(firstLine)) {
      return firstLine
    }
  }
  // Fallback to date-based title
  return `Resume Analysis - ${new Date().toLocaleDateString()}`
}
