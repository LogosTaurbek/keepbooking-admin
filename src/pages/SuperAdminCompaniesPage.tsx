import { useEffect, useState, type FormEvent } from 'react'
import * as adminCompaniesApi from '../api/adminCompanies'
import { ApiError } from '../api/client'
import type { CompanyDto, UserProfileDto } from '../api/types'

const STATUS_STYLES: Record<CompanyDto['status'], string> = {
  PENDING_MODERATION: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  BLOCKED: 'bg-red-100 text-red-800',
}

export function SuperAdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyDto[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  function load() {
    adminCompaniesApi
      .getAllCompanies()
      .then((res) => setCompanies(res.content))
      .catch((err) => setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to load companies') : 'Failed to load companies'))
  }

  useEffect(load, [])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Companies (onboarding)</h1>
        {!creating && (
          <button onClick={() => setCreating(true)} className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">
            New company
          </button>
        )}
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {creating && (
        <div className="mb-6">
          <CreateCompanyForm
            onCancel={() => setCreating(false)}
            onSave={async (name) => {
              await adminCompaniesApi.createCompanyOnBehalf({ name })
              setCreating(false)
              load()
            }}
          />
        </div>
      )}

      {companies === null ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : companies.length === 0 ? (
        <p className="text-sm text-gray-500">No companies yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {companies.map((company) => (
            <div key={company.id} className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{company.name}</p>
                  <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[company.status]}`}>
                    {company.status}
                  </span>
                </div>
                <button
                  onClick={() => setExpandedId(expandedId === company.id ? null : company.id)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {expandedId === company.id ? 'Hide admins' : 'Manage admins'}
                </button>
              </div>

              {expandedId === company.id && <CompanyAdmins companyId={company.id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CompanyAdmins({ companyId }: { companyId: number }) {
  const [admins, setAdmins] = useState<UserProfileDto[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [revokingId, setRevokingId] = useState<number | null>(null)

  function load() {
    adminCompaniesApi
      .getCompanyAdmins(companyId)
      .then(setAdmins)
      .catch((err) => setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to load admins') : 'Failed to load admins'))
  }

  useEffect(load, [companyId])

  async function handleRevoke(userId: number) {
    if (!confirm("Revoke this admin's access to the company?")) return
    setRevokingId(userId)
    try {
      await adminCompaniesApi.revokeCompanyAdmin(companyId, userId)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to revoke admin') : 'Failed to revoke admin')
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      {error && <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}

      {admins === null ? (
        <p className="text-xs text-gray-500">Loading…</p>
      ) : admins.length === 0 ? (
        <p className="mb-3 text-xs text-gray-500">No admins attached yet.</p>
      ) : (
        <ul className="mb-3 divide-y divide-gray-100">
          {admins.map((admin) => (
            <li key={admin.id} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-gray-900">
                  {admin.firstname} {admin.lastname}
                </p>
                <p className="text-xs text-gray-500">{admin.email}</p>
              </div>
              <button
                onClick={() => handleRevoke(admin.id)}
                disabled={revokingId === admin.id}
                className="text-xs text-red-600 hover:underline disabled:opacity-50"
              >
                {revokingId === admin.id ? 'Revoking…' : 'Revoke'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <AssignAdminForm
          onCancel={() => setAdding(false)}
          onSave={async (email) => {
            await adminCompaniesApi.assignCompanyAdmin(companyId, email)
            setAdding(false)
            load()
          }}
        />
      ) : (
        <button onClick={() => setAdding(true)} className="text-sm text-blue-600 hover:underline">
          + Attach admin by email
        </button>
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
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
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
          placeholder="contact@client.com"
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

function CreateCompanyForm({ onSave, onCancel }: { onSave: (name: string) => Promise<void>; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await onSave(name)
    } catch (err) {
      setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to create company') : 'Failed to create company')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 rounded-lg border border-gray-200 bg-white p-5">
      {error && <div className="w-full text-xs text-red-700">{error}</div>}
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-gray-700">Company name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
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
