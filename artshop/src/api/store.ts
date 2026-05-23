import { request, type PageResult } from './cloudbase'
import type { StoreLocation, Exhibition } from '@/types/store'

export interface ExhibitionListParams {
  page?: number
  pageSize?: number
  status?: string
}

export async function getStoreLocations(): Promise<StoreLocation[]> {
  return request<StoreLocation[]>('store-locations', {})
}

export async function getExhibitions(
  params: ExhibitionListParams = {},
): Promise<PageResult<Exhibition>> {
  return request<PageResult<Exhibition>>('store-exhibitions', { params })
}

export async function getExhibitionDetail(id: string): Promise<Exhibition> {
  return request<Exhibition>('store-exhibition-detail', { id })
}

export async function registerExhibition(id: string): Promise<void> {
  return request<void>('store-exhibition-register', { id })
}

export async function checkInExhibition(id: string): Promise<void> {
  return request<void>('store-exhibition-checkin', { id })
}
