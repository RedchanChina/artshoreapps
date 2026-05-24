<template>
  <view class="dashboard">
    <view class="stats-grid">
      <view class="stat-card" v-for="stat in stats" :key="stat.label">
        <text class="stat-value">{{ stat.value }}</text>
        <text class="stat-label">{{ stat.label }}</text>
      </view>
    </view>
    <view class="quick-actions">
      <text class="section-title">快捷操作</text>
      <view class="action-grid">
        <view class="action-card" @click="navigateTo('artworks')">
          <text class="action-text">管理作品</text>
        </view>
        <view class="action-card" @click="navigateTo('artists')">
          <text class="action-text">管理艺术家</text>
        </view>
        <view class="action-card" @click="navigateTo('orders')">
          <text class="action-text">处理订单</text>
        </view>
        <view class="action-card" @click="navigateTo('community')">
          <text class="action-text">社区内容</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getDashboardStats } from '@/api/admin'

const emit = defineEmits(['navigate'])

const stats = ref([
  { label: '作品总数', value: '-' },
  { label: '艺术家', value: '-' },
  { label: '订单数', value: '-' },
  { label: '用户数', value: '-' },
])

function navigateTo(key: string) {
  emit('navigate', key)
}

onMounted(async () => {
  try {
    const data = await getDashboardStats()
    stats.value = [
      { label: '作品总数', value: String(data.artworkCount) },
      { label: '艺术家', value: String(data.artistCount) },
      { label: '订单数', value: String(data.orderCount) },
      { label: '用户数', value: String(data.userCount) },
    ]
  } catch {
    // CloudBase 不可用时保持默认值
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.dashboard {
  width: 100%;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: $color-surface;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: $shadow-subtle;
}

.stat-value {
  display: block;
  font-family: $font-serif;
  font-size: 28px;
  font-weight: 600;
  color: $color-text-primary;
}

.stat-label {
  display: block;
  font-family: $font-sans;
  font-size: $font-sm;
  color: $color-text-secondary;
  margin-top: 4px;
}

.section-title {
  display: block;
  font-family: $font-serif;
  font-size: $font-lg;
  font-weight: 600;
  color: $color-text-primary;
  margin-bottom: 12px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.action-card {
  background: $color-surface;
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;
  cursor: pointer;
  transition: all $duration-fast;
  box-shadow: $shadow-subtle;
}

.action-card:hover {
  box-shadow: $shadow-float;
  transform: translateY(-2px);
}

.action-text {
  font-family: $font-sans;
  font-size: $font-sm;
  color: $color-accent;
}
</style>
