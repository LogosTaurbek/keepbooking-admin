import { apiFetch } from './client'
import type { CreateHallRequest, HallDto, UpdateHallRequest } from './types'

export function getHallsByRestaurant(restaurantId: number): Promise<HallDto[]> {
  return apiFetch<HallDto[]>(`/api/v1/halls?restaurantId=${restaurantId}`)
}

export function createHall(request: CreateHallRequest): Promise<HallDto> {
  return apiFetch<HallDto>('/api/v1/halls', { method: 'POST', body: request })
}

export function updateHall(id: number, request: UpdateHallRequest): Promise<HallDto> {
  return apiFetch<HallDto>(`/api/v1/halls/${id}`, { method: 'PATCH', body: request })
}

export function deleteHall(id: number): Promise<void> {
  return apiFetch<void>(`/api/v1/halls/${id}`, { method: 'DELETE' })
}
