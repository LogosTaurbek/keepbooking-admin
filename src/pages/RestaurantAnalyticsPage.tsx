import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as analyticsApi from '../api/analytics'
import { ApiError } from '../api/client'
import type { RestaurantAnalyticsDto } from '../api/types'

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function defaultFrom(): string {
  const d = new Date()
  d.setDate(d.getDate() - 29)
  return isoDate(d)
}

function defaultTo(): string {
  return isoDate(new Date())
}

const STAT_CARDS: { key: keyof RestaurantAnalyticsDto; label: string }[] = [
  { key: 'totalBookings', label: 'Total bookings' },
  { key: 'pendingBookings', label: 'Pending' },
  { key: 'confirmedBookings', label: 'Confirmed' },
  { key: 'completedBookings', label: 'Completed' },
  { key: 'rejectedBookings', label: 'Rejected' },
  { key: 'cancelledBookings', label: 'Cancelled' },
  { key: 'noShowBookings', label: 'No-show' },
  { key: 'uniqueGuests', label: 'Unique guests' },
]

export function RestaurantAnalyticsPage() {
  const { id } = useParams<{ id: string }>()
  const restaurantId = Number(id)

  const [from, setFrom] = useState(defaultFrom())
  const [to, setTo] = useState(defaultTo())
  const [data, setData] = useState<RestaurantAnalyticsDto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(
    (fromDate: string, toDate: string) => {
      setLoading(true)
      setError(null)
      analyticsApi
        .getRestaurantAnalytics(restaurantId, fromDate, toDate)
        .then(setData)
        .catch((err) => setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to load analytics') : 'Failed to load analytics'))
        .finally(() => setLoading(false))
    },
    [restaurantId],
  )

  useEffect(() => load(defaultFrom(), defaultTo()), [restaurantId, load])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    load(from, to)
  }

  const maxHourCount = Math.max(1, ...(data?.popularHours.map((h) => h.count) ?? [1]))
  const maxTableCount = Math.max(1, ...(data?.popularTables.map((t) => t.count) ?? [1]))

  return (
    <div>
      <Link to="/restaurants" className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700">
        ← Back to restaurants
      </Link>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Analytics</h1>

      <form onSubmit={handleSubmit} className="mb-6 flex items-end gap-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">From</label>
          <input
            required
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">To</label>
          <input
            required
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Apply'}
        </button>
      </form>

      {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {data && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STAT_CARDS.map(({ key, label }) => (
              <div key={key} className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{data[key] as number}</p>
              </div>
            ))}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-500">Confirmation rate</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{(data.confirmationRate * 100).toFixed(0)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-base font-semibold text-gray-900">Popular hours</h2>
              {data.popularHours.length === 0 ? (
                <p className="text-sm text-gray-500">No bookings in this range.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {data.popularHours.map((h) => (
                    <div key={h.hour} className="flex items-center gap-2">
                      <span className="w-12 text-xs text-gray-600">{h.hour.toString().padStart(2, '0')}:00</span>
                      <div className="h-4 flex-1 rounded bg-gray-100">
                        <div
                          className="h-4 rounded bg-blue-500"
                          style={{ width: `${(h.count / maxHourCount) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs text-gray-600">{h.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-base font-semibold text-gray-900">Popular tables</h2>
              {data.popularTables.length === 0 ? (
                <p className="text-sm text-gray-500">No bookings in this range.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {data.popularTables.map((t) => (
                    <div key={t.tableId} className="flex items-center gap-2">
                      <span className="w-12 text-xs text-gray-600">{t.tableNumber}</span>
                      <div className="h-4 flex-1 rounded bg-gray-100">
                        <div
                          className="h-4 rounded bg-blue-500"
                          style={{ width: `${(t.count / maxTableCount) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs text-gray-600">{t.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
