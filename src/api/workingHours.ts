import { apiFetch } from './client'
import type {
  UpsertWorkingHoursOverrideRequest,
  WorkingHoursDto,
  WorkingHoursItemRequest,
  WorkingHoursOverrideDto,
} from './types'

export function getWorkingHours(restaurantId: number): Promise<WorkingHoursDto[]> {
  return apiFetch<WorkingHoursDto[]>(`/api/v1/restaurants/${restaurantId}/working-hours`)
}

export function replaceWorkingHours(restaurantId: number, items: WorkingHoursItemRequest[]): Promise<WorkingHoursDto[]> {
  return apiFetch<WorkingHoursDto[]>(`/api/v1/restaurants/${restaurantId}/working-hours`, { method: 'PUT', body: items })
}

export function getWorkingHoursOverrides(restaurantId: number): Promise<WorkingHoursOverrideDto[]> {
  return apiFetch<WorkingHoursOverrideDto[]>(`/api/v1/restaurants/${restaurantId}/working-hours/overrides`)
}

export function upsertWorkingHoursOverride(
  restaurantId: number,
  request: UpsertWorkingHoursOverrideRequest,
): Promise<WorkingHoursOverrideDto> {
  return apiFetch<WorkingHoursOverrideDto>(`/api/v1/restaurants/${restaurantId}/working-hours/overrides`, {
    method: 'PUT',
    body: request,
  })
}

export function deleteWorkingHoursOverride(restaurantId: number, date: string): Promise<void> {
  return apiFetch<void>(`/api/v1/restaurants/${restaurantId}/working-hours/overrides/${date}`, { method: 'DELETE' })
}
