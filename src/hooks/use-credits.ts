'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCredits() {
  const [credits, setCredits] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchCredits = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single()

      if (data) {
        setCredits(data.credits)
      }
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  const refreshCredits = useCallback(async () => {
    setLoading(true)
    await fetchCredits()
  }, [fetchCredits])

  const hasEnoughCredits = useCallback(
    (required: number) => credits >= required,
    [credits]
  )

  return {
    credits,
    loading,
    refreshCredits,
    hasEnoughCredits,
  }
}
