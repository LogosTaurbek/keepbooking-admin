import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as bookingsApi from '../api/bookings'
import { ApiError } from '../api/client'
import type { BookingDto, BookingStatus } from '../api/types'

// Mirrors BookingStatus.canTransitionTo() in the backend - keep in sync by hand.
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: [],
  NO_SHOW: [],
}

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
  COMPLETED: 'bg-green-100 text-green-800',
  NO_SHOW: 'bg-orange-100 text-orange-800',
}

const ACTION_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Reset to pending',
  CONFIRMED: 'Confirm',
  REJECTED: 'Reject',
  CANCELLED: 'Cancel',
  COMPLETED: 'Mark completed',
  NO_SHOW: 'Mark no-show',
}

export function RestaurantBookingsPage() {
  const { id } = useParams<{ id: string }>()
  const restaurantId = Number(id)

  const [bookings, setBookings] = useState<BookingDto[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [actioningId, setActioningId] = useState<number | null>(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const load = useCallback(
    (fromDate?: string, toDate?: string) => {
      bookingsApi
        .getRestaurantBookings(restaurantId, { from: fromDate, to: toDate })
        .then((res) => setBookings(res.content))
        .catch((err) => setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to load') : 'Failed to load'))
    },
    [restaurantId],
  )

  useEffect(() => load(), [load])

  function handleFilterSubmit(e: FormEvent) {
    e.preventDefault()
    load(from || undefined, to || undefined)
  }

  function handleClearFilter() {
    setFrom('')
    setTo('')
    load()
  }

  async function handleTransition(booking: BookingDto, status: BookingStatus) {
    setError(null)
    setActioningId(booking.id)
    try {
      const cancelReason = status === 'REJECTED' || status === 'CANCELLED' ? 'Changed by manager' : undefined
      await bookingsApi.updateBookingStatus(booking.id, status, cancelReason)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to update booking') : 'Failed to update booking')
    } finally {
      setActioningId(null)
    }
  }

  return (
    <div>
      <Link to="/restaurants" className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700">
        ← Back to restaurants
      </Link>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Bookings</h1>

      <form onSubmit={handleFilterSubmit} className="mb-4 flex items-end gap-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Apply
        </button>
        {(from || to) && (
          <button
            type="button"
            onClick={handleClearFilter}
            className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Clear
          </button>
        )}
      </form>

      {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {bookings === null ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-gray-500">No bookings in this range.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Table</th>
                <th className="px-4 py-2">Guests</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-2">{b.bookingDate}</td>
                  <td className="px-4 py-2">
                    {b.timeFrom.slice(0, 5)}–{b.timeTo.slice(0, 5)}
                  </td>
                  <td className="px-4 py-2">{b.tableNumber}</td>
                  <td className="px-4 py-2">{b.guestCount}</td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[b.status]}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      {ALLOWED_TRANSITIONS[b.status].map((next) => (
                        <button
                          key={next}
                          disabled={actioningId === b.id}
                          onClick={() => handleTransition(b, next)}
                          className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          {ACTION_LABELS[next]}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
