import { request, type PageResult } from './cloudbase'
import type { Artwork, ArtworkFilter } from '@/types/artwork'

export interface ArtworkListParams {
  page?: number
  pageSize?: number
  filter?: ArtworkFilter
}

export async function getArtworkList(
  params: ArtworkListParams = {},
): Promise<PageResult<Artwork>> {
  return request<PageResult<Artwork>>('artwork-list', { params })
}

export async function getArtworkDetail(id: string): Promise<Artwork> {
  return request<Artwork>('artwork-detail', { id })
}

export async function searchArtworks(keyword: string): Promise<Artwork[]> {
  return request<Artwork[]>('artwork-search', { keyword })
}

export async function getArtworksByArtist(
  artistId: string,
): Promise<Artwork[]> {
  return request<Artwork[]>('artwork-by-artist', { artistId })
}

export async function getLimitedEditions(): Promise<Artwork[]> {
  return request<Artwork[]>('artwork-limited-editions', {})
}

export async function getNewArrivals(): Promise<Artwork[]> {
  return request<Artwork[]>('artwork-new-arrivals', {})
}
