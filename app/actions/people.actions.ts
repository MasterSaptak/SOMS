// @ts-nocheck
'use server'

import { peopleService, PeopleFilters } from '@/lib/services/people.service'

export async function getPeopleAction(filters: PeopleFilters) {
  return peopleService.list(filters)
}

export async function getPersonProfileAction(employeeId: string) {
  return peopleService.getProfile(employeeId)
}

export async function updatePersonAction(employeeId: string, updates: Record<string, any>) {
  return peopleService.updateProfile(employeeId, updates)
}

export async function createPersonAction(data: {
  full_name: string
  email: string
  organization_id?: string
  phone?: string
  department?: string
  designation?: string
  employment_type?: string
  lifecycle_status?: string
  joining_date?: string
}) {
  return peopleService.createPerson(data)
}

export async function getFilterOptionsAction(organizationId?: string) {
  return peopleService.getFilterOptions(organizationId)
}

export async function getEmployeeOptionsAction(organizationId?: string) {
  return peopleService.getEmployeeOptions(organizationId)
}

export async function bulkUpdateStatusAction(employeeIds: string[], status: string) {
  return peopleService.bulkUpdateStatus(employeeIds, status)
}
