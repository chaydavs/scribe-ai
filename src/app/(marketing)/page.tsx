'use client'

import Link from 'next/link'
import { KeywordMatcher } from '@/components/tools/resumelab/keyword-matcher'
import { RevealSection } from '@/components/marketing/reveal-section'
import { FaqSection } from '@/components/marketing/faq-section'
import { useTypingEffect } from '@/hooks/use-typing-effect'

// Interactive annotation mockup for the hero
function AnnotationDemo() {
  return (
    <div className="relative rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden">
      {/* Mock toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <span className="ml-2 text-slate-400">resume-analysis.pdf</span>
        <div className="ml-auto flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" /></svg>
            3/7 fixes applied
          </span>
          <span className="text-primary-400 font-medium">Score: 72</span>
        </div>
      </div>

      {/* Mock document with annotations */}
      <div className="px-6 py-5 font-mono text-[12px] leading-[1.8] text-slate-600 space-y-1">
        <p className="text-slate-900 font-semibold text-sm">Alex Johnson</p>
        <p className="text-slate-500 text-[11px]">alex@email.com | San Francisco, CA</p>

        <div className="flex items-center gap-2 mt-4 mb-1 -mx-2 px-2 py-1 rounded bg-slate-50 border-l-4 border-slate-300">
          <span className="font-bold text-slate-800 text-[11px] tracking-wide">EXPERIENCE</span>
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full border bg-blue-100 text-blue-700 border-blue-300">B</span>
        </div>

        <p className="text-slate-800 font-medium text-[11px]">Software Engineer, TechCorp</p>

        <p>
          {'- '}
          <span className="bg-red-100/70 border-b-2 border-red-400 px-0.5 cursor-pointer">
            Responsible for backend API development
          </span>
        </p>
        <p>
          {'- '}
          <span className="bg-green-100/70 border-b-2 border-green-400 px-0.5">
            Reduced API response time by 40% through query optimization
          </span>
        </p>
        <p>
          {'- '}
          <span className="bg-amber-100/70 border-b-2 border-amber-400 px-0.5 cursor-pointer">
            Helped with migrating services to cloud
          </span>
        </p>
        <p className="text-slate-400">- Collaborated with cross-functional team on new features</p>
      </div>

      {/* Mock sidebar peek */}
      <div className="absolute right-0 top-[42px] bottom-0 w-[180px] bg-white border-l border-slate-100 px-3 py-3 hidden lg:block">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Fixes</div>
        <div className="rounded-lg border-2 border-red-200 bg-red-50/50 p-2 mb-2">
          <div className="text-[10px] font-semibold text-red-700">Vague bullet</div>
          <div className="text-[9px] text-slate-500 mt-0.5 line-through">&quot;Responsible for...&quot;</div>
          <div className="text-[9px] text-green-700 mt-0.5">&quot;Built REST APIs serving 50K+ daily requests&quot;</div>
          <button className="mt-1.5 text-[9px] font-medium text-white bg-black rounded px-2 py-0.5">Apply Fix</button>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-2">
          <div className="text-[10px] font-semibold text-amber-700">Weak verb</div>
          <div className="text-[9px] text-slate-500 mt-0.5">&quot;Helped with...&quot;</div>
        </div>
      </div>
    </div>
  )
}

const TYPING_PHRASES = [
  'The only resume editor with built-in AI fixes',
  'Fix weak bullets in one click',
  'See keyword gaps instantly',
]

function HeroBadge() {
  const typedText = useTypingEffect({ phrases: TYPING_PHRASES })

  return (
    <div className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700 mb-6 animate-card-enter">
      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      <span>{typedText}</span>
      <span className="ml-0.5 inline-block w-[2px] h-4 bg-black animate-pulse" />
    </div>
  )
}

const OTHER_TOOLS = [
  { text: 'Give you a score and a report', detail: 'You still have to open Word/Docs to make changes' },
  { text: 'Charge $29-50/month', detail: 'Subscription for a tool you need for 2 weeks' },
  { text: 'Generate generic AI rewrites', detail: 'Same corporate-speak for everyone' },
  { text: 'Require Chrome extensions & job trackers', detail: 'Feature bloat you didn\'t ask for' },
]

const RESUMELAB_BENEFITS = [
  { text: 'Edit and fix directly on your resume', detail: 'Inline highlights + one-click apply, like Google Docs suggestions' },
  { text: 'Pay $10 once, not $50/month', detail: 'Credits for your job search — no recurring charge' },
  { text: 'Rewrites using YOUR real experience', detail: 'Nothing fabricated — your voice, stronger impact' },
  { text: 'One tool that does the whole job', detail: 'Upload → fix → export PDF. That\'s it.' },
]

const PROBLEM_ITEMS = [
  { title: 'ATS filters reject 80% of resumes', desc: 'Missing keywords means a human never sees your application' },
  { title: '\u201cResponsible for\u201d is invisible to recruiters', desc: 'Duty-based bullets blend together — impact statements get noticed' },
  { title: 'Generic feedback doesn\u2019t help', desc: '\u201cAdd more metrics\u201d is useless — you need exact rewrites using your real experience' },
]

const SOLUTION_ITEMS = [
  { title: 'Inline annotations on your actual resume', desc: 'Not a separate report — highlights right on your document, like Google Docs suggestions' },
  { title: 'One-click fixes using your real experience', desc: 'Every rewrite uses only facts from your resume — nothing fabricated' },
  { title: 'ATS keyword scoring for any job', desc: 'Paste a job description and see exactly which keywords you\u2019re missing' },
]

const TESTIMONIALS = [
  {
    text: '\u201cThe rewrite feature blew my mind. It took my bullet \u2018Responsible for managing database operations\u2019 and turned it into \u2018Managed PostgreSQL cluster serving 2M+ queries/day.\u2019 Same facts, completely different impact. Got 3 callbacks in a week.\u201d',
    initial: 'S', name: 'Sarah M.', role: 'Software Engineer',
  },
  {
    text: '\u201cI went from a 58 to an 87 score. The inline annotations made it so obvious what was wrong — I could see the red highlights on my weak bullets and fix them one by one. Way better than a wall of text telling me what to do.\u201d',
    initial: 'J', name: 'James R.', role: 'Product Manager',
  },
  {
    text: '\u201cUsed the free credits, was skeptical. But it caught things I never would have noticed — my skills section was missing 4 keywords from the job posting. Fixed them, applied, got the interview. Bought more credits the same day.\u201d',
    initial: 'A', name: 'Alex T.', role: 'Marketing Director',
  },
]

function XIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function CheckIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="border-b border-slate-200/60 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm shadow-slate-100/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-slate-900">ResumeLab</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-8 sm:pt-24 sm:pb-12">
        <div className="absolute inset-0 bg-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-slate-100/30 rounded-full blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <HeroBadge />
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl animate-card-enter [animation-delay:100ms]">
              Fix your resume{' '}
              <span className="text-black underline decoration-2 underline-offset-4">
                right here
              </span>
              {' '}&mdash; not in another tab
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed animate-card-enter [animation-delay:200ms]">
              Upload your resume, see exactly what&apos;s wrong with inline highlights, fix it with one click, and export as PDF. 60 seconds. No subscription.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-card-enter [animation-delay:300ms]">
              <Link
                href="/signup"
                className="group rounded-xl bg-black px-8 py-4 text-base font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                Fix My Resume Now
                <svg className="inline-block ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Free to try — no credit card required
            </p>
          </div>

          {/* Product Demo */}
          <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
            <AnnotationDemo />
          </div>
        </div>
      </section>

      {/* Why ResumeLab Is Different */}
      <section className="py-20 bg-white/70">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Why ResumeLab is different
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Other tools give you a report. We give you an editor.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            <RevealSection delay={0}>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
                    <XIcon className="h-4 w-4 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-500">Other resume tools</h3>
                </div>
                <ul className="space-y-4">
                  {OTHER_TOOLS.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                        <XIcon className="w-3 h-3 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{item.text}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </RevealSection>

            <RevealSection delay={100}>
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 relative">
                <div className="absolute -top-3 left-6 rounded-full bg-black px-3 py-0.5 text-xs font-medium text-white">
                  ResumeLab
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                    <CheckIcon className="h-4 w-4 text-slate-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">A better way</h3>
                </div>
                <ul className="space-y-4">
                  {RESUMELAB_BENEFITS.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckIcon className="w-3 h-3 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.text}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-100/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              From upload to optimized in 60 seconds
            </h2>
          </div>

          <div className="relative grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            <div className="hidden md:block absolute top-7 left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-0.5 bg-slate-300" />

            {[
              { step: '1', title: 'Upload your resume', desc: 'Drop a PDF or paste text. We parse it instantly.' },
              { step: '2', title: 'See inline annotations', desc: 'Color-coded highlights on every issue — click any to see the fix.' },
              { step: '3', title: 'Apply fixes & export', desc: 'One-click apply or auto-rewrite everything. Export as PDF.' },
            ].map((card, i) => (
              <RevealSection key={card.step} delay={i * 100}>
                <div className="relative text-center rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white text-xl font-bold shadow-sm relative z-10">
                    {card.step}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{card.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{card.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="py-20 bg-white/70">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <RevealSection delay={0}>
              <div>
                <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                  Recruiters spend 6 seconds on your resume. Make every word count.
                </h2>
                <div className="mt-8 space-y-5">
                  {PROBLEM_ITEMS.map((item, i) => (
                    <RevealSection key={i} delay={i * 100}>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                          <XIcon className="w-3.5 h-3.5 text-red-500" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{item.title}</p>
                          <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    </RevealSection>
                  ))}
                </div>
              </div>
            </RevealSection>

            <RevealSection delay={200}>
              <div className="bg-white rounded-2xl p-8 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">
                  ResumeLab gives you:
                </h3>
                <div className="space-y-5">
                  {SOLUTION_ITEMS.map((item, i) => (
                    <RevealSection key={i} delay={i * 100}>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckIcon className="w-3.5 h-3.5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{item.title}</p>
                          <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    </RevealSection>
                  ))}
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-slate-100/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Job seekers who fix their resumes get results
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <RevealSection key={t.name} delay={i * 100}>
                <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} />)}
                  </div>
                  <p className="text-slate-600 mb-4 text-sm leading-relaxed">{t.text}</p>
                  <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-semibold text-sm">
                      {t.initial}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-slate-900 text-sm">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Free Keyword Match Checker */}
      <section className="py-20 bg-white/70" id="match">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-4 py-1.5 text-sm font-medium text-green-700 mb-4">
              Free tool — no signup needed
            </div>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Does your resume match the job?
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Paste your resume and a job description to instantly see which keywords you&apos;re missing.
              Other tools charge $50/month for this.
            </p>
          </div>
          <KeywordMatcher />
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white/70">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              One price, everything included
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              No subscription. Buy credits, use them when you need them. They never expire.
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 mb-10 flex-wrap">
            <span className="text-sm text-slate-400 line-through">Jobscan: $50/mo</span>
            <span className="text-sm text-slate-400 line-through">Teal: $36/mo</span>
            <span className="text-sm text-slate-400 line-through">Rezi: $29/mo</span>
            <span className="text-sm font-semibold text-primary-600">ResumeLab: $10 total</span>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Free tier */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
              <h3 className="text-lg font-semibold text-slate-900">Free</h3>
              <p className="mt-2 text-3xl font-bold text-slate-900">$0</p>
              <p className="text-sm text-slate-500">25 credits included</p>
              <p className="mt-4 text-sm text-slate-600">Try it on your actual resume</p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                  Full analysis with inline annotations
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                  AI rewrite + PDF export
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                  No credit card required
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-6 block w-full rounded-lg bg-black py-2.5 text-center text-sm font-medium text-white hover:bg-slate-800 transition-colors"
              >
                Start Free
              </Link>
            </div>

            {/* Standard tier — Most Popular */}
            <div className="rounded-2xl border-2 border-black ring-2 ring-slate-200 scale-[1.02] shadow-xl bg-white p-6 relative transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-black px-4 py-1 text-xs font-medium text-white whitespace-nowrap">
                Most Popular
              </span>
              <h3 className="text-lg font-semibold text-slate-900">Standard</h3>
              <p className="mt-2 text-3xl font-bold text-slate-900">$10</p>
              <p className="text-sm text-slate-500">120 credits</p>
              <p className="mt-4 text-sm text-slate-600">For active job seekers</p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ~12 full analyses + rewrites
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                  Job-specific keyword matching
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                  Credits never expire
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-6 block w-full rounded-lg bg-black py-2.5 text-center text-sm font-medium text-white shadow-sm hover:shadow-md transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Pro tier */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 relative transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-700 px-4 py-1 text-xs font-medium text-white whitespace-nowrap">
                Best for Volume
              </span>
              <h3 className="text-lg font-semibold text-slate-900">Pro</h3>
              <p className="mt-2 text-3xl font-bold text-slate-900">$20</p>
              <p className="text-sm text-slate-500">300 credits</p>
              <p className="mt-4 text-sm text-slate-600">For career changers</p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ~30 full analyses + rewrites
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                  Multiple resume versions
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                  50% savings vs Standard
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-6 block w-full rounded-lg border border-slate-200 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection />

      {/* Final CTA */}
      <section className="py-20 bg-black">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Every day with a weak resume is interviews you&apos;re not getting
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            Upload your resume now. See exactly what to fix in 30 seconds.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center rounded-xl bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-lg transition-all hover:bg-slate-50 hover:-translate-y-0.5"
          >
            Analyze My Resume Free
            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="mt-4 text-sm text-slate-400">
            25 free credits — no credit card, no commitment
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 py-10 bg-white/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-black">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-slate-900">ResumeLab</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/login" className="hover:text-slate-700 transition-colors">Sign in</Link>
              <Link href="/signup" className="hover:text-slate-700 transition-colors">Get started</Link>
              <span>Powered by Claude AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
