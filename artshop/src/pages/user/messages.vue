<template>
  <view class="messages-page">
    <view class="message-categories">
      <view
        v-for="cat in categories"
        :key="cat.key"
        class="category-card"
        @tap="onCategoryTap(cat.key)"
      >
        <view class="category-icon-wrap" :class="'category-icon-wrap--' + cat.key">
          <text class="category-icon">{{ cat.icon }}</text>
          <view v-if="cat.unreadCount > 0" class="category-unread-badge">
            <text class="category-unread-text">{{ cat.unreadCount > 99 ? '99+' : cat.unreadCount }}</text>
          </view>
        </view>
        <view class="category-info">
          <view class="category-title-row">
            <text class="category-title">{{ cat.title }}</text>
            <text v-if="cat.latestTime" class="category-time">{{ cat.latestTime }}</text>
          </view>
          <text class="category-preview">{{ cat.latestMessage }}</text>
        </view>
        <text class="category-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface MessageCategory {
  key: string
  icon: string
  title: string
  latestMessage: string
  latestTime: string
  unreadCount: number
}

const categories = ref<MessageCategory[]>([
  {
    key: 'order',
    icon: '📦',
    title: '订单通知',
    latestMessage: '您的订单 ORD20260420003 已发货，顺丰快递 SF1234567890',
    latestTime: '10:30',
    unreadCount: 2,
  },
  {
    key: 'new_arrival',
    icon: '🖼️',
    title: '新品推送',
    latestMessage: '您关注的艺术家「林清远」发布了新作品「秋山行旅图」',
    latestTime: '昨天',
    unreadCount: 5,
  },
  {
    key: 'artist',
    icon: '🎨',
    title: '艺术家动态',
    latestMessage: '苏婉清将于本周六在798艺术区举办个人画展',
    latestTime: '周三',
    unreadCount: 3,
  },
  {
    key: 'system',
    icon: '🔔',
    title: '系统消息',
    latestMessage: '您的白银会员即将到期，续费享8折优惠',
    latestTime: '5/18',
    unreadCount: 1,
  },
])

const onCategoryTap = (key: string) => {
  uni.navigateTo({ url: `/pages/user/message-list?key=${key}` })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.messages-page {
  min-height: 100vh;
  background-color: $color-bg;
}

.message-categories {
  padding: $spacing-base $spacing-md;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.category-card {
  display: flex;
  align-items: center;
  padding: $spacing-base;
  background-color: $color-white;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  transition: $transition-base;

  &:active {
    transform: scale(0.98);
    box-shadow: $shadow-base;
  }
}

.category-icon-wrap {
  position: relative;
  width: 88rpx;
  height: 88rpx;
  @include flex-center;
  border-radius: $radius-lg;
  flex-shrink: 0;

  &--order {
    background-color: rgba(154, 165, 180, 0.15);
  }

  &--new_arrival {
    background-color: rgba(196, 182, 166, 0.15);
  }

  &--artist {
    background-color: rgba(201, 169, 166, 0.15);
  }

  &--system {
    background-color: rgba(168, 181, 162, 0.15);
  }
}

.category-icon {
  font-size: 40rpx;
}

.category-unread-badge {
  position: absolute;
  top: -6rpx;
  right: -6rpx;
  min-width: 32rpx;
  height: 32rpx;
  @include flex-center;
  background-color: $color-error;
  border-radius: $radius-full;
  padding: 0 8rpx;
  border: 3rpx solid $color-white;
}

.category-unread-text {
  font-size: 18rpx;
  color: $color-white;
  font-weight: 600;
}

.category-info {
  flex: 1;
  margin-left: $spacing-base;
  overflow: hidden;
}

.category-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-title {
  font-size: $font-md;
  font-weight: 600;
  color: $color-text-primary;
  letter-spacing: 2rpx;
}

.category-time {
  font-size: $font-xs;
  color: $color-text-placeholder;
  letter-spacing: 1rpx;
  flex-shrink: 0;
}

.category-preview {
  display: block;
  margin-top: 8rpx;
  font-size: $font-sm;
  color: $color-text-tertiary;
  @include ellipsis(2);
  line-height: 1.5;
  letter-spacing: 1rpx;
}

.category-arrow {
  font-size: $font-lg;
  color: $color-text-placeholder;
  margin-left: $spacing-sm;
  flex-shrink: 0;
}
</style>
