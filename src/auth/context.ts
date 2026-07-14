import { createContext } from 'react'
import type { UserProfileDto } from '../api/types'

export interface AuthContextValue {
  isAuthenticated: boolean
  profile: UserProfileDto | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
