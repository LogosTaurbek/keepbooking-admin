// Mirrors backend DTOs (see KeepBooking backend/src/main/java/com/keepbooking/**/dto).
// Keep in sync by hand for now - no shared schema/codegen between the two repos yet.

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export interface CompanyDto {
  id: number
  name: string
  description: string | null
  logoUrl: string | null
  website: string | null
  phone: string | null
  email: string | null
  status: 'PENDING_MODERATION' | 'ACTIVE' | 'BLOCKED'
}

export interface CreateCompanyRequest {
  name: string
  description?: string
  website?: string
  phone?: string
  email?: string
}

export interface RestaurantDto {
  id: number
  companyId: number
  name: string
  description: string | null
  address: string | null
  cityId: number | null
  cityName: string | null
  latitude: number | null
  longitude: number | null
  timezone: string
  rating: number
  reviewsCount: number
  avgCheck: number | null
  status: 'DRAFT' | 'PENDING_MODERATION' | 'ACTIVE' | 'HIDDEN' | 'BLOCKED'
  cuisineSlugs: string[]
}

export interface CreateRestaurantRequest {
  companyId: number
  name: string
  description?: string
  address?: string
  cityId?: number
  latitude?: number
  longitude?: number
  timezone?: string
  avgCheck?: number
  cuisineIds?: number[]
}

export type UpdateRestaurantRequest = Partial<Omit<CreateRestaurantRequest, 'companyId'>>

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'

export interface BookingDto {
  id: number
  restaurantId: number
  restaurantName: string
  tableId: number
  tableNumber: string
  userId: number
  bookingDate: string
  timeFrom: string
  timeTo: string
  guestCount: number
  comment: string | null
  status: BookingStatus
  source: string
  cancelReason: string | null
  createdAt: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus
  cancelReason?: string
}

// RFC 7807 Problem Details (see backend's ProblemDetail/GlobalExceptionHandler).
export interface ProblemDetail {
  type: string
  code: string
  status: number
  title: string
  detail: string
  instance: string
  traceId: string
  timestamp: string
  errors: { field: string; message: string }[] | null
}
