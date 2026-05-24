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
          <text class="cart-count">{{ cartStore.totalCount }} 件商品</text>
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
                <view class="item-select" @tap="cartStore.toggleSelect(item.artworkId)">
                  <text class="select-radio">{{ isSelected(item.artworkId) ? '●' : '○' }}</text>
                </view>

                <image :src="item.image" mode="aspectFill" class="item-thumb" />

                <view class="item-info">
                  <text class="item-title">{{ item.title }}</text>
                  <text class="item-spec">{{ item.spec.size }} · {{ item.spec.material }} · {{ item.spec.frameStyle }}</text>
                  <view class="item-bottom">
                    <text class="item-price">¥{{ formatPrice(item.unitPrice) }}</text>
                    <view class="quantity-stepper">
                      <text class="stepper-btn" @tap="decreaseQuantity(item.artworkId)">−</text>
                      <text class="stepper-value">{{ item.quantity }}</text>
                      <text class="stepper-btn" @tap="increaseQuantity(item.artworkId)">+</text>
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

        <view class="continue-link" @tap="goToGallery">
          <text class="continue-link-text">继续逛逛 →</text>
        </view>
      </scroll-view>

      <view class="bottom-bar" :style="{ paddingBottom: safeAreaBottom + 'px' }">
        <view class="select-all" @tap="cartStore.selectAll()">
          <text class="select-radio">{{ cartStore.allSelected ? '●' : '○' }}</text>
          <text class="select-all-text">全选</text>
        </view>

        <view class="bottom-right">
          <view class="total-info">
            <text class="total-label">合计</text>
            <text class="total-price">¥{{ formatPrice(cartStore.selectedTotalPrice) }}</text>
          </view>
          <view
            :class="['checkout-btn', { 'checkout-btn--disabled': cartStore.selectedCount === 0 }]"
            @tap="goToCheckout"
          >
            <text class="checkout-btn-text">结算</text>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="cart-empty">
      <text class="empty-title">购物车是空的</text>
      <text class="empty-link" @tap="goToGallery">去逛逛 →</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
const isRefreshing = ref(false)
const safeAreaBottom = ref(0)
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
    title: '',
    content: '确定要删除这件商品吗？',
    success: (res) => {
      if (res.confirm) {
        cartStore.removeItem(artworkId)
        delete swipeOffsets[artworkId]
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
  if (cartStore.selectedCount === 0) return
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
@import '@/styles/mixins.scss';
.cart-page {
  min-height: 100vh;
  background-color: $color-surface;
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
  padding: $space-xl $space-lg $space-md;

  .cart-title {
    @include serif-heading;
    font-size: $font-xl;
  }

  .cart-count {
    @include sans-body;
    font-size: $font-sm;
  }
}

.cart-list {
  padding: 0 $space-lg;
}

.cart-item-wrapper {
  position: relative;
  overflow: hidden;
  margin-bottom: $space-md;
}

.cart-item-swipe {
  position: relative;
  z-index: 2;
  background-color: $color-surface;
  transition: transform $duration-base $ease-out-expo;
}

.cart-item {
  display: flex;
  align-items: flex-start;
  padding: $space-lg 0;
  border-bottom: 1rpx solid $color-rule;
  gap: $space-md;
}

.item-select {
  flex-shrink: 0;
  padding-top: $space-xs;

  .select-radio {
    font-size: $font-md;
    color: $color-ink-tertiary;
    letter-spacing: 0;
  }
}

.item-thumb {
  flex-shrink: 0;
  width: 120rpx;
  height: 120rpx;
  border-radius: $radius-xs;
  background-color: $color-surface-warm;
}

.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: $space-xs;
}

.item-title {
  @include serif-heading;
  font-size: $font-base;
  @include ellipsis;
}

.item-spec {
  @include sans-body;
  font-size: $font-xs;
}

.item-bottom {
  @include flex-between;
  margin-top: $space-xs;
}

.item-price {
  font-family: $font-sans;
  font-size: $font-base;
  color: $color-ink;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.quantity-stepper {
  display: flex;
  align-items: center;
  gap: $space-md;

  .stepper-btn {
    @include sans-body;
    font-size: $font-base;
    color: $color-ink-secondary;
    letter-spacing: 0;
  }

  .stepper-value {
    @include sans-body;
    font-size: $font-sm;
    color: $color-ink;
    min-width: 32rpx;
    text-align: center;
  }
}

.swipe-action {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 160rpx;
  z-index: 1;
  @include flex-center;
  background-color: $color-ink;

  .swipe-action-text {
    font-family: $font-sans;
    font-size: $font-xs;
    color: $color-surface;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
}

.continue-link {
  @include flex-center;
  padding: $space-xl 0 $space-3xl;

  .continue-link-text {
    @include sans-body;
    font-size: $font-sm;
    color: $color-ink-secondary;
    letter-spacing: 0.04em;
  }

  &:active {
    opacity: 0.6;
  }
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  @include flex-between;
  padding: $space-md $space-lg;
  background-color: $color-surface;
  border-top: 1rpx solid $color-rule;
}

.select-all {
  display: flex;
  align-items: center;
  gap: $space-sm;

  .select-radio {
    font-size: $font-md;
    color: $color-ink-tertiary;
  }

  .select-all-text {
    @include sans-body;
    font-size: $font-sm;
    letter-spacing: 0.04em;
  }
}

.bottom-right {
  display: flex;
  align-items: center;
  gap: $space-lg;
}

.total-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  .total-label {
    @include sans-body;
    font-size: $font-xs;
    letter-spacing: 0.04em;
  }

  .total-price {
    font-family: $font-serif;
    font-size: $font-lg;
    color: $color-ink;
    font-weight: 400;
    letter-spacing: 0.02em;
  }
}

.checkout-btn {
  @include btn-primary;
  height: 80rpx;
  padding: 0 $space-xl;

  &--disabled {
    background-color: $color-rule;
    pointer-events: none;

    .checkout-btn-text {
      color: $color-ink-tertiary;
    }
  }

  .checkout-btn-text {
    font-size: $font-sm;
    letter-spacing: 0.08em;
  }
}

.cart-empty {
  @include flex-center;
  flex-direction: column;
  min-height: 100vh;
  background-color: $color-surface;
  gap: $space-lg;

  .empty-title {
    @include serif-heading;
    font-size: $font-lg;
  }

  .empty-link {
    @include sans-body;
    font-size: $font-sm;
    color: $color-ink-secondary;
    letter-spacing: 0.04em;

    &:active {
      opacity: 0.6;
    }
  }
}

@media (min-width: 768px) {
  .cart-page {
    @include responsive-container($max-width-narrow);
  }

  .cart-scroll {
    @include desktop-scrollbar;
  }

  .cart-header {
    padding: $space-2xl $space-xl $space-lg;
  }

  .cart-list {
    padding: 0 $space-xl;
  }

  .cart-item-wrapper {
    margin-bottom: $space-lg;
  }

  .cart-item {
    padding: $space-xl 0;
    gap: $space-lg;
  }

  .item-thumb {
    width: 90px;
    height: 90px;
  }

  .item-info {
    gap: $space-sm;
  }

  .quantity-stepper {
    gap: $space-lg;

    .stepper-btn {
      font-size: $font-md;
      padding: $space-xs $space-sm;
      cursor: pointer;
    }

    .stepper-value {
      font-size: $font-base;
      min-width: 20px;
    }
  }

  .bottom-bar {
    @include responsive-container($max-width-narrow);
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    padding: $space-lg $space-2xl;
  }

  .continue-link {
    .continue-link-text {
      @include hover-lift;
      cursor: pointer;
    }
  }
}
</style>
