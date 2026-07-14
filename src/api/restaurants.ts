import { apiFetch } from './client'
import type { AssignAdminRequest, CreateRestaurantRequest, RestaurantDto, UpdateRestaurantRequest, UserProfileDto } from './types'

export function getMyRestaurants(): Promise<RestaurantDto[]> {
  return apiFetch<RestaurantDto[]>('/api/v1/restaurants/my')
}

export function getRestaurant(id: number): Promise<RestaurantDto> {
  return apiFetch<RestaurantDto>(`/api/v1/restaurants/${id}`)
}

export function createRestaurant(request: CreateRestaurantRequest): Promise<RestaurantDto> {
  return apiFetch<RestaurantDto>('/api/v1/restaurants', { method: 'POST', body: request })
}

export function updateRestaurant(id: number, request: UpdateRestaurantRequest): Promise<RestaurantDto> {
  return apiFetch<RestaurantDto>(`/api/v1/restaurants/${id}`, { method: 'PATCH', body: request })
}

export function getRestaurantAdmins(restaurantId: number): Promise<UserProfileDto[]> {
  return apiFetch<UserProfileDto[]>(`/api/v1/restaurants/${restaurantId}/admins`)
}

export function assignRestaurantAdmin(restaurantId: number, email: string): Promise<UserProfileDto> {
  const body: AssignAdminRequest = { email }
  return apiFetch<UserProfileDto>(`/api/v1/restaurants/${restaurantId}/admins`, { method: 'POST', body })
}

export function revokeRestaurantAdmin(restaurantId: number, userId: number): Promise<void> {
  return apiFetch<void>(`/api/v1/restaurants/${restaurantId}/admins/${userId}`, { method: 'DELETE' })
}
