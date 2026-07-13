import { apiFetch } from './client'
import type {
  UpsertWorkingHoursDayRequest,
  UpsertWorkingHoursOverrideRequest,
  WorkingHoursDto,
  WorkingHoursOverrideDto,
} from './types'

export function getWorkingHours(restaurantId: number): Promise<WorkingHoursDto[]> {
  return apiFetch<WorkingHoursDto[]>(`/api/v1/restaurants/${restaurantId}/working-hours`)
}

export function upsertWorkingHoursDay(
  restaurantId: number,
  dayOfWeek: number,
  request: UpsertWorkingHoursDayRequest,
): Promise<WorkingHoursDto> {
  return apiFetch<WorkingHoursDto>(`/api/v1/restaurants/${restaurantId}/working-hours/${dayOfWeek}`, {
    method: 'PATCH',
    body: request,
  })
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
