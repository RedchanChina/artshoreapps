<template>
  <view class="admin-layout">
    <view class="admin-sidebar" v-if="isDesktop">
      <view class="sidebar-header">
        <image class="sidebar-logo" :src="appStore.logoUrl" mode="heightFix" />
        <text class="sidebar-subtitle">后台管理</text>
      </view>
      <view
        v-for="item in menuItems"
        :key="item.key"
        :class="['sidebar-item', currentTab === item.key && 'sidebar-item-active']"
        @tap="currentTab = item.key"
      >
        <text class="sidebar-item-text">{{ item.label }}</text>
      </view>
    </view>
    <view class="admin-main">
      <view class="admin-topbar">
        <view class="topbar-left" v-if="!isDesktop">
          <image class="topbar-logo" :src="appStore.logoUrl" mode="heightFix" />
          <text class="topbar-title-text">后台管理</text>
        </view>
        <view class="topbar-left" v-else>
          <text class="topbar-page-title">{{ currentLabel }}</text>
        </view>
        <view class="topbar-right">
          <text class="topbar-back" @tap="goBack">返回前台</text>
        </view>
      </view>
      <view class="admin-content">
        <view v-if="!isDesktop" class="mobile-tabs">
          <view class="tabs-scroll">
            <view
              v-for="item in menuItems"
              :key="item.key"
              :class="['tab-item', currentTab === item.key && 'tab-item-active']"
              @tap="currentTab = item.key"
            >
              <text>{{ item.label }}</text>
            </view>
          </view>
        </view>
        <AdminDashboard v-if="currentTab === 'dashboard'" @navigate="handleNavigate" />
        <AdminArtworks v-else-if="currentTab === 'artworks'" />
        <AdminArtists v-else-if="currentTab === 'artists'" />
        <AdminOrders v-else-if="currentTab === 'orders'" />
        <AdminCommunity v-else-if="currentTab === 'community'" />
        <AdminStores v-else-if="currentTab === 'stores'" />
        <AdminLogoManager v-else-if="currentTab === 'logo'" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import AdminDashboard from './components/Dashboard.vue'
import AdminArtworks from './components/Artworks.vue'
import AdminArtists from './components/Artists.vue'
import AdminOrders from './components/Orders.vue'
import AdminCommunity from './components/Community.vue'
import AdminStores from './components/Stores.vue'
import AdminLogoManager from './components/LogoManager.vue'

const appStore = useAppStore()
const currentTab = ref('dashboard')
const isDesktop = ref(false)

const menuItems = [
  { key: 'dashboard', label: '数据概览' },
  { key: 'artworks', label: '作品管理' },
  { key: 'artists', label: '艺术家管理' },
  { key: 'orders', label: '订单管理' },
  { key: 'community', label: '社区管理' },
  { key: 'stores', label: '门店管理' },
  { key: 'logo', label: 'LOGO 管理' },
]

const currentLabel = computed(() => {
  const item = menuItems.find((m) => m.key === currentTab.value)
  return item ? item.label : ''
})

function checkDesktop() {
  const sys = uni.getSystemInfoSync()
  isDesktop.value = sys.windowWidth >= 1024
}

function goBack() {
  uni.switchTab({ url: '/pages/index/index' })
}

function handleNavigate(key: string) {
  currentTab.value = key
}

onMounted(() => {
  appStore.loadStoredLogo()
  checkDesktop()
  uni.onWindowResize(() => checkDesktop())
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: $color-bg;
  width: 100%;
}

.admin-sidebar {
  width: 240px;
  background-color: $color-surface;
  border-right: 1px solid $color-border;
  flex-shrink: 0;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: $space-xl $space-lg;
  border-bottom: 1px solid $color-border;
}

.sidebar-logo {
  display: block;
  height: 36px;
  margin-bottom: $space-xs;
}

.sidebar-subtitle {
  display: block;
  font-family: $font-sans;
  font-size: $font-sm;
  color: $color-text-secondary;
  margin-top: $space-xs;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: $space-md $space-lg;
  cursor: pointer;
  transition: all $duration-base $ease-out;
}

.sidebar-item:hover {
  background-color: $color-bg-secondary;
}

.sidebar-item-active {
  background-color: $color-bg-secondary;
  border-left: 2px solid $color-accent;
}

.sidebar-item-text {
  font-family: $font-sans;
  font-size: $font-sm;
  color: $color-text-primary;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.admin-sidebar + .admin-main {
  margin-left: 240px;
  width: calc(100% - 240px);
}

.admin-topbar {
  height: 64px;
  background-color: $color-surface;
  border-bottom: 1px solid $color-border;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $space-xl;
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
}

.topbar-left {
  display: flex;
  align-items: center;
}

.topbar-logo {
  height: 28px;
  margin-right: $space-sm;
}

.topbar-title-text {
  font-family: $font-sans;
  font-size: $font-md;
  font-weight: 500;
  color: $color-text-primary;
}

.topbar-page-title {
  font-family: $font-serif;
  font-size: $font-lg;
  font-weight: 400;
  color: $color-text-primary;
}

.topbar-back {
  font-family: $font-sans;
  font-size: $font-sm;
  color: $color-accent;
  cursor: pointer;
  transition: color $duration-fast;
}

.topbar-back:hover {
  color: $color-accent-hover;
}

.admin-content {
  flex: 1;
  padding: $space-xl;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
}

.mobile-tabs {
  margin-bottom: $space-lg;
}

.tabs-scroll {
  display: flex;
  overflow-x: auto;
  white-space: nowrap;
  width: 100%;
  box-sizing: border-box;
}

.tab-item {
  display: inline-block;
  padding: $space-sm $space-md;
  font-family: $font-sans;
  font-size: $font-sm;
  color: $color-text-secondary;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all $duration-fast;
  flex-shrink: 0;
}

.tab-item-active {
  color: $color-accent;
  border-bottom-color: $color-accent;
}

@media (max-width: 1023px) {
  .admin-sidebar {
    display: none;
  }

  .admin-sidebar + .admin-main {
    margin-left: 0;
    width: 100%;
  }
}
</style>
