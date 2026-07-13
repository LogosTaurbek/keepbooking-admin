import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as menuItemsApi from '../api/menuItems'
import { ApiError } from '../api/client'
import type { MenuItemDto } from '../api/types'

const UNCATEGORIZED = 'Uncategorized'

export function RestaurantMenuPage() {
  const { id } = useParams<{ id: string }>()
  const restaurantId = Number(id)

  const [items, setItems] = useState<MenuItemDto[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [addingItem, setAddingItem] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  function load() {
    menuItemsApi
      .getMenuItemsByRestaurant(restaurantId)
      .then(setItems)
      .catch((err) => setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to load') : 'Failed to load'))
  }

  useEffect(load, [restaurantId])

  const categories = useMemo(() => {
    const distinct = Array.from(new Set((items ?? []).map((i) => i.category).filter((c): c is string => !!c)))
    return distinct.sort((a, b) => a.localeCompare(b))
  }, [items])

  const grouped = useMemo(() => {
    const groups = new Map<string, MenuItemDto[]>()
    for (const item of items ?? []) {
      const key = item.category || UNCATEGORIZED
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(item)
    }
    return Array.from(groups.entries()).sort(([a], [b]) => {
      if (a === UNCATEGORIZED) return 1
      if (b === UNCATEGORIZED) return -1
      return a.localeCompare(b)
    })
  }, [items])

  async function handleDelete(itemId: number) {
    if (!confirm('Delete this menu item?')) return
    try {
      await menuItemsApi.deleteMenuItem(itemId)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to delete item') : 'Failed to delete item')
    }
  }

  return (
    <div>
      <Link to="/restaurants" className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700">
        ← Back to restaurants
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Menu</h1>
        {!addingItem && (
          <button
            onClick={() => setAddingItem(true)}
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            New item
          </button>
        )}
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {addingItem && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
          <MenuItemForm
            categories={categories}
            onCancel={() => setAddingItem(false)}
            onSave={async (values) => {
              await menuItemsApi.createMenuItem({ restaurantId, name: values.name!, price: values.price!, ...values })
              setAddingItem(false)
              load()
            }}
          />
        </div>
      )}

      {items === null ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">No menu items yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(([category, categoryItems]) => (
            <div key={category} className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-base font-semibold text-gray-900">{category}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="text-left text-xs font-medium uppercase text-gray-500">
                    <tr>
                      <th className="py-1.5 pr-4">Name</th>
                      <th className="py-1.5 pr-4">Price</th>
                      <th className="py-1.5 pr-4">Available</th>
                      <th className="py-1.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categoryItems.map((item) =>
                      editingId === item.id ? (
                        <tr key={item.id}>
                          <td colSpan={4} className="py-2">
                            <MenuItemForm
                              initial={item}
                              categories={categories}
                              onCancel={() => setEditingId(null)}
                              onSave={async (values) => {
                                await menuItemsApi.updateMenuItem(item.id, values)
                                setEditingId(null)
                                load()
                              }}
                            />
                          </td>
                        </tr>
                      ) : (
                        <tr key={item.id}>
                          <td className="py-1.5 pr-4">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                          </td>
                          <td className="py-1.5 pr-4">{item.price.toFixed(2)}</td>
                          <td className="py-1.5 pr-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {item.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </td>
                          <td className="py-1.5">
                            <button onClick={() => setEditingId(item.id)} className="mr-3 text-blue-600 hover:underline">
                              Edit
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface MenuItemFormValues {
  name?: string
  description?: string
  price?: number
  category?: string
  photoUrl?: string
  isAvailable?: boolean
}

function MenuItemForm({
  initial,
  categories,
  onSave,
  onCancel,
}: {
  initial?: MenuItemDto
  categories: string[]
  onSave: (values: MenuItemFormValues) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [price, setPrice] = useState(initial?.price?.toString() ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? '')
  const [isAvailable, setIsAvailable] = useState(initial?.isAvailable ?? true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await onSave({
        name,
        description: description || undefined,
        price: Number(price),
        category: category || undefined,
        photoUrl: photoUrl || undefined,
        isAvailable,
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
      <div className="flex-1 basis-40">
        <label className="mb-1 block text-xs font-medium text-gray-700">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="flex-1 basis-48">
        <label className="mb-1 block text-xs font-medium text-gray-700">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="w-24">
        <label className="mb-1 block text-xs font-medium text-gray-700">Price</label>
        <input
          required
          type="number"
          min={0}
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="w-40">
        <label className="mb-1 block text-xs font-medium text-gray-700">Category</label>
        <input
          list="menu-categories"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
        />
        <datalist id="menu-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <div className="flex-1 basis-48">
        <label className="mb-1 block text-xs font-medium text-gray-700">Photo URL</label>
        <input
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <label className="flex items-center gap-1 text-xs text-gray-700">
        <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
        Available
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
