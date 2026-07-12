import { apiFetch } from './client'
import type { CreateRestaurantRequest, RestaurantDto, UpdateRestaurantRequest } from './types'

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
