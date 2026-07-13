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

export interface HallDto {
  id: number
  restaurantId: number
  name: string
  floor: number | null
  canvasWidth: number | null
  canvasHeight: number | null
}

export interface CreateHallRequest {
  restaurantId: number
  name: string
  floor?: number
  canvasWidth?: number
  canvasHeight?: number
}

export type UpdateHallRequest = Partial<Omit<CreateHallRequest, 'restaurantId'>>

export type TableType = 'REGULAR' | 'SOFA' | 'VIP' | 'BAR' | 'TERRACE'
export type TableStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'

export interface TableDto {
  id: number
  hallId: number
  number: string
  capacity: number
  minCapacity: number | null
  shape: string
  type: TableType
  posX: number
  posY: number
  width: number
  height: number
  rotation: number
  isVip: boolean
  isSofa: boolean
  nearWindow: boolean
  hasSocket: boolean
  isSmoking: boolean
  status: TableStatus
}

export interface CreateTableRequest {
  hallId: number
  number: string
  capacity: number
  minCapacity?: number
  type?: TableType
  isVip?: boolean
  isSofa?: boolean
  nearWindow?: boolean
  hasSocket?: boolean
  isSmoking?: boolean
}

export type UpdateTableRequest = Partial<Omit<CreateTableRequest, 'hallId'>> & { status?: TableStatus }

export interface MenuItemDto {
  id: number
  restaurantId: number
  name: string
  description: string | null
  price: number
  category: string | null
  photoUrl: string | null
  isAvailable: boolean
  position: number
}

export interface CreateMenuItemRequest {
  restaurantId: number
  name: string
  description?: string
  price: number
  category?: string
  photoUrl?: string
  position?: number
}

export type UpdateMenuItemRequest = Partial<Omit<CreateMenuItemRequest, 'restaurantId'>> & { isAvailable?: boolean }

// dayOfWeek: 1=Monday .. 7=Sunday (java.time.DayOfWeek convention, no string enum on the backend).
export interface WorkingHoursDto {
  id: number
  restaurantId: number
  dayOfWeek: number
  openTime: string | null
  closeTime: string | null
  isDayOff: boolean
}

export interface UpsertWorkingHoursDayRequest {
  openTime?: string | null
  closeTime?: string | null
  isDayOff?: boolean
}

export interface WorkingHoursOverrideDto {
  id: number
  restaurantId: number
  date: string
  openTime: string | null
  closeTime: string | null
  isClosed: boolean
}

export interface UpsertWorkingHoursOverrideRequest {
  date: string
  openTime?: string | null
  closeTime?: string | null
  isClosed?: boolean
}

export interface HourCountDto {
  hour: number
  count: number
}

export interface TableCountDto {
  tableId: number
  tableNumber: string
  count: number
}

// Range-summed totals only - no daily time series and no revenue data on the backend yet.
export interface RestaurantAnalyticsDto {
  restaurantId: number
  from: string
  to: string
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  rejectedBookings: number
  cancelledBookings: number
  completedBookings: number
  noShowBookings: number
  confirmationRate: number
  uniqueGuests: number
  popularHours: HourCountDto[]
  popularTables: TableCountDto[]
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
