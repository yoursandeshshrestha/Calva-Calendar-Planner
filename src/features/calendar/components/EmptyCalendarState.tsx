import { Link2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface EmptyCalendarStateProps {
  needsReLogin: boolean
  connecting: boolean
  onSignOut: () => void
  onConnect: () => Promise<void>
}

export function EmptyCalendarState({
  needsReLogin,
  connecting,
  onSignOut,
  onConnect,
}: EmptyCalendarStateProps) {
  const handleConnect = async () => {
    try {
      await onConnect()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to connect account')
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
        <Link2 className="size-8 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-xl font-semibold">No calendar connected yet</h2>
        <p className="mt-1 max-w-md text-muted-foreground">
          {needsReLogin
            ? 'Sign out and sign in again to grant calendar access.'
            : 'Your account is syncing. If this persists, try signing in again.'}
        </p>
      </div>
      <div className="flex gap-2">
        {needsReLogin && (
          <Button className="cursor-pointer" onClick={() => onSignOut()}>
            Sign out & sign in again
          </Button>
        )}
        <Button
          variant="outline"
          className="cursor-pointer"
          disabled={connecting}
          onClick={handleConnect}
        >
          {connecting ? <Loader2 className="size-4 animate-spin" /> : 'Connect account'}
        </Button>
      </div>
    </div>
  )
}
