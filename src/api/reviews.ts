import { apiFetch } from './client'
import type { PageResponse, ReplyToReviewRequest, ReviewDto } from './types'

export function getRestaurantReviewsForOwner(
  restaurantId: number,
  page = 0,
  size = 20,
): Promise<PageResponse<ReviewDto>> {
  return apiFetch<PageResponse<ReviewDto>>(
    `/api/v1/restaurants/${restaurantId}/reviews/manage?page=${page}&size=${size}`,
  )
}

export function replyToReview(reviewId: number, reply: string): Promise<ReviewDto> {
  const body: ReplyToReviewRequest = { reply }
  return apiFetch<ReviewDto>(`/api/v1/reviews/${reviewId}/reply`, { method: 'PATCH', body })
}
