'use client'

import { useRef, useEffect, useCallback, useState } from 'react'

interface ScoreBreakdown {
  impact: { score: number; label: string }
  clarity: { score: number; label: string }
  ats: { score: number; label: string }
  structure: { score: number; label: string }
}

interface ScoreCardProps {
  score: number
  scoreBreakdown: ScoreBreakdown
  previousScore?: number | null
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#f59e0b'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}

function drawCard(
  canvas: HTMLCanvasElement,
  score: number,
  scoreBreakdown: ScoreBreakdown,
  previousScore?: number | null
) {
  const dpr = window.devicePixelRatio || 1
  const W = 600
  const H = 340

  canvas.width = W * dpr
  canvas.height = H * dpr
  canvas.style.width = `${W}px`
  canvas.style.height = `${H}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)

  const fontFamily = '-apple-system, BlinkMacSystemFont, sans-serif'

  // Background with rounded corners
  ctx.beginPath()
  ctx.roundRect(0, 0, W, H, 16)
  ctx.clip()

  // Gradient background — deep indigo
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
  bgGrad.addColorStop(0, '#1e1b4b')
  bgGrad.addColorStop(1, '#312e81')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, W, H)

  // Indigo accent line at top
  ctx.fillStyle = '#6366f1'
  ctx.fillRect(0, 0, W, 4)

  // Circular progress ring
  const cx = 140
  const cy = 150
  const radius = 60
  const lineWidth = 10
  const scoreColor = getScoreColor(score)

  // Track ring
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = lineWidth
  ctx.stroke()

  // Score arc
  const startAngle = -Math.PI / 2
  const endAngle = startAngle + (score / 100) * Math.PI * 2
  ctx.beginPath()
  ctx.arc(cx, cy, radius, startAngle, endAngle)
  ctx.strokeStyle = scoreColor
  ctx.lineWidth = lineWidth
  ctx.lineCap = 'round'
  ctx.stroke()
  ctx.lineCap = 'butt'

  // Score number
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold 36px ${fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(score), cx, cy - 4)

  // "out of 100"
  ctx.fillStyle = '#94a3b8'
  ctx.font = `13px ${fontFamily}`
  ctx.fillText('out of 100', cx, cy + 26)

  // Delta from previous score
  if (previousScore != null) {
    const delta = score - previousScore
    const deltaSign = delta >= 0 ? '+' : ''
    const deltaColor = delta >= 0 ? '#22c55e' : '#ef4444'
    ctx.fillStyle = deltaColor
    ctx.font = `bold 13px ${fontFamily}`
    ctx.fillText(`${deltaSign}${delta} from ${previousScore}`, cx, cy + radius + 28)
  }

  // Bar charts (right side)
  const categories: { key: keyof ScoreBreakdown; displayLabel: string }[] = [
    { key: 'impact', displayLabel: 'Impact' },
    { key: 'clarity', displayLabel: 'Clarity' },
    { key: 'ats', displayLabel: 'ATS-Ready' },
    { key: 'structure', displayLabel: 'Structure' },
  ]

  const barX = 270
  const barW = 280
  const barH = 14
  const barStartY = 70
  const barGap = 56

  categories.forEach((cat, i) => {
    const entry = scoreBreakdown[cat.key]
    const y = barStartY + i * barGap
    const color = getScoreColor(entry.score)

    // Label
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#94a3b8'
    ctx.font = `13px ${fontFamily}`
    ctx.fillText(cat.displayLabel, barX, y)

    // Score value
    ctx.textAlign = 'right'
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold 13px ${fontFamily}`
    ctx.fillText(String(entry.score), barX + barW, y)

    // Bar background
    const barY = y + 8
    ctx.beginPath()
    ctx.roundRect(barX, barY, barW, barH, 4)
    ctx.fillStyle = '#334155'
    ctx.fill()

    // Filled bar — use actual max per dimension (impact:35, clarity:25, ats:25, structure:15)
    const maxScore = cat.key === 'impact' ? 35 : cat.key === 'structure' ? 15 : 25
    const filledW = Math.max(0, (entry.score / maxScore) * barW)
    if (filledW > 0) {
      ctx.beginPath()
      ctx.roundRect(barX, barY, filledW, barH, 4)
      ctx.fillStyle = color
      ctx.fill()
    }
  })

  // Footer
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#475569'
  ctx.font = `12px ${fontFamily}`
  ctx.fillText('Checked with ResumeLab \u2014 resumelab.com', W / 2, H - 18)
}

export function ScoreCard({ score, scoreBreakdown, previousScore }: ScoreCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copyLabel, setCopyLabel] = useState('Copy Image')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawCard(canvas, score, scoreBreakdown, previousScore)
  }, [score, scoreBreakdown, previousScore])

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = 'resume-score.png'
    a.click()
  }, [])

  const handleCopy = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      )
      if (!blob) throw new Error('Failed to create blob')
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      setCopyLabel('Copied!')
      setTimeout(() => setCopyLabel('Copy Image'), 2000)
    } catch {
      handleDownload()
    }
  }, [handleDownload])

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        className="w-full max-w-[600px] rounded-2xl"
      />
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copyLabel}
        </button>
      </div>
    </div>
  )
}
