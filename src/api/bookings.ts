import { apiFetch } from './client'
import type { BookingDto, BookingStatus, PageResponse } from './types'

export function getRestaurantBookings(
  restaurantId: number,
  options: { from?: string; to?: string; page?: number; size?: number } = {},
): Promise<PageResponse<BookingDto>> {
  const { from, to, page = 0, size = 50 } = options
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  return apiFetch<PageResponse<BookingDto>>(`/api/v1/bookings/restaurant/${restaurantId}?${params}`)
}

export function updateBookingStatus(id: number, status: BookingStatus, cancelReason?: string): Promise<BookingDto> {
  return apiFetch<BookingDto>(`/api/v1/bookings/${id}/status`, {
    method: 'PATCH',
    body: { status, cancelReason },
  })
}
