import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as hallsApi from '../api/halls'
import { ApiError } from '../api/client'
import { HallCard } from '../components/HallCard'
import type { HallDto } from '../api/types'

export function RestaurantHallsPage() {
  const { id } = useParams<{ id: string }>()
  const restaurantId = Number(id)

  const [halls, setHalls] = useState<HallDto[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [addingHall, setAddingHall] = useState(false)

  function load() {
    hallsApi
      .getHallsByRestaurant(restaurantId)
      .then(setHalls)
      .catch((err) => setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to load') : 'Failed to load'))
  }

  useEffect(load, [restaurantId])

  return (
    <div>
      <Link to="/restaurants" className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700">
        ← Back to restaurants
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Halls & tables</h1>
        {!addingHall && (
          <button
            onClick={() => setAddingHall(true)}
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            New hall
          </button>
        )}
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {addingHall && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
          <NewHallForm
            restaurantId={restaurantId}
            onCancel={() => setAddingHall(false)}
            onCreated={() => {
              setAddingHall(false)
              load()
            }}
          />
        </div>
      )}

      {halls === null ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : halls.length === 0 ? (
        <p className="text-sm text-gray-500">No halls yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {halls.map((h) => (
            <HallCard key={h.id} hall={h} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  )
}

function NewHallForm({
  restaurantId,
  onCreated,
  onCancel,
}: {
  restaurantId: number
  onCreated: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [floor, setFloor] = useState('1')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await hallsApi.createHall({ restaurantId, name, floor: floor ? Number(floor) : undefined })
      onCreated()
    } catch (err) {
      setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to create hall') : 'Failed to create hall')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      {error && <div className="text-xs text-red-700">{error}</div>}
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-gray-700">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="w-20">
        <label className="mb-1 block text-xs font-medium text-gray-700">Floor</label>
        <input
          type="number"
          value={floor}
          onChange={(e) => setFloor(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <button type="submit" disabled={submitting} className="rounded-md bg-gray-900 px-3 py-1 text-sm text-white hover:bg-gray-800 disabled:opacity-50">
        Create
      </button>
      <button type="button" onClick={onCancel} className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100">
        Cancel
      </button>
    </form>
  )
}
