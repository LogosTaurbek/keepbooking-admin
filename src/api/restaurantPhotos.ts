import { apiFetch } from './client'
import type { RestaurantPhotoDto } from './types'

export function getRestaurantPhotos(restaurantId: number): Promise<RestaurantPhotoDto[]> {
  return apiFetch<RestaurantPhotoDto[]>(`/api/v1/restaurants/${restaurantId}/photos`)
}

export function uploadRestaurantPhoto(restaurantId: number, file: File): Promise<RestaurantPhotoDto> {
  const formData = new FormData()
  formData.append('file', file)
  return apiFetch<RestaurantPhotoDto>(`/api/v1/restaurants/${restaurantId}/photos`, {
    method: 'POST',
    body: formData,
  })
}

export function deleteRestaurantPhoto(restaurantId: number, photoId: number): Promise<void> {
  return apiFetch<void>(`/api/v1/restaurants/${restaurantId}/photos/${photoId}`, { method: 'DELETE' })
}
