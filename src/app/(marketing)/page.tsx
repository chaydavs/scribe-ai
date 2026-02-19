import Link from 'next/link'

const exampleResumeOutput = `## Resume Score: 72/100

## Executive Summary
Strong technical foundation with 4 years of experience, but the resume undersells your impact. Your bullet points describe tasks rather than achievements. With targeted improvements, this could easily score 85+.

## Strengths
- Clear technical skills section with relevant technologies
- Logical chronological structure
- Education credentials are well-presented

## Critical Improvements
1. **Quantify your impact** - "Improved API performance" → "Improved API response time by 40%, reducing server costs by $2K/month"
2. **Lead with results** - Start bullets with outcomes, not responsibilities
3. **Add keywords** - Missing: Agile, CI/CD, microservices (common ATS filters)

## Quick Wins
1. Add 2-3 metrics to each job (%, $, time saved)
2. Include a 2-line professional summary at top
3. Remove "References available upon request"`

const tools = [
  {
    name: 'ResumeRadar',
    description: 'Get your resume scored and optimized for ATS systems',
    icon: '📄',
    color: 'from-indigo-500 to-purple-600',
    credits: 5,
    featured: true,
  },
  {
    name: 'ColdCraft',
    description: 'Personalized cold emails that actually get responses',
    icon: '✉️',
    color: 'from-blue-500 to-cyan-500',
    credits: 3,
  },
  {
    name: 'GrantGPT',
    description: 'Win more grants with AI-powered proposal writing',
    icon: '💰',
    color: 'from-emerald-500 to-teal-500',
    credits: 6,
  },
  {
    name: 'LinkedIn Writer',
    description: 'Viral LinkedIn posts that build your personal brand',
    icon: '💼',
    color: 'from-sky-500 to-blue-600',
    credits: 2,
  },
  {
    name: 'Notion Templates',
    description: 'Sellable Notion templates for passive income',
    icon: '📦',
    color: 'from-orange-500 to-pink-500',
    credits: 6,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-slate-900">Scribe AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30"
              >
                Get 10 Free Credits
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              AI writing tools that{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                actually help you make money
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Stop paying $20/month for ChatGPT. Get specialized tools built for specific tasks —
              resume optimization, cold outreach, grant writing, and more.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40"
              >
                Start Free — 10 Credits Included
              </Link>
              <a
                href="#how-it-works"
                className="rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                See How It Works
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              No credit card required • 10 free credits • Pay only for what you use
            </p>
          </div>
        </div>
      </section>

      {/* Featured Tool: ResumeRadar */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700 mb-4">
              Most Popular Tool
            </span>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              ResumeRadar: Get Hired Faster
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Paste your resume, get an instant score and specific improvements.
              Our AI knows what ATS systems and recruiters look for.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 items-start">
            {/* Input Example */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <div className="rounded-lg bg-slate-100 p-2">
                  <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="font-medium text-slate-700">Your Resume (paste text)</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 font-mono">
                <p className="font-semibold text-slate-800">John Smith</p>
                <p className="text-slate-500">Software Engineer</p>
                <p className="mt-3 font-medium text-slate-700">Experience</p>
                <p className="mt-1">• Worked on backend API development</p>
                <p>• Improved performance of database queries</p>
                <p>• Collaborated with frontend team</p>
                <p className="mt-3 font-medium text-slate-700">Skills</p>
                <p className="mt-1">Python, JavaScript, SQL, React</p>
              </div>
              <div className="mt-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-indigo-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

            {/* Output Example */}
            <div className="rounded-2xl border-2 border-indigo-200 bg-white p-6 shadow-lg">
              <div className="flex items-center space-x-2 mb-4">
                <div className="rounded-lg bg-green-100 p-2">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-medium text-slate-700">AI Analysis (5 credits)</span>
              </div>
              <div className="prose prose-sm max-w-none text-slate-600">
                <div className="whitespace-pre-wrap text-sm" dangerouslySetInnerHTML={{
                  __html: exampleResumeOutput
                    .replace(/## (.*?)(\n|$)/g, '<h3 class="text-base font-bold mt-4 mb-2 text-slate-900">$1</h3>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900">$1</strong>')
                    .replace(/(\d+)\./g, '<span class="text-indigo-600 font-semibold">$1.</span>')
                    .replace(/- (.*?)(\n|$)/g, '<span class="block ml-2 text-slate-600">• $1</span>')
                }} />
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl"
            >
              Try ResumeRadar Free
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* All Tools */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              5 Specialized AI Tools
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Each tool is fine-tuned for its specific task. Better results than generic AI.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <div
                key={tool.name}
                className={`rounded-2xl border ${tool.featured ? 'border-indigo-200 ring-2 ring-indigo-500/20' : 'border-slate-200'} bg-white p-6 transition-all hover:shadow-lg`}
              >
                {tool.featured && (
                  <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 mb-3">
                    Most Popular
                  </span>
                )}
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${tool.color} text-2xl`}>
                    {tool.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{tool.name}</h3>
                    <p className="text-sm text-slate-500">{tool.credits} credits per use</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Simple Credit-Based Pricing
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Pay for what you use. No subscriptions. Credits never expire.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Starter</h3>
              <p className="mt-2 text-3xl font-bold text-slate-900">$5</p>
              <p className="text-slate-500">50 credits</p>
              <p className="mt-4 text-sm text-slate-600">Perfect for trying out the tools</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>• 10 resume analyses</li>
                <li>• 16 cold emails</li>
                <li>• 25 LinkedIn posts</li>
              </ul>
            </div>

            <div className="rounded-2xl border-2 border-indigo-500 bg-white p-6 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-4 py-1 text-xs font-medium text-white">
                Best Value
              </span>
              <h3 className="text-lg font-semibold text-slate-900">Standard</h3>
              <p className="mt-2 text-3xl font-bold text-slate-900">$10</p>
              <p className="text-slate-500">120 credits</p>
              <p className="mt-4 text-sm text-slate-600">Best for regular use</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>• 24 resume analyses</li>
                <li>• 40 cold emails</li>
                <li>• 60 LinkedIn posts</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Pro</h3>
              <p className="mt-2 text-3xl font-bold text-slate-900">$20</p>
              <p className="text-slate-500">300 credits</p>
              <p className="mt-4 text-sm text-slate-600">For power users</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>• 60 resume analyses</li>
                <li>• 100 cold emails</li>
                <li>• 150 LinkedIn posts</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Ready to level up your writing?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Start with 10 free credits. No credit card required.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl"
          >
            Get Started Free
            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-indigo-500 to-purple-600">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-slate-900">Scribe AI</span>
            </div>
            <p className="text-sm text-slate-500">
              Powered by Claude AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
