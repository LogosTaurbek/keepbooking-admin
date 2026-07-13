import { apiFetch } from './client'
import type { RestaurantAnalyticsDto } from './types'

export function getRestaurantAnalytics(restaurantId: number, from: string, to: string): Promise<RestaurantAnalyticsDto> {
  const params = new URLSearchParams({ from, to })
  return apiFetch<RestaurantAnalyticsDto>(`/api/v1/restaurants/${restaurantId}/analytics?${params}`)
}
