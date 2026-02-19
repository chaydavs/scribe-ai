import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch a single analysis by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: analysis, error } = await supabase
      .from('resume_analyses')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Fetch analysis error:', error)
    return NextResponse.json({ error: 'Failed to fetch analysis' }, { status: 500 })
  }
}

// PATCH - Update an analysis (e.g., add rewrite result or rename)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, analysisResult, rewriteResult, score } = body

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (title !== undefined) updateData.title = title
    if (analysisResult !== undefined) updateData.analysis_result = analysisResult
    if (rewriteResult !== undefined) updateData.rewrite_result = rewriteResult
    if (score !== undefined) updateData.score = score

    const { data: analysis, error } = await supabase
      .from('resume_analyses')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select('id, title, updated_at')
      .single()

    if (error) {
      console.error('Update analysis error:', error)
      return NextResponse.json({ error: 'Failed to update analysis' }, { status: 500 })
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Update analysis API error:', error)
    return NextResponse.json({ error: 'Failed to update analysis' }, { status: 500 })
  }
}

// DELETE - Delete an analysis
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('resume_analyses')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Delete analysis error:', error)
      return NextResponse.json({ error: 'Failed to delete analysis' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete analysis API error:', error)
    return NextResponse.json({ error: 'Failed to delete analysis' }, { status: 500 })
  }
}
