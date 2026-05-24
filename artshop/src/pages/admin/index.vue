<template>
  <view class="admin-layout">
    <view class="admin-sidebar" v-if="isDesktop">
      <view class="sidebar-header">
        <image class="sidebar-logo" src="/static/logo.png" mode="heightFix" />
        <text class="sidebar-subtitle">后台管理</text>
      </view>
      <view
        v-for="item in menuItems"
        :key="item.key"
        :class="['sidebar-item', currentTab === item.key && 'sidebar-item-active']"
        @tap="currentTab = item.key"
      >
        <text class="sidebar-item-icon">{{ item.icon }}</text>
        <text class="sidebar-item-text">{{ item.label }}</text>
      </view>
    </view>
    <view class="admin-main">
      <view class="admin-topbar">
        <view class="topbar-left" v-if="!isDesktop">
          <image class="topbar-logo" src="/static/logo.png" mode="heightFix" />
          <text class="topbar-title-text">后台管理</text>
        </view>
        <view class="topbar-left" v-else>
          <text class="topbar-page-title">{{ currentLabel }}</text>
        </view>
        <view class="topbar-right">
          <text class="topbar-back" @tap="goBack">返回前台</text>
        </view>
      </view>
      <scroll-view scroll-y class="admin-content">
        <view v-if="!isDesktop" class="mobile-tabs">
          <scroll-view scroll-x class="tabs-scroll">
            <view
              v-for="item in menuItems"
              :key="item.key"
              :class="['tab-item', currentTab === item.key && 'tab-item-active']"
              @tap="currentTab = item.key"
            >
              <text>{{ item.label }}</text>
            </view>
          </scroll-view>
        </view>
        <AdminDashboard v-if="currentTab === 'dashboard'" />
        <AdminArtworks v-else-if="currentTab === 'artworks'" />
        <AdminArtists v-else-if="currentTab === 'artists'" />
        <AdminOrders v-else-if="currentTab === 'orders'" />
        <AdminCommunity v-else-if="currentTab === 'community'" />
        <AdminStores v-else-if="currentTab === 'stores'" />
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminDashboard from './components/Dashboard.vue'
import AdminArtworks from './components/Artworks.vue'
import AdminArtists from './components/Artists.vue'
import AdminOrders from './components/Orders.vue'
import AdminCommunity from './components/Community.vue'
import AdminStores from './components/Stores.vue'

const { t } = useI18n()

const currentTab = ref('dashboard')
const isDesktop = ref(false)

const menuItems = computed(() => [
  { key: 'dashboard', label: t('admin.dashboard'), icon: '📊' },
  { key: 'artworks', label: t('admin.artworks'), icon: '🖼️' },
  { key: 'artists', label: t('admin.artists'), icon: '🎨' },
  { key: 'orders', label: t('admin.orders'), icon: '📦' },
  { key: 'community', label: t('admin.community'), icon: '💬' },
  { key: 'stores', label: t('admin.stores'), icon: '🏪' },
])

const currentLabel = computed(() => {
  const item = menuItems.value.find((m) => m.key === currentTab.value)
  return item ? item.label : ''
})

function checkDesktop() {
  const sys = uni.getSystemInfoSync()
  isDesktop.value = sys.windowWidth >= 1024
}

function goBack() {
  uni.switchTab({ url: '/pages/index/index' })
}

checkDesktop()
uni.onWindowResize(() => checkDesktop())
</script>

<style lang="scss" scoped>
@import '@/styles/mixins.scss';

.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.admin-sidebar {
  width: 220px;
  background: #1a1a2e;
  color: #fff;
  flex-shrink: 0;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar-header {
  padding: 24px 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-logo {
  display: block;
  height: 36px;
  margin-bottom: 4px;
}

.sidebar-subtitle {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.sidebar-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.sidebar-item-active {
  background: rgba(255, 255, 255, 0.1);
  border-right: 3px solid #8b7355;
}

.sidebar-item-icon {
  font-size: 18px;
  margin-right: 12px;
}

.sidebar-item-text {
  font-size: 14px;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.admin-sidebar + .admin-main {
  margin-left: 220px;
}

.admin-topbar {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 50;
}

.topbar-left {
  display: flex;
  align-items: center;
}

.topbar-logo {
  height: 28px;
  margin-right: 8px;
}

.topbar-title-text {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
}

.topbar-page-title {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
}

.topbar-back {
  font-size: 13px;
  color: #8b7355;
  cursor: pointer;
}

.admin-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.mobile-tabs {
  margin-bottom: 16px;
}

.tabs-scroll {
  white-space: nowrap;
}

.tab-item {
  display: inline-block;
  padding: 8px 16px;
  font-size: 13px;
  color: #666;
  background: #fff;
  border-radius: 20px;
  margin-right: 8px;
  border: 1px solid #e8e8e8;
}

.tab-item-active {
  background: #1a1a2e;
  color: #fff;
  border-color: #1a1a2e;
}

@media (max-width: 767px) {
  .admin-content {
    padding: 12px;
  }
}
</style>
