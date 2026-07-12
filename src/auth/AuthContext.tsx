import { createContext, useContext, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import { clearTokens, isAuthenticated as hasTokens, setTokens } from '../api/client'

interface AuthContextValue {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(hasTokens())

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
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
