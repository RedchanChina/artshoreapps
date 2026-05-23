import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Artwork, ArtworkFilter } from '@/types/artwork'

const DEFAULT_FILTER: ArtworkFilter = {
  category: '',
  priceRange: null,
  sortBy: 'default',
  keyword: '',
}

export const useArtworkStore = defineStore('artwork', () => {
  const artworks = ref<Artwork[]>([])
  const currentArtwork = ref<Artwork | null>(null)
  const filters = ref<ArtworkFilter>({ ...DEFAULT_FILTER })
  const loading = ref<boolean>(false)
  const hasMore = ref<boolean>(true)
  const page = ref<number>(1)

  const filteredArtworks = computed(() => {
    let result = [...artworks.value]

    if (filters.value.category) {
      result = result.filter((item) => item.category === filters.value.category)
    }

    if (filters.value.priceRange) {
      const [min, max] = filters.value.priceRange
      result = result.filter((item) => item.price >= min && item.price <= max)
    }

    if (filters.value.keyword) {
      const kw = filters.value.keyword.toLowerCase()
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(kw) ||
          item.artistName.toLowerCase().includes(kw) ||
          item.tags.some((tag) => tag.toLowerCase().includes(kw)),
      )
    }

    switch (filters.value.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'sales':
        result.sort((a, b) => b.sales - a.sales)
        break
      case 'newest':
        result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        break
      default:
        break
    }

    return result
  })

  const categoryCount = computed(() => {
    const countMap: Record<string, number> = {}
    artworks.value.forEach((item) => {
      countMap[item.category] = (countMap[item.category] ?? 0) + 1
    })
    return countMap
  })

  async function fetchArtworks() {
    loading.value = true
    page.value = 1
    hasMore.value = true
    try {
      // TODO: call API
      // const res = await api.getArtworks({ page: page.value, ...filters.value })
      // artworks.value = res.list
      // hasMore.value = res.hasMore
    } finally {
      loading.value = false
    }
  }

  async function fetchArtworkDetail(id: string) {
    loading.value = true
    try {
      // TODO: call API
      // const res = await api.getArtworkDetail(id)
      // currentArtwork.value = res
    } finally {
      loading.value = false
    }
  }

  function setFilter(partial: Partial<ArtworkFilter>) {
    Object.assign(filters.value, partial)
  }

  function resetFilter() {
    filters.value = { ...DEFAULT_FILTER }
  }

  async function loadMore() {
    if (loading.value || !hasMore.value) return
    loading.value = true
    page.value += 1
    try {
      // TODO: call API
      // const res = await api.getArtworks({ page: page.value, ...filters.value })
      // artworks.value.push(...res.list)
      // hasMore.value = res.hasMore
    } finally {
      loading.value = false
    }
  }

  return {
    artworks,
    currentArtwork,
    filters,
    loading,
    hasMore,
    page,
    filteredArtworks,
    categoryCount,
    fetchArtworks,
    fetchArtworkDetail,
    setFilter,
    resetFilter,
    loadMore,
  }
})
