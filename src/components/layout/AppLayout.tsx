import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Header } from './Header'

interface AppLayoutProps {
  children: ReactNode
  fullBleed?: boolean
}

export function AppLayout({ children, fullBleed }: AppLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header />
      <main
        className={cn(
          'flex-1',
          fullBleed ? 'overflow-hidden' : 'overflow-y-auto p-6',
        )}
      >
        {children}
      </main>
    </div>
  )
}
