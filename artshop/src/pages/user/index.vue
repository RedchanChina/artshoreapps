<template>
  <view class="user-page">
    <view class="profile-header">
      <view class="profile-bg" />
      <view class="profile-content">
        <image
          class="profile-avatar"
          :src="mockUser.avatar"
          mode="aspectFill"
        />
        <view class="profile-info">
          <view class="profile-name-row">
            <text class="profile-nickname">{{ mockUser.nickname }}</text>
            <view class="member-badge" :class="'member-badge--level-' + mockUser.memberLevel">
              <text class="member-badge-text">{{ memberLevelName }}</text>
            </view>
          </view>
          <text class="profile-bio">{{ mockUser.bio }}</text>
        </view>
        <view class="profile-edit" @tap="onEditProfile">
          <text class="profile-edit-text">编辑</text>
        </view>
      </view>
    </view>

    <view class="order-section">
      <view class="section-header">
        <text class="section-title">我的订单</text>
        <view class="section-link" @tap="onViewAllOrders">
          <text class="section-link-text">全部订单</text>
          <text class="section-link-arrow">›</text>
        </view>
      </view>
      <view class="order-quick-entries">
        <view
          v-for="entry in orderEntries"
          :key="entry.key"
          class="order-entry"
          @tap="onOrderEntryTap(entry.key)"
        >
          <view class="order-entry-icon-wrap">
            <text class="order-entry-icon">{{ entry.icon }}</text>
            <view v-if="entry.count > 0" class="order-entry-badge">
              <text class="order-entry-badge-text">{{ entry.count > 99 ? '99+' : entry.count }}</text>
            </view>
          </view>
          <text class="order-entry-label">{{ entry.label }}</text>
        </view>
      </view>
    </view>

    <view class="func-section">
      <view class="func-grid">
        <view
          v-for="item in funcItems"
          :key="item.key"
          class="func-item"
          @tap="onFuncItemTap(item.key)"
        >
          <view class="func-item-icon-wrap">
            <text class="func-item-icon">{{ item.icon }}</text>
            <view v-if="item.badge && item.badge > 0" class="func-item-badge">
              <text class="func-item-badge-text">{{ item.badge }}</text>
            </view>
          </view>
          <text class="func-item-label">{{ item.label }}</text>
        </view>
      </view>
    </view>

    <view class="member-card-section">
      <view class="member-card">
        <view class="member-card-bg" />
        <view class="member-card-content">
          <view class="member-card-top">
            <view class="member-card-level">
              <text class="member-card-level-icon">✦</text>
              <text class="member-card-level-name">{{ memberLevelName }}</text>
            </view>
            <text class="member-card-points">{{ mockUser.points }} 积分</text>
          </view>
          <view class="member-card-benefits">
            <view
              v-for="(benefit, idx) in memberBenefits"
              :key="idx"
              class="member-benefit"
            >
              <text class="member-benefit-icon">{{ benefit.icon }}</text>
              <text class="member-benefit-text">{{ benefit.text }}</text>
            </view>
          </view>
          <view class="member-card-action" @tap="onMemberTap">
            <text class="member-card-action-text">查看会员权益 ›</text>
          </view>
        </view>
      </view>
    </view>

    <view class="settings-section">
      <view class="settings-btn" :class="isLoggedIn ? 'settings-btn--logout' : 'settings-btn--login'" @tap="onLoginLogout">
        <text class="settings-btn-text">{{ isLoggedIn ? '退出登录' : '登录 / 注册' }}</text>
      </view>
    </view>

    <view class="bottom-spacer" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)

const memberLevelName = computed(() => userStore.memberLevelName || '普通会员')

const mockUser = ref({
  nickname: '艺术旅人',
  avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=abstract%20morandi%20colors%20artistic%20avatar%20soft%20beige%20minimalist&image_size=portrait_4_3',
  bio: '用艺术点亮生活的每一刻',
  memberLevel: 2,
  points: 2680,
})

const orderEntries = ref([
  { key: 'pending_payment', label: '待付款', icon: '💳', count: 2 },
  { key: 'pending_shipment', label: '待发货', icon: '📦', count: 1 },
  { key: 'shipped', label: '已发货', icon: '🚚', count: 3 },
  { key: 'completed', label: '已完成', icon: '✅', count: 0 },
])

const funcItems = ref([
  { key: 'collections', label: '我的收藏', icon: '♥', badge: 0 },
  { key: 'addresses', label: '地址管理', icon: '📍', badge: 0 },
  { key: 'custom', label: '我的定制', icon: '🎨', badge: 0 },
  { key: 'coupons', label: '优惠券', icon: '🎫', badge: 5 },
  { key: 'messages', label: '消息中心', icon: '🔔', badge: 3 },
  { key: 'about', label: '关于我们', icon: 'ℹ️', badge: 0 },
])

const memberBenefits = ref([
  { icon: '🎁', text: '专属折扣' },
  { icon: '🚚', text: '免运费' },
  { icon: '🎯', text: '优先定制' },
])

const onEditProfile = () => {
  uni.navigateTo({ url: '/pages/user/profile' })
}

const onViewAllOrders = () => {
  uni.navigateTo({ url: '/pages/order/index?tab=all' })
}

const onOrderEntryTap = (key: string) => {
  const tabMap: Record<string, string> = {
    pending_payment: 'pending_payment',
    pending_shipment: 'pending_shipment',
    shipped: 'shipped',
    completed: 'completed',
  }
  uni.navigateTo({ url: `/pages/order/index?tab=${tabMap[key] || 'all'}` })
}

const onFuncItemTap = (key: string) => {
  const urlMap: Record<string, string> = {
    collections: '/pages/user/collections',
    addresses: '/pages/user/addresses',
    custom: '/pages/user/custom',
    coupons: '/pages/user/coupons',
    messages: '/pages/user/messages',
    about: '/pages/user/about',
  }
  const url = urlMap[key]
  if (url) {
    uni.navigateTo({ url })
  }
}

const onMemberTap = () => {
  uni.navigateTo({ url: '/pages/user/membership' })
}

const onLoginLogout = () => {
  if (isLoggedIn.value) {
    uni.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          userStore.logout()
        }
      },
    })
  } else {
    uni.navigateTo({ url: '/pages/user/login' })
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.user-page {
  min-height: 100vh;
  background-color: $color-bg;
}

.profile-header {
  position: relative;
  padding: 0 $spacing-md $spacing-lg;
  padding-top: calc(env(safe-area-inset-top) + 40rpx);

  .profile-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 440rpx;
    background: linear-gradient(135deg, $morandi-beige 0%, $morandi-rose 50%, $morandi-purple 100%);
    border-radius: 0 0 $radius-xl $radius-xl;
  }

  .profile-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    padding-top: 40rpx;
  }

  .profile-avatar {
    width: 128rpx;
    height: 128rpx;
    border-radius: $radius-full;
    border: 6rpx solid rgba(255, 255, 255, 0.6);
    flex-shrink: 0;
  }

  .profile-info {
    flex: 1;
    margin-left: $spacing-base;
    overflow: hidden;
  }

  .profile-name-row {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .profile-nickname {
    font-size: $font-lg;
    font-weight: 600;
    color: $color-white;
    letter-spacing: 2rpx;
  }

  .member-badge {
    padding: 4rpx 16rpx;
    border-radius: $radius-full;
    background-color: rgba(255, 255, 255, 0.25);

    &--level-0 {
      background-color: rgba(255, 255, 255, 0.2);
    }

    &--level-1 {
      background-color: rgba(181, 168, 152, 0.5);
    }

    &--level-2 {
      background-color: rgba(180, 195, 210, 0.5);
    }

    &--level-3 {
      background-color: rgba(212, 184, 150, 0.5);
    }

    &--level-4 {
      background-color: rgba(184, 169, 201, 0.5);
    }

    &--level-5 {
      background-color: rgba(201, 169, 166, 0.5);
    }
  }

  .member-badge-text {
    font-size: $font-xs;
    color: $color-white;
    letter-spacing: 1rpx;
  }

  .profile-bio {
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.8);
    margin-top: $spacing-xs;
    @include ellipsis;
    letter-spacing: 1rpx;
  }

  .profile-edit {
    flex-shrink: 0;
    padding: $spacing-xs $spacing-base;
    border: 2rpx solid rgba(255, 255, 255, 0.5);
    border-radius: $radius-full;
    transition: $transition-base;

    &:active {
      opacity: 0.8;
      transform: scale(0.96);
    }
  }

  .profile-edit-text {
    font-size: $font-sm;
    color: $color-white;
    letter-spacing: 2rpx;
  }
}

.order-section {
  margin: $spacing-base $spacing-md 0;
  padding: $spacing-base;
  background-color: $color-white;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;

  .section-header {
    @include flex-between;
    margin-bottom: $spacing-base;
  }

  .section-title {
    font-size: $font-md;
    font-weight: 600;
    color: $color-text-primary;
    letter-spacing: 2rpx;
  }

  .section-link {
    display: flex;
    align-items: center;
    transition: $transition-base;

    &:active {
      opacity: 0.7;
    }
  }

  .section-link-text {
    font-size: $font-sm;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;
  }

  .section-link-arrow {
    font-size: $font-md;
    color: $color-text-tertiary;
    margin-left: 4rpx;
  }

  .order-quick-entries {
    display: flex;
    justify-content: space-around;
  }

  .order-entry {
    @include flex-center;
    flex-direction: column;
    gap: $spacing-xs;
    transition: $transition-base;

    &:active {
      transform: scale(0.95);
    }
  }

  .order-entry-icon-wrap {
    position: relative;
    width: 72rpx;
    height: 72rpx;
    @include flex-center;
    background-color: $color-bg-secondary;
    border-radius: $radius-full;
  }

  .order-entry-icon {
    font-size: 36rpx;
  }

  .order-entry-badge {
    position: absolute;
    top: -4rpx;
    right: -4rpx;
    min-width: 32rpx;
    height: 32rpx;
    @include flex-center;
    background-color: $color-error;
    border-radius: $radius-full;
    padding: 0 8rpx;
  }

  .order-entry-badge-text {
    font-size: 18rpx;
    color: $color-white;
    font-weight: 600;
  }

  .order-entry-label {
    font-size: $font-sm;
    color: $color-text-secondary;
    letter-spacing: 1rpx;
  }
}

.func-section {
  margin: $spacing-base $spacing-md 0;

  .func-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-sm;
  }

  .func-item {
    display: flex;
    align-items: center;
    padding: $spacing-base;
    background-color: $color-white;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
    transition: $transition-base;

    &:active {
      transform: scale(0.97);
      box-shadow: $shadow-base;
    }
  }

  .func-item-icon-wrap {
    position: relative;
    width: 64rpx;
    height: 64rpx;
    @include flex-center;
    background-color: $color-bg-secondary;
    border-radius: $radius-base;
    flex-shrink: 0;
  }

  .func-item-icon {
    font-size: 32rpx;
  }

  .func-item-badge {
    position: absolute;
    top: -6rpx;
    right: -6rpx;
    min-width: 28rpx;
    height: 28rpx;
    @include flex-center;
    background-color: $color-error;
    border-radius: $radius-full;
    padding: 0 6rpx;
  }

  .func-item-badge-text {
    font-size: 18rpx;
    color: $color-white;
    font-weight: 600;
  }

  .func-item-label {
    flex: 1;
    margin-left: $spacing-base;
    font-size: $font-base;
    color: $color-text-primary;
    letter-spacing: 2rpx;
  }
}

.member-card-section {
  margin: $spacing-base $spacing-md 0;

  .member-card {
    position: relative;
    border-radius: $radius-lg;
    overflow: hidden;
    box-shadow: $shadow-base;
  }

  .member-card-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, $color-accent 0%, $morandi-brown 50%, $morandi-beige 100%);
  }

  .member-card-content {
    position: relative;
    z-index: 1;
    padding: $spacing-base $spacing-md;
  }

  .member-card-top {
    @include flex-between;
  }

  .member-card-level {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
  }

  .member-card-level-icon {
    font-size: $font-md;
    color: $color-warning;
  }

  .member-card-level-name {
    font-size: $font-md;
    font-weight: 600;
    color: $color-white;
    letter-spacing: 2rpx;
  }

  .member-card-points {
    font-size: $font-base;
    color: rgba(255, 255, 255, 0.85);
    letter-spacing: 1rpx;
  }

  .member-card-benefits {
    display: flex;
    gap: $spacing-md;
    margin-top: $spacing-base;
    padding-top: $spacing-base;
    border-top: 1rpx solid rgba(255, 255, 255, 0.2);
  }

  .member-benefit {
    display: flex;
    align-items: center;
    gap: 6rpx;
  }

  .member-benefit-icon {
    font-size: $font-sm;
  }

  .member-benefit-text {
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.85);
    letter-spacing: 1rpx;
  }

  .member-card-action {
    margin-top: $spacing-base;
    align-self: flex-start;
    transition: $transition-base;

    &:active {
      opacity: 0.8;
    }
  }

  .member-card-action-text {
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 1rpx;
  }
}

.settings-section {
  margin: $spacing-lg $spacing-md 0;

  .settings-btn {
    width: 100%;
    padding: $spacing-base 0;
    @include flex-center;
    border-radius: $radius-lg;
    transition: $transition-base;

    &:active {
      transform: scale(0.98);
    }

    &--login {
      background-color: $color-accent;
    }

    &--logout {
      background-color: $color-white;
      border: 2rpx solid $color-border;
    }
  }

  .settings-btn-text {
    font-size: $font-base;
    letter-spacing: 2rpx;
  }

  .settings-btn--login .settings-btn-text {
    color: $color-white;
  }

  .settings-btn--logout .settings-btn-text {
    color: $color-text-secondary;
  }
}

.bottom-spacer {
  height: 120rpx;
}
</style>
