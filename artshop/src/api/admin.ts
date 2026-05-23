import { callAction, type PageResult } from './cloudbase'
import type { Artwork } from '@/types/artwork'
import type { Artist } from '@/types/artist'
import type { Order, OrderStatus } from '@/types/order'
import type { StoreLocation, Exhibition } from '@/types/store'

export interface DashboardStats {
  artworkCount: number
  artistCount: number
  orderCount: number
  userCount: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return callAction<DashboardStats>('admin', 'dashboard-stats', {})
}

export async function adminAddArtwork(data: Partial<Artwork>): Promise<{ id: string }> {
  return callAction<{ id: string }>('admin', 'artwork-add', { data })
}

export async function adminUpdateArtwork(id: string, data: Partial<Artwork>): Promise<void> {
  return callAction<void>('admin', 'artwork-update', { id, data })
}

export async function adminDeleteArtwork(id: string): Promise<void> {
  return callAction<void>('admin', 'artwork-delete', { id })
}

export async function adminAddArtist(data: Partial<Artist>): Promise<{ id: string }> {
  return callAction<{ id: string }>('admin', 'artist-add', { data })
}

export async function adminUpdateArtist(id: string, data: Partial<Artist>): Promise<void> {
  return callAction<void>('admin', 'artist-update', { id, data })
}

export async function adminDeleteArtist(id: string): Promise<void> {
  return callAction<void>('admin', 'artist-delete', { id })
}

export async function adminGetOrders(params: {
  page?: number
  pageSize?: number
  status?: OrderStatus
}): Promise<PageResult<Order>> {
  return callAction<PageResult<Order>>('admin', 'order-list', { params })
}

export async function adminUpdateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  return callAction<void>('admin', 'order-update-status', { id, status })
}

export async function adminAddExhibition(data: Partial<Exhibition>): Promise<{ id: string }> {
  return callAction<{ id: string }>('admin', 'exhibition-add', { data })
}

export async function adminUpdateExhibition(id: string, data: Partial<Exhibition>): Promise<void> {
  return callAction<void>('admin', 'exhibition-update', { id, data })
}

export async function adminDeleteExhibition(id: string): Promise<void> {
  return callAction<void>('admin', 'exhibition-delete', { id })
}

export interface AdminArticle {
  id?: string
  title: string
  coverImage: string
  author: string
  summary: string
  content: string
  viewCount?: number
  likeCount?: number
  createdAt?: string
}

export async function adminAddArticle(data: Partial<AdminArticle>): Promise<{ id: string }> {
  return callAction<{ id: string }>('admin', 'article-add', { data })
}

export async function adminUpdateArticle(id: string, data: Partial<AdminArticle>): Promise<void> {
  return callAction<void>('admin', 'article-update', { id, data })
}

export async function adminDeleteArticle(id: string): Promise<void> {
  return callAction<void>('admin', 'article-delete', { id })
}

export async function adminAddStore(data: Partial<StoreLocation>): Promise<{ id: string }> {
  return callAction<{ id: string }>('admin', 'store-add', { data })
}

export async function adminUpdateStore(id: string, data: Partial<StoreLocation>): Promise<void> {
  return callAction<void>('admin', 'store-update', { id, data })
}

export async function adminDeleteStore(id: string): Promise<void> {
  return callAction<void>('admin', 'store-delete', { id })
}
