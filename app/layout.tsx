import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import FloatingNav from '@/components/FloatingNav'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        {children}
        <FloatingNav />
      </body>
    </html>
  )
}
