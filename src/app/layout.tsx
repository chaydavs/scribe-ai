import type { Metadata } from 'next'
import { ToastProvider } from '@/components/ui/toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'ResumeLab - Fix Your Resume with AI',
  description: 'Upload your resume, see what\'s wrong with inline highlights, fix it with one click, and export as PDF. No subscription.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
