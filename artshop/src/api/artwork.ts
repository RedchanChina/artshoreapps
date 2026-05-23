import { callAction, type PageResult } from './cloudbase'
import type { Artwork, ArtworkFilter } from '@/types/artwork'

export interface ArtworkListParams {
  page?: number
  pageSize?: number
  filter?: ArtworkFilter
}

export async function getArtworkList(
  params: ArtworkListParams = {},
): Promise<PageResult<Artwork>> {
  return callAction<PageResult<Artwork>>('artwork', 'list', { params })
}

export async function getArtworkDetail(id: string): Promise<Artwork> {
  return callAction<Artwork>('artwork', 'detail', { id })
}

export async function searchArtworks(keyword: string): Promise<Artwork[]> {
  return callAction<Artwork[]>('artwork', 'search', { keyword })
}

export async function getArtworksByArtist(
  artistId: string,
): Promise<Artwork[]> {
  return callAction<Artwork[]>('artwork', 'by-artist', { artistId })
}

export async function getLimitedEditions(): Promise<Artwork[]> {
  return callAction<Artwork[]>('artwork', 'limited-editions', {})
}

export async function getNewArrivals(): Promise<Artwork[]> {
  return callAction<Artwork[]>('artwork', 'new-arrivals', {})
}
