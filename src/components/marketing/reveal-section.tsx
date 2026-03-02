'use client'

import React from 'react'
import { useIntersectionObserver } from '@/hooks/use-intersection-observer'

interface RevealSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  animation?: 'up' | 'fade'
}

export function RevealSection({
  children,
  className = '',
  delay = 0,
  animation = 'up',
}: RevealSectionProps) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 })

  const animationClass = animation === 'up' ? 'animate-reveal-up' : 'animate-reveal-fade'

  return (
    <div
      ref={ref}
      className={`${className} ${
        isVisible ? animationClass : 'opacity-0 translate-y-6'
      }`}
      style={isVisible && delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
