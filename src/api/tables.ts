import { apiFetch } from './client'
import type { CreateTableRequest, TableDto, UpdateTableRequest } from './types'

export function getTablesByHall(hallId: number): Promise<TableDto[]> {
  return apiFetch<TableDto[]>(`/api/v1/tables?hallId=${hallId}`)
}

export function createTable(request: CreateTableRequest): Promise<TableDto> {
  return apiFetch<TableDto>('/api/v1/tables', { method: 'POST', body: request })
}

export function updateTable(id: number, request: UpdateTableRequest): Promise<TableDto> {
  return apiFetch<TableDto>(`/api/v1/tables/${id}`, { method: 'PATCH', body: request })
}

export function deleteTable(id: number): Promise<void> {
  return apiFetch<void>(`/api/v1/tables/${id}`, { method: 'DELETE' })
}
