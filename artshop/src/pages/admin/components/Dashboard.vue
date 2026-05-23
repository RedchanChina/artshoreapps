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
        <view class="action-card" @tap="$emit('navigate', 'artworks')">
          <text class="action-icon">🖼️</text>
          <text class="action-text">管理作品</text>
        </view>
        <view class="action-card" @tap="$emit('navigate', 'artists')">
          <text class="action-icon">🎨</text>
          <text class="action-text">管理艺术家</text>
        </view>
        <view class="action-card" @tap="$emit('navigate', 'orders')">
          <text class="action-icon">📦</text>
          <text class="action-text">处理订单</text>
        </view>
        <view class="action-card" @tap="$emit('navigate', 'community')">
          <text class="action-icon">💬</text>
          <text class="action-text">社区内容</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getDashboardStats } from '@/api/admin'

const stats = ref([
  { label: '作品总数', value: '-' },
  { label: '艺术家', value: '-' },
  { label: '订单数', value: '-' },
  { label: '用户数', value: '-' },
])

onMounted(async () => {
  try {
    const data = await getDashboardStats()
    stats.value = [
      { label: '作品总数', value: String(data.artworkCount) },
      { label: '艺术家', value: String(data.artistCount) },
      { label: '订单数', value: String(data.orderCount) },
      { label: '用户数', value: String(data.userCount) },
    ]
  } catch (e) {
    console.error('获取统计数据失败', e)
  }
})
</script>

<style lang="scss" scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  font-family: 'DM Sans', sans-serif;
}

.stat-label {
  display: block;
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

.section-title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.action-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;
  cursor: pointer;
  transition: box-shadow 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.action-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-icon {
  display: block;
  font-size: 28px;
  margin-bottom: 8px;
}

.action-text {
  font-size: 13px;
  color: #666;
}
</style>
