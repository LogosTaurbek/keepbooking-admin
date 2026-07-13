import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as reviewsApi from '../api/reviews'
import { ApiError } from '../api/client'
import type { ReviewDto } from '../api/types'

function stars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString()
}

export function RestaurantReviewsPage() {
  const { id } = useParams<{ id: string }>()
  const restaurantId = Number(id)

  const [reviews, setReviews] = useState<ReviewDto[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [replyingId, setReplyingId] = useState<number | null>(null)

  function load() {
    reviewsApi
      .getRestaurantReviewsForOwner(restaurantId)
      .then((res) => setReviews(res.content))
      .catch((err) => setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to load reviews') : 'Failed to load reviews'))
  }

  useEffect(load, [restaurantId])

  return (
    <div>
      <Link to="/restaurants" className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700">
        ← Back to restaurants
      </Link>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Reviews</h1>

      {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {reviews === null ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="mb-1 flex items-center justify-between">
                <div>
                  <span className="text-amber-500">{stars(review.rating)}</span>
                  <span className="ml-2 text-sm font-medium text-gray-900">{review.userName}</span>
                </div>
                <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
              </div>
              {review.comment && <p className="mb-3 text-sm text-gray-700">{review.comment}</p>}

              {review.ownerReply ? (
                <div className="rounded-md bg-gray-50 p-3">
                  <p className="mb-1 text-xs font-medium text-gray-500">
                    Your reply {review.ownerReplyAt && `· ${formatDate(review.ownerReplyAt)}`}
                  </p>
                  <p className="text-sm text-gray-700">{review.ownerReply}</p>
                </div>
              ) : replyingId === review.id ? (
                <ReplyForm
                  onCancel={() => setReplyingId(null)}
                  onSave={async (reply) => {
                    await reviewsApi.replyToReview(review.id, reply)
                    setReplyingId(null)
                    load()
                  }}
                />
              ) : (
                <button onClick={() => setReplyingId(review.id)} className="text-sm text-blue-600 hover:underline">
                  Reply
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ReplyForm({ onSave, onCancel }: { onSave: (reply: string) => Promise<void>; onCancel: () => void }) {
  const [reply, setReply] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await onSave(reply)
    } catch (err) {
      setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to save reply') : 'Failed to save reply')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {error && <div className="text-xs text-red-700">{error}</div>}
      <textarea
        required
        rows={2}
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Write a reply…"
        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-gray-900 px-3 py-1 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Save reply
        </button>
        <button type="button" onClick={onCancel} className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100">
          Cancel
        </button>
      </div>
    </form>
  )
}
