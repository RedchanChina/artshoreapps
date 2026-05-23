import { request, type PageResult } from './cloudbase'
import type { Artist } from '@/types/artist'
import type { Artwork } from '@/types/artwork'

export interface ArtistListParams {
  page?: number
  pageSize?: number
  keyword?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export async function getArtistList(
  params: ArtistListParams = {},
): Promise<PageResult<Artist>> {
  return request<PageResult<Artist>>('artist-list', { params })
}

export async function getArtistDetail(id: string): Promise<Artist> {
  return request<Artist>('artist-detail', { id })
}

export async function followArtist(id: string): Promise<void> {
  return request<void>('artist-follow', { id })
}

export async function unfollowArtist(id: string): Promise<void> {
  return request<void>('artist-unfollow', { id })
}

export async function getArtistArtworks(artistId: string): Promise<Artwork[]> {
  return request<Artwork[]>('artist-artworks', { artistId })
}
