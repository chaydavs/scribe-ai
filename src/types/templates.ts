// Resume template types

export interface ResumeTemplate {
  id: string
  name: string
  description: string
  preview_image_url: string
  style: TemplateStyle
  is_premium: boolean
  credit_cost: number
  created_at: string
}

export type TemplateStyle =
  | 'modern-minimal'      // Clean, lots of whitespace
  | 'classic-professional' // Traditional corporate style
  | 'tech-focused'        // Emphasis on skills/tech stack
  | 'creative-bold'       // Colorful, unique layout
  | 'executive'           // Senior/leadership focused

export interface ParsedResume {
  fullName: string
  email?: string
  phone?: string
  linkedin?: string
  location?: string
  summary?: string
  experience: ExperienceEntry[]
  education: EducationEntry[]
  skills: string[]
  certifications?: string[]
  projects?: ProjectEntry[]
}

export interface ExperienceEntry {
  title: string
  company: string
  location?: string
  startDate: string
  endDate: string
  bullets: string[]
}

export interface EducationEntry {
  degree: string
  school: string
  location?: string
  graduationDate: string
  gpa?: string
  honors?: string[]
}

export interface ProjectEntry {
  name: string
  description: string
  technologies?: string[]
  link?: string
}

export interface ResumeExport {
  id: string
  user_id: string
  analysis_id: string
  template_id: string
  export_url?: string
  credits_used: number
  created_at: string
}

// Template metadata for the picker UI
export interface TemplatePreview {
  id: string
  name: string
  description: string
  previewUrl: string
  style: TemplateStyle
  isPremium: boolean
  creditCost: number
  tags: string[]
}

// Available templates (hardcoded for now, can move to DB later)
export const AVAILABLE_TEMPLATES: TemplatePreview[] = [
  {
    id: 'modern-minimal-1',
    name: 'Clean Modern',
    description: 'Minimalist design with clean lines. Perfect for tech roles.',
    previewUrl: '/templates/modern-minimal.png',
    style: 'modern-minimal',
    isPremium: false,
    creditCost: 10,
    tags: ['tech', 'startup', 'modern']
  },
  {
    id: 'classic-professional-1',
    name: 'Executive Classic',
    description: 'Traditional professional layout. Ideal for corporate positions.',
    previewUrl: '/templates/classic-professional.png',
    style: 'classic-professional',
    isPremium: false,
    creditCost: 10,
    tags: ['corporate', 'finance', 'consulting']
  },
  {
    id: 'tech-focused-1',
    name: 'Tech Stack',
    description: 'Skills-first layout with prominent tech stack display.',
    previewUrl: '/templates/tech-focused.png',
    style: 'tech-focused',
    isPremium: true,
    creditCost: 15,
    tags: ['developer', 'engineer', 'technical']
  },
  {
    id: 'creative-bold-1',
    name: 'Creative Bold',
    description: 'Stand out with a unique, eye-catching design.',
    previewUrl: '/templates/creative-bold.png',
    style: 'creative-bold',
    isPremium: true,
    creditCost: 15,
    tags: ['design', 'marketing', 'creative']
  },
  {
    id: 'executive-1',
    name: 'Senior Executive',
    description: 'Refined layout for leadership and C-suite positions.',
    previewUrl: '/templates/executive.png',
    style: 'executive',
    isPremium: true,
    creditCost: 20,
    tags: ['executive', 'leadership', 'director']
  }
]
