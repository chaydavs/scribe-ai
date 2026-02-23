'use client'

import { useRef, useEffect, useState } from 'react'

interface CanvasResumePreviewProps {
  text: string
}

export function CanvasResumePreview({ text }: CanvasResumePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasHeight, setCanvasHeight] = useState(600)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || !text) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const padding = 24
    const containerWidth = container.clientWidth
    const drawWidth = containerWidth - padding * 2

    // Set canvas size accounting for device pixel ratio
    canvas.width = containerWidth * dpr
    canvas.style.width = `${containerWidth}px`

    // Font settings
    const fontSize = 14
    const lineHeight = 20
    const font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
    ctx.font = font

    // Word-wrap text into lines
    const rawLines = text.split('\n')
    const wrappedLines: string[] = []

    for (const rawLine of rawLines) {
      if (rawLine.trim() === '') {
        wrappedLines.push('')
        continue
      }

      const words = rawLine.split(' ')
      let currentLine = ''

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word
        const metrics = ctx.measureText(testLine)

        if (metrics.width > drawWidth && currentLine) {
          wrappedLines.push(currentLine)
          currentLine = word
        } else {
          currentLine = testLine
        }
      }
      if (currentLine) {
        wrappedLines.push(currentLine)
      }
    }

    // Calculate and set canvas height
    const totalHeight = wrappedLines.length * lineHeight + padding * 2
    canvas.height = totalHeight * dpr
    canvas.style.height = `${totalHeight}px`
    setCanvasHeight(totalHeight)

    // Scale for retina
    ctx.scale(dpr, dpr)

    // Clear and draw background
    ctx.fillStyle = '#f8fafc' // slate-50
    ctx.fillRect(0, 0, containerWidth, totalHeight)

    // Draw text
    ctx.font = font
    ctx.fillStyle = '#334155' // slate-700
    ctx.textBaseline = 'top'

    wrappedLines.forEach((line, i) => {
      // Bold section headers (ALL CAPS lines)
      if (line === line.toUpperCase() && line.trim().length > 2 && /^[A-Z\s&]+$/.test(line.trim())) {
        ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
        ctx.fillStyle = '#0f172a' // slate-900
      } else {
        ctx.font = font
        ctx.fillStyle = '#334155' // slate-700
      }

      ctx.fillText(line, padding, padding + i * lineHeight)
    })
  }, [text])

  return (
    <div
      ref={containerRef}
      className="rounded-xl bg-slate-50 border border-slate-200 overflow-y-auto"
      style={{ maxHeight: 600 }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', height: canvasHeight }}
      />
    </div>
  )
}
