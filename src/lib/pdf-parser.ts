// PDF parser with serverless-compatible fallback

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Try unpdf first (modern, uses pdfjs)
  try {
    const { extractText } = await import('unpdf')
    const uint8Array = new Uint8Array(buffer)
    const { text } = await extractText(uint8Array)
    const result = Array.isArray(text) ? text.join('\n') : (text || '')
    if (result.trim()) return result
  } catch (e) {
    console.log('unpdf failed, trying fallback:', e)
  }

  // Fallback: Try pdf-parse with workaround
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse/lib/pdf-parse')
    const data = await pdfParse(buffer)
    if (data.text?.trim()) return data.text
  } catch (e) {
    console.log('pdf-parse fallback failed:', e)
  }

  // Last resort: Basic text extraction for simple PDFs
  try {
    const text = extractBasicText(buffer)
    if (text.trim()) return text
  } catch (e) {
    console.log('Basic extraction failed:', e)
  }

  throw new Error('Could not extract text from this PDF. It may be scanned or image-based')
}

// Basic text extraction - looks for readable strings in the PDF
function extractBasicText(buffer: Buffer): string {
  const content = buffer.toString('utf-8', 0, Math.min(buffer.length, 500000))

  // Look for text between stream/endstream or in parentheses
  const textParts: string[] = []

  // Extract text from PDF text objects (Tj, TJ operators)
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
