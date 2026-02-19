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
    description: 'AI-powered resume analysis, scoring, and optimization',
    creditCost: 5,
    icon: '📄',
    href: '/resumeradar',
  },
]

export function getTool(id: string): Tool | undefined {
  return tools.find(tool => tool.id === id)
}
