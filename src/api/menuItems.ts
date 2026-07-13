import { apiFetch } from './client'
import type { CreateMenuItemRequest, MenuItemDto, UpdateMenuItemRequest } from './types'

export function getMenuItemsByRestaurant(restaurantId: number): Promise<MenuItemDto[]> {
  return apiFetch<MenuItemDto[]>(`/api/v1/menu-items?restaurantId=${restaurantId}`)
}

export function createMenuItem(request: CreateMenuItemRequest): Promise<MenuItemDto> {
  return apiFetch<MenuItemDto>('/api/v1/menu-items', { method: 'POST', body: request })
}

export function updateMenuItem(id: number, request: UpdateMenuItemRequest): Promise<MenuItemDto> {
  return apiFetch<MenuItemDto>(`/api/v1/menu-items/${id}`, { method: 'PATCH', body: request })
}

export function deleteMenuItem(id: number): Promise<void> {
  return apiFetch<void>(`/api/v1/menu-items/${id}`, { method: 'DELETE' })
}
