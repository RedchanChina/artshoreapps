import { request } from './cloudbase'
import type { PaymentMethod } from '@/types/order'

export interface PaymentInfo {
  paymentId: string
  orderId: string
  amount: number
  method: PaymentMethod
  status: string
  createdAt: string
}

export async function createPayment(
  orderId: string,
  method: PaymentMethod,
): Promise<PaymentInfo> {
  return request<PaymentInfo>('payment-create', { orderId, method })
}

export async function verifyPayment(paymentId: string): Promise<PaymentInfo> {
  return request<PaymentInfo>('payment-verify', { paymentId })
}

export async function getPaymentStatus(orderId: string): Promise<PaymentInfo> {
  return request<PaymentInfo>('payment-status', { orderId })
}
