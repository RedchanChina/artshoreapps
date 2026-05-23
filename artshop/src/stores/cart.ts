import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CartItem {
  artworkId: string
  title: string
  image: string
  artistName: string
  spec: {
    size: string
    material: string
    frameStyle: string
  }
  quantity: number
  unitPrice: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const selectedIds = ref<string[]>([])

  const totalCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  })

  const selectedCount = computed(() => {
    return items.value
      .filter((item) => selectedIds.value.includes(item.artworkId))
      .reduce((sum, item) => sum + item.quantity, 0)
  })

  const selectedTotalPrice = computed(() => {
    return items.value
      .filter((item) => selectedIds.value.includes(item.artworkId))
      .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  })

  const allSelected = computed(() => {
    return items.value.length > 0 && selectedIds.value.length === items.value.length
  })

  function addItem(item: CartItem) {
    const existing = items.value.find(
      (i) =>
        i.artworkId === item.artworkId &&
        i.spec.size === item.spec.size &&
        i.spec.material === item.spec.material &&
        i.spec.frameStyle === item.spec.frameStyle,
    )
    if (existing) {
      existing.quantity += item.quantity
    } else {
      items.value.push({ ...item })
      selectedIds.value.push(item.artworkId)
    }
  }

  function removeItem(artworkId: string) {
    items.value = items.value.filter((item) => item.artworkId !== artworkId)
    selectedIds.value = selectedIds.value.filter((id) => id !== artworkId)
  }

  function updateQuantity(artworkId: string, quantity: number) {
    const item = items.value.find((i) => i.artworkId === artworkId)
    if (item) {
      if (quantity <= 0) {
        removeItem(artworkId)
      } else {
        item.quantity = quantity
      }
    }
  }

  function updateSpec(
    artworkId: string,
    spec: { size: string; material: string; frameStyle: string },
  ) {
    const item = items.value.find((i) => i.artworkId === artworkId)
    if (item) {
      item.spec = { ...spec }
    }
  }

  function toggleSelect(artworkId: string) {
    const index = selectedIds.value.indexOf(artworkId)
    if (index > -1) {
      selectedIds.value.splice(index, 1)
    } else {
      selectedIds.value.push(artworkId)
    }
  }

  function selectAll() {
    if (allSelected.value) {
      selectedIds.value = []
    } else {
      selectedIds.value = items.value.map((item) => item.artworkId)
    }
  }

  function clearCart() {
    items.value = []
    selectedIds.value = []
  }

  return {
    items,
    selectedIds,
    totalCount,
    totalPrice,
    selectedCount,
    selectedTotalPrice,
    allSelected,
    addItem,
    removeItem,
    updateQuantity,
    updateSpec,
    toggleSelect,
    selectAll,
    clearCart,
  }
})
