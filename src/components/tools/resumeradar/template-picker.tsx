'use client'

import { useState } from 'react'
import { AVAILABLE_TEMPLATES, TemplatePreview } from '@/types/templates'

interface TemplatePickerProps {
  onSelect: (template: TemplatePreview) => void
  onExport: (template: TemplatePreview) => void
  selectedTemplateId?: string
  loading?: boolean
  userCredits: number
  compact?: boolean
}

export function TemplatePicker({
  onSelect,
  onExport,
  selectedTemplateId,
  loading,
  userCredits,
  compact = false
}: TemplatePickerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const canAfford = (template: TemplatePreview) => userCredits >= template.creditCost

  if (compact) {
    return (
      <div className="space-y-2">
        {AVAILABLE_TEMPLATES.map((template) => {
          const isSelected = selectedTemplateId === template.id
          const affordable = canAfford(template)

          return (
            <div
              key={template.id}
              onClick={() => affordable && onSelect(template)}
              className={`
                relative p-3 rounded-xl border transition-all cursor-pointer
                ${isSelected
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                }
                ${!affordable ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-amber-500/20' : 'bg-white/10'
                  }`}>
                    <svg className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/80'}`}>
                        {template.name}
                      </h4>
                      {template.isPremium && (
                        <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-medium rounded">
                          PRO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/40 line-clamp-1">{template.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/50'
                  }`}>
                    {template.creditCost}
                  </span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-light text-white">Choose Template</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/40">Credits:</span>
          <span className="text-amber-400 font-medium">{userCredits}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {AVAILABLE_TEMPLATES.map((template) => {
          const isSelected = selectedTemplateId === template.id
          const isHovered = hoveredId === template.id
          const affordable = canAfford(template)

          return (
            <div
              key={template.id}
              className={`
                relative rounded-2xl border overflow-hidden transition-all cursor-pointer
                ${isSelected
                  ? 'border-amber-500/50 ring-1 ring-amber-500/20'
                  : 'border-white/10 hover:border-white/20'
                }
                ${!affordable ? 'opacity-50' : ''}
              `}
              onClick={() => affordable && onSelect(template)}
              onMouseEnter={() => setHoveredId(template.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Preview */}
              <div className="aspect-[8.5/11] bg-gradient-to-br from-white/5 to-white/10 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className={`w-14 h-18 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-amber-500/20' : 'bg-white/10'
                    }`}>
                      <svg className={`w-6 h-6 ${isSelected ? 'text-amber-400' : 'text-white/30'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-xs text-white/30">{template.style}</p>
                  </div>
                </div>

                {template.isPremium && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[10px] font-medium rounded-full">
                    PRO
                  </div>
                )}

                {isSelected && (
                  <div className="absolute top-2 left-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {isHovered && affordable && !isSelected && (
                  <div className="absolute inset-0 bg-amber-500/10 flex items-center justify-center backdrop-blur-sm transition-all">
                    <span className="px-4 py-2 bg-white/10 backdrop-blur text-white text-sm font-medium rounded-lg">
                      Select
                    </span>
                  </div>
                )}

                {!affordable && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                    <span className="px-4 py-2 bg-white/10 backdrop-blur text-white/80 text-sm rounded-lg">
                      Need {template.creditCost} credits
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 bg-white/5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-medium text-white truncate">{template.name}</h4>
                    <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{template.description}</p>
                  </div>
                  <div className="flex-shrink-0 px-2 py-0.5 bg-amber-500/10 text-amber-400 text-sm font-medium rounded">
                    {template.creditCost}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 bg-white/10 text-white/50 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selectedTemplateId && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => {
              const template = AVAILABLE_TEMPLATES.find(t => t.id === selectedTemplateId)
              if (template) onExport(template)
            }}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-medium text-black transition-all hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
                <span className="text-black/60">
                  ({AVAILABLE_TEMPLATES.find(t => t.id === selectedTemplateId)?.creditCost} credits)
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
