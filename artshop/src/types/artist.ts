export interface ArtistExhibition {
  name: string
  date: string
  location: string
}

export interface Artist {
  id: string
  name: string
  avatar: string
  bio: string
  representativeWorks: string[]
  followerCount: number
  isFollowing: boolean
  story: string
  exhibitions: ArtistExhibition[]
  honors: string[]
  createdAt: string
}
