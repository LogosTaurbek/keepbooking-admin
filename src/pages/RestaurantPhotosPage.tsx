import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as photosApi from '../api/restaurantPhotos'
import { ApiError } from '../api/client'
import type { RestaurantPhotoDto } from '../api/types'

export function RestaurantPhotosPage() {
  const { id } = useParams<{ id: string }>()
  const restaurantId = Number(id)

  const [photos, setPhotos] = useState<RestaurantPhotoDto[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function load() {
    photosApi
      .getRestaurantPhotos(restaurantId)
      .then(setPhotos)
      .catch((err) => setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to load photos') : 'Failed to load photos'))
  }

  useEffect(load, [restaurantId])

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError(null)
    setUploading(true)
    try {
      await photosApi.uploadRestaurantPhoto(restaurantId, file)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to upload photo') : 'Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(photoId: number) {
    if (!confirm('Delete this photo?')) return
    setDeletingId(photoId)
    try {
      await photosApi.deleteRestaurantPhoto(restaurantId, photoId)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? (err.problem?.detail ?? 'Failed to delete photo') : 'Failed to delete photo')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <Link to="/restaurants" className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700">
        ← Back to restaurants
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Photos</h1>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelected}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Upload photo'}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {photos === null ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : photos.length === 0 ? (
        <p className="text-sm text-gray-500">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white">
              <img src={photo.url} alt="" className="aspect-square w-full object-cover" />
              <button
                onClick={() => handleDelete(photo.id)}
                disabled={deletingId === photo.id}
                className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-red-600 opacity-0 shadow hover:bg-white group-hover:opacity-100 disabled:opacity-50"
              >
                {deletingId === photo.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
