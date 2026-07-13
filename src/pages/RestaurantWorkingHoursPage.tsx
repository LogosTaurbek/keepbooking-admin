import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as workingHoursApi from '../api/workingHours'
import { ApiError } from '../api/client'
import type { WorkingHoursOverrideDto } from '../api/types'

const DAYS = [1, 2, 3, 4, 5, 6, 7]
const DAY_LABELS: Record<number, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
}

interface DayRow {
  dayOfWeek: number
  isDayOff: boolean
  openTime: string
  closeTime: string
}

function toInputTime(t: string | null): string {
  return t ? t.slice(0, 5) : ''
}

export function RestaurantWorkingHoursPage() {
  const { id } = useParams<{ id: string }>()
  const restaurantId = Number(id)

  const [rows, setRows] = useState<DayRow[] | null>(null)
  const [overrides, setOverrides] = useState<WorkingHoursOverrideDto[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savingDay, setSavingDay] = useState<number | null>(null)
  const [dayErrors, setDayErrors] = useState<Record<number, string>>({})
  const [addingOverride, setAddingOverride] = useState(false)
  const [editingOverrideDate, setEditingOverrideDate] = useState<string | null>(null)

  function load() {
    Promise.all([workingHoursApi.getWorkingHours(restaurantId), workingHoursApi.getWorkingHoursOverrides(restaurantId)])
      .then(([hours, overridesRes]) => {
        setRows(
          DAYS.map((d) => {
            const existing = hours.find((h) => h.dayOfWeek === d)
            return {
              dayOfWeek: d,
              isDayOff: existing?.isDayOff ?? true,
              openTime: toInputTime(existing?.openTime ?? null) || '09:00',
              closeTime: toInputTime(existing?.closeTime ?? null) || '18:00',
            }
          }),
        )
        setOverrides(overridesRes)
      })
      .catch((err) => setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to load') : 'Failed to load'))
  }

  useEffect(load, [restaurantId])

  function updateRow(dayOfWeek: number, patch: Partial<DayRow>) {
    setRows((prev) => (prev ? prev.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, ...patch } : r)) : prev))
  }

  async function handleSaveDay(row: DayRow) {
    setSavingDay(row.dayOfWeek)
    setDayErrors((prev) => ({ ...prev, [row.dayOfWeek]: '' }))
    try {
      await workingHoursApi.upsertWorkingHoursDay(restaurantId, row.dayOfWeek, {
        isDayOff: row.isDayOff,
        openTime: row.isDayOff ? null : `${row.openTime}:00`,
        closeTime: row.isDayOff ? null : `${row.closeTime}:00`,
      })
    } catch (err) {
      const message = err instanceof ApiError ? (err.problem?.detail ?? 'Failed to save') : 'Failed to save'
      setDayErrors((prev) => ({ ...prev, [row.dayOfWeek]: message }))
    } finally {
      setSavingDay(null)
    }
  }

  async function handleDeleteOverride(date: string) {
    if (!confirm(`Remove the override for ${date}?`)) return
    try {
      await workingHoursApi.deleteWorkingHoursOverride(restaurantId, date)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to delete override') : 'Failed to delete override')
    }
  }

  return (
    <div>
      <Link to="/restaurants" className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700">
        ← Back to restaurants
      </Link>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Working hours</h1>

      {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {rows === null ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-base font-semibold text-gray-900">Weekly schedule</h2>
          <p className="mb-3 text-xs text-gray-500">Each day saves independently — edit a day and click Save to apply just that day.</p>
          <div className="flex flex-col gap-2">
            {rows.map((row) => (
              <div key={row.dayOfWeek} className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className="w-24 text-sm text-gray-700">{DAY_LABELS[row.dayOfWeek]}</span>
                  <label className="flex items-center gap-1 text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={row.isDayOff}
                      onChange={(e) => updateRow(row.dayOfWeek, { isDayOff: e.target.checked })}
                    />
                    Closed
                  </label>
                  <input
                    type="time"
                    disabled={row.isDayOff}
                    value={row.openTime}
                    onChange={(e) => updateRow(row.dayOfWeek, { openTime: e.target.value })}
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                  />
                  <span className="text-sm text-gray-400">–</span>
                  <input
                    type="time"
                    disabled={row.isDayOff}
                    value={row.closeTime}
                    onChange={(e) => updateRow(row.dayOfWeek, { closeTime: e.target.value })}
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                  />
                  <button
                    type="button"
                    disabled={savingDay === row.dayOfWeek}
                    onClick={() => handleSaveDay(row)}
                    className="rounded-md bg-gray-900 px-3 py-1 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    {savingDay === row.dayOfWeek ? 'Saving…' : 'Save'}
                  </button>
                </div>
                {dayErrors[row.dayOfWeek] && <p className="pl-24 text-xs text-red-700">{dayErrors[row.dayOfWeek]}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Date overrides</h2>
          {!addingOverride && (
            <button onClick={() => setAddingOverride(true)} className="text-sm text-blue-600 hover:underline">
              + Add override
            </button>
          )}
        </div>

        {addingOverride && (
          <div className="mb-4">
            <OverrideForm
              onCancel={() => setAddingOverride(false)}
              onSave={async (values) => {
                await workingHoursApi.upsertWorkingHoursOverride(restaurantId, values)
                setAddingOverride(false)
                load()
              }}
            />
          </div>
        )}

        {overrides === null ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : overrides.length === 0 ? (
          <p className="text-sm text-gray-500">No overrides — the weekly schedule applies to every date.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="text-left text-xs font-medium uppercase text-gray-500">
                <tr>
                  <th className="py-1.5 pr-4">Date</th>
                  <th className="py-1.5 pr-4">Hours</th>
                  <th className="py-1.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {overrides.map((o) =>
                  editingOverrideDate === o.date ? (
                    <tr key={o.date}>
                      <td colSpan={3} className="py-2">
                        <OverrideForm
                          initial={o}
                          onCancel={() => setEditingOverrideDate(null)}
                          onSave={async (values) => {
                            await workingHoursApi.upsertWorkingHoursOverride(restaurantId, values)
                            setEditingOverrideDate(null)
                            load()
                          }}
                        />
                      </td>
                    </tr>
                  ) : (
                    <tr key={o.date}>
                      <td className="py-1.5 pr-4 font-medium text-gray-900">{o.date}</td>
                      <td className="py-1.5 pr-4">
                        {o.isClosed ? (
                          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">Closed</span>
                        ) : (
                          `${toInputTime(o.openTime)}–${toInputTime(o.closeTime)}`
                        )}
                      </td>
                      <td className="py-1.5">
                        <button
                          onClick={() => setEditingOverrideDate(o.date)}
                          className="mr-3 text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeleteOverride(o.date)} className="text-red-600 hover:underline">
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
      </div>
    </div>
  )
}

function OverrideForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: WorkingHoursOverrideDto
  onSave: (values: { date: string; openTime?: string | null; closeTime?: string | null; isClosed?: boolean }) => Promise<void>
  onCancel: () => void
}) {
  const [date, setDate] = useState(initial?.date ?? '')
  const [isClosed, setIsClosed] = useState(initial?.isClosed ?? false)
  const [openTime, setOpenTime] = useState(toInputTime(initial?.openTime ?? null) || '09:00')
  const [closeTime, setCloseTime] = useState(toInputTime(initial?.closeTime ?? null) || '18:00')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await onSave({
        date,
        isClosed,
        openTime: isClosed ? null : `${openTime}:00`,
        closeTime: isClosed ? null : `${closeTime}:00`,
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
        <label className="mb-1 block text-xs font-medium text-gray-700">Date</label>
        <input
          required
          type="date"
          disabled={!!initial}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
        />
      </div>
      <label className="flex items-center gap-1 text-xs text-gray-700">
        <input type="checkbox" checked={isClosed} onChange={(e) => setIsClosed(e.target.checked)} />
        Closed
      </label>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">Open</label>
        <input
          type="time"
          disabled={isClosed}
          value={openTime}
          onChange={(e) => setOpenTime(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">Close</label>
        <input
          type="time"
          disabled={isClosed}
          value={closeTime}
          onChange={(e) => setCloseTime(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
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
