import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const DEFAULT_LOGO_URL = '/static/logo.png'
const LOGO_STORAGE_KEY = 'app_logo_url'

export const useAppStore = defineStore('app', () => {
  const tabBarIndex = ref<number>(0)
  const searchHistory = ref<string[]>([])
  const systemInfo = ref<any>(null)
  const networkType = ref<string>('unknown')
  const customLogoUrl = ref<string>('')

  const logoUrl = computed(() => customLogoUrl.value || DEFAULT_LOGO_URL)
  const isUsingCustomLogo = computed(() => !!customLogoUrl.value)
  const currentTab = computed(() => tabBarIndex.value)

  function setTabBarIndex(index: number) {
    tabBarIndex.value = index
  }

  function addSearchHistory(keyword: string) {
    const trimmed = keyword.trim()
    if (!trimmed) return
    searchHistory.value = searchHistory.value.filter((item) => item !== trimmed)
    searchHistory.value.unshift(trimmed)
    if (searchHistory.value.length > 20) {
      searchHistory.value = searchHistory.value.slice(0, 20)
    }
  }

  function clearSearchHistory() {
    searchHistory.value = []
  }

  function getSystemInfo() {
    try {
      systemInfo.value = uni.getSystemInfoSync()
    } catch {
      systemInfo.value = null
    }
  }

  function getNetworkType() {
    uni.getNetworkType({
      success: (res) => {
        networkType.value = res.networkType
      },
      fail: () => {
        networkType.value = 'unknown'
      },
    })
  }

  function setCustomLogo(url: string) {
    customLogoUrl.value = url
    uni.setStorageSync(LOGO_STORAGE_KEY, url)
  }

  function resetToDefaultLogo() {
    customLogoUrl.value = ''
    uni.removeStorageSync(LOGO_STORAGE_KEY)
  }

  function loadStoredLogo() {
    try {
      const stored = uni.getStorageSync(LOGO_STORAGE_KEY)
      if (stored) {
        customLogoUrl.value = stored
      }
    } catch {
      // 忽略错误
    }
  }

  return {
    tabBarIndex,
    searchHistory,
    systemInfo,
    networkType,
    customLogoUrl,
    logoUrl,
    isUsingCustomLogo,
    currentTab,
    setTabBarIndex,
    addSearchHistory,
    clearSearchHistory,
    getSystemInfo,
    getNetworkType,
    setCustomLogo,
    resetToDefaultLogo,
    loadStoredLogo,
  }
})
