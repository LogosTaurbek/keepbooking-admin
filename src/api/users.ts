import { apiFetch } from './client'
import type { UserProfileDto } from './types'

export function getMyProfile(): Promise<UserProfileDto> {
  return apiFetch<UserProfileDto>('/api/v1/users/me')
}
