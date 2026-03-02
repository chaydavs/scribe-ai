'use client'

import React, { useState } from 'react'
import { RevealSection } from './reveal-section'

const FAQ_ITEMS = [
  {
    question: 'How do credits work?',
    answer:
      'You start with 25 free credits. An analysis costs 5 credits, a rewrite costs 5, and a PDF export costs 10-20 depending on the template. Credits never expire. Buy more anytime \u2014 no subscription.',
  },
  {
    question: 'Is my resume data secure?',
    answer:
      'Your resume is processed in-memory and never stored on third-party servers. We use Claude AI for analysis \u2014 your data is not used for training. You can delete your account and all data at any time.',
  },
  {
    question: 'How accurate is the AI analysis?',
    answer:
      'ResumeLab uses Claude Sonnet, one of the most capable AI models. The scoring system is calibrated across thousands of resumes. That said, AI suggestions are a starting point \u2014 always use your judgment for your specific industry.',
  },
  {
    question: 'Can I use this for multiple resumes?',
    answer:
      'Yes! Create a new analysis for each resume version. Many users create tailored versions for different job applications. Your history is saved so you can compare scores over time.',
  },
  {
    question: 'What makes this different from other resume tools?',
    answer:
      'Most tools give you a report and leave you to fix things yourself in another app. ResumeLab shows inline annotations on your actual resume text and lets you apply fixes with one click \u2014 like Google Docs suggestions, but for resume optimization.',
  },
] as const

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-primary-600"
      >
        <span className="text-base font-medium text-slate-900">{question}</span>
        <svg
          className={`h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-sm leading-relaxed text-slate-600">{answer}</p>
        </div>
      </div>
    </div>
  )
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <section className="py-20 bg-slate-100/60">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Everything you need to know about ResumeLab.
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 px-6 shadow-sm">
          {FAQ_ITEMS.map((item, i) => (
            <RevealSection key={item.question} delay={i * 100}>
              <FaqItem
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === i}
                onToggle={() => handleToggle(i)}
              />
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  )
}
