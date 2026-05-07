import type { PropsWithChildren } from 'react'
import Footer from '@/components/Footer'

export function PageShell({ children }: PropsWithChildren) {
  return (
    <div className="flex w-full flex-1 flex-col">
      <main className="flex w-full flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  )
}