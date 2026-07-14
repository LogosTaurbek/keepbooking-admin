import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import * as companiesApi from '../api/companies'
import * as restaurantsApi from '../api/restaurants'
import type { CompanyDto, RestaurantDto } from '../api/types'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'

const STATUS_STYLES: Record<RestaurantDto['status'], string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING_MODERATION: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  HIDDEN: 'bg-gray-100 text-gray-500',
  BLOCKED: 'bg-red-100 text-red-800',
}

export function RestaurantsListPage() {
  const { profile } = useAuth()
  const [companies, setCompanies] = useState<CompanyDto[] | null>(null)
  const [restaurants, setRestaurants] = useState<RestaurantDto[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (profile?.role === 'ROLE_SUPER_ADMIN') return
    Promise.all([companiesApi.getMyCompanies(), restaurantsApi.getMyRestaurants()])
      .then(([c, r]) => {
        setCompanies(c)
        setRestaurants(r)
      })
      .catch((err) => setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to load') : 'Failed to load'))
  }, [profile])

  // SUPER_ADMIN has no company/restaurant of their own - their home is the onboarding console.
  if (profile?.role === 'ROLE_SUPER_ADMIN') {
    return <Navigate to="/admin/companies" replace />
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>
  if (companies === null || restaurants === null) return <p className="text-sm text-gray-500">Loading…</p>

  // A restaurant can't be created without an owning company - onboard that first.
  if (companies.length === 0) {
    return <CreateCompanyForm onCreated={(c) => setCompanies([c])} />
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Restaurants</h1>
        {profile?.role === 'ROLE_COMPANY_ADMIN' && (
          <Link
            to="/restaurants/new"
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            New restaurant
          </Link>
        )}
      </div>

      {restaurants.length === 0 ? (
        <p className="text-sm text-gray-500">No restaurants yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {restaurants.map((r) => (
            <li key={r.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <Link to={`/restaurants/${r.id}/edit`} className="flex-1">
                <p className="text-sm font-medium text-gray-900">{r.name}</p>
                <p className="text-xs text-gray-500">{r.address || 'No address set'}</p>
              </Link>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[r.status]}`}>
                  {r.status}
                </span>
                <Link to={`/restaurants/${r.id}/photos`} className="text-sm text-blue-600 hover:underline">
                  Photos
                </Link>
                <Link to={`/restaurants/${r.id}/hours`} className="text-sm text-blue-600 hover:underline">
                  Hours
                </Link>
                <Link to={`/restaurants/${r.id}/menu`} className="text-sm text-blue-600 hover:underline">
                  Menu
                </Link>
                <Link to={`/restaurants/${r.id}/halls`} className="text-sm text-blue-600 hover:underline">
                  Halls
                </Link>
                <Link to={`/restaurants/${r.id}/bookings`} className="text-sm text-blue-600 hover:underline">
                  Bookings
                </Link>
                <Link to={`/restaurants/${r.id}/analytics`} className="text-sm text-blue-600 hover:underline">
                  Analytics
                </Link>
                <Link to={`/restaurants/${r.id}/reviews`} className="text-sm text-blue-600 hover:underline">
                  Reviews
                </Link>
                {profile?.role === 'ROLE_COMPANY_ADMIN' && (
                  <Link to={`/restaurants/${r.id}/team`} className="text-sm text-blue-600 hover:underline">
                    Team
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CreateCompanyForm({ onCreated }: { onCreated: (company: CompanyDto) => void }) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const company = await companiesApi.createCompany({ name })
      onCreated(company)
    } catch (err) {
      setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to create company') : 'Failed to create company')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6">
      <h1 className="mb-1 text-lg font-semibold text-gray-900">Register your company</h1>
      <p className="mb-4 text-sm text-gray-500">A restaurant belongs to a company - create one first.</p>

      {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit}>
        <label className="mb-1 block text-sm font-medium text-gray-700">Company name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? 'Creating…' : 'Create company'}
        </button>
      </form>
    </div>
  )
}
