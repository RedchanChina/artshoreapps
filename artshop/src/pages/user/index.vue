<template>
  <view class="user-page">
    <view class="profile-header">
      <image
        class="profile-avatar"
        :src="mockUser.avatar"
        mode="aspectFill"
      />
      <text class="profile-name">{{ mockUser.nickname }}</text>
      <text class="profile-level">{{ memberLevelName }}</text>
    </view>

    <view class="section-divider" />

    <view class="orders-section">
      <text class="section-heading">My Orders</text>
      <view class="order-links">
        <text class="order-link" @tap="onOrderEntryTap('PENDING_PAYMENT')">Pending</text>
        <text class="order-link" @tap="onOrderEntryTap('SHIPPED')">Shipped</text>
        <text class="order-link" @tap="onOrderEntryTap('COMPLETED')">Completed</text>
        <text class="order-link" @tap="onOrderEntryTap('AFTER_SALE')">Refund</text>
      </view>
    </view>

    <view class="section-divider" />

    <view class="func-list">
      <view class="func-row" @tap="onFuncItemTap('collections')">
        <text class="func-label">My Collections</text>
        <text class="func-arrow">→</text>
      </view>
      <view class="func-row" @tap="onFuncItemTap('addresses')">
        <text class="func-label">Addresses</text>
        <text class="func-arrow">→</text>
      </view>
      <view class="func-row" @tap="onFuncItemTap('coupons')">
        <text class="func-label">Coupons</text>
        <text class="func-arrow">→</text>
      </view>
      <view class="func-row" @tap="onFuncItemTap('messages')">
        <text class="func-label">Messages</text>
        <text class="func-arrow">→</text>
      </view>
      <view class="func-row" @tap="onFuncItemTap('about')">
        <text class="func-label">About</text>
        <text class="func-arrow">→</text>
      </view>
    </view>

    <view class="section-divider" />

    <view class="member-section">
      <text class="section-heading">Membership</text>
      <text class="member-level">{{ memberLevelName }}</text>
      <text class="member-points">{{ mockUser.points }} Points</text>
      <text class="member-benefit">Exclusive discounts · Free shipping · Priority access</text>
    </view>

    <view class="section-divider" />

    <view class="logout-section">
      <text class="logout-link" @tap="onLoginLogout">{{ isLoggedIn ? 'Log Out' : 'Log In' }}</text>
    </view>

    <view class="bottom-spacer" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const memberLevelName = computed(() => userStore.memberLevelName || 'Standard Member')

const mockUser = ref({
  nickname: 'Art Voyager',
  avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=abstract%20morandi%20colors%20artistic%20avatar%20soft%20beige%20minimalist&image_size=portrait_4_3',
  bio: 'Illuminating life through art',
  memberLevel: 2,
  points: 2680,
})

const onOrderEntryTap = (status: string) => {
  uni.navigateTo({ url: `/pages/order/index?tab=${status}` })
}

const onFuncItemTap = (key: string) => {
  const urlMap: Record<string, string> = {
    collections: '/pages/user/collections',
    addresses: '/pages/user/addresses',
    coupons: '/pages/user/coupons',
    messages: '/pages/user/messages',
    about: '/pages/user/about',
  }
  const url = urlMap[key]
  if (url) {
    uni.navigateTo({ url })
  }
}

const onLoginLogout = () => {
  if (isLoggedIn.value) {
    uni.showModal({
      title: '',
      content: 'Log out?',
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
@import '@/styles/mixins.scss';
.user-page {
  min-height: 100vh;
  background-color: $color-surface;
}

.profile-header {
  @include flex-center;
  flex-direction: column;
  padding: $space-3xl $space-lg $space-xl;
  gap: $space-sm;
}

.profile-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  flex-shrink: 0;
  margin-bottom: $space-md;
}

.profile-name {
  @include serif-heading;
  font-size: $font-xl;
}

.profile-level {
  @include sans-body;
  font-size: $font-sm;
  letter-spacing: 0.04em;
}

.section-divider {
  @include divider;
  margin: 0 $space-lg;
}

.orders-section {
  padding: $space-xl $space-lg;

  .section-heading {
    @include serif-heading;
    font-size: $font-md;
    display: block;
    margin-bottom: $space-md;
  }
}

.order-links {
  display: flex;
  justify-content: space-between;
}

.order-link {
  @include sans-body;
  font-size: $font-sm;
  color: $color-ink-secondary;
  letter-spacing: 0.04em;

  &:active {
    color: $color-ink;
  }
}

.func-list {
  padding: $space-md $space-lg;
}

.func-row {
  @include flex-between;
  padding: $space-lg 0;
  border-bottom: 1rpx solid $color-rule;

  &:last-child {
    border-bottom: none;
  }
}

.func-label {
  @include sans-body;
  font-size: $font-base;
  color: $color-ink;
  letter-spacing: 0.04em;
}

.func-arrow {
  @include sans-body;
  font-size: $font-sm;
  color: $color-ink-tertiary;
}

.member-section {
  padding: $space-xl $space-lg;

  .section-heading {
    @include serif-heading;
    font-size: $font-md;
    display: block;
    margin-bottom: $space-md;
  }
}

.member-level {
  @include serif-heading;
  font-size: $font-lg;
  display: block;
  margin-bottom: $space-xs;
}

.member-points {
  @include sans-body;
  font-size: $font-sm;
  display: block;
  margin-bottom: $space-sm;
}

.member-benefit {
  @include sans-body;
  font-size: $font-xs;
  color: $color-ink-tertiary;
  letter-spacing: 0.02em;
}

.logout-section {
  @include flex-center;
  padding: $space-xl $space-lg;
}

.logout-link {
  @include sans-body;
  font-size: $font-sm;
  color: $color-ink-tertiary;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  &:active {
    color: $color-ink;
  }
}

.bottom-spacer {
  height: 120rpx;
}

@media (min-width: $breakpoint-md) {
  .user-page {
    @include responsive-container;
  }

  .profile-header {
    padding: $space-3xl $space-xl $space-2xl;
  }

  .profile-avatar {
    width: 200rpx;
    height: 200rpx;
  }

  .profile-name {
    font-size: $font-xxl;
  }

  .section-divider {
    margin: 0 $space-xl;
  }

  .orders-section {
    padding: $space-xl $space-xl;

    .section-heading {
      font-size: $font-lg;
    }
  }

  .order-links {
    gap: $space-xl;
  }

  .order-link {
    font-size: $font-base;
    cursor: pointer;

    &:hover {
      color: $color-ink;
    }
  }

  .func-list {
    padding: $space-lg $space-xl;
  }

  .func-row {
    padding: $space-xl 0;
    cursor: pointer;

    &:hover {
      .func-label {
        color: $color-accent;
      }
    }
  }

  .func-label {
    font-size: $font-md;
  }

  .member-section {
    padding: $space-xl $space-xl;

    .section-heading {
      font-size: $font-lg;
    }
  }

  .member-level {
    font-size: $font-xl;
  }

  .member-points {
    font-size: $font-base;
  }

  .logout-section {
    padding: $space-2xl $space-xl;
  }

  .logout-link {
    cursor: pointer;

    &:hover {
      color: $color-ink;
    }
  }
}

@media (min-width: $breakpoint-lg) {
  .user-page {
    @include desktop-sidebar(1fr, 360px);
    padding: $space-2xl;
    gap: $space-3xl;
  }

  .profile-header {
    padding: $space-2xl 0;
  }

  .section-divider {
    margin: 0;
  }

  .orders-section {
    padding: $space-xl 0;
  }

  .func-list {
    padding: $space-lg 0;
  }

  .member-section {
    padding: $space-xl 0;
  }

  .logout-section {
    padding: $space-xl 0;
  }
}
</style>
