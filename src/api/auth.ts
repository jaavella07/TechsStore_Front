import { apiClient } from './client'
import type { AuthResponse, LoginDto, RegisterDto, User, UpdateProfileDto } from '@/types'

export const authApi = {
  login: (dto: LoginDto) =>
    apiClient.post<AuthResponse>('/auth/login', dto).then((r) => r.data),

  register: (dto: RegisterDto) =>
    apiClient.post<AuthResponse>('/auth/register', dto).then((r) => r.data),

  refresh: (refreshToken: string) =>
    apiClient
      .post<AuthResponse>('/auth/refresh', undefined, {
        headers: { Authorization: `Bearer ${refreshToken}` },
      })
      .then((r) => r.data),

  logout: () => apiClient.post('/auth/logout').then((r) => r.data),

  me: () => apiClient.get<User>('/auth/me').then((r) => r.data),

  updateProfile: (dto: UpdateProfileDto) =>
    apiClient.patch<User>('/users/me', dto).then((r) => r.data),
}
