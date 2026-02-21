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
    id: 'resumelab',
    name: 'ResumeLab',
    description: 'AI-powered resume analysis, creation, and optimization',
    creditCost: 5,
    icon: '📄',
    href: '/resumelab',
  },
]

export function getTool(id: string): Tool | undefined {
  return tools.find(tool => tool.id === id)
}
