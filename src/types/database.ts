export interface Profile {
  id: string
  email: string
  full_name: string | null
  credits: number
  created_at: string
  updated_at: string
}

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  type: 'purchase' | 'usage'
  tool: string | null
  stripe_session_id: string | null
  description: string | null
  created_at: string
}

export interface UsageLog {
  id: string
  user_id: string
  tool: string
  credits_used: number
  input_tokens: number | null
  output_tokens: number | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      credit_transactions: {
        Row: CreditTransaction
        Insert: Omit<CreditTransaction, 'id' | 'created_at'>
        Update: Partial<Omit<CreditTransaction, 'id' | 'created_at'>>
      }
      usage_logs: {
        Row: UsageLog
        Insert: Omit<UsageLog, 'id' | 'created_at'>
        Update: Partial<Omit<UsageLog, 'id' | 'created_at'>>
      }
    }
  }
}
