import { describe, it, expect } from 'vitest'
import { parseResumeText } from '@/lib/latex/converter'

// ─── Header parsing ───────────────────────────────────────────────────────────

describe('header parsing', () => {
  it('extracts name from the first non-contact line', () => {
    const result = parseResumeText('Jane Smith\njane@example.com | 555-1234')
    expect(result.fullName).toBe('Jane Smith')
  })

  it('extracts email from pipe-separated contact line', () => {
    const result = parseResumeText('Jane Smith\njane@example.com | 555-1234')
    expect(result.email).toBe('jane@example.com')
  })

  it('extracts phone from contact line', () => {
    const result = parseResumeText('Jane Smith\njane@example.com | (555) 123-4567')
    expect(result.phone).toBe('(555) 123-4567')
  })

  it('extracts LinkedIn URL', () => {
    const result = parseResumeText('Jane Smith\njane@example.com | linkedin.com/in/jane')
    expect(result.linkedin).toBe('linkedin.com/in/jane')
  })

  it('uses bullet separator in contact line', () => {
    const result = parseResumeText('Jane Smith\njane@example.com • 555-1234 • linkedin.com/in/jane')
    expect(result.email).toBe('jane@example.com')
    expect(result.linkedin).toBe('linkedin.com/in/jane')
  })
})

// ─── Section detection ───────────────────────────────────────────────────────

describe('section detection', () => {
  it('detects section headers case-insensitively', () => {
    const resume = `Jane Smith\n\nexperience\nEngineer | Acme | Jan 2024 - Present\n- Built stuff`
    const result = parseResumeText(resume)
    expect(result.experience.length).toBeGreaterThan(0)
  })

  it('detects "WORK EXPERIENCE" as experience section', () => {
    const resume = `Jane Smith\n\nWORK EXPERIENCE\nEngineer | Acme | Jan 2024 - Present\n- Built stuff`
    const result = parseResumeText(resume)
    expect(result.experience.length).toBeGreaterThan(0)
  })

  it('does not treat "Relevant Coursework: Calc, Algebra, CS101" as a section header', () => {
    // Lines with substantial content after colon are not section headers
    const resume = `Jane Smith\n\nEDUCATION\nVirginia Tech | BS Computer Science | May 2025\nRelevant Coursework: Calculus, Algorithms, Data Structures`
    const result = parseResumeText(resume)
    expect(result.education.length).toBeGreaterThan(0)
    expect(result.education[0].honors).toBeDefined()
    const honors = result.education[0].honors!.join(' ')
    expect(honors).toContain('Coursework')
  })

  it('detects "TECHNICAL SKILLS" as skills section', () => {
    const resume = `Jane Smith\n\nTECHNICAL SKILLS\nPython, Java, SQL`
    const result = parseResumeText(resume)
    expect(result.skills).toContain('Python')
  })
})

// ─── Bullet recognition ───────────────────────────────────────────────────────

describe('bullet recognition (isBullet)', () => {
  it('recognises regular hyphen as bullet', () => {
    const resume = `Jane Smith\n\nEXPERIENCE\nEngineer | Acme | Jan 2024 - Present\n- Led a team of 5`
    const result = parseResumeText(resume)
    expect(result.experience[0].bullets).toContain('Led a team of 5')
  })

  it('recognises en-dash (U+2013) as bullet', () => {
    // Critical bug: en-dash is common in resumes and must be treated as a bullet
    const resume = `Jane Smith\n\nEXPERIENCE\nEngineer | Acme | Jan 2024 - Present\n– Reduced latency by 40%`
    const result = parseResumeText(resume)
    expect(result.experience[0].bullets).toContain('Reduced latency by 40%')
  })

  it('recognises bullet char (•) as bullet', () => {
    const resume = `Jane Smith\n\nEXPERIENCE\nEngineer | Acme | Jan 2024 - Present\n• Improved throughput`
    const result = parseResumeText(resume)
    expect(result.experience[0].bullets).toContain('Improved throughput')
  })

  it('recognises asterisk (*) as bullet', () => {
    const resume = `Jane Smith\n\nEXPERIENCE\nEngineer | Acme | Jan 2024 - Present\n* Shipped feature`
    const result = parseResumeText(resume)
    expect(result.experience[0].bullets).toContain('Shipped feature')
  })
})

// ─── Date extraction ──────────────────────────────────────────────────────────

describe('date extraction', () => {
  it('parses "Month YYYY - Present" date range', () => {
    const resume = `Jane Smith\n\nEXPERIENCE\nEngineer | Acme | Jan 2024 - Present`
    const result = parseResumeText(resume)
    expect(result.experience[0].startDate).toBe('Jan 2024')
    expect(result.experience[0].endDate).toBe('Present')
  })

  it('parses en-dash date range "Aug 2024 – May 2025"', () => {
    const resume = `Jane Smith\n\nEXPERIENCE\nIntern | StartupCo | Aug 2024 – May 2025`
    const result = parseResumeText(resume)
    expect(result.experience[0].startDate).toBe('Aug 2024')
    expect(result.experience[0].endDate).toBe('May 2025')
  })

  it('parses "Expected May 2026" graduation date', () => {
    const resume = `Jane Smith\n\nEDUCATION\nVirginia Tech | BS Computer Science | Expected May 2026`
    const result = parseResumeText(resume)
    expect(result.education[0].graduationDate).toMatch(/May 2026/)
  })

  it('parses seasonal dates "Fall 2023 - Spring 2024"', () => {
    const resume = `Jane Smith\n\nEXPERIENCE\nTA | University | Fall 2023 - Spring 2024`
    const result = parseResumeText(resume)
    expect(result.experience[0].startDate).toBe('Fall 2023')
    expect(result.experience[0].endDate).toBe('Spring 2024')
  })

  it('does not confuse course numbers like "CS 2104" as years', () => {
    const resume = `Jane Smith\n\nEDUCATION\nVirginia Tech | BS Computer Science | May 2025\nRelevant Coursework: CS 2104, CS 3114`
    const result = parseResumeText(resume)
    // CS 2104 should not be mistaken for a year
    expect(result.education[0].graduationDate).toMatch(/2025/)
  })
})

// ─── Experience parsing ───────────────────────────────────────────────────────

describe('experience parsing', () => {
  it('parses "Title | Company | Location  Date" format', () => {
    const resume = `Jane Smith\n\nEXPERIENCE\nSoftware Engineer | Google | Mountain View, CA  Jan 2024 - Present\n- Built search features`
    const result = parseResumeText(resume)
    const exp = result.experience[0]
    expect(exp.title).toBe('Software Engineer')
    expect(exp.company).toBe('Google')
    expect(exp.bullets[0]).toBe('Built search features')
  })

  it('parses "Title @ Company" format', () => {
    const resume = `Jane Smith\n\nEXPERIENCE\nResearch Assistant @ Virginia Tech  Aug 2023 - May 2024\n- Analyzed data`
    const result = parseResumeText(resume)
    expect(result.experience[0].title).toBe('Research Assistant')
    expect(result.experience[0].company).toBe('Virginia Tech')
  })

  it('collects multiple bullets under one experience entry', () => {
    const resume = `Jane Smith\n\nEXPERIENCE\nEngineer | Acme | Jan 2024 - Present\n- Built API\n- Wrote tests\n- Deployed to prod`
    const result = parseResumeText(resume)
    expect(result.experience[0].bullets).toHaveLength(3)
  })

  it('handles two experience entries correctly', () => {
    const resume = `Jane Smith\n\nEXPERIENCE\nEngineer | Acme | Jan 2024 - Present\n- Built API\nIntern | BigCo | Jun 2023 - Dec 2023\n- Learned stuff`
    const result = parseResumeText(resume)
    expect(result.experience).toHaveLength(2)
    expect(result.experience[0].company).toBe('Acme')
    expect(result.experience[1].company).toBe('BigCo')
  })
})

// ─── Education parsing ────────────────────────────────────────────────────────

describe('education parsing', () => {
  it('parses degree, school, and graduation from pipe-separated line', () => {
    const resume = `Jane Smith\n\nEDUCATION\nVirginia Tech | BS in Computer Science | May 2025`
    const result = parseResumeText(resume)
    expect(result.education[0].school).toContain('Virginia Tech')
    expect(result.education[0].graduationDate).toMatch(/2025/)
  })

  it('extracts GPA from "GPA: 3.8/4.0" notation', () => {
    const resume = `Jane Smith\n\nEDUCATION\nVirginia Tech | BS Computer Science | May 2025\nGPA: 3.8/4.0`
    const result = parseResumeText(resume)
    expect(result.education[0].gpa).toBe('3.8')
  })

  it('extracts GPA from pipe line "GPA: 3.82/4.0 | In-major GPA: 4.0/4.0"', () => {
    const resume = `Jane Smith\n\nEDUCATION\nVirginia Tech | BS Computer Science | May 2025\nGPA: 3.82/4.0 | In-major GPA: 4.0/4.0`
    const result = parseResumeText(resume)
    expect(result.education[0].gpa).toBe('3.82')
  })
})

// ─── Skills parsing ───────────────────────────────────────────────────────────

describe('skills parsing', () => {
  it('splits comma-separated skills', () => {
    const resume = `Jane Smith\n\nSKILLS\nPython, Java, SQL`
    const result = parseResumeText(resume)
    expect(result.skills).toContain('Python')
    expect(result.skills).toContain('Java')
    expect(result.skills).toContain('SQL')
  })

  it('respects parentheses when splitting — "Python (NumPy, scikit-learn)" stays together', () => {
    // Critical: commas inside parens should not split the skill
    const resume = `Jane Smith\n\nSKILLS\nPython (NumPy, scikit-learn), Java, SQL`
    const result = parseResumeText(resume)
    expect(result.skills).toContain('Python (NumPy, scikit-learn)')
    expect(result.skills).toContain('Java')
    expect(result.skills).toHaveLength(3)
  })

  it('handles skills with category prefix "Languages: Python, Java"', () => {
    const resume = `Jane Smith\n\nTECHNICAL SKILLS\nLanguages: Python, Java\nFrameworks: React, Node.js`
    const result = parseResumeText(resume)
    expect(result.skills).toContain('Python')
    expect(result.skills).toContain('React')
  })

  it('deduplicates skills that appear in multiple categories', () => {
    const resume = `Jane Smith\n\nSKILLS\nPython, Java\nPython, SQL`
    const result = parseResumeText(resume)
    const pythonCount = result.skills.filter(s => s === 'Python').length
    expect(pythonCount).toBe(1)
  })
})

// ─── Project parsing ──────────────────────────────────────────────────────────

describe('project parsing', () => {
  it('parses "Name - Description" format', () => {
    const resume = `Jane Smith\n\nPROJECTS\nFinanceBot - An AI chatbot for personal finance`
    const result = parseResumeText(resume)
    expect(result.projects![0].name).toBe('FinanceBot')
    expect(result.projects![0].description).toContain('AI chatbot')
  })

  it('parses "Name: Description" format', () => {
    const resume = `Jane Smith\n\nPROJECTS\nWeather App: Real-time weather dashboard using React`
    const result = parseResumeText(resume)
    expect(result.projects![0].name).toBe('Weather App')
  })

  it('treats short en-dash bullets as project names, not description bullets', () => {
    // Critical bug pattern: "– Refr.store" should become a project name
    const resume = `Jane Smith\n\nPROJECTS\n– Refr.store\n– Built Flask backend for data processing`
    const result = parseResumeText(resume)
    const names = result.projects!.map(p => p.name)
    expect(names).toContain('Refr.store')
    // The description bullet should be part of Refr.store's description, not a new project
    const refr = result.projects!.find(p => p.name === 'Refr.store')
    expect(refr?.description).toContain('Built Flask backend')
  })

  it('treats single-word bullet without verb as project name', () => {
    const resume = `Jane Smith\n\nPROJECTS\n- FinanceBot\n- Built a financial forecasting tool`
    const result = parseResumeText(resume)
    const names = result.projects!.map(p => p.name)
    expect(names).toContain('FinanceBot')
  })

  it('treats verb-starting bullet as description, not project name', () => {
    const resume = `Jane Smith\n\nPROJECTS\nMyApp - A great app\n- Built the backend using Node.js\n- Deployed to AWS`
    const result = parseResumeText(resume)
    expect(result.projects![0].name).toBe('MyApp')
    // Verb bullets should go into description, not become new projects
    expect(result.projects!.length).toBe(1)
  })

  it('does not split "Refr.store" on the dot — dot is part of the name', () => {
    // Critical: "Refr.store" has a dot but is not a sentence
    const resume = `Jane Smith\n\nPROJECTS\nRefr.store - AI-powered credit card comparison platform`
    const result = parseResumeText(resume)
    expect(result.projects![0].name).toBe('Refr.store')
    expect(result.projects![0].description).toContain('AI-powered')
  })

  it('detects sentence periods correctly — "Built it. Then deployed." is a description', () => {
    // "Built it." ends with period on 3+ word line → sentence, not a project name fragment
    const resume = `Jane Smith\n\nPROJECTS\nMyProject - A cool project\nBuilt the backend. Then deployed to AWS.`
    const result = parseResumeText(resume)
    // Long lines with sentence periods become description, not a new project
    expect(result.projects![0].name).toBe('MyProject')
  })

  it('handles multiple projects correctly', () => {
    const resume = `Jane Smith\n\nPROJECTS\nProjectA - Description of A\nProjectB - Description of B`
    const result = parseResumeText(resume)
    expect(result.projects!).toHaveLength(2)
    expect(result.projects![0].name).toBe('ProjectA')
    expect(result.projects![1].name).toBe('ProjectB')
  })
})

// ─── splitTitleCompany ────────────────────────────────────────────────────────

describe('title/company splitting (via experience parsing)', () => {
  it('splits on pipe: "Software Engineer | Google | Mountain View"', () => {
    const resume = `Jane Smith\n\nEXPERIENCE\nSoftware Engineer | Google | Mountain View  Jan 2024 - Present`
    const result = parseResumeText(resume)
    expect(result.experience[0].title).toBe('Software Engineer')
    expect(result.experience[0].company).toBe('Google')
  })

  it('splits on comma when right side looks like a company', () => {
    const resume = `Jane Smith\n\nEXPERIENCE\nSoftware Engineer, Google Inc  Jan 2024 - Present`
    const result = parseResumeText(resume)
    expect(result.experience[0].title).toBe('Software Engineer')
    expect(result.experience[0].company).toBe('Google Inc')
  })

  it('splits on "@": "Research Assistant @ Virginia Tech"', () => {
    const resume = `Jane Smith\n\nEXPERIENCE\nResearch Assistant @ Virginia Tech  Aug 2023 - May 2024`
    const result = parseResumeText(resume)
    expect(result.experience[0].title).toBe('Research Assistant')
    expect(result.experience[0].company).toBe('Virginia Tech')
  })
})

// ─── Full resume round-trip ───────────────────────────────────────────────────

describe('full resume parsing', () => {
  const SAMPLE_RESUME = `Jane Smith
jane@example.com | (555) 123-4567 | linkedin.com/in/jane | Arlington, VA

EDUCATION
Virginia Tech | BS in Computer Science | Expected May 2026
GPA: 3.9/4.0

EXPERIENCE
Software Engineering Intern | Google | Mountain View, CA  Jun 2024 - Aug 2024
– Reduced API latency by 35% using caching strategies
– Shipped 3 features to production serving 1M+ users

Research Assistant @ Virginia Tech  Jan 2024 - May 2024
- Analyzed NLP datasets with Python and pandas

PROJECTS
– Refr.store
– Built full-stack app with Next.js and Supabase

WeatherBot - Real-time weather dashboard using React and OpenWeatherMap API

TECHNICAL SKILLS
Languages: Python (NumPy, pandas), JavaScript, Java
Frameworks: React, Next.js, Node.js
Tools: Git, Docker, PostgreSQL`

  it('extracts all top-level fields', () => {
    const result = parseResumeText(SAMPLE_RESUME)
    expect(result.fullName).toBe('Jane Smith')
    expect(result.email).toBe('jane@example.com')
    expect(result.linkedin).toBe('linkedin.com/in/jane')
  })

  it('parses both experience entries', () => {
    const result = parseResumeText(SAMPLE_RESUME)
    expect(result.experience).toHaveLength(2)
    expect(result.experience[0].company).toBe('Google')
    expect(result.experience[1].company).toBe('Virginia Tech')
  })

  it('en-dash bullets become experience bullets, not new entries', () => {
    const result = parseResumeText(SAMPLE_RESUME)
    expect(result.experience[0].bullets).toHaveLength(2)
    expect(result.experience[0].bullets[0]).toContain('latency')
  })

  it('Refr.store becomes a project name via en-dash bullet', () => {
    const result = parseResumeText(SAMPLE_RESUME)
    const names = result.projects!.map(p => p.name)
    expect(names).toContain('Refr.store')
  })

  it('parses skills with nested parens correctly', () => {
    const result = parseResumeText(SAMPLE_RESUME)
    expect(result.skills).toContain('Python (NumPy, pandas)')
    expect(result.skills).toContain('JavaScript')
    expect(result.skills).toContain('React')
  })

  it('extracts GPA', () => {
    const result = parseResumeText(SAMPLE_RESUME)
    expect(result.education[0].gpa).toBe('3.9')
  })
})
