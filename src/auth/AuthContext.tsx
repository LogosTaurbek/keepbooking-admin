import { useCallback, useEffect, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import { clearTokens, isAuthenticated as hasTokens, setTokens } from '../api/client'
import * as usersApi from '../api/users'
import type { UserProfileDto } from '../api/types'
import { AuthContext } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(hasTokens())
  const [profile, setProfile] = useState<UserProfileDto | null>(null)

  const refreshProfile = useCallback(async () => {
    if (!hasTokens()) {
      setProfile(null)
      return
    }
    const p = await usersApi.getMyProfile()
    setProfile(p)
  }, [])

  useEffect(() => {
    if (isAuthenticated) refreshProfile()
  }, [isAuthenticated, refreshProfile])

  async function login(email: string, password: string) {
    const tokens = await authApi.login(email, password)
    setTokens(tokens)
    setIsAuthenticated(true)
  }

  function logout() {
    // Best-effort - the user is logged out locally regardless of whether the revoke call succeeds.
    authApi.logout().catch(() => {})
    clearTokens()
    setIsAuthenticated(false)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, profile, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
