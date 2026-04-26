import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { convertResumeToLatex, parseResumeText } from '@/lib/latex/converter'
import { TemplateStyle, AVAILABLE_TEMPLATES } from '@/types/templates'
import { isFirebaseConfigured } from '@/lib/firebase/admin'
import { uploadExportPDF } from '@/lib/storage/server'
import crypto from 'crypto'

export const maxDuration = 30

const TEMPLATE_DB_IDS: Record<string, string> = {
  'modern-minimal-1':       'a1b2c3d4-0001-0001-0001-000000000001',
  'classic-professional-1': 'a1b2c3d4-0002-0002-0002-000000000002',
  'tech-focused-1':         'a1b2c3d4-0003-0003-0003-000000000003',
  'creative-bold-1':        'a1b2c3d4-0004-0004-0004-000000000004',
  'executive-1':            'a1b2c3d4-0005-0005-0005-000000000005',
}

// Simple in-memory cache for preview PDFs (avoids re-compiling identical LaTeX, ephemeral in serverless)
const previewCache = new Map<string, { pdf: string; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const MAX_CACHE_SIZE = 20

function getCacheKey(latex: string): string {
  return crypto.createHash('md5').update(latex).digest('hex')
}

function getCachedPdf(latex: string): string | null {
  const key = getCacheKey(latex)
  const entry = previewCache.get(key)
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.pdf
  }
  if (entry) previewCache.delete(key)
  return null
}

function setCachedPdf(latex: string, pdf: string) {
  // Evict oldest entries if cache is full
  if (previewCache.size >= MAX_CACHE_SIZE) {
    const entries = Array.from(previewCache.entries())
    const oldest = entries.sort((a, b) => a[1].timestamp - b[1].timestamp)[0]
    if (oldest) previewCache.delete(oldest[0])
  }
  previewCache.set(getCacheKey(latex), { pdf, timestamp: Date.now() })
}

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

      // Check cache first
      const cached = getCachedPdf(latex)
      if (cached) {
        return NextResponse.json({
          success: true,
          format: 'pdf',
          content: cached,
          preview: true,
          cached: true,
        })
      }

      const compileResponse = await fetch('https://latex.ytotech.com/builds/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiler: 'pdflatex',
          resources: [{ main: true, content: latex }],
        }),
        signal: AbortSignal.timeout(30_000),
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
      const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')

      // Cache the result
      setCachedPdf(latex, pdfBase64)

      return NextResponse.json({
        success: true,
        format: 'pdf',
        content: pdfBase64,
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
      signal: AbortSignal.timeout(30_000),
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

    // Atomically deduct credits via RPC (prevents race condition double-spend)
    const serviceClient = await createServiceClient()
    const { data: newCredits, error: creditError } = await serviceClient
      .rpc('deduct_credits', { p_user_id: user.id, p_cost: creditCost })

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
        amount: -creditCost,
        type: 'usage',
        tool: 'resume-export',
        description: `Resume export - ${template.name} template`,
      }),
      serviceClient.from('usage_logs').insert({
        user_id: user.id,
        tool: 'resume-export',
        credits_used: creditCost,
      }),
    ])

    // Parse resume and build export metadata
    const exportId = crypto.randomUUID()
    const parsedResume = parseResumeText(resumeText)
    const fileName = `${parsedResume.fullName.replace(/\s+/g, '_')}_Resume.pdf`
    const templateDbId = TEMPLATE_DB_IDS[template.id] ?? null

    // Upload to Cloud Storage (best-effort — skipped if Firebase is not configured)
    let exportUrl: string | null = null
    if (isFirebaseConfigured()) {
      try {
        const { storagePath } = await uploadExportPDF(
          user.id,
          exportId,
          Buffer.from(pdfBase64, 'base64'),
          { fileName, templateId: template.id }
        )
        exportUrl = storagePath
      } catch (storageError) {
        console.error('Storage upload failed (non-fatal, PDF still delivered):', storageError)
      }
    }

    // Save export record (non-fatal — PDF already compiled and credits already deducted)
    try {
      await serviceClient.from('resume_exports').insert({
        id: exportId,
        user_id: user.id,
        analysis_id: analysisId || null,
        template_id: templateDbId,
        resume_data: parsedResume,
        credits_used: creditCost,
        export_url: exportUrl,
      })
    } catch (exportRecordError) {
      console.error('Export record save failed (non-fatal, PDF delivered):', exportRecordError)
    }

    return NextResponse.json({
      success: true,
      format: 'pdf',
      content: pdfBase64,
      filename: fileName,
      creditsUsed: creditCost,
      remainingCredits: newCredits,
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
      .select('id, analysis_id, template_id, credits_used, created_at')
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
