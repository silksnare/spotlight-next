import type { Metadata } from 'next'
import './globals.css'
import FloatingNav from '@/components/FloatingNav'

export const metadata: Metadata = {
  title: 'Spotlight - Video Competition Platform',
  description: 'A secure, web-based video competition platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        {children}
        <FloatingNav />
      </body>
    </html>
  )
}
