import { apiClient } from './client'
import type { PaginatedResult, User, UserRole } from '@/types'

export const usersApi = {
  getUsers: (params?: { page?: number; limit?: number }) =>
    apiClient
      .get<PaginatedResult<User>>('/users', { params })
      .then((r) => r.data),

  getUser: (id: string) =>
    apiClient.get<User>(`/users/${id}`).then((r) => r.data),

  updateRole: (id: string, role: UserRole) =>
    apiClient.patch<User>(`/users/${id}/role`, { role }).then((r) => r.data),

  deactivate: (id: string) =>
    apiClient.delete(`/users/${id}`).then((r) => r.data),
}
