import { ParsedResume, TemplateStyle, ProjectEntry } from '@/types/templates'
import { generateModernMinimalLatex } from './templates/modern-minimal'
import { generateClassicProfessionalLatex } from './templates/classic-professional'
import { generateTechFocusedLatex } from './templates/tech-focused'
import { generateCreativeBoldLatex } from './templates/creative-bold'
import { generateExecutiveLatex } from './templates/executive'

/**
 * Date pattern: matches "Mon YYYY", "Month YYYY", "YYYY", "Present", "Current"
 */
const MONTHS = 'Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?'
const DATE_TOKEN = `(?:(?:Expected\\s+)?(?:${MONTHS})\\s+\\d{4}|\\d{4}|Present|Current)`
const DATE_RANGE_RE = new RegExp(`(${DATE_TOKEN})\\s*[-–—]\\s*(${DATE_TOKEN})`, 'i')
const SINGLE_DATE_RE = new RegExp(`(${DATE_TOKEN})`, 'i')

/**
 * Extract a date range from a line.
 * Returns the text before the date and the parsed start/end dates.
 */
function extractDateRange(line: string): { text: string; startDate: string; endDate: string } | null {
  const rangeMatch = line.match(DATE_RANGE_RE)
  if (rangeMatch) {
    const text = line.slice(0, rangeMatch.index).replace(/[\s|,]+$/, '').trim()
    return { text, startDate: rangeMatch[1].trim(), endDate: rangeMatch[2].trim() }
  }
  const singleMatch = line.match(SINGLE_DATE_RE)
  if (singleMatch) {
    const text = line.slice(0, singleMatch.index).replace(/[\s|,]+$/, '').trim()
    return { text, startDate: singleMatch[1].trim(), endDate: '' }
  }
  return null
}

/**
 * Check if a line is ONLY a date range with no other meaningful content.
 * e.g. "Jan 2025 - Present" or "Aug 2024 – May 2025"
 */
function isDateOnlyLine(line: string): boolean {
  const dateInfo = extractDateRange(line)
  if (!dateInfo) return false
  // If the text before the date is empty or very short (just punctuation), it's date-only
  return dateInfo.text.length < 3
}

/**
 * Split a title/company string using various separator patterns.
 * Handles: "Title | Company", "Title, Company", "Title @ Company"
 * Dates should already be stripped.
 */
function splitTitleCompany(text: string): { title: string; company: string; location: string } {
  let title = '', company = '', location = ''

  // Handle "@ Organization" pattern (e.g. "Research Assistant, NLP (GrayUR) @ Virginia Tech")
  const atParts = text.split(/\s*@\s*/)
  if (atParts.length >= 2) {
    const left = atParts[0].trim()
    const right = atParts.slice(1).join(' @ ').trim()
    // Left side may have "Title, Company" or just "Title"
    const pipeParts = left.split(/\s*\|\s*/)
    if (pipeParts.length >= 2) {
      title = pipeParts[0].trim()
      company = pipeParts.slice(1).join(' | ').trim()
      location = right
    } else {
      const commaParts = left.split(/,\s*/)
      if (commaParts.length >= 2) {
        title = commaParts[0].trim()
        company = commaParts.slice(1).join(', ').trim()
      } else {
        title = left
      }
      // Use @ part as company if no company yet, otherwise as location
      if (!company) {
        company = right
      } else {
        location = right
      }
    }
    return { title, company, location }
  }

  // Handle pipe separator "Title | Company | Location"
  const pipeParts = text.split(/\s*\|\s*/)
  if (pipeParts.length >= 3) {
    title = pipeParts[0].trim()
    company = pipeParts[1].trim()
    location = pipeParts.slice(2).join(' | ').trim()
    return { title, company, location }
  }
  if (pipeParts.length === 2) {
    title = pipeParts[0].trim()
    company = pipeParts[1].trim()
    return { title, company, location }
  }

  // Handle comma separator "Title, Company"
  // Be careful: don't split on commas inside parentheses
  const commaIdx = text.search(/,\s*(?![^(]*\))/)
  if (commaIdx > 0) {
    title = text.slice(0, commaIdx).trim()
    company = text.slice(commaIdx + 1).trim()
    return { title, company, location }
  }

  return { title: text.trim(), company: '', location: '' }
}

/**
 * Split skills text respecting parentheses.
 * "Python (NumPy, scikit-learn), Java, SQL" → ["Python (NumPy, scikit-learn)", "Java", "SQL"]
 */
function splitSkills(text: string): string[] {
  const results: string[] = []
  let current = ''
  let depth = 0
  for (const ch of text) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if ((ch === ',' || ch === ';') && depth === 0) {
      const trimmed = current.trim()
      if (trimmed) results.push(trimmed)
      current = ''
    } else {
      current += ch
    }
  }
  const trimmed = current.trim()
  if (trimmed) results.push(trimmed)
  return results
}

// Section header patterns
const SECTION_HEADERS: Record<string, string[]> = {
  summary: ['SUMMARY', 'PROFESSIONAL SUMMARY', 'OBJECTIVE', 'PROFILE'],
  experience: ['EXPERIENCE', 'PROFESSIONAL EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT', 'RESEARCH & WORK EXPERIENCE', 'RESEARCH EXPERIENCE', 'WORK HISTORY'],
  education: ['EDUCATION', 'ACADEMIC BACKGROUND', 'ACADEMICS'],
  skills: ['SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES', 'TECHNOLOGIES', 'TECH STACK'],
  projects: ['PROJECTS', 'SELECTED PROJECTS', 'PERSONAL PROJECTS', 'KEY PROJECTS'],
  certifications: ['CERTIFICATIONS', 'CERTIFICATES', 'LICENSES', 'CREDENTIALS'],
  leadership: ['LEADERSHIP', 'LEADERSHIP & ACTIVITIES', 'ACTIVITIES', 'EXTRACURRICULAR'],
  coursework: ['COURSEWORK', 'RELEVANT COURSEWORK']
}

function detectSection(line: string): string {
  const upper = line.toUpperCase().replace(/[^A-Z\s&]/g, '').trim()
  for (const [section, headers] of Object.entries(SECTION_HEADERS)) {
    if (headers.some(h => upper === h || upper.startsWith(h))) {
      return section
    }
  }
  return ''
}

function isBullet(line: string): boolean {
  return /^[-•*]\s/.test(line)
}

/**
 * Parse a rewritten resume text into structured data.
 *
 * STRATEGY: Never discard content. If a line can't be classified as a
 * structured field, attach it to the nearest entry as a bullet or description
 * rather than silently dropping it.
 */
export function parseResumeText(resumeText: string): ParsedResume {
  const lines = resumeText.split('\n').map(l => l.trim())

  const resume: ParsedResume = {
    fullName: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  }

  let currentSection = ''
  let currentExperience: ParsedResume['experience'][0] | null = null
  let currentEducation: ParsedResume['education'][0] | null = null
  let currentProject: ProjectEntry | null = null

  const saveCurrentEntries = () => {
    if (currentExperience) {
      resume.experience.push(currentExperience)
      currentExperience = null
    }
    if (currentEducation) {
      resume.education.push(currentEducation)
      currentEducation = null
    }
    if (currentProject) {
      resume.projects!.push(currentProject)
      currentProject = null
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue

    // ── Section headers ──
    const section = detectSection(line)
    if (section) {
      saveCurrentEntries()
      currentSection = section
      continue
    }

    // ── Header area (name + contact) ──
    if (!currentSection) {
      if (!resume.fullName && !line.includes('|') && !line.includes('@')) {
        resume.fullName = line
        continue
      }
      if (line.includes('|') || line.includes('@')) {
        const parts = line.split(/\s*\|\s*/)
        for (const part of parts) {
          const t = part.trim()
          if (t.includes('@') && t.includes('.') && !resume.email) {
            resume.email = t
          } else if (t.match(/\+?\d[\d\s\-().]{8,}/)) {
            resume.phone = t
          } else if (t.toLowerCase().includes('linkedin') || t.includes('linkedin.com')) {
            resume.linkedin = t
          } else if (t.toLowerCase().includes('github') || t.includes('github.com')) {
            // skip
          } else if (t.match(/^[A-Za-z\s,]+$/) && t.length < 50 && !resume.location) {
            resume.location = t
          }
        }
        continue
      }
      continue
    }

    // ── Summary ──
    if (currentSection === 'summary') {
      resume.summary = (resume.summary || '') + ' ' + line
      resume.summary = resume.summary.trim()
      continue
    }

    // ── Experience ──
    if (currentSection === 'experience') {
      if (isBullet(line)) {
        if (currentExperience) {
          currentExperience.bullets.push(line.replace(/^[-•*]\s*/, '').trim())
        }
        continue
      }

      // Check: is this line ONLY a date? (from formatResumeForExport format)
      // If so, attach dates to the previous experience entry that has no dates
      if (isDateOnlyLine(line) && currentExperience && !currentExperience.startDate) {
        const dateInfo = extractDateRange(line)!
        currentExperience.startDate = dateInfo.startDate
        currentExperience.endDate = dateInfo.endDate
        continue
      }

      // Try to detect if this is a new job header
      const dateInfo = extractDateRange(line)
      const hasDate = !!dateInfo
      const hasPipe = line.includes('|')
      const hasAt = line.includes('@') && !line.includes('@') // @ as separator, not email
      const looksLikeHeader = hasPipe || (hasDate && !isBullet(line))

      // Also detect: line with @ that's not an email
      const hasAtSeparator = /\s@\s/.test(line) && !line.includes('@.')

      if (looksLikeHeader || hasAtSeparator) {
        // Save previous entry
        if (currentExperience) {
          resume.experience.push(currentExperience)
        }

        let title = '', company = '', location = '', startDate = '', endDate = ''

        if (dateInfo) {
          startDate = dateInfo.startDate
          endDate = dateInfo.endDate
          const parsed = splitTitleCompany(dateInfo.text)
          title = parsed.title
          company = parsed.company
          location = parsed.location
        } else {
          const parsed = splitTitleCompany(line)
          title = parsed.title
          company = parsed.company
          location = parsed.location
        }

        currentExperience = { title, company, location, startDate, endDate, bullets: [] }
      } else if (currentExperience && line.length > 0) {
        // Non-bullet, non-header line → add as bullet to preserve content
        currentExperience.bullets.push(line)
      } else if (!currentExperience && line.length > 0) {
        // No current experience but we have a line → create entry from it
        currentExperience = { title: line, company: '', startDate: '', endDate: '', bullets: [] }
      }
      continue
    }

    // ── Education ──
    if (currentSection === 'education') {
      if (isBullet(line)) continue

      // Check if this is a detail line for current education (GPA, minor, coursework)
      const dateInfo = extractDateRange(line)
      const hasPipe = line.includes('|')
      const isNewEntry = hasPipe || (dateInfo && !currentEducation)

      // If we have a current education and this line has no pipe and no date,
      // or it's a GPA/minor/coursework line, treat as detail
      if (currentEducation && !hasPipe && !dateInfo) {
        // GPA line
        if (/gpa/i.test(line) && !currentEducation.gpa) {
          const gpaMatch = line.match(/gpa[:\s]*([0-9.]+)/i)
          if (gpaMatch) currentEducation.gpa = gpaMatch[1]
        }
        // Minor/honors
        if (/minor|honors|dean|magna|summa|cum laude|coursework/i.test(line)) {
          if (!currentEducation.honors) currentEducation.honors = []
          currentEducation.honors.push(line)
        }
        continue
      }

      // Date-only line for current education
      if (currentEducation && !currentEducation.graduationDate && dateInfo && !hasPipe) {
        currentEducation.graduationDate = dateInfo.endDate || dateInfo.startDate
        continue
      }

      // New education entry
      if (currentEducation) {
        resume.education.push(currentEducation)
      }

      let degree = '', school = '', graduationDate = ''
      const textWithoutDate = dateInfo ? dateInfo.text : line
      if (dateInfo) {
        graduationDate = dateInfo.endDate || dateInfo.startDate
      }

      // Split by pipe
      const parts = textWithoutDate.split(/\s*\|\s*/).filter(Boolean)

      if (parts.length >= 2) {
        // Detect which part is school (contains university/college/tech/institute)
        const schoolKw = /university|college|institute|school|tech(?!nol)|academy/i
        const schoolIdx = parts.findIndex(p => schoolKw.test(p))
        if (schoolIdx >= 0) {
          school = parts[schoolIdx].trim()
          degree = parts.filter((_, idx) => idx !== schoolIdx).join(', ').trim()
        } else {
          // Assume first is school, second is degree
          school = parts[0].trim()
          degree = parts.slice(1).join(', ').trim()
        }
      } else if (parts.length === 1) {
        // Single text — check if it contains school keywords
        const schoolKw = /university|college|institute|school|tech(?!nol)|academy/i
        if (schoolKw.test(parts[0])) {
          school = parts[0].trim()
        } else {
          degree = parts[0].trim()
        }
      }

      // Extract and remove GPA from degree/school to prevent duplication
      const gpaInDegree = degree.match(/\s*\|?\s*gpa[:\s]*([0-9.]+)/i)
      const gpaInSchool = school.match(/\s*\|?\s*gpa[:\s]*([0-9.]+)/i)
      let gpa = ''
      if (gpaInDegree) {
        gpa = gpaInDegree[1]
        degree = degree.replace(gpaInDegree[0], '').trim()
      } else if (gpaInSchool) {
        gpa = gpaInSchool[1]
        school = school.replace(gpaInSchool[0], '').trim()
      }

      currentEducation = { degree, school, graduationDate, gpa: gpa || undefined }
      continue
    }

    // ── Skills ──
    if (currentSection === 'skills') {
      if (line.includes(':')) {
        const colonIdx = line.indexOf(':')
        const skillsPart = line.slice(colonIdx + 1).trim()
        if (skillsPart) {
          resume.skills.push(...splitSkills(skillsPart))
        }
      } else {
        resume.skills.push(...splitSkills(line))
      }
      continue
    }

    // ── Projects ──
    if (currentSection === 'projects') {
      if (isBullet(line)) {
        if (currentProject) {
          currentProject.description += ' ' + line.replace(/^[-•*]\s*/, '').trim()
        }
        continue
      }

      // Project separator: use em dash (—) or colon (:) only, NOT regular hyphen
      // This prevents "Refr.store - AI Credit Card Platform" from splitting on the hyphen
      const emDashMatch = line.match(/^(.+?)\s*[—]\s*(.+)$/)
      const colonMatch = !emDashMatch ? line.match(/^([^:]+?):\s*(.+)$/) : null
      const match = emDashMatch || colonMatch

      if (match) {
        if (currentProject) {
          resume.projects!.push(currentProject)
        }
        currentProject = {
          name: match[1].trim(),
          description: match[2].trim()
        }
      } else if (line.length > 0) {
        // Check if this looks like a new project name (short, no sentence structure)
        // vs a continuation of the previous project description
        if (!currentProject || (line.length < 80 && !line.includes('.') && !line.includes(','))) {
          // Likely a new project name
          if (currentProject) {
            resume.projects!.push(currentProject)
          }
          currentProject = { name: line, description: '' }
        } else {
          // Continuation of description
          currentProject.description += ' ' + line
        }
      }
      continue
    }

    // ── Certifications ──
    if (currentSection === 'certifications') {
      if (line.length > 0) {
        resume.certifications!.push(line.replace(/^[-•*]\s*/, '').trim())
      }
      continue
    }

    // ── Leadership / Other sections → store as experience-like entries ──
    if (currentSection === 'leadership') {
      // Treat leadership entries similar to experience
      if (isBullet(line)) {
        if (currentExperience) {
          currentExperience.bullets.push(line.replace(/^[-•*]\s*/, '').trim())
        }
        continue
      }
      const dateInfo = extractDateRange(line)
      if (dateInfo || line.includes('|') || /\s@\s/.test(line)) {
        if (currentExperience) {
          resume.experience.push(currentExperience)
        }
        const startDate = dateInfo?.startDate || ''
        const endDate = dateInfo?.endDate || ''
        const parsed = splitTitleCompany(dateInfo?.text || line)
        currentExperience = { title: parsed.title, company: parsed.company, location: parsed.location, startDate, endDate, bullets: [] }
      } else if (currentExperience) {
        currentExperience.bullets.push(line)
      }
      continue
    }
  }

  // Save final entries
  saveCurrentEntries()

  // Dedupe skills
  resume.skills = Array.from(new Set(resume.skills))

  return resume
}

/**
 * Generate LaTeX from parsed resume using specified template
 */
export function generateLatex(resume: ParsedResume, templateStyle: TemplateStyle): string {
  switch (templateStyle) {
    case 'modern-minimal':
      return generateModernMinimalLatex(resume)
    case 'classic-professional':
      return generateClassicProfessionalLatex(resume)
    case 'tech-focused':
      return generateTechFocusedLatex(resume)
    case 'creative-bold':
      return generateCreativeBoldLatex(resume)
    case 'executive':
      return generateExecutiveLatex(resume)
    default:
      return generateModernMinimalLatex(resume)
  }
}

/**
 * Main function: Convert resume text to LaTeX
 */
export function convertResumeToLatex(resumeText: string, templateStyle: TemplateStyle): string {
  const parsedResume = parseResumeText(resumeText)
  return generateLatex(parsedResume, templateStyle)
}
