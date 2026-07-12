import { apiFetch } from './client'
import type { BookingDto, BookingStatus, PageResponse } from './types'

export function getRestaurantBookings(restaurantId: number, page = 0, size = 50): Promise<PageResponse<BookingDto>> {
  return apiFetch<PageResponse<BookingDto>>(
    `/api/v1/bookings/restaurant/${restaurantId}?page=${page}&size=${size}`,
  )
}

export function updateBookingStatus(id: number, status: BookingStatus, cancelReason?: string): Promise<BookingDto> {
  return apiFetch<BookingDto>(`/api/v1/bookings/${id}/status`, {
    method: 'PATCH',
    body: { status, cancelReason },
  })
}
