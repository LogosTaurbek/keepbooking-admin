import { apiFetch } from './client'
import type { AssignAdminRequest, CompanyDto, CreateCompanyRequest, PageResponse, UserProfileDto } from './types'

export function getAllCompanies(page = 0, size = 50): Promise<PageResponse<CompanyDto>> {
  return apiFetch<PageResponse<CompanyDto>>(`/api/v1/admin/companies?page=${page}&size=${size}`)
}

export function createCompanyOnBehalf(request: CreateCompanyRequest): Promise<CompanyDto> {
  return apiFetch<CompanyDto>('/api/v1/admin/companies', { method: 'POST', body: request })
}

export function getCompanyAdmins(companyId: number): Promise<UserProfileDto[]> {
  return apiFetch<UserProfileDto[]>(`/api/v1/admin/companies/${companyId}/admins`)
}

export function assignCompanyAdmin(companyId: number, email: string): Promise<UserProfileDto> {
  const body: AssignAdminRequest = { email }
  return apiFetch<UserProfileDto>(`/api/v1/admin/companies/${companyId}/admins`, { method: 'POST', body })
}

export function revokeCompanyAdmin(companyId: number, userId: number): Promise<void> {
  return apiFetch<void>(`/api/v1/admin/companies/${companyId}/admins/${userId}`, { method: 'DELETE' })
}
