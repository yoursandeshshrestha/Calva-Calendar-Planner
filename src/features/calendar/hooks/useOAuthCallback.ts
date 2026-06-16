import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

export function useOAuthCallback() {
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const connected = searchParams.get('connected')
    const oauthError = searchParams.get('error')

    if (connected === 'true') {
      toast.success('Google account connected successfully')
      setSearchParams({})
    } else if (oauthError) {
      toast.error(`Connection failed: ${oauthError.replace(/_/g, ' ')}`)
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])
}
