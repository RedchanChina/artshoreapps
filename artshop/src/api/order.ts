import { callAction, type PageResult } from './cloudbase'
import type { Order, OrderStatus } from '@/types/order'

export interface CreateOrderData {
  items: {
    artworkId: string
    spec: {
      size: string
      material: string
      frameStyle: string
    }
    quantity: number
  }[]
  addressId: string
  couponId?: string
  remark?: string
}

export interface OrderListParams {
  page?: number
  pageSize?: number
  status?: OrderStatus
}

export async function createOrder(orderData: CreateOrderData): Promise<Order> {
  return callAction<Order>('order', 'create', { orderData })
}

export async function getOrderList(
  params: OrderListParams = {},
): Promise<PageResult<Order>> {
  return callAction<PageResult<Order>>('order', 'list', { params })
}

export async function getOrderDetail(id: string): Promise<Order> {
  return callAction<Order>('order', 'detail', { id })
}

export async function cancelOrder(id: string): Promise<void> {
  return callAction<void>('order', 'cancel', { id })
}

export async function confirmReceive(id: string): Promise<void> {
  return callAction<void>('order', 'confirm-receive', { id })
}

export async function requestRefund(
  id: string,
  reason: string,
): Promise<void> {
  return callAction<void>('order', 'request-refund', { id, reason })
}
