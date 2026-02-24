'use client'

import { useMemo, useRef, useCallback } from 'react'

// Types
export interface Annotation {
  id: string
  text: string
  fixIndex: number
  severity: 'critical' | 'important' | 'nice-to-have'
  isStrength: boolean
}

export interface ResumeSection {
  name: string
  startIndex: number
  endIndex: number
  grade?: string
}

interface ResumeAnnotatorProps {
  text: string
  annotations: Annotation[]
  sections: ResumeSection[]
  activeAnnotationId: string | null
  appliedFixes: Set<string>
  onAnnotationClick: (id: string) => void
}

// Segment types for the annotated text
type Segment =
  | { type: 'text'; content: string }
  | { type: 'annotation'; content: string; annotationId: string; severity: string; isStrength: boolean }
  | { type: 'section-header'; content: string; grade?: string; sectionName: string }

// Detect section headers (ALL CAPS lines)
const SECTION_HEADER_RE = /^[A-Z][A-Z\s&/,]+$/

// Build annotated segments from text + annotation positions
function buildSegments(text: string, annotations: Annotation[], appliedFixes: Set<string>): Segment[] {
  // Find match positions for each annotation
  const ranges: Array<{ start: number; end: number; annotation: Annotation }> = []

  for (const ann of annotations) {
    if (appliedFixes.has(ann.id)) continue // skip applied fixes
    const idx = text.indexOf(ann.text)
    if (idx !== -1) {
      ranges.push({ start: idx, end: idx + ann.text.length, annotation: ann })
    }
  }

  // Sort by start, remove overlaps (first match wins)
  ranges.sort((a, b) => a.start - b.start)
  const nonOverlapping = ranges.reduce<typeof ranges>((acc, range) => {
    const last = acc[acc.length - 1]
    if (!last || range.start >= last.end) acc.push(range)
    return acc
  }, [])

  // Build flat segments
  const segments: Segment[] = []
  let cursor = 0

  for (const range of nonOverlapping) {
    if (cursor < range.start) {
      segments.push({ type: 'text', content: text.slice(cursor, range.start) })
    }
    segments.push({
      type: 'annotation',
      content: text.slice(range.start, range.end),
      annotationId: range.annotation.id,
      severity: range.annotation.severity,
      isStrength: range.annotation.isStrength,
    })
    cursor = range.end
  }

  if (cursor < text.length) {
    segments.push({ type: 'text', content: text.slice(cursor) })
  }

  return segments
}

// Parse sections from text
export function parseSections(
  text: string,
  sectionReviews: Array<{ name: string; grade: string }>
): ResumeSection[] {
  const lines = text.split('\n')
  const sections: ResumeSection[] = []
  let charOffset = 0

  lines.forEach((line) => {
    const trimmed = line.trim()
    if (SECTION_HEADER_RE.test(trimmed) && trimmed.length > 2 && trimmed.length < 40) {
      const review = sectionReviews.find(r =>
        r.name.toUpperCase().includes(trimmed) ||
        trimmed.includes(r.name.toUpperCase())
      )
      sections.push({
        name: trimmed,
        startIndex: charOffset,
        endIndex: -1,
        grade: review?.grade,
      })
    }
    charOffset += line.length + 1
  })

  // Set end boundaries
  sections.forEach((s, i) => {
    s.endIndex = i < sections.length - 1 ? sections[i + 1].startIndex : text.length
  })

  return sections
}

// Grade colors
function gradeColor(grade: string): string {
  const colors: Record<string, string> = {
    'A': 'bg-green-100 text-green-700 border-green-300',
    'B': 'bg-blue-100 text-blue-700 border-blue-300',
    'C': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'D': 'bg-orange-100 text-orange-700 border-orange-300',
    'F': 'bg-red-100 text-red-700 border-red-300',
  }
  return colors[grade] || 'bg-slate-100 text-slate-600 border-slate-300'
}

export default function ResumeAnnotator({
  text,
  annotations,
  sections,
  activeAnnotationId,
  appliedFixes,
  onAnnotationClick,
}: ResumeAnnotatorProps) {
  const annotationRefs = useRef<Record<string, HTMLElement>>({})

  // Build segments with memoization
  const rawSegments = useMemo(
    () => buildSegments(text, annotations, appliedFixes),
    [text, annotations, appliedFixes]
  )

  // Create a section lookup by char position
  const getSectionAt = useCallback(
    (charPos: number) => sections.find(s => charPos >= s.startIndex && charPos < s.endIndex),
    [sections]
  )

  // Expand text segments to detect section headers within them
  const renderSegments = useMemo(() => {
    const result: Segment[] = []
    let globalOffset = 0

    for (const seg of rawSegments) {
      if (seg.type === 'text') {
        // Split text on line breaks to detect section headers
        const lines = seg.content.split('\n')
        let lineContent = ''

        lines.forEach((line, lineIdx) => {
          const trimmed = line.trim()
          const isHeader = SECTION_HEADER_RE.test(trimmed) && trimmed.length > 2 && trimmed.length < 40

          if (isHeader) {
            // Flush accumulated text
            if (lineContent) {
              result.push({ type: 'text', content: lineContent })
              lineContent = ''
            }
            const section = getSectionAt(globalOffset + seg.content.indexOf(line))
            result.push({
              type: 'section-header',
              content: line,
              grade: section?.grade,
              sectionName: trimmed,
            })
            if (lineIdx < lines.length - 1) lineContent += '\n'
          } else {
            lineContent += line
            if (lineIdx < lines.length - 1) lineContent += '\n'
          }
        })

        if (lineContent) {
          result.push({ type: 'text', content: lineContent })
        }
      } else {
        result.push(seg)
      }

      globalOffset += seg.content.length
    }

    return result
  }, [rawSegments, getSectionAt])

  // Scroll an annotation into view (called externally via ref)
  const scrollToAnnotation = useCallback((id: string) => {
    annotationRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  // Expose scroll method
  ;(ResumeAnnotator as unknown as { scrollToAnnotation: typeof scrollToAnnotation }).scrollToAnnotation = scrollToAnnotation

  return (
    <div className="relative bg-white rounded-xl border border-slate-200 overflow-y-auto max-h-[calc(100vh-240px)] scrollbar-thin">
      <div
        className="px-8 py-6 font-mono text-[13px] leading-[1.75] text-slate-700 max-w-[700px] mx-auto"
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {renderSegments.map((seg, i) => {
          if (seg.type === 'section-header') {
            return (
              <div key={i} className="flex items-center gap-3 mt-6 mb-1 -mx-3 px-3 py-1.5 rounded-lg bg-slate-50 border-l-4 border-slate-300">
                <span className="font-bold text-slate-900 tracking-wide text-sm flex-1">{seg.content}</span>
                {seg.grade && (
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${gradeColor(seg.grade)}`}>
                    {seg.grade}
                  </span>
                )}
              </div>
            )
          }

          if (seg.type === 'annotation') {
            const isActive = activeAnnotationId === seg.annotationId
            const baseClass = seg.isStrength
              ? 'bg-green-100/70 border-b-2 border-green-400'
              : seg.severity === 'critical'
                ? 'bg-red-100/70 border-b-2 border-red-400'
                : seg.severity === 'important'
                  ? 'bg-amber-100/70 border-b-2 border-amber-400'
                  : 'bg-blue-100/60 border-b-2 border-blue-300'

            const activeClass = isActive
              ? 'ring-2 ring-offset-1 ring-indigo-500 rounded-sm'
              : 'hover:ring-1 hover:ring-offset-1 hover:ring-slate-300 hover:rounded-sm'

            return (
              <mark
                key={i}
                ref={el => { if (el) annotationRefs.current[seg.annotationId] = el }}
                className={`${baseClass} ${activeClass} cursor-pointer transition-all duration-200 inline`}
                style={{ backgroundColor: undefined }}
                onClick={(e) => {
                  e.stopPropagation()
                  onAnnotationClick(seg.annotationId)
                }}
              >
                {seg.content}
              </mark>
            )
          }

          // Plain text
          return <span key={i}>{seg.content}</span>
        })}
      </div>
    </div>
  )
}
