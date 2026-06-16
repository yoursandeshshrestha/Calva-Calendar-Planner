import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { GoogleIcon } from './components/GoogleIcon'
import { LoginBackgroundArtifacts } from './components/LoginBackgroundArtifacts'
import { LoginHero } from './components/LoginHero'

export function LoginPage() {
  const { signInWithGoogle } = useAuth()
  const [signingIn, setSigningIn] = useState(false)

  const handleGoogleSignIn = async () => {
    setSigningIn(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to sign in')
      setSigningIn(false)
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#f4f4f5]">
      <LoginBackgroundArtifacts />
      <LoginHero />

      <div className="relative z-[1] flex w-full flex-col items-center justify-center px-6 py-12 sm:px-10 lg:w-[60%] lg:shrink-0">
        <div className="relative z-10 w-full max-w-[380px]">
          <div className="mb-8 space-y-3 text-center lg:text-left">
            <h1 className="text-[2rem] leading-tight font-bold tracking-tight text-zinc-900 sm:text-[2.25rem]">
              Plan your days.
              <br />
              Own your{' '}
              <span className="text-[#7340DC]">time.</span>
            </h1>
            <p className="text-[15px] leading-relaxed text-zinc-500">
              Calendar planner for a more organized, productive you.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              type="button"
              disabled={signingIn}
              onClick={handleGoogleSignIn}
              className="h-12 w-full cursor-pointer rounded-xl bg-[#6835D0] text-[15px] font-medium text-white shadow-sm hover:bg-[#5628B8]"
            >
              {signingIn ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  <GoogleIcon />
                  Continue with Google
                </>
              )}
            </Button>

            <p className="text-center text-xs leading-relaxed text-zinc-400 lg:text-left">
              Sign in with Google to connect your calendars and see every meeting in one place.
            </p>

            <p className="text-center text-xs leading-relaxed text-zinc-400 lg:text-left">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="font-medium text-zinc-500 underline-offset-2 hover:text-[#6835D0] hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="font-medium text-zinc-500 underline-offset-2 hover:text-[#6835D0] hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
