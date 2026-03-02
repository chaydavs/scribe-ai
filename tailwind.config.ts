import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
      },
      fontFamily: {
        sans: ['Futura', 'Futura-Medium', 'Century Gothic', 'CenturyGothic', 'AppleGothic', 'sans-serif'],
      },
      animation: {
        'score-pulse': 'score-pulse 2s ease-in-out infinite',
        'card-enter': 'card-enter 0.3s ease-out both',
        'progress-fill': 'progress-fill 1s ease-out both',
        'fade-in': 'fade-in 0.2s ease-out both',
        'reveal-up': 'reveal-up 0.5s ease-out both',
        'reveal-fade': 'reveal-fade 0.5s ease-out both',
        'cursor-blink': 'cursor-blink 0.8s step-end infinite',
        'toast-enter': 'toast-enter 0.3s ease-out both',
        'toast-exit': 'toast-exit 0.25s ease-in both',
        'score-count': 'score-count 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        'score-burst': 'score-burst 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
        'tab-enter': 'tab-enter 0.25s ease-out both',
        'skeleton-shimmer': 'skeleton-shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        'score-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99, 102, 241, 0.3)' },
          '50%': { boxShadow: '0 0 20px 8px rgba(99, 102, 241, 0.15)' },
        },
        'card-enter': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'progress-fill': {
          from: { width: '0%' },
          to: { width: 'var(--target-width, 100%)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'reveal-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'reveal-fade': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'cursor-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'toast-enter': {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'toast-exit': {
          from: { opacity: '1', transform: 'translateX(0)' },
          to: { opacity: '0', transform: 'translateX(100%)' },
        },
        'score-count': {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '60%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'skeleton-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'score-burst': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '40%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'tab-enter': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}

export default config
