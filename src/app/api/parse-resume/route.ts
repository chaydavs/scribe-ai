import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const fileName = file.name.toLowerCase()
    let text = ''

    if (fileName.endsWith('.pdf')) {
      // Parse PDF using dynamic require
      const buffer = Buffer.from(await file.arrayBuffer())
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse')
      const pdfData = await pdfParse(buffer)
      text = pdfData.text
    } else if (fileName.endsWith('.txt')) {
      // Plain text
      text = await file.text()
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF or TXT file.' },
        { status: 400 }
      )
    }

    // Clean up the text
    text = text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim()

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: 'Could not extract enough text from the file. Please try a different file or paste your resume text.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ text })
  } catch (error) {
    console.error('Parse resume error:', error)
    return NextResponse.json(
      { error: 'Failed to parse file. Please try pasting your resume text instead.' },
      { status: 500 }
    )
  }
}
