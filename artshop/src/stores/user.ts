import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Address, CollectionItem, Coupon } from '@/types/user'

const MEMBER_LEVEL_MAP: Record<number, string> = {
  0: '普通会员',
  1: '青铜会员',
  2: '白银会员',
  3: '黄金会员',
  4: '铂金会员',
  5: '钻石会员',
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<User | null>(null)
  const token = ref<string>('')
  const addresses = ref<Address[]>([])
  const collections = ref<CollectionItem[]>([])
  const coupons = ref<Coupon[]>([])

  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)

  const memberLevelName = computed(() => {
    if (!userInfo.value) return ''
    return MEMBER_LEVEL_MAP[userInfo.value.memberLevel] ?? '普通会员'
  })

  const defaultAddress = computed(() => {
    return addresses.value.find((addr) => addr.isDefault) ?? null
  })

  async function login(code: string) {
    // TODO: call API
    // const res = await api.login(code)
    // token.value = res.token
    // userInfo.value = res.userInfo
  }

  function logout() {
    userInfo.value = null
    token.value = ''
    addresses.value = []
    collections.value = []
    coupons.value = []
  }

  async function updateProfile(
    data: Partial<Pick<User, 'nickname' | 'avatar' | 'phone' | 'gender' | 'bio'>>,
  ) {
    // TODO: call API
    // await api.updateUserInfo(data)
    if (userInfo.value) {
      Object.assign(userInfo.value, data)
    }
  }

  async function fetchAddresses() {
    // TODO: call API
    // const res = await api.getAddresses()
    // addresses.value = res
  }

  async function addAddress(data: Omit<Address, 'id' | 'userId'>) {
    // TODO: call API
    // const res = await api.addAddress(data)
    // addresses.value.push(res)
  }

  async function removeAddress(id: string) {
    // TODO: call API
    // await api.deleteAddress(id)
    addresses.value = addresses.value.filter((addr) => addr.id !== id)
  }

  async function setDefaultAddress(id: string) {
    // TODO: call API
    // await api.updateAddress(id, { isDefault: true })
    addresses.value.forEach((addr) => {
      addr.isDefault = addr.id === id
    })
  }

  async function fetchCollections() {
    // TODO: call API
    // const res = await api.getCollections()
    // collections.value = res.list
  }

  async function toggleCollection(targetId: string, targetType: string) {
    const existing = collections.value.find(
      (item) => item.targetId === targetId && item.targetType === targetType,
    )
    if (existing) {
      // TODO: call API
      // await api.removeCollection(existing.id)
      collections.value = collections.value.filter((item) => item.id !== existing.id)
    } else {
      // TODO: call API
      // const res = await api.addCollection({ targetId, targetType })
      // collections.value.push(res)
    }
  }

  async function fetchCoupons() {
    // TODO: call API
    // const res = await api.getCoupons()
    // coupons.value = res
  }

  return {
    userInfo,
    token,
    addresses,
    collections,
    coupons,
    isLoggedIn,
    memberLevelName,
    defaultAddress,
    login,
    logout,
    updateProfile,
    fetchAddresses,
    addAddress,
    removeAddress,
    setDefaultAddress,
    fetchCollections,
    toggleCollection,
    fetchCoupons,
  }
})
