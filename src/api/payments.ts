import { apiClient } from './client'
import type { CheckoutSessionResponse } from '@/types'

export const paymentsApi = {
  createCheckoutSession: (orderId: string) =>
    apiClient
      .post<CheckoutSessionResponse>('/payments/checkout', { orderId })
      .then((r) => r.data),
}
