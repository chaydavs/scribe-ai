export * from './database'

export interface Tool {
  id: string
  name: string
  description: string
  creditCost: number
  icon: string
  href: string
}

export const tools: Tool[] = [
  {
    id: 'resumeradar',
    name: 'ResumeRadar',
    description: 'AI-powered resume analysis and feedback',
    creditCost: 5,
    icon: '📄',
    href: '/resumeradar',
  },
  {
    id: 'coldcraft',
    name: 'ColdCraft',
    description: 'Generate personalized cold outreach emails',
    creditCost: 3,
    icon: '✉️',
    href: '/coldcraft',
  },
  {
    id: 'feedbackloop',
    name: 'FeedbackLoop',
    description: 'Get constructive feedback on your writing',
    creditCost: 4,
    icon: '💬',
    href: '/feedbackloop',
  },
  {
    id: 'databrief',
    name: 'DataBrief',
    description: 'Summarize and analyze documents',
    creditCost: 5,
    icon: '📊',
    href: '/databrief',
  },
  {
    id: 'grantgpt',
    name: 'GrantGPT',
    description: 'AI-assisted grant writing',
    creditCost: 6,
    icon: '📝',
    href: '/grantgpt',
  },
  {
    id: 'linkedinwriter',
    name: 'LinkedIn Writer',
    description: 'Create viral LinkedIn posts with hooks',
    creditCost: 2,
    icon: '💼',
    href: '/linkedinwriter',
  },
  {
    id: 'seooutliner',
    name: 'SEO Outliner',
    description: 'Generate full blog outlines from keywords',
    creditCost: 4,
    icon: '🔍',
    href: '/seooutliner',
  },
  {
    id: 'productdesc',
    name: 'Product Descriptions',
    description: 'E-commerce product copy that sells',
    creditCost: 2,
    icon: '🛒',
    href: '/productdesc',
  },
  {
    id: 'subjectline',
    name: 'Subject Line Tester',
    description: 'Score and improve email subject lines',
    creditCost: 1,
    icon: '📧',
    href: '/subjectline',
  },
  {
    id: 'meetingnotes',
    name: 'Meeting Notes',
    description: 'Summarize transcripts into action items',
    creditCost: 3,
    icon: '📋',
    href: '/meetingnotes',
  },
  {
    id: 'notiontemplate',
    name: 'Notion Templates',
    description: 'Generate sellable Notion templates',
    creditCost: 6,
    icon: '📦',
    href: '/notiontemplate',
  },
]

export function getTool(id: string): Tool | undefined {
  return tools.find(tool => tool.id === id)
}
