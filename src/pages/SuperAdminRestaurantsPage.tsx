import { useEffect, useState, type FormEvent } from 'react'
import * as adminRestaurantsApi from '../api/adminRestaurants'
import { ApiError } from '../api/client'
import type { RestaurantDto } from '../api/types'

const STATUS_STYLES: Record<RestaurantDto['status'], string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING_MODERATION: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  HIDDEN: 'bg-gray-100 text-gray-500',
  BLOCKED: 'bg-red-100 text-red-800',
}

const STATUS_FILTERS: RestaurantDto['status'][] = ['PENDING_MODERATION', 'DRAFT', 'ACTIVE', 'HIDDEN', 'BLOCKED']

export function SuperAdminRestaurantsPage() {
  const [status, setStatus] = useState<RestaurantDto['status']>('PENDING_MODERATION')
  const [restaurants, setRestaurants] = useState<RestaurantDto[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [actingId, setActingId] = useState<number | null>(null)

  function load() {
    setRestaurants(null)
    adminRestaurantsApi
      .getRestaurantsByStatus(status)
      .then((res) => setRestaurants(res.content))
      .catch((err) => setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to load restaurants') : 'Failed to load restaurants'))
  }

  useEffect(load, [status])

  async function handleApprove(id: number) {
    setActingId(id)
    setError(null)
    try {
      await adminRestaurantsApi.approveRestaurant(id)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to approve restaurant') : 'Failed to approve restaurant')
    } finally {
      setActingId(null)
    }
  }

  async function handleBlock(id: number) {
    if (!confirm('Block this restaurant? It will no longer be bookable.')) return
    setActingId(id)
    setError(null)
    try {
      await adminRestaurantsApi.blockRestaurant(id)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to block restaurant') : 'Failed to block restaurant')
    } finally {
      setActingId(null)
    }
  }

  async function handleReject(id: number, reason: string) {
    setActingId(id)
    setError(null)
    try {
      await adminRestaurantsApi.rejectRestaurant(id, reason)
      setRejectingId(null)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to reject restaurant') : 'Failed to reject restaurant')
    } finally {
      setActingId(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Restaurant moderation</h1>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as RestaurantDto['status'])}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {restaurants === null ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : restaurants.length === 0 ? (
        <p className="text-sm text-gray-500">No restaurants with status {status}.</p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {restaurants.map((r) => (
            <li key={r.id} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-500">
                    {r.address || 'No address set'}
                    {r.cityName ? ` · ${r.cityName}` : ''} · company #{r.companyId}
                  </p>
                  <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[r.status]}`}>
                    {r.status}
                  </span>
                  {r.status === 'HIDDEN' && r.rejectionReason && (
                    <p className="mt-1 text-xs text-gray-500">Reason: {r.rejectionReason}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {r.status !== 'ACTIVE' && (
                    <button
                      onClick={() => handleApprove(r.id)}
                      disabled={actingId === r.id}
                      className="text-sm text-green-700 hover:underline disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                  {r.status !== 'HIDDEN' && (
                    <button
                      onClick={() => setRejectingId(rejectingId === r.id ? null : r.id)}
                      disabled={actingId === r.id}
                      className="text-sm text-orange-700 hover:underline disabled:opacity-50"
                    >
                      Reject
                    </button>
                  )}
                  {r.status !== 'BLOCKED' && (
                    <button
                      onClick={() => handleBlock(r.id)}
                      disabled={actingId === r.id}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      Block
                    </button>
                  )}
                </div>
              </div>

              {rejectingId === r.id && (
                <RejectForm
                  submitting={actingId === r.id}
                  onCancel={() => setRejectingId(null)}
                  onSubmit={(reason) => handleReject(r.id, reason)}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function RejectForm({
  onSubmit,
  onCancel,
  submitting,
}: {
  onSubmit: (reason: string) => void
  onCancel: () => void
  submitting: boolean
}) {
  const [reason, setReason] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(reason)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex items-end gap-2 border-t border-gray-100 pt-3">
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-gray-700">Rejection reason</label>
        <input
          required
          maxLength={1000}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. duplicate listing, incomplete details"
          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-gray-900 px-3 py-1 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {submitting ? 'Rejecting…' : 'Confirm reject'}
      </button>
      <button type="button" onClick={onCancel} className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100">
        Cancel
      </button>
    </form>
  )
}
