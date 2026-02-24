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
                relative rounded-lg border-2 p-3 transition-all cursor-pointer
                ${isSelected
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                }
                ${!affordable ? 'opacity-60 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Mini Preview Icon */}
                  <div className="w-10 h-12 rounded bg-white shadow-sm border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-slate-900 text-sm">{template.name}</h4>
                      {template.isPremium && (
                        <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                          Pro
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{template.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                    {template.creditCost} cr
                  </span>
                  {isSelected && (
                    <div className="bg-teal-500 text-white rounded-full p-0.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Choose a Template</h3>
        <span className="text-sm text-slate-500">
          Your credits: <span className="font-semibold text-teal-600">{userCredits}</span>
        </span>
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
                relative rounded-xl border-2 transition-all cursor-pointer overflow-hidden
                ${isSelected
                  ? 'border-teal-500 ring-2 ring-teal-500/20'
                  : 'border-slate-200 hover:border-teal-300'
                }
                ${!affordable ? 'opacity-60' : ''}
              `}
              onClick={() => affordable && onSelect(template)}
              onMouseEnter={() => setHoveredId(template.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Preview Image */}
              <div className="aspect-[8.5/11] bg-gradient-to-br from-slate-100 to-slate-200 relative">
                {/* Placeholder for actual template preview */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="w-16 h-20 mx-auto mb-2 rounded bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-xs text-slate-500">{template.style}</p>
                  </div>
                </div>

                {/* Premium Badge */}
                {template.isPremium && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                    Premium
                  </div>
                )}

                {/* Selected Checkmark */}
                {isSelected && (
                  <div className="absolute top-2 left-2 bg-teal-500 text-white rounded-full p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Hover Overlay */}
                {isHovered && affordable && (
                  <div className="absolute inset-0 bg-teal-500/10 flex items-center justify-center">
                    <span className="bg-white text-teal-600 font-medium px-4 py-2 rounded-lg shadow-lg">
                      {isSelected ? 'Selected' : 'Select Template'}
                    </span>
                  </div>
                )}

                {/* Not Affordable Overlay */}
                {!affordable && (
                  <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
                    <span className="bg-white text-slate-600 font-medium px-4 py-2 rounded-lg shadow-lg text-sm">
                      Need {template.creditCost} credits
                    </span>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="p-3 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">{template.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{template.description}</p>
                  </div>
                  <div className="flex items-center space-x-1 text-sm font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">
                    <span>{template.creditCost}</span>
                    <span className="text-xs text-teal-400">cr</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
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

      {/* Export Button */}
      {selectedTemplateId && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => {
              const template = AVAILABLE_TEMPLATES.find(t => t.id === selectedTemplateId)
              if (template) onExport(template)
            }}
            disabled={loading}
            className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-xl transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export as PDF</span>
                <span className="text-teal-200">
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
