import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { convertResumeToLatex, parseResumeText } from '@/lib/latex/converter'
import { TemplateStyle, AVAILABLE_TEMPLATES } from '@/types/templates'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { resumeText, templateId, analysisId, previewOnly } = await request.json()

    if (!resumeText || !templateId) {
      return NextResponse.json(
        { error: 'Resume text and template ID are required' },
        { status: 400 }
      )
    }

    // Get template info
    const template = AVAILABLE_TEMPLATES.find(t => t.id === templateId)
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Generate LaTeX first (fast, no DB needed)
    let latex = convertResumeToLatex(resumeText, template.style as TemplateStyle)

    // For preview mode, skip credit check entirely — just compile and return
    if (previewOnly) {
      const watermarkCode = `\\AddToShipoutPictureBG*{%
  \\AtPageCenter{%
    \\rotatebox{45}{%
      \\scalebox{5}{%
        \\textcolor[gray]{0.85}{PREVIEW}%
      }%
    }%
  }%
}`
      latex = latex.replace('\\begin{document}', `\\begin{document}\n${watermarkCode}`)

      const compileResponse = await fetch('https://latex.ytotech.com/builds/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiler: 'pdflatex',
          resources: [{ main: true, content: latex }],
        }),
      })

      if (!compileResponse.ok) {
        return NextResponse.json({
          success: true,
          format: 'latex',
          content: latex,
          message: 'PDF compilation unavailable. LaTeX source provided instead.',
        })
      }

      const pdfBuffer = await compileResponse.arrayBuffer()
      return NextResponse.json({
        success: true,
        format: 'pdf',
        content: Buffer.from(pdfBuffer).toString('base64'),
        preview: true,
      })
    }

    const creditCost = template.creditCost

    // Check credits (only for actual exports)
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (!profile || profile.credits < creditCost) {
      return NextResponse.json(
        { error: `Insufficient credits. You need ${creditCost} credits for this export.` },
        { status: 402 }
      )
    }

    // Compile LaTeX to PDF using external API
    const compileResponse = await fetch('https://latex.ytotech.com/builds/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        compiler: 'pdflatex',
        resources: [
          {
            main: true,
            content: latex,
          },
        ],
      }),
    })

    if (!compileResponse.ok) {
      // If LaTeX compilation fails, return the LaTeX source instead
      // so user can compile it themselves
      const errorText = await compileResponse.text()
      console.error('LaTeX compilation error:', errorText)

      // Return LaTeX source as fallback
      return NextResponse.json({
        success: true,
        format: 'latex',
        content: latex,
        message: 'PDF compilation unavailable. LaTeX source provided instead.',
      })
    }

    // Get the PDF binary
    const pdfBuffer = await compileResponse.arrayBuffer()
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')

    // Deduct credits
    const serviceClient = await createServiceClient()

    await serviceClient
      .from('profiles')
      .update({ credits: (profile?.credits || 0) - creditCost })
      .eq('id', user.id)

    // Log the transaction
    await serviceClient.from('credit_transactions').insert({
      user_id: user.id,
      amount: -creditCost,
      type: 'usage',
      tool: 'resume-export',
      description: `Resume export - ${template.name} template`,
    })

    // Log usage
    await serviceClient.from('usage_logs').insert({
      user_id: user.id,
      tool: 'resume-export',
      credits_used: creditCost,
    })

    // Save export record
    const parsedResume = parseResumeText(resumeText)
    await serviceClient.from('resume_exports').insert({
      user_id: user.id,
      analysis_id: analysisId || null,
      template_id: template.id,
      resume_data: parsedResume,
      credits_used: creditCost,
    })

    return NextResponse.json({
      success: true,
      format: 'pdf',
      content: pdfBase64,
      filename: `${parsedResume.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
      creditsUsed: creditCost,
      remainingCredits: (profile?.credits || 0) - creditCost,
    })
  } catch (error) {
    console.error('Export resume error:', error)
    return NextResponse.json(
      { error: 'Failed to export resume' },
      { status: 500 }
    )
  }
}

// GET - Fetch user's export history
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: exports, error } = await supabase
      .from('resume_exports')
      .select('id, template_id, credits_used, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Fetch exports error:', error)
      return NextResponse.json({ error: 'Failed to fetch exports' }, { status: 500 })
    }

    return NextResponse.json({ exports })
  } catch (error) {
    console.error('Exports API error:', error)
    return NextResponse.json({ error: 'Failed to fetch exports' }, { status: 500 })
  }
}
