export interface StoreLocation {
  id: string
  name: string
  address: string
  businessHours: string
  images: string[]
  latitude: number
  longitude: number
  phone: string
}

export interface Exhibition {
  id: string
  title: string
  coverImage: string
  startDate: string
  endDate: string
  location: string
  description: string
  ticketPrice: number
  isRegistered: boolean
}
