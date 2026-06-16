import { Link } from 'react-router-dom'
import { UserMenu } from './UserMenu'

export function Header() {
  return (
    <header className="relative flex h-12 shrink-0 items-center justify-between border-b border-border/60 bg-white px-5 dark:bg-background">
      <Link to="/" className="flex items-center gap-2">
        <img
          src="/logo.png"
          alt=""
          className="size-7 rounded-lg"
          aria-hidden
        />
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          Calva
        </span>
      </Link>
      <UserMenu />
    </header>
  )
}
