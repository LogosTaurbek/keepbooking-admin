import { apiFetch } from './client'
import type { TokenResponse } from './types'

export function login(email: string, password: string): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  })
}

export function register(
  firstname: string,
  lastname: string,
  email: string,
  password: string,
): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: { firstname, lastname, email, password },
    auth: false,
  })
}

export function logout(): Promise<void> {
  return apiFetch<void>('/api/v1/auth/logout', { method: 'POST' })
}
