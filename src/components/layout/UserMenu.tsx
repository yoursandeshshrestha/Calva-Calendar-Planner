import { useEffect, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { connectGoogleAccount, getConnectedAccounts } from '@/lib/api'
import type { ConnectedAccount } from '@/types/database'

export function UserMenu() {
  const { user, signOut } = useAuth()
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([])
  const [connecting, setConnecting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const userEmail = user?.email ?? ''
  const userName = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? userEmail
  const userAvatar = user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture

  useEffect(() => {
    if (!user) return
    getConnectedAccounts()
      .then(setAccounts)
      .catch(() => setAccounts([]))
  }, [user, menuOpen])

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const url = await connectGoogleAccount()
      window.location.href = url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to connect account')
      setConnecting(false)
    }
  }

  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="cursor-pointer rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar className="size-8">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="text-xs">
              {userName[0]?.toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium">{userName}</p>
          <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Connected accounts
        </DropdownMenuLabel>
        {accounts.length === 0 ? (
          <DropdownMenuItem
            className="cursor-default text-muted-foreground"
            onSelect={(e) => e.preventDefault()}
          >
            No accounts connected
          </DropdownMenuItem>
        ) : (
          accounts.map((account) => (
            <DropdownMenuItem
              key={account.id}
              className="cursor-default"
              onSelect={(e) => e.preventDefault()}
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: account.color }}
              />
              <span className="truncate">{account.google_email}</span>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          disabled={connecting}
          onClick={handleConnect}
        >
          {connecting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Connect new account
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          variant="destructive"
          onClick={() => signOut()}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
