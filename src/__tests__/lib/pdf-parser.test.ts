import { describe, it, expect } from 'vitest'
import { cleanResumeText } from '@/lib/pdf-parser'

// Mojibake sequences: UTF-8 curly-quote bytes misread as Windows-1252
// U+2019 RIGHT SINGLE QUOTATION MARK (UTF-8: E2 80 99) → cp1252: â(E2) €(80) ™(99)
const MOJIBAKE_APOSTROPHE = 'â€™'
// U+201C LEFT DOUBLE QUOTATION MARK  (UTF-8: E2 80 9C) → cp1252: â(E2) €(80) œ(9C)
const MOJIBAKE_LEFT_DQUOTE = 'â€œ'
// U+201D RIGHT DOUBLE QUOTATION MARK (UTF-8: E2 80 9D) → cp1252: â(E2) €(80) 
const MOJIBAKE_RIGHT_DQUOTE = 'â€'

// ─── Encoding cleanup ─────────────────────────────────────────────────────────

describe('cleanResumeText — encoding cleanup', () => {
  it("fixes UTF-8 mojibake apostrophe to straight quote", () => {
    expect(cleanResumeText(`don${MOJIBAKE_APOSTROPHE}t`)).toBe("don't")
  })

  it("fixes UTF-8 mojibake left/right double quotes", () => {
    const input = `${MOJIBAKE_LEFT_DQUOTE}Hello${MOJIBAKE_RIGHT_DQUOTE}`
    expect(cleanResumeText(input)).toBe('"Hello"')
  })

  it('normalises Unicode left single quotation mark (‘) to straight quote', () => {
    expect(cleanResumeText('‘left’')).toBe("'left'")
  })

  it('normalises Unicode left double quotation mark (“) to straight quote', () => {
    expect(cleanResumeText('“left”')).toBe('"left"')
  })
})

// ─── Bullet normalisation ─────────────────────────────────────────────────────

describe('cleanResumeText — bullet normalisation', () => {
  it('converts • (bullet) to "- "', () => {
    expect(cleanResumeText('• Built the thing')).toBe('- Built the thing')
  })

  it('converts ▸ (triangle bullet) to "- "', () => {
    expect(cleanResumeText('▸ Led a team')).toBe('- Led a team')
  })

  it('converts — (em-dash) bullet to "- "', () => {
    expect(cleanResumeText('— Shipped feature')).toBe('- Shipped feature')
  })

  it('converts ■ (black square) to "- "', () => {
    expect(cleanResumeText('■ Increased revenue')).toBe('- Increased revenue')
  })

  it('converts common PDF bullet codepoint \\uf0b7 to "- "', () => {
    expect(cleanResumeText(' Built API')).toBe('- Built API')
  })
})

// ─── Line artifact fixes ──────────────────────────────────────────────────────

describe('cleanResumeText — PDF extraction artifacts', () => {
  it('joins hyphenated words split across lines', () => {
    expect(cleanResumeText('data-\ndriven')).toBe('datadriven')
  })

  it('joins month-year dates split across lines: "Jan\\n2025" -> "Jan 2025"', () => {
    expect(cleanResumeText('Jan\n2025')).toBe('Jan 2025')
  })

  it('joins date ranges split across lines: "2020\\n-\\n2022"', () => {
    expect(cleanResumeText('2020\n-\n2022')).toBe('2020 - 2022')
  })

  it('joins MM/YYYY dates split across lines: "01/\\n2025"', () => {
    expect(cleanResumeText('01/\n2025')).toBe('01/2025')
  })

  it('collapses 4+ consecutive blank lines down to max 3', () => {
    const input = 'line1\n\n\n\n\nline2'
    const result = cleanResumeText(input)
    expect(result).not.toMatch(/\n{4,}/)
  })

  it('collapses multiple spaces within a line', () => {
    expect(cleanResumeText('too  many   spaces')).toBe('too many spaces')
  })

  it('removes trailing whitespace from lines', () => {
    const lines = cleanResumeText('line with trailing   \nline two').split('\n')
    expect(lines[0]).toBe('line with trailing')
  })
})

// ─── Section header spacing ───────────────────────────────────────────────────

describe('cleanResumeText — section header spacing', () => {
  it('ensures a blank line before EDUCATION', () => {
    expect(cleanResumeText('some text\nEDUCATION\nVirginia Tech')).toContain('\n\nEDUCATION')
  })

  it('ensures a blank line before EXPERIENCE', () => {
    expect(cleanResumeText('some text\nEXPERIENCE\nEngineer')).toContain('\n\nEXPERIENCE')
  })

  it('ensures a blank line before SKILLS', () => {
    expect(cleanResumeText('some text\nSKILLS\nPython')).toContain('\n\nSKILLS')
  })
})
