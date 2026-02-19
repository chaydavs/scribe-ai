// PDF parser using unpdf - works in serverless environments

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Use unpdf (modern, serverless-compatible)
  try {
    const { extractText } = await import('unpdf')
    const uint8Array = new Uint8Array(buffer)
    const { text } = await extractText(uint8Array)
    const result = Array.isArray(text) ? text.join('\n') : (text || '')
    if (result.trim()) return result
  } catch (e) {
    console.error('unpdf extraction failed:', e)
  }

  // Fallback: Basic text extraction for simple PDFs
  try {
    const text = extractBasicText(buffer)
    if (text.trim()) return text
  } catch (e) {
    console.error('Basic extraction failed:', e)
  }

  throw new Error('Could not extract text from this PDF. It may be scanned or image-based')
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
