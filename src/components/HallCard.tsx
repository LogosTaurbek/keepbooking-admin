import { useEffect, useState, type FormEvent } from 'react'
import * as hallsApi from '../api/halls'
import * as tablesApi from '../api/tables'
import { ApiError } from '../api/client'
import type { HallDto, TableDto, TableType } from '../api/types'

const TABLE_TYPES: TableType[] = ['REGULAR', 'SOFA', 'VIP', 'BAR', 'TERRACE']

interface Props {
  hall: HallDto
  onChanged: () => void
}

export function HallCard({ hall, onChanged }: Props) {
  const [tables, setTables] = useState<TableDto[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingHall, setEditingHall] = useState(false)
  const [addingTable, setAddingTable] = useState(false)
  const [editingTableId, setEditingTableId] = useState<number | null>(null)

  function loadTables() {
    tablesApi
      .getTablesByHall(hall.id)
      .then(setTables)
      .catch((err) => setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to load tables') : 'Failed to load tables'))
  }

  useEffect(loadTables, [hall.id])

  async function handleDeleteHall() {
    if (!confirm(`Delete hall "${hall.name}"? This also removes its tables.`)) return
    try {
      await hallsApi.deleteHall(hall.id)
      onChanged()
    } catch (err) {
      setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to delete hall') : 'Failed to delete hall')
    }
  }

  async function handleDeleteTable(tableId: number) {
    if (!confirm('Delete this table?')) return
    try {
      await tablesApi.deleteTable(tableId)
      loadTables()
    } catch (err) {
      setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to delete table') : 'Failed to delete table')
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        {editingHall ? (
          <HallForm
            initial={hall}
            onCancel={() => setEditingHall(false)}
            onSave={async (values) => {
              await hallsApi.updateHall(hall.id, values)
              setEditingHall(false)
              onChanged()
            }}
          />
        ) : (
          <>
            <div>
              <h2 className="text-base font-semibold text-gray-900">{hall.name}</h2>
              <p className="text-xs text-gray-500">Floor {hall.floor ?? '—'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditingHall(true)} className="text-sm text-blue-600 hover:underline">
                Edit
              </button>
              <button onClick={handleDeleteHall} className="text-sm text-red-600 hover:underline">
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      {error && <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {tables === null ? (
        <p className="text-sm text-gray-500">Loading tables…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="text-left text-xs font-medium uppercase text-gray-500">
              <tr>
                <th className="py-1.5 pr-4">Number</th>
                <th className="py-1.5 pr-4">Capacity</th>
                <th className="py-1.5 pr-4">Type</th>
                <th className="py-1.5 pr-4">Status</th>
                <th className="py-1.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tables.map((t) =>
                editingTableId === t.id ? (
                  <tr key={t.id}>
                    <td colSpan={5} className="py-2">
                      <TableForm
                        initial={t}
                        onCancel={() => setEditingTableId(null)}
                        onSave={async (values) => {
                          await tablesApi.updateTable(t.id, values)
                          setEditingTableId(null)
                          loadTables()
                        }}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={t.id}>
                    <td className="py-1.5 pr-4 font-medium text-gray-900">{t.number}</td>
                    <td className="py-1.5 pr-4">
                      {t.capacity}
                      {t.minCapacity ? ` (min ${t.minCapacity})` : ''}
                    </td>
                    <td className="py-1.5 pr-4">{t.type}</td>
                    <td className="py-1.5 pr-4">{t.status}</td>
                    <td className="py-1.5">
                      <button onClick={() => setEditingTableId(t.id)} className="mr-3 text-blue-600 hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteTable(t.id)} className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}

      {addingTable ? (
        <div className="mt-3">
          <TableForm
            onCancel={() => setAddingTable(false)}
            onSave={async (values) => {
              await tablesApi.createTable({ hallId: hall.id, number: values.number!, capacity: values.capacity!, ...values })
              setAddingTable(false)
              loadTables()
            }}
          />
        </div>
      ) : (
        <button onClick={() => setAddingTable(true)} className="mt-3 text-sm text-blue-600 hover:underline">
          + Add table
        </button>
      )}
    </div>
  )
}

function HallForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<HallDto>
  onSave: (values: { name?: string; floor?: number; canvasWidth?: number; canvasHeight?: number }) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [floor, setFloor] = useState(initial?.floor?.toString() ?? '1')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await onSave({ name, floor: floor ? Number(floor) : undefined })
    } catch (err) {
      setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to save') : 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 items-end gap-2">
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
        Save
      </button>
      <button type="button" onClick={onCancel} className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100">
        Cancel
      </button>
    </form>
  )
}

interface TableFormValues {
  number?: string
  capacity?: number
  minCapacity?: number
  type?: TableType
  isVip?: boolean
  isSofa?: boolean
  nearWindow?: boolean
  hasSocket?: boolean
  isSmoking?: boolean
}

function TableForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: TableDto
  onSave: (values: TableFormValues) => Promise<void>
  onCancel: () => void
}) {
  const [number, setNumber] = useState(initial?.number ?? '')
  const [capacity, setCapacity] = useState(initial?.capacity?.toString() ?? '2')
  const [minCapacity, setMinCapacity] = useState(initial?.minCapacity?.toString() ?? '')
  const [type, setType] = useState<TableType>(initial?.type ?? 'REGULAR')
  const [isVip, setIsVip] = useState(initial?.isVip ?? false)
  const [nearWindow, setNearWindow] = useState(initial?.nearWindow ?? false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await onSave({
        number,
        capacity: Number(capacity),
        minCapacity: minCapacity ? Number(minCapacity) : undefined,
        type,
        isVip,
        nearWindow,
      })
    } catch (err) {
      setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to save') : 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 rounded-md bg-gray-50 p-3">
      {error && <div className="w-full text-xs text-red-700">{error}</div>}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">Number</label>
        <input
          required
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">Capacity</label>
        <input
          required
          type="number"
          min={1}
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">Min guests</label>
        <input
          type="number"
          min={1}
          value={minCapacity}
          onChange={(e) => setMinCapacity(e.target.value)}
          className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as TableType)}
          className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
        >
          {TABLE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-1 text-xs text-gray-700">
        <input type="checkbox" checked={isVip} onChange={(e) => setIsVip(e.target.checked)} />
        VIP
      </label>
      <label className="flex items-center gap-1 text-xs text-gray-700">
        <input type="checkbox" checked={nearWindow} onChange={(e) => setNearWindow(e.target.checked)} />
        Near window
      </label>
      <button type="submit" disabled={submitting} className="rounded-md bg-gray-900 px-3 py-1 text-sm text-white hover:bg-gray-800 disabled:opacity-50">
        Save
      </button>
      <button type="button" onClick={onCancel} className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100">
        Cancel
      </button>
    </form>
  )
}
