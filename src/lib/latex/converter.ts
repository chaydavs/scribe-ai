import { ParsedResume, TemplateStyle, ProjectEntry } from '@/types/templates'
import { generateModernMinimalLatex } from './templates/modern-minimal'
import { generateClassicProfessionalLatex } from './templates/classic-professional'
import { generateTechFocusedLatex } from './templates/tech-focused'
import { generateCreativeBoldLatex } from './templates/creative-bold'
import { generateExecutiveLatex } from './templates/executive'

/**
 * Parse a rewritten resume text into structured data
 * Handles multiple section header variations
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

  // Section header patterns
  const sectionHeaders: { [key: string]: string[] } = {
    summary: ['SUMMARY', 'PROFESSIONAL SUMMARY', 'OBJECTIVE', 'PROFILE'],
    experience: ['EXPERIENCE', 'PROFESSIONAL EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT', 'RESEARCH & WORK EXPERIENCE', 'WORK HISTORY'],
    education: ['EDUCATION', 'ACADEMIC BACKGROUND', 'ACADEMICS'],
    skills: ['SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES', 'TECHNOLOGIES', 'TECH STACK'],
    projects: ['PROJECTS', 'SELECTED PROJECTS', 'PERSONAL PROJECTS', 'KEY PROJECTS'],
    certifications: ['CERTIFICATIONS', 'CERTIFICATES', 'LICENSES', 'CREDENTIALS'],
    leadership: ['LEADERSHIP', 'LEADERSHIP & ACTIVITIES', 'ACTIVITIES', 'EXTRACURRICULAR'],
    coursework: ['COURSEWORK', 'RELEVANT COURSEWORK']
  }

  const detectSection = (line: string): string => {
    const upper = line.toUpperCase().replace(/[^A-Z\s&]/g, '').trim()
    for (const [section, headers] of Object.entries(sectionHeaders)) {
      if (headers.some(h => upper === h || upper.startsWith(h))) {
        return section
      }
    }
    return ''
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue

    // Check for section headers
    const detectedSection = detectSection(line)
    if (detectedSection) {
      // Save current entries before switching sections
      if (currentExperience && currentExperience.bullets.length > 0) {
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
      currentSection = detectedSection
      continue
    }

    // Parse header (name and contact)
    if (!currentSection) {
      if (i === 0 && !resume.fullName && !line.includes('|') && !line.includes('@')) {
        resume.fullName = line
        continue
      }
      // Contact info line
      if (line.includes('|') || line.includes('@')) {
        const parts = line.split(/\s*\|\s*/)
        for (const part of parts) {
          const trimmed = part.trim()
          if (trimmed.includes('@') && !resume.email) {
            resume.email = trimmed
          } else if (trimmed.match(/\+?\d[\d\s\-().]{8,}/)) {
            resume.phone = trimmed
          } else if (trimmed.toLowerCase().includes('linkedin') || trimmed.includes('linkedin.com')) {
            resume.linkedin = trimmed
          } else if (trimmed.toLowerCase().includes('github') || trimmed.includes('github.com')) {
            // Store in location for now, or add github field
          } else if (trimmed.match(/^[A-Za-z\s,]+$/) && trimmed.length < 50) {
            resume.location = trimmed
          }
        }
        continue
      }
    }

    // Parse summary
    if (currentSection === 'summary') {
      resume.summary = (resume.summary || '') + ' ' + line
      resume.summary = resume.summary.trim()
    }

    // Parse experience
    if (currentSection === 'experience') {
      // Check if this is a job title line (contains | or looks like a header)
      const isJobHeader = line.includes('|') && !line.startsWith('-')
      const hasDatePattern = /\d{4}|present|current/i.test(line)

      if (isJobHeader || (hasDatePattern && !line.startsWith('-'))) {
        // Save previous experience
        if (currentExperience && currentExperience.bullets.length > 0) {
          resume.experience.push(currentExperience)
        }

        // Parse job line - handle various formats
        const parts = line.split(/\s*\|\s*/)

        let title = '', company = '', startDate = '', endDate = ''

        if (parts.length >= 3) {
          title = parts[0]?.trim() || ''
          company = parts[1]?.trim() || ''
          const dateRange = parts[2]?.trim() || ''
          const dateParts = dateRange.split(/\s*[-–—]\s*/)
          startDate = dateParts[0]?.trim() || ''
          endDate = dateParts[1]?.trim() || 'Present'
        } else if (parts.length === 2) {
          // Could be "Title | Company" with date on next line or in same line
          title = parts[0]?.trim() || ''
          const secondPart = parts[1]?.trim() || ''
          if (/\d{4}/.test(secondPart)) {
            // Second part has date
            const dateParts = secondPart.split(/\s*[-–—]\s*/)
            company = ''
            startDate = dateParts[0]?.trim() || ''
            endDate = dateParts[1]?.trim() || 'Present'
          } else {
            company = secondPart
          }
        } else {
          title = line
        }

        currentExperience = {
          title,
          company,
          startDate,
          endDate,
          bullets: []
        }
      } else if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
        // Bullet point
        if (currentExperience) {
          currentExperience.bullets.push(line.replace(/^[-•*]\s*/, '').trim())
        }
      } else if (currentExperience && line.length > 0 && !line.includes('|')) {
        // Could be a continuation or additional info - add as bullet if substantial
        if (line.length > 20) {
          currentExperience.bullets.push(line)
        }
      }
    }

    // Parse education
    if (currentSection === 'education') {
      if (line.includes('|') && !line.startsWith('-')) {
        // Save previous education
        if (currentEducation) {
          resume.education.push(currentEducation)
        }

        const parts = line.split(/\s*\|\s*/)

        // Handle various formats
        let degree = '', school = '', graduationDate = '', gpa = ''

        if (parts.length >= 3) {
          // Could be "School | Degree | Date" or "Degree | School | Date"
          // Check which part looks like a date
          const dateIdx = parts.findIndex(p => /\d{4}|expected|present/i.test(p))
          if (dateIdx === 2) {
            degree = parts[0]?.trim() || ''
            school = parts[1]?.trim() || ''
            graduationDate = parts[2]?.trim() || ''
          } else if (dateIdx === 0) {
            graduationDate = parts[0]?.trim() || ''
            school = parts[1]?.trim() || ''
            degree = parts[2]?.trim() || ''
          } else {
            // Assume first is school/degree
            school = parts[0]?.trim() || ''
            degree = parts[1]?.trim() || ''
            graduationDate = parts[2]?.trim() || ''
          }
        } else if (parts.length === 2) {
          school = parts[0]?.trim() || ''
          degree = parts[1]?.trim() || ''
        }

        // Extract GPA if present
        const gpaMatch = line.match(/gpa[:\s]*([0-9.]+)/i)
        if (gpaMatch) gpa = gpaMatch[1]

        currentEducation = {
          degree,
          school,
          graduationDate,
          gpa: gpa || undefined
        }
      } else if (line.toLowerCase().includes('gpa') && currentEducation) {
        const gpaMatch = line.match(/gpa[:\s]*([0-9.]+)/i)
        if (gpaMatch) currentEducation.gpa = gpaMatch[1]
      } else if (line.toLowerCase().includes('coursework') && currentEducation) {
        // Could add coursework handling
      }
    }

    // Parse skills
    if (currentSection === 'skills') {
      // Handle "Category: skill1, skill2" format
      if (line.includes(':')) {
        const [, skillsPart] = line.split(':')
        if (skillsPart) {
          const skillList = skillsPart.split(/[,;]/).map(s => s.trim()).filter(Boolean)
          resume.skills.push(...skillList)
        }
      } else {
        // Plain comma-separated list
        const skillList = line.split(/[,;]/).map(s => s.trim()).filter(Boolean)
        resume.skills.push(...skillList)
      }
    }

    // Parse projects
    if (currentSection === 'projects') {
      if (line.includes(':') && !line.startsWith('-')) {
        // Project header: "Project Name: Description"
        if (currentProject) {
          resume.projects!.push(currentProject)
        }
        const [name, ...descParts] = line.split(':')
        currentProject = {
          name: name.trim(),
          description: descParts.join(':').trim()
        }
      } else if (line.startsWith('-') || line.startsWith('•')) {
        // Project bullet
        if (currentProject) {
          currentProject.description += ' ' + line.replace(/^[-•]\s*/, '').trim()
        }
      }
    }

    // Parse certifications
    if (currentSection === 'certifications') {
      if (line.length > 0 && !line.startsWith('-')) {
        resume.certifications!.push(line)
      }
    }
  }

  // Save final entries
  if (currentExperience && currentExperience.bullets.length > 0) {
    resume.experience.push(currentExperience)
  }
  if (currentEducation) {
    resume.education.push(currentEducation)
  }
  if (currentProject) {
    resume.projects!.push(currentProject)
  }

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
