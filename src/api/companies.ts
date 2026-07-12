import { apiFetch } from './client'
import type { CompanyDto, CreateCompanyRequest } from './types'

export function getMyCompanies(): Promise<CompanyDto[]> {
  return apiFetch<CompanyDto[]>('/api/v1/companies/my')
}

export function createCompany(request: CreateCompanyRequest): Promise<CompanyDto> {
  return apiFetch<CompanyDto>('/api/v1/companies', { method: 'POST', body: request })
}
