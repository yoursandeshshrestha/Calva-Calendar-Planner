import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

interface LegalPageLayoutProps {
  title: string
  lastUpdated: string
  children: ReactNode
}

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f4f4f5]">
      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
        <Link
          to="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-[#6835D0]"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>

        <header className="mb-10 space-y-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="size-8 rounded-lg" aria-hidden />
            <span className="text-sm font-semibold tracking-tight text-zinc-900">Calva</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">{title}</h1>
          <p className="text-sm text-zinc-500">Last updated: {lastUpdated}</p>
        </header>

        <article className="space-y-8 text-[15px] leading-relaxed text-zinc-600 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h2]:not-first:mt-2 [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-4 [&_ul]:space-y-2">
          {children}
        </article>
      </div>
    </div>
  )
}
