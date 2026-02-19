import { ParsedResume, TemplateStyle } from '@/types/templates'
import { generateModernMinimalLatex } from './templates/modern-minimal'
import { generateClassicProfessionalLatex } from './templates/classic-professional'
import { generateTechFocusedLatex } from './templates/tech-focused'

/**
 * Parse a rewritten resume text into structured data
 */
export function parseResumeText(resumeText: string): ParsedResume {
  const lines = resumeText.split('\n').map(l => l.trim()).filter(Boolean)

  const resume: ParsedResume = {
    fullName: '',
    experience: [],
    education: [],
    skills: []
  }

  let currentSection = ''
  let currentExperience: ParsedResume['experience'][0] | null = null
  let currentEducation: ParsedResume['education'][0] | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const upperLine = line.toUpperCase()

    // Detect section headers
    if (upperLine === 'SUMMARY' || upperLine === 'PROFESSIONAL SUMMARY') {
      currentSection = 'summary'
      continue
    }
    if (upperLine === 'EXPERIENCE' || upperLine === 'PROFESSIONAL EXPERIENCE' || upperLine === 'WORK EXPERIENCE') {
      currentSection = 'experience'
      continue
    }
    if (upperLine === 'EDUCATION') {
      currentSection = 'education'
      continue
    }
    if (upperLine === 'SKILLS' || upperLine === 'TECHNICAL SKILLS') {
      currentSection = 'skills'
      continue
    }
    if (upperLine === 'PROJECTS') {
      currentSection = 'projects'
      continue
    }
    if (upperLine === 'CERTIFICATIONS') {
      currentSection = 'certifications'
      continue
    }

    // Parse based on current section
    if (!currentSection) {
      // Header section (name, contact)
      if (i === 0 && !resume.fullName) {
        resume.fullName = line
        continue
      }
      // Contact info line
      if (line.includes('|') || line.includes('@')) {
        const parts = line.split(/\s*\|\s*/)
        for (const part of parts) {
          if (part.includes('@')) resume.email = part.trim()
          else if (part.match(/\d{3}.*\d{3}.*\d{4}/)) resume.phone = part.trim()
          else if (part.toLowerCase().includes('linkedin')) resume.linkedin = part.trim()
          else if (part.match(/^[A-Za-z\s,]+$/)) resume.location = part.trim()
        }
        continue
      }
    }

    if (currentSection === 'summary') {
      resume.summary = (resume.summary || '') + ' ' + line
      resume.summary = resume.summary.trim()
    }

    if (currentSection === 'experience') {
      // Check if this is a job title line (contains | and dates)
      if (line.includes('|') && (line.includes('-') || line.includes('–'))) {
        // Save previous experience
        if (currentExperience) {
          resume.experience.push(currentExperience)
        }

        // Parse: JOB TITLE | Company Name | Start Date - End Date
        const parts = line.split(/\s*\|\s*/)
        const title = parts[0] || ''
        const company = parts[1] || ''
        const dateRange = parts[2] || ''

        const [startDate, endDate] = dateRange.split(/\s*[-–]\s*/)

        currentExperience = {
          title: title.trim(),
          company: company.trim(),
          startDate: startDate?.trim() || '',
          endDate: endDate?.trim() || 'Present',
          bullets: []
        }
      } else if (line.startsWith('-') || line.startsWith('•')) {
        // Bullet point
        if (currentExperience) {
          currentExperience.bullets.push(line.replace(/^[-•]\s*/, '').trim())
        }
      }
    }

    if (currentSection === 'education') {
      // Check if this is an education entry line
      if (line.includes('|')) {
        // Save previous education
        if (currentEducation) {
          resume.education.push(currentEducation)
        }

        // Parse: Degree | School Name | Graduation Year
        const parts = line.split(/\s*\|\s*/)

        currentEducation = {
          degree: parts[0]?.trim() || '',
          school: parts[1]?.trim() || '',
          graduationDate: parts[2]?.trim() || ''
        }
      } else if (line.toLowerCase().includes('gpa')) {
        if (currentEducation) {
          const gpaMatch = line.match(/gpa[:\s]*([0-9.]+)/i)
          if (gpaMatch) currentEducation.gpa = gpaMatch[1]
        }
      }
    }

    if (currentSection === 'skills') {
      // Skills can be comma-separated or on multiple lines
      const skillList = line.split(/[,;]/).map(s => s.trim()).filter(Boolean)
      resume.skills.push(...skillList)
    }
  }

  // Save last entries
  if (currentExperience) {
    resume.experience.push(currentExperience)
  }
  if (currentEducation) {
    resume.education.push(currentEducation)
  }

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
      // Fallback to modern for now
      return generateModernMinimalLatex(resume)
    case 'executive':
      // Fallback to classic for now
      return generateClassicProfessionalLatex(resume)
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
