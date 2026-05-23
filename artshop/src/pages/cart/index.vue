<template>
  <view class="cart-page">
    <view v-if="cartStore.items.length > 0" class="cart-content">
      <scroll-view
        class="cart-scroll"
        scroll-y
        enhanced
        :show-scrollbar="false"
        refresher-enabled
        :refresher-triggered="isRefreshing"
        @refresherrefresh="onRefresh"
      >
        <view class="cart-header">
          <text class="cart-title">购物车</text>
          <text class="cart-count">({{ cartStore.totalCount }})</text>
        </view>

        <view class="cart-list">
          <view
            v-for="item in cartStore.items"
            :key="item.artworkId"
            class="cart-item-wrapper"
          >
            <view
              class="cart-item-swipe"
              :style="{ transform: `translateX(${swipeOffsets[item.artworkId] || 0}rpx)` }"
              @touchstart="onSwipeStart($event, item.artworkId)"
              @touchmove="onSwipeMove($event, item.artworkId)"
              @touchend="onSwipeEnd(item.artworkId)"
            >
              <view class="cart-item">
                <view
                  :class="['checkbox', { 'checkbox--checked': isSelected(item.artworkId) }]"
                  @tap="cartStore.toggleSelect(item.artworkId)"
                >
                  <text v-if="isSelected(item.artworkId)" class="checkbox-icon">✓</text>
                </view>

                <image :src="item.image" mode="aspectFill" class="item-thumb" />

                <view class="item-info">
                  <text class="item-title">{{ item.title }}</text>
                  <text class="item-artist">{{ item.artistName }}</text>
                  <view class="item-specs">
                    <text class="spec-tag">{{ item.spec.size }}</text>
                    <text class="spec-tag">{{ item.spec.material }}</text>
                    <text class="spec-tag">{{ item.spec.frameStyle }}</text>
                  </view>
                  <view class="item-bottom">
                    <text class="item-price">¥{{ formatPrice(item.unitPrice) }}</text>
                    <view class="quantity-stepper">
                      <view
                        :class="['stepper-btn', { 'stepper-btn--disabled': item.quantity <= 1 }]"
                        @tap="decreaseQuantity(item.artworkId)"
                      >
                        <text class="stepper-btn-text">−</text>
                      </view>
                      <text class="stepper-value">{{ item.quantity }}</text>
                      <view
                        class="stepper-btn"
                        @tap="increaseQuantity(item.artworkId)"
                      >
                        <text class="stepper-btn-text">+</text>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>

            <view class="swipe-action" @tap="onDelete(item.artworkId)">
              <text class="swipe-action-text">删除</text>
            </view>
          </view>
        </view>

        <view class="continue-shopping" @tap="goToGallery">
          <text class="continue-shopping-text">继续逛逛 ›</text>
        </view>
      </scroll-view>

      <view class="bottom-bar" :style="{ paddingBottom: safeAreaBottom + 'px' }">
        <view class="select-all" @tap="cartStore.selectAll()">
          <view :class="['checkbox', { 'checkbox--checked': cartStore.allSelected }]">
            <text v-if="cartStore.allSelected" class="checkbox-icon">✓</text>
          </view>
          <text class="select-all-text">全选</text>
        </view>

        <view class="bottom-right">
          <view class="total-info">
            <text class="total-label">合计：</text>
            <text class="total-price">¥{{ formatPrice(cartStore.selectedTotalPrice) }}</text>
          </view>
          <view
            :class="['checkout-btn', { 'checkout-btn--disabled': cartStore.selectedCount === 0 }]"
            @tap="goToCheckout"
          >
            <text class="checkout-btn-text">结算({{ cartStore.selectedCount }})</text>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="cart-empty">
      <EmptyState
        icon="🛒"
        title="购物车空空如也"
        description="快去挑选心仪的艺术品吧"
        actionText="去逛逛"
        @action="goToGallery"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { useCartStore } from '@/stores/cart'
import EmptyState from '@/components/EmptyState.vue'

const cartStore = useCartStore()
const isRefreshing = ref(false)
const safeAreaBottom = ref(0)
const swipeOffset = 0
const DELETE_WIDTH = 160
const swipeOffsets = reactive<Record<string, number>>({})
const swipeStartX = reactive<Record<string, number>>({})
const swipeStartOffset = reactive<Record<string, number>>({})

function isSelected(artworkId: string): boolean {
  return cartStore.selectedIds.includes(artworkId)
}

function formatPrice(price: number): string {
  return price.toLocaleString('zh-CN')
}

function increaseQuantity(artworkId: string) {
  const item = cartStore.items.find((i) => i.artworkId === artworkId)
  if (item) {
    cartStore.updateQuantity(artworkId, item.quantity + 1)
  }
}

function decreaseQuantity(artworkId: string) {
  const item = cartStore.items.find((i) => i.artworkId === artworkId)
  if (item && item.quantity > 1) {
    cartStore.updateQuantity(artworkId, item.quantity - 1)
  }
}

function onDelete(artworkId: string) {
  uni.showModal({
    title: '提示',
    content: '确定要删除该商品吗？',
    success: (res) => {
      if (res.confirm) {
        cartStore.removeItem(artworkId)
        delete swipeOffsets[artworkId]
        uni.showToast({ title: '已删除', icon: 'none', duration: 1000 })
      }
    },
  })
}

function onSwipeStart(e: any, artworkId: string) {
  swipeStartX[artworkId] = e.touches[0].clientX
  swipeStartOffset[artworkId] = swipeOffsets[artworkId] || 0
}

function onSwipeMove(e: any, artworkId: string) {
  const deltaX = e.touches[0].clientX - swipeStartX[artworkId]
  const rpxDelta = (deltaX / uni.getSystemInfoSync().windowWidth) * 750
  let newOffset = swipeStartOffset[artworkId] + rpxDelta
  if (newOffset > 0) newOffset = 0
  if (newOffset < -DELETE_WIDTH) newOffset = -DELETE_WIDTH
  swipeOffsets[artworkId] = newOffset
}

function onSwipeEnd(artworkId: string) {
  const currentOffset = swipeOffsets[artworkId] || 0
  if (currentOffset < -DELETE_WIDTH / 2) {
    swipeOffsets[artworkId] = -DELETE_WIDTH
  } else {
    swipeOffsets[artworkId] = 0
  }
}

function goToGallery() {
  uni.switchTab({ url: '/pages/gallery/index' })
}

function goToCheckout() {
  if (cartStore.selectedCount === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages/checkout/index' })
}

function onRefresh() {
  isRefreshing.value = true
  setTimeout(() => {
    isRefreshing.value = false
  }, 800)
}

onPullDownRefresh(() => {
  setTimeout(() => {
    uni.stopPullDownRefresh()
  }, 800)
})

const systemInfo = uni.getSystemInfoSync()
safeAreaBottom.value = systemInfo.safeArea?.bottom
  ? systemInfo.windowHeight - systemInfo.safeArea.bottom
  : 0
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.cart-page {
  min-height: 100vh;
  background-color: $color-bg;
}

.cart-content {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.cart-scroll {
  flex: 1;
  padding-bottom: 140rpx;
}

.cart-header {
  @include flex-between;
  padding: $spacing-md $spacing-lg $spacing-sm;

  .cart-title {
    font-size: $font-lg;
    font-weight: 600;
    color: $color-text-primary;
    letter-spacing: 4rpx;
  }

  .cart-count {
    font-size: $font-sm;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;
  }
}

.cart-list {
  padding: 0 $spacing-base;
}

.cart-item-wrapper {
  position: relative;
  overflow: hidden;
  margin-bottom: $spacing-sm;
  border-radius: $radius-lg;
}

.cart-item-swipe {
  position: relative;
  z-index: 2;
  background-color: $color-white;
  transition: transform 0.15s ease;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.cart-item {
  display: flex;
  align-items: flex-start;
  padding: $spacing-base;
  gap: $spacing-sm;
}

.checkbox {
  flex-shrink: 0;
  width: 44rpx;
  height: 44rpx;
  border-radius: $radius-full;
  border: 2rpx solid $color-border;
  background-color: $color-white;
  @include flex-center;
  margin-top: 40rpx;
  transition: $transition-base;

  &--checked {
    background-color: $color-accent;
    border-color: $color-accent;

    .checkbox-icon {
      color: $color-white;
      font-size: $font-sm;
      font-weight: 600;
    }
  }
}

.item-thumb {
  flex-shrink: 0;
  width: 180rpx;
  height: 180rpx;
  border-radius: $radius-base;
  background-color: $color-bg-secondary;
}

.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.item-title {
  font-size: $font-base;
  font-weight: 500;
  color: $color-text-primary;
  letter-spacing: 1rpx;
  @include ellipsis;
}

.item-artist {
  font-size: $font-xs;
  color: $color-text-tertiary;
  letter-spacing: 1rpx;
}

.item-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 4rpx;
}

.spec-tag {
  font-size: $font-xs;
  color: $color-text-secondary;
  background-color: $color-bg-secondary;
  padding: 4rpx 12rpx;
  border-radius: $radius-sm;
  letter-spacing: 1rpx;
}

.item-bottom {
  @include flex-between;
  margin-top: 8rpx;
}

.item-price {
  font-size: $font-md;
  color: $color-accent;
  font-weight: 600;
  letter-spacing: 1rpx;
}

.quantity-stepper {
  display: flex;
  align-items: center;
  gap: 0;
  border: 2rpx solid $color-border;
  border-radius: $radius-sm;
  overflow: hidden;
}

.stepper-btn {
  width: 56rpx;
  height: 52rpx;
  @include flex-center;
  background-color: $color-bg-secondary;
  transition: $transition-base;

  &:active {
    background-color: $color-border;
  }

  &--disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .stepper-btn-text {
    font-size: $font-md;
    color: $color-text-secondary;
    font-weight: 500;
  }
}

.stepper-value {
  min-width: 56rpx;
  height: 52rpx;
  @include flex-center;
  font-size: $font-sm;
  color: $color-text-primary;
  font-weight: 500;
  background-color: $color-white;
}

.swipe-action {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 160rpx;
  z-index: 1;
  @include flex-center;
  background-color: $color-error;
  border-radius: 0 $radius-lg $radius-lg 0;

  .swipe-action-text {
    font-size: $font-base;
    color: $color-white;
    letter-spacing: 2rpx;
    font-weight: 500;
  }
}

.continue-shopping {
  @include flex-center;
  padding: $spacing-lg 0 $spacing-xl;

  .continue-shopping-text {
    font-size: $font-sm;
    color: $morandi-beige;
    letter-spacing: 2rpx;
  }

  &:active {
    opacity: 0.7;
  }
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-base;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-top: 1rpx solid $color-border;
  gap: $spacing-base;
}

.select-all {
  display: flex;
  align-items: center;
  gap: $spacing-xs;

  .select-all-text {
    font-size: $font-sm;
    color: $color-text-secondary;
    letter-spacing: 1rpx;
  }
}

.bottom-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: $spacing-base;
}

.total-info {
  display: flex;
  align-items: baseline;

  .total-label {
    font-size: $font-sm;
    color: $color-text-secondary;
    letter-spacing: 1rpx;
  }

  .total-price {
    font-size: $font-lg;
    color: $color-accent;
    font-weight: 700;
    letter-spacing: 1rpx;
  }
}

.checkout-btn {
  height: 80rpx;
  padding: 0 $spacing-lg;
  @include flex-center;
  background-color: $color-accent;
  border-radius: $radius-full;
  transition: $transition-base;

  &:active {
    opacity: 0.85;
    transform: scale(0.97);
  }

  &--disabled {
    background-color: $color-border;
    pointer-events: none;

    .checkout-btn-text {
      color: $color-text-tertiary;
    }
  }

  .checkout-btn-text {
    font-size: $font-base;
    color: $color-white;
    letter-spacing: 2rpx;
    font-weight: 500;
  }
}

.cart-empty {
  @include flex-center;
  min-height: 100vh;
  background-color: $color-bg;
}
</style>
