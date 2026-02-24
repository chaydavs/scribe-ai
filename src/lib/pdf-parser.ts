// PDF parser using unpdf - works in serverless environments

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Use unpdf (modern, serverless-compatible)
  try {
    const { extractText } = await import('unpdf')
    const uint8Array = new Uint8Array(buffer)
    const { text } = await extractText(uint8Array)
    let result = Array.isArray(text) ? text.join('\n') : (text || '')
    if (result.trim()) {
      return cleanResumeText(result)
    }
  } catch (e) {
    console.error('unpdf extraction failed:', e)
  }

  // Fallback: Basic text extraction for simple PDFs
  try {
    const text = extractBasicText(buffer)
    if (text.trim()) return cleanResumeText(text)
  } catch (e) {
    console.error('Basic extraction failed:', e)
  }

  throw new Error('Could not extract text from this PDF. It may be scanned or image-based')
}

// Smart resume text cleanup that preserves structure
function cleanResumeText(raw: string): string {
  let text = raw
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')

  // Preserve section headers - detect common resume section names
  const sectionHeaders = [
    'EDUCATION', 'EXPERIENCE', 'WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE',
    'SKILLS', 'TECHNICAL SKILLS', 'PROJECTS', 'CERTIFICATIONS',
    'SUMMARY', 'PROFESSIONAL SUMMARY', 'OBJECTIVE', 'AWARDS',
    'LEADERSHIP', 'ACTIVITIES', 'VOLUNTEER', 'PUBLICATIONS',
    'RESEARCH', 'INTERESTS', 'REFERENCES', 'LANGUAGES',
    'CONTACT', 'ABOUT', 'PROFILE', 'QUALIFICATIONS',
  ]

  // Ensure section headers have proper spacing (blank line before them)
  const headerPattern = new RegExp(
    `^(${sectionHeaders.join('|')})\\s*$`,
    'gim'
  )
  text = text.replace(headerPattern, '\n\n$1')

  // Normalize bullets — various PDF bullet chars to standard dash
  text = text
    .replace(/^[\s]*[•◦▪▸►●○■□‣⁃–—]\s*/gm, '- ')
    .replace(/^[\s]*\uf0b7\s*/gm, '- ') // Common PDF bullet codepoint

  // Collapse multiple spaces within a line (but preserve line breaks)
  text = text.replace(/[ \t]{2,}/g, ' ')

  // Clean up excessive blank lines (max 2 consecutive)
  text = text.replace(/\n{4,}/g, '\n\n\n')

  // Remove trailing whitespace from each line
  text = text.split('\n').map(line => line.trimEnd()).join('\n')

  // Remove leading/trailing whitespace from the whole text
  text = text.trim()

  // Detect and fix common PDF extraction artifacts
  // Fix split words (hyphenation at line breaks)
  text = text.replace(/(\w)-\n(\w)/g, '$1$2')

  // Fix dates that got split across lines
  text = text.replace(/(\w{3,9})\s*\n\s*(20\d{2})/g, '$1 $2')
  text = text.replace(/(20\d{2})\s*\n\s*[-–—]\s*\n?\s*(20\d{2}|Present|Current)/gi, '$1 - $2')

  return text
}

// Basic text extraction - looks for readable strings in the PDF
function extractBasicText(buffer: Buffer): string {
  const content = buffer.toString('utf-8', 0, Math.min(buffer.length, 500000))

  const textParts: string[] = []

  // Extract text from PDF text objects
  const textRegex = /\(([^)]+)\)/g
  let match
  while ((match = textRegex.exec(content)) !== null) {
    const text = match[1]
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '')
      .replace(/\\t/g, ' ')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\')
    if (text.length > 2 && /[a-zA-Z]/.test(text)) {
      textParts.push(text)
    }
  }

  return textParts.join(' ').replace(/\s+/g, ' ').trim()
}
