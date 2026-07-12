import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as companiesApi from '../api/companies'
import * as restaurantsApi from '../api/restaurants'
import { ApiError } from '../api/client'

export function RestaurantFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = id !== undefined
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [companyId, setCompanyId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        if (isEdit) {
          const restaurant = await restaurantsApi.getRestaurant(Number(id))
          setName(restaurant.name)
          setDescription(restaurant.description ?? '')
          setAddress(restaurant.address ?? '')
          setTimezone(restaurant.timezone)
          setCompanyId(restaurant.companyId)
        } else {
          // Getting here means RestaurantsListPage already confirmed at least one company exists.
          const companies = await companiesApi.getMyCompanies()
          setCompanyId(companies[0].id)
        }
      } catch (err) {
        setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to load') : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isEdit])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (isEdit) {
        await restaurantsApi.updateRestaurant(Number(id), { name, description, address, timezone })
      } else {
        await restaurantsApi.createRestaurant({ companyId: companyId!, name, description, address, timezone })
      }
      navigate('/restaurants')
    } catch (err) {
      setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to save') : 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Loading…</p>

  return (
    <div className="mx-auto max-w-lg rounded-lg border border-gray-200 bg-white p-6">
      <h1 className="mb-4 text-lg font-semibold text-gray-900">{isEdit ? 'Edit restaurant' : 'New restaurant'}</h1>

      {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit}>
        <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />

        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />

        <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />

        <label className="mb-1 block text-sm font-medium text-gray-700">Timezone (IANA, e.g. Asia/Almaty)</label>
        <input
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="mb-6 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/restaurants')}
            className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
