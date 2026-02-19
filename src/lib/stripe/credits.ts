export interface CreditPack {
  id: string
  name: string
  credits: number
  price: number // in cents
  description: string
  popular?: boolean
}

export const creditPacks: CreditPack[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 50,
    price: 500, // $5
    description: 'Perfect for trying out the tools',
  },
  {
    id: 'standard',
    name: 'Standard',
    credits: 120,
    price: 1000, // $10
    description: 'Best for regular use',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 300,
    price: 2000, // $20
    description: 'For power users',
  },
]

export const toolCreditCosts: Record<string, number> = {
  resumeradar: 5,
}

export function getCreditPack(id: string): CreditPack | undefined {
  return creditPacks.find(pack => pack.id === id)
}

export function getToolCreditCost(tool: string): number {
  return toolCreditCosts[tool] || 5
}
