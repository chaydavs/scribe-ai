import Link from 'next/link'

const exampleResumeOutput = `## Resume Score: 72/100

## Executive Summary
Strong technical foundation with 4 years of experience, but the resume undersells your impact. Your bullet points describe tasks rather than achievements. With targeted improvements, this could easily score 85+.

## What's Working
- Clear technical skills section with relevant technologies
- Logical chronological structure
- Education credentials are well-presented

## Critical Fixes (Do These First)

1. **The Problem**: Bullet points describe duties, not impact
   **Why It Matters**: Recruiters spend 6 seconds scanning - they need to see VALUE
   **The Fix**: Add metrics to every bullet
   **Example**: "Worked on backend API" → "Built REST APIs serving 50K daily requests with 99.9% uptime"

2. **The Problem**: No professional summary
   **Why It Matters**: First thing recruiters read - missing it loses their attention
   **The Fix**: Add 2-3 sentence summary highlighting your biggest wins

## Quick Wins
1. Add 2-3 metrics to each job (%, $, time saved)
2. Include a 2-line professional summary at top
3. Remove "References available upon request"`

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-slate-900">ResumeRadar</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30"
              >
                Get Started Free
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
            <div className="inline-flex items-center rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700 mb-6">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI-Powered Resume Analysis
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Get more interviews with a{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                better resume
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Upload your resume and get instant, actionable feedback. Our AI analyzes your resume like a recruiter would — identifying what's working and exactly what to fix.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40"
              >
                Analyze My Resume — It's Free
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              No credit card required • 2 free analyses • Results in seconds
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Three simple steps to a better resume
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold shadow-lg shadow-indigo-500/30">
                1
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900">Upload Resume</h3>
              <p className="mt-2 text-slate-600">
                Drop your PDF or paste your resume text. We support all formats.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold shadow-lg shadow-indigo-500/30">
                2
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900">Get AI Analysis</h3>
              <p className="mt-2 text-slate-600">
                Our AI scores your resume and identifies specific improvements.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold shadow-lg shadow-indigo-500/30">
                3
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900">Apply Fixes</h3>
              <p className="mt-2 text-slate-600">
                Follow our actionable recommendations to improve your resume.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Output */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              See What You'll Get
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Real feedback from our AI. Specific, actionable, and instantly useful.
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
                <span className="font-medium text-slate-700">Your Resume</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 font-mono">
                <p className="font-semibold text-slate-800">John Smith</p>
                <p className="text-slate-500">Software Engineer | john@email.com</p>
                <p className="mt-4 font-medium text-slate-700">EXPERIENCE</p>
                <p className="mt-2 font-medium text-slate-800">Software Engineer, TechCorp</p>
                <p className="text-slate-500 text-xs">2020 - Present</p>
                <p className="mt-1">• Worked on backend API development</p>
                <p>• Improved performance of database queries</p>
                <p>• Collaborated with frontend team on features</p>
                <p>• Participated in code reviews</p>
                <p className="mt-4 font-medium text-slate-700">SKILLS</p>
                <p className="mt-1">Python, JavaScript, SQL, React, Node.js</p>
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
                <span className="font-medium text-slate-700">AI Analysis</span>
              </div>
              <div className="prose prose-sm max-w-none text-slate-600 max-h-[400px] overflow-y-auto">
                <div className="whitespace-pre-wrap text-sm" dangerouslySetInnerHTML={{
                  __html: exampleResumeOutput
                    .replace(/## (.*?)(\n|$)/g, '<h3 class="text-base font-bold mt-4 mb-2 text-slate-900">$1</h3>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900">$1</strong>')
                    .replace(/(\d+)\./g, '<span class="text-indigo-600 font-semibold">$1.</span>')
                    .replace(/- (.*?)(\n|$)/g, '<span class="block ml-2 text-slate-600">• $1</span>')
                    .replace(/→/g, '<span class="text-indigo-500 font-bold">→</span>')
                }} />
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl"
            >
              Try It Free
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Simple Pricing
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Start free, upgrade when you need more analyses
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border-2 border-indigo-500 bg-white p-6 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-4 py-1 text-xs font-medium text-white">
                Start Here
              </span>
              <h3 className="text-lg font-semibold text-slate-900">Free</h3>
              <p className="mt-2 text-3xl font-bold text-slate-900">$0</p>
              <p className="text-slate-500">10 credits</p>
              <p className="mt-4 text-sm text-slate-600">Perfect for trying it out</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  2 resume analyses
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Full AI feedback
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  No credit card
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-6 block w-full rounded-lg bg-indigo-500 py-2.5 text-center text-sm font-medium text-white hover:bg-indigo-600"
              >
                Get Started
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Standard</h3>
              <p className="mt-2 text-3xl font-bold text-slate-900">$10</p>
              <p className="text-slate-500">120 credits</p>
              <p className="mt-4 text-sm text-slate-600">For active job seekers</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  24 resume analyses
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Job-specific tailoring
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Credits never expire
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-6 block w-full rounded-lg border border-slate-200 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Get Started
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Pro</h3>
              <p className="mt-2 text-3xl font-bold text-slate-900">$20</p>
              <p className="text-slate-500">300 credits</p>
              <p className="mt-4 text-sm text-slate-600">For career changers</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  60 resume analyses
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Multiple resume versions
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Best value per analysis
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-6 block w-full rounded-lg border border-slate-200 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to improve your resume?
          </h2>
          <p className="mt-4 text-lg text-indigo-100">
            Join thousands of job seekers who've improved their resumes with ResumeRadar.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center rounded-xl bg-white px-8 py-4 text-base font-semibold text-indigo-600 shadow-lg transition-all hover:bg-indigo-50"
          >
            Start Free Analysis
            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-indigo-500 to-purple-600">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-slate-900">ResumeRadar</span>
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
