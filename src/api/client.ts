import type { ProblemDetail, TokenResponse } from './types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const ACCESS_TOKEN_KEY = 'keepbooking_access_token'
const REFRESH_TOKEN_KEY = 'keepbooking_refresh_token'

export class ApiError extends Error {
  readonly status: number
  readonly problem: ProblemDetail | null

  constructor(status: number, problem: ProblemDetail | null) {
    super(problem?.detail ?? `Request failed with status ${status}`)
    this.status = status
    this.problem = problem
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setTokens(tokens: TokenResponse): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null
}

// Concurrent 401s during the same refresh attempt share one in-flight refresh call instead of
// each independently hammering /auth/refresh (which would race to rotate the same refresh token).
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  if (!refreshToken) {
    throw new ApiError(401, null)
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) {
          clearTokens()
          throw new ApiError(res.status, null)
        }
        const tokens: TokenResponse = await res.json()
        setTokens(tokens)
        return tokens.accessToken
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

interface RequestOptions {
  method?: string
  body?: unknown
  auth?: boolean
}

/**
 * On a 401 from an authenticated call, transparently refreshes the access token once and
 * retries - a caller only ever sees a final ApiError if the refresh token itself is invalid.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options

  const doFetch = async (): Promise<Response> => {
    const isFormData = body instanceof FormData
    // For FormData, let the browser set Content-Type itself (it needs to add the multipart boundary).
    const headers: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' }
    if (auth) {
      const token = getAccessToken()
      if (token) headers.Authorization = `Bearer ${token}`
    }
    return fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    })
  }

  let res = await doFetch()

  if (res.status === 401 && auth && getAccessToken() !== null) {
    try {
      await refreshAccessToken()
      res = await doFetch()
    } catch {
      clearTokens()
      window.location.assign('/login')
      throw new ApiError(401, null)
    }
  }

  if (!res.ok) {
    const problem = await res.json().catch(() => null)
    if (res.status === 401) {
      clearTokens()
      window.location.assign('/login')
    }
    throw new ApiError(res.status, problem)
  }

  if (res.status === 204) {
    return undefined as T
  }
  return res.json()
}
