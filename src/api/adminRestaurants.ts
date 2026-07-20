import { apiFetch } from './client'
import type { PageResponse, RejectRestaurantRequest, RestaurantDto } from './types'

export function getRestaurantsByStatus(
  status: RestaurantDto['status'],
  page = 0,
  size = 50,
): Promise<PageResponse<RestaurantDto>> {
  return apiFetch<PageResponse<RestaurantDto>>(`/api/v1/admin/restaurants?status=${status}&page=${page}&size=${size}`)
}

export function approveRestaurant(id: number): Promise<RestaurantDto> {
  return apiFetch<RestaurantDto>(`/api/v1/admin/restaurants/${id}/approve`, { method: 'PATCH' })
}

export function rejectRestaurant(id: number, reason: string): Promise<RestaurantDto> {
  const body: RejectRestaurantRequest = { reason }
  return apiFetch<RestaurantDto>(`/api/v1/admin/restaurants/${id}/reject`, { method: 'PATCH', body })
}

export function blockRestaurant(id: number): Promise<RestaurantDto> {
  return apiFetch<RestaurantDto>(`/api/v1/admin/restaurants/${id}/block`, { method: 'PATCH' })
}
