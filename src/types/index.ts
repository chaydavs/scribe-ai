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
    description: 'AI-powered resume analysis and optimization',
    creditCost: 5,
    icon: '📄',
    href: '/resumeradar',
  },
  {
    id: 'coldcraft',
    name: 'ColdCraft',
    description: 'Personalized cold emails that convert',
    creditCost: 3,
    icon: '✉️',
    href: '/coldcraft',
  },
  {
    id: 'grantgpt',
    name: 'GrantGPT',
    description: 'AI-powered grant proposal writing',
    creditCost: 6,
    icon: '💰',
    href: '/grantgpt',
  },
  {
    id: 'linkedinwriter',
    name: 'LinkedIn Writer',
    description: 'Viral LinkedIn posts that build your brand',
    creditCost: 2,
    icon: '💼',
    href: '/linkedinwriter',
  },
  {
    id: 'notiontemplate',
    name: 'Notion Templates',
    description: 'Sellable Notion templates for passive income',
    creditCost: 6,
    icon: '📦',
    href: '/notiontemplate',
  },
]

export function getTool(id: string): Tool | undefined {
  return tools.find(tool => tool.id === id)
}
