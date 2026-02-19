import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractTextFromPDF } from '@/lib/pdf-parser'

// Configure for serverless
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    const fileName = file.name.toLowerCase()
    let text = ''

    if (fileName.endsWith('.pdf')) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        text = await extractTextFromPDF(buffer)
      } catch (pdfError) {
        console.error('PDF parsing failed:', pdfError)
        const errorMessage = pdfError instanceof Error ? pdfError.message : 'Could not read this PDF'
        return NextResponse.json(
          { error: `${errorMessage}. Please paste your resume text instead.` },
          { status: 400 }
        )
      }
    } else if (fileName.endsWith('.txt')) {
      text = await file.text()
    } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      return NextResponse.json(
        { error: 'Word documents (.doc/.docx) are not yet supported. Please save as PDF or paste your resume text.' },
        { status: 400 }
      )
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF or TXT file.' },
        { status: 400 }
      )
    }

    // Clean up the text
    text = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    if (!text) {
      return NextResponse.json(
        { error: 'No text could be extracted from the file. The PDF may be scanned or image-based. Please paste your resume text instead.' },
        { status: 400 }
      )
    }

    if (text.length < 50) {
      return NextResponse.json(
        { error: 'Very little text was extracted. The PDF may be mostly images. Please paste your resume text instead.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ text })
  } catch (error) {
    console.error('Parse resume error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('Error details:', { message: errorMessage, stack: errorStack })

    // Temporarily show debug info to diagnose the issue
    return NextResponse.json(
      {
        error: `Failed to parse file: ${errorMessage}. Please try pasting your resume text instead.`,
      },
      { status: 500 }
    )
  }
}
