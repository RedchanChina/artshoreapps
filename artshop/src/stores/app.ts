import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const tabBarIndex = ref<number>(0)
  const searchHistory = ref<string[]>([])
  const systemInfo = ref<any>(null)
  const networkType = ref<string>('unknown')

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

  return {
    tabBarIndex,
    searchHistory,
    systemInfo,
    networkType,
    currentTab,
    setTabBarIndex,
    addSearchHistory,
    clearSearchHistory,
    getSystemInfo,
    getNetworkType,
  }
})
