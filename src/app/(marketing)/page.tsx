import Link from 'next/link'

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
          <span className="text-indigo-400 font-medium">Score: 72</span>
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
          <button className="mt-1.5 text-[9px] font-medium text-white bg-indigo-500 rounded px-2 py-0.5">Apply Fix</button>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-2">
          <div className="text-[10px] font-semibold text-amber-700">Weak verb</div>
          <div className="text-[9px] text-slate-500 mt-0.5">&quot;Helped with...&quot;</div>
        </div>
      </div>
    </div>
  )
}

// Before/After bullet comparison
function BeforeAfter({ before, after, label }: { before: string; after: string; label: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{label}</div>
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-sm text-slate-500 line-through">{before}</p>
        </div>
        <div className="flex items-start gap-2">
          <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-slate-800 font-medium">{after}</p>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
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
                className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section — Loss Aversion + Product Demo */}
      <section className="relative overflow-hidden pt-16 pb-8 sm:pt-24 sm:pb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-100/30 rounded-full blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full bg-red-50 border border-red-200 px-4 py-1.5 text-sm font-medium text-red-700 mb-6">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              80% of resumes get rejected before a human sees them
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Your resume is{' '}
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                costing you
              </span>
              {' '}interviews
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed">
              See exactly what recruiters see wrong in 30 seconds. Our AI marks up your resume like an expert editor — highlighting weak bullets, missing keywords, and the exact fixes to land more interviews.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="group rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5"
              >
                See What&apos;s Wrong With My Resume
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

      {/* How It's Different — Before/After Transformation */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Not another generic AI review
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              ResumeLab doesn&apos;t just tell you what&apos;s wrong — it shows you exactly what to change and rewrites it for you.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <BeforeAfter
              label="Vague bullet"
              before="Responsible for backend API development"
              after="Built REST APIs serving 50K+ daily requests with 99.9% uptime, reducing response latency by 40%"
            />
            <BeforeAfter
              label="Missing metrics"
              before="Improved team productivity"
              after="Increased sprint velocity 35% by implementing automated testing pipeline"
            />
            <BeforeAfter
              label="Weak action verb"
              before="Helped with migrating services to the cloud"
              after="Led migration of 12 microservices to AWS, cutting infrastructure costs by $8K/month"
            />
          </div>
        </div>
      </section>

      {/* How It Works — 3 Steps */}
      <section className="py-20 border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              From upload to optimized in 60 seconds
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold shadow-lg shadow-indigo-500/30">
                1
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">Upload your resume</h3>
              <p className="mt-2 text-sm text-slate-600">
                Drop a PDF or paste text. We parse it instantly.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold shadow-lg shadow-indigo-500/30">
                2
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">See inline annotations</h3>
              <p className="mt-2 text-sm text-slate-600">
                Your resume appears with color-coded highlights on every issue — click any to see the fix.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xl font-bold shadow-lg shadow-emerald-500/30">
                3
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">Apply fixes & export</h3>
              <p className="mt-2 text-sm text-slate-600">
                One-click apply for each fix, or auto-rewrite the whole thing. Export as PDF.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution with specifics */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                Recruiters spend 6 seconds on your resume. Make every word count.
              </h2>
              <div className="mt-8 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">ATS filters reject 80% of resumes</p>
                    <p className="text-sm text-slate-500 mt-0.5">Missing keywords means a human never sees your application</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">&ldquo;Responsible for&rdquo; is invisible to recruiters</p>
                    <p className="text-sm text-slate-500 mt-0.5">Duty-based bullets blend together — impact statements get noticed</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Generic feedback doesn&apos;t help</p>
                    <p className="text-sm text-slate-500 mt-0.5">&ldquo;Add more metrics&rdquo; is useless — you need exact rewrites using your real experience</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">
                ResumeLab gives you:
              </h3>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Inline annotations on your actual resume</p>
                    <p className="text-sm text-slate-500 mt-0.5">Not a separate report — highlights right on your document, like Google Docs suggestions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">One-click fixes using your real experience</p>
                    <p className="text-sm text-slate-500 mt-0.5">Every rewrite uses only facts from your resume — nothing fabricated</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">ATS keyword scoring for any job</p>
                    <p className="text-sm text-slate-500 mt-0.5">Paste a job description and see exactly which keywords you&apos;re missing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Job seekers who fix their resumes get results
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                &ldquo;The rewrite feature blew my mind. It took my bullet &lsquo;Responsible for managing database operations&rsquo; and turned it into &lsquo;Managed PostgreSQL cluster serving 2M+ queries/day.&rsquo; Same facts, completely different impact. Got 3 callbacks in a week.&rdquo;
              </p>
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold text-sm">
                  S
                </div>
                <div className="ml-3">
                  <p className="font-medium text-slate-900 text-sm">Sarah M.</p>
                  <p className="text-xs text-slate-500">Software Engineer</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                &ldquo;I went from a 58 to an 87 score. The inline annotations made it so obvious what was wrong — I could see the red highlights on my weak bullets and fix them one by one. Way better than a wall of text telling me what to do.&rdquo;
              </p>
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-semibold text-sm">
                  J
                </div>
                <div className="ml-3">
                  <p className="font-medium text-slate-900 text-sm">James R.</p>
                  <p className="text-xs text-slate-500">Product Manager</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                &ldquo;Used the free credits, was skeptical. But it caught things I never would have noticed — my skills section was missing 4 keywords from the job posting. Fixed them, applied, got the interview. Bought more credits the same day.&rdquo;
              </p>
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 font-semibold text-sm">
                  A
                </div>
                <div className="ml-3">
                  <p className="font-medium text-slate-900 text-sm">Alex T.</p>
                  <p className="text-xs text-slate-500">Marketing Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              One price, everything included
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Every plan includes full analysis, inline fixes, AI rewrite, and PDF export
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border-2 border-indigo-500 bg-white p-6 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-4 py-1 text-xs font-medium text-white">
                Start Here
              </span>
              <h3 className="text-lg font-semibold text-slate-900">Free</h3>
              <p className="mt-2 text-3xl font-bold text-slate-900">$0</p>
              <p className="text-sm text-slate-500">25 credits included</p>
              <p className="mt-4 text-sm text-slate-600">Try it on your actual resume</p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Full analysis with inline annotations
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  AI rewrite + PDF export
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  No credit card required
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-6 block w-full rounded-lg bg-indigo-500 py-2.5 text-center text-sm font-medium text-white hover:bg-indigo-600 transition-colors"
              >
                Start Free
              </Link>
            </div>

            <div className="rounded-2xl border-2 border-emerald-500 bg-white p-6 relative shadow-lg shadow-emerald-500/10">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-xs font-medium text-white">
                Best Value
              </span>
              <h3 className="text-lg font-semibold text-slate-900">Standard</h3>
              <p className="mt-2 text-3xl font-bold text-slate-900">$10</p>
              <p className="text-sm text-slate-500">120 credits</p>
              <p className="mt-4 text-sm text-slate-600">For active job seekers</p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ~12 full analyses + rewrites
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Job-specific keyword matching
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Credits never expire
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-6 block w-full rounded-lg bg-emerald-500 py-2.5 text-center text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
              >
                Get Started
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Pro</h3>
              <p className="mt-2 text-3xl font-bold text-slate-900">$20</p>
              <p className="text-sm text-slate-500">300 credits</p>
              <p className="mt-4 text-sm text-slate-600">For career changers</p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ~30 full analyses + rewrites
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Multiple resume versions
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
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

      {/* Final CTA — Urgency */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800">
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
      <footer className="border-t border-slate-200 py-8 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-indigo-500 to-purple-600">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-slate-900">ResumeLab</span>
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
