import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as restaurantsApi from '../api/restaurants'
import { ApiError } from '../api/client'
import type { UserProfileDto } from '../api/types'

export function RestaurantTeamPage() {
  const { id } = useParams<{ id: string }>()
  const restaurantId = Number(id)

  const [admins, setAdmins] = useState<UserProfileDto[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [revokingId, setRevokingId] = useState<number | null>(null)

  function load() {
    restaurantsApi
      .getRestaurantAdmins(restaurantId)
      .then(setAdmins)
      .catch((err) => setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to load team') : 'Failed to load team'))
  }

  useEffect(load, [restaurantId])

  async function handleRevoke(userId: number) {
    if (!confirm('Revoke this admin\'s access to the restaurant?')) return
    setRevokingId(userId)
    try {
      await restaurantsApi.revokeRestaurantAdmin(restaurantId, userId)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to revoke admin') : 'Failed to revoke admin')
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <div>
      <Link to="/restaurants" className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700">
        ← Back to restaurants
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Team</h1>
        {!adding && (
          <button onClick={() => setAdding(true)} className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">
            Add admin
          </button>
        )}
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {adding && (
        <div className="mb-6">
          <AssignAdminForm
            onCancel={() => setAdding(false)}
            onSave={async (email) => {
              await restaurantsApi.assignRestaurantAdmin(restaurantId, email)
              setAdding(false)
              load()
            }}
          />
        </div>
      )}

      {admins === null ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : admins.length === 0 ? (
        <p className="text-sm text-gray-500">No admins assigned to this restaurant yet - only you (via your company) manage it.</p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {admins.map((admin) => (
            <li key={admin.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {admin.firstname} {admin.lastname}
                </p>
                <p className="text-xs text-gray-500">{admin.email}</p>
              </div>
              <button
                onClick={() => handleRevoke(admin.id)}
                disabled={revokingId === admin.id}
                className="text-sm text-red-600 hover:underline disabled:opacity-50"
              >
                {revokingId === admin.id ? 'Revoking…' : 'Revoke'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AssignAdminForm({ onSave, onCancel }: { onSave: (email: string) => Promise<void>; onCancel: () => void }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await onSave(email)
    } catch (err) {
      setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to assign admin') : 'Failed to assign admin')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 rounded-lg border border-gray-200 bg-white p-5">
      {error && <div className="w-full text-xs text-red-700">{error}</div>}
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-gray-700">
          Email of an already-registered user
        </label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="manager@example.com"
          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <button type="submit" disabled={submitting} className="rounded-md bg-gray-900 px-3 py-1 text-sm text-white hover:bg-gray-800 disabled:opacity-50">
        Assign
      </button>
      <button type="button" onClick={onCancel} className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100">
        Cancel
      </button>
    </form>
  )
}
