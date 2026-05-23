export interface User {
  id: string
  nickname: string
  avatar: string
  phone: string
  email: string
  gender: string
  bio: string
  memberLevel: number
  createdAt: string
}

export interface Address {
  id: string
  userId: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

export interface CollectionItem {
  id: string
  artworkId: string
  targetId: string
  targetType: string
  title: string
  image: string
  artistName: string
  collectedAt: string
}

export interface Coupon {
  id: string
  name: string
  discount: number
  minAmount: number
  startDate: string
  endDate: string
  status: 'available' | 'used' | 'expired'
}
