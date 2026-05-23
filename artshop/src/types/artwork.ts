export interface Artwork {
  id: string
  title: string
  image: string
  images: string[]
  artistName: string
  artistId: string
  category: string
  price: number
  originalPrice?: number
  description: string
  specifications: ArtworkSpec[]
  sales: number
  stock: number
  rating: number
  tags: string[]
  createdAt: string
}

export interface ArtworkSpec {
  size: string
  material: string
  frameStyle: string
  price: number
  stock: number
}

export interface ArtworkFilter {
  category: string
  priceRange: [number, number] | null
  sortBy: 'default' | 'price_asc' | 'price_desc' | 'sales' | 'newest'
  keyword: string
}
