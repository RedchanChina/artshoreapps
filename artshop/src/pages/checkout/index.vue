<template>
  <view class="checkout-page">
    <view v-if="!paymentSuccess" class="checkout-content">
      <scroll-view class="checkout-scroll" scroll-y enhanced :show-scrollbar="false">
        <view class="section shipping-section" @tap="onAddressTap">
          <view class="section-header">
            <text class="section-title">收货信息</text>
            <text class="section-action">›</text>
          </view>

          <view v-if="currentAddress" class="address-info">
            <view class="address-top">
              <text class="address-name">{{ currentAddress.name }}</text>
              <text class="address-phone">{{ currentAddress.phone }}</text>
              <view v-if="currentAddress.isDefault" class="default-badge">
                <text class="default-badge-text">默认</text>
              </view>
            </view>
            <text class="address-detail">
              {{ currentAddress.province }}{{ currentAddress.city }}{{ currentAddress.district }}{{ currentAddress.detail }}
            </text>
          </view>

          <view v-else class="address-empty" @tap="onAddAddress">
            <text class="address-empty-icon">📍</text>
            <text class="address-empty-text">添加收货地址</text>
          </view>

          <view class="address-divider">
            <view class="divider-line" />
            <view class="divider-dots">
              <view v-for="i in 12" :key="i" class="divider-dot" />
            </view>
            <view class="divider-line" />
          </view>
        </view>

        <view v-if="showAddressPicker" class="section address-picker">
          <view class="picker-header">
            <text class="picker-title">选择收货地址</text>
            <view class="picker-close" @tap="showAddressPicker = false">
              <text class="picker-close-text">✕</text>
            </view>
          </view>
          <view
            v-for="addr in userStore.addresses"
            :key="addr.id"
            :class="['address-option', { 'address-option--active': selectedAddressId === addr.id }]"
            @tap="selectAddress(addr.id)"
          >
            <view :class="['radio-dot', { 'radio-dot--checked': selectedAddressId === addr.id }]" />
            <view class="address-option-info">
              <view class="address-option-top">
                <text class="address-option-name">{{ addr.name }}</text>
                <text class="address-option-phone">{{ addr.phone }}</text>
              </view>
              <text class="address-option-detail">
                {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}
              </text>
            </view>
          </view>
        </view>

        <view class="section order-section">
          <text class="section-title">订单商品</text>
          <view class="order-items">
            <view
              v-for="item in selectedItems"
              :key="item.artworkId"
              class="order-item"
            >
              <image :src="item.image" mode="aspectFill" class="order-item-thumb" />
              <view class="order-item-info">
                <text class="order-item-title">{{ item.title }}</text>
                <view class="order-item-specs">
                  <text class="order-item-spec">{{ item.spec.size }}</text>
                  <text class="order-item-spec">{{ item.spec.material }}</text>
                </view>
                <view class="order-item-bottom">
                  <text class="order-item-price">¥{{ formatPrice(item.unitPrice) }}</text>
                  <text class="order-item-qty">×{{ item.quantity }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="section fee-section">
          <view class="fee-row">
            <text class="fee-label">运费</text>
            <text class="fee-value">{{ shippingFee > 0 ? '¥' + formatPrice(shippingFee) : '免运费' }}</text>
          </view>

          <view class="fee-row coupon-row" @tap="showCouponPicker = !showCouponPicker">
            <text class="fee-label">优惠券</text>
            <view class="coupon-right">
              <text v-if="selectedCoupon" class="coupon-discount">-¥{{ formatPrice(selectedCoupon.discount) }}</text>
              <text v-else class="coupon-placeholder">{{ availableCoupons.length }}张可用</text>
              <text :class="['coupon-arrow', { 'coupon-arrow--open': showCouponPicker }]">›</text>
            </view>
          </view>

          <view v-if="showCouponPicker && availableCoupons.length > 0" class="coupon-list">
            <view
              v-for="coupon in availableCoupons"
              :key="coupon.id"
              :class="['coupon-card', { 'coupon-card--selected': selectedCouponId === coupon.id }]"
              @tap="selectCoupon(coupon)"
            >
              <view class="coupon-card-left">
                <text class="coupon-amount">¥{{ formatPrice(coupon.discount) }}</text>
                <text class="coupon-condition">满{{ formatPrice(coupon.minAmount) }}可用</text>
              </view>
              <view class="coupon-card-right">
                <text class="coupon-name">{{ coupon.name }}</text>
                <text class="coupon-date">{{ coupon.endDate }}到期</text>
              </view>
              <view v-if="selectedCouponId === coupon.id" class="coupon-check">✓</view>
            </view>
            <view class="coupon-none" @tap="selectCoupon(null)">
              <text class="coupon-none-text">不使用优惠券</text>
            </view>
          </view>

          <view v-if="discountAmount > 0" class="fee-row">
            <text class="fee-label">优惠金额</text>
            <text class="fee-value fee-value--discount">-¥{{ formatPrice(discountAmount) }}</text>
          </view>

          <view class="fee-row fee-row--total">
            <text class="fee-label">实付金额</text>
            <text class="fee-value fee-value--accent">¥{{ formatPrice(actualPrice) }}</text>
          </view>
        </view>

        <view class="section payment-section">
          <text class="section-title">支付方式</text>
          <view class="payment-options">
            <view
              :class="['payment-option', { 'payment-option--active': paymentMethod === 'WECHAT' }]"
              @tap="paymentMethod = 'WECHAT'"
            >
              <text class="payment-icon payment-icon--wechat">💳</text>
              <text class="payment-name">微信支付</text>
              <view :class="['radio-dot', { 'radio-dot--checked': paymentMethod === 'WECHAT' }]" />
            </view>
            <view
              :class="['payment-option', { 'payment-option--active': paymentMethod === 'ALIPAY' }]"
              @tap="paymentMethod = 'ALIPAY'"
            >
              <text class="payment-icon payment-icon--alipay">🔵</text>
              <text class="payment-name">支付宝</text>
              <view :class="['radio-dot', { 'radio-dot--checked': paymentMethod === 'ALIPAY' }]" />
            </view>
          </view>
        </view>

        <view class="section remark-section">
          <text class="section-title">订单备注</text>
          <textarea
            v-model="remark"
            class="remark-input"
            placeholder="选填，请输入特殊要求"
            placeholder-class="remark-placeholder"
            :maxlength="200"
            auto-height
          />
        </view>

        <view class="bottom-spacer" />
      </scroll-view>

      <view class="bottom-bar" :style="{ paddingBottom: safeAreaBottom + 'px' }">
        <view class="bottom-total">
          <text class="bottom-total-label">合计：</text>
          <text class="bottom-total-price">¥{{ formatPrice(actualPrice) }}</text>
        </view>
        <view
          :class="['pay-btn', { 'pay-btn--loading': isPaying }]"
          @tap="onPay"
        >
          <text class="pay-btn-text">{{ isPaying ? '支付中...' : '确认支付' }}</text>
        </view>
      </view>
    </view>

    <view v-else class="success-page">
      <view class="success-content">
        <view class="success-icon-wrap">
          <view class="success-circle" />
          <text class="success-check">✓</text>
        </view>

        <text class="success-title">支付成功</text>
        <text class="success-order-no">订单号：{{ orderNo }}</text>

        <view class="success-actions">
          <view class="success-btn success-btn--primary" @tap="goToOrderDetail">
            <text class="success-btn-text success-btn-text--primary">查看订单</text>
          </view>
          <view class="success-btn success-btn--outline" @tap="goToHome">
            <text class="success-btn-text success-btn-text--outline">返回首页</text>
          </view>
        </view>

        <view class="share-btn" @tap="onShareOrder">
          <text class="share-btn-icon">↗</text>
          <text class="share-btn-text">分享订单</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import type { Coupon } from '@/types/user'

const cartStore = useCartStore()
const userStore = useUserStore()

const selectedAddressId = ref('')
const showAddressPicker = ref(false)
const showCouponPicker = ref(false)
const selectedCouponId = ref('')
const paymentMethod = ref<'WECHAT' | 'ALIPAY'>('WECHAT')
const remark = ref('')
const isPaying = ref(false)
const paymentSuccess = ref(false)
const orderNo = ref('')
const safeAreaBottom = ref(0)

const selectedItems = computed(() => {
  return cartStore.items.filter((item) => cartStore.selectedIds.includes(item.artworkId))
})

const currentAddress = computed(() => {
  if (selectedAddressId.value) {
    return userStore.addresses.find((a) => a.id === selectedAddressId.value) ?? null
  }
  return userStore.defaultAddress
})

const availableCoupons = computed(() => {
  return userStore.coupons.filter((c) => c.status === 'available')
})

const selectedCoupon = computed(() => {
  if (!selectedCouponId.value) return null
  return availableCoupons.value.find((c) => c.id === selectedCouponId.value) ?? null
})

const subtotalPrice = computed(() => cartStore.selectedTotalPrice)

const shippingFee = computed(() => {
  if (subtotalPrice.value >= 5000) return 0
  return subtotalPrice.value > 0 ? 30 : 0
})

const discountAmount = computed(() => {
  if (!selectedCoupon.value) return 0
  if (subtotalPrice.value < selectedCoupon.value.minAmount) return 0
  return selectedCoupon.value.discount
})

const actualPrice = computed(() => {
  return Math.max(0, subtotalPrice.value + shippingFee.value - discountAmount.value)
})

function formatPrice(price: number): string {
  return price.toLocaleString('zh-CN')
}

function onAddressTap() {
  if (userStore.addresses.length > 1) {
    showAddressPicker.value = !showAddressPicker.value
  }
}

function selectAddress(id: string) {
  selectedAddressId.value = id
  showAddressPicker.value = false
}

function onAddAddress() {
  uni.navigateTo({ url: '/pages/address/edit' })
}

function selectCoupon(coupon: Coupon | null) {
  selectedCouponId.value = coupon?.id ?? ''
  showCouponPicker.value = false
}

function onPay() {
  if (isPaying.value) return

  if (!currentAddress.value) {
    uni.showToast({ title: '请添加收货地址', icon: 'none' })
    return
  }

  if (selectedItems.value.length === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }

  isPaying.value = true

  setTimeout(() => {
    orderNo.value = 'AS' + Date.now().toString().slice(-10)
    isPaying.value = false
    paymentSuccess.value = true

    const purchasedIds = selectedItems.value.map((item) => item.artworkId)
    purchasedIds.forEach((id) => cartStore.removeItem(id))
  }, 2000)
}

function goToOrderDetail() {
  uni.navigateTo({ url: `/pages/order/detail?id=${orderNo.value}` })
}

function goToHome() {
  uni.switchTab({ url: '/pages/index/index' })
}

function onShareOrder() {
  uni.showToast({ title: '分享功能开发中', icon: 'none' })
}

onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  safeAreaBottom.value = systemInfo.safeArea?.bottom
    ? systemInfo.windowHeight - systemInfo.safeArea.bottom
    : 0

  if (userStore.defaultAddress) {
    selectedAddressId.value = userStore.defaultAddress.id
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.checkout-page {
  min-height: 100vh;
  background-color: $color-bg;
}

.checkout-content {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.checkout-scroll {
  flex: 1;
  padding-bottom: 160rpx;
}

.section {
  margin: $spacing-sm $spacing-base;
  padding: $spacing-base;
  background-color: $color-white;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.section-header {
  @include flex-between;
}

.section-title {
  @include section-title;
  margin-bottom: $spacing-base;
}

.section-action {
  font-size: $font-lg;
  color: $color-text-tertiary;
}

.shipping-section {
  padding-bottom: 0;
}

.address-info {
  padding-bottom: $spacing-base;

  .address-top {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-xs;
  }

  .address-name {
    font-size: $font-md;
    font-weight: 600;
    color: $color-text-primary;
    letter-spacing: 2rpx;
  }

  .address-phone {
    font-size: $font-base;
    color: $color-text-secondary;
    letter-spacing: 1rpx;
  }

  .default-badge {
    height: 32rpx;
    padding: 0 12rpx;
    border-radius: $radius-full;
    background-color: rgba(139, 115, 85, 0.1);
    @include flex-center;

    .default-badge-text {
      font-size: $font-xs;
      color: $color-accent;
      letter-spacing: 1rpx;
    }
  }

  .address-detail {
    font-size: $font-sm;
    color: $color-text-secondary;
    line-height: 1.6;
    letter-spacing: 1rpx;
  }
}

.address-empty {
  @include flex-center;
  flex-direction: column;
  padding: $spacing-lg 0;
  gap: $spacing-xs;

  .address-empty-icon {
    font-size: 48rpx;
  }

  .address-empty-text {
    font-size: $font-base;
    color: $morandi-beige;
    letter-spacing: 2rpx;
  }

  &:active {
    opacity: 0.7;
  }
}

.address-divider {
  display: flex;
  align-items: center;
  margin-top: $spacing-sm;

  .divider-line {
    flex: 1;
    height: 2rpx;
    background-color: $color-border;
  }

  .divider-dots {
    display: flex;
    gap: 8rpx;
    padding: 0 $spacing-xs;
  }

  .divider-dot {
    width: 6rpx;
    height: 6rpx;
    border-radius: $radius-full;
    background-color: $morandi-beige;
    opacity: 0.4;
  }
}

.address-picker {
  .picker-header {
    @include flex-between;
    margin-bottom: $spacing-base;
  }

  .picker-title {
    font-size: $font-md;
    font-weight: 600;
    color: $color-text-primary;
    letter-spacing: 2rpx;
  }

  .picker-close {
    width: 48rpx;
    height: 48rpx;
    @include flex-center;
    border-radius: $radius-full;
    background-color: $color-bg-secondary;

    .picker-close-text {
      font-size: $font-sm;
      color: $color-text-tertiary;
    }
  }
}

.address-option {
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm;
  padding: $spacing-base;
  border-radius: $radius-base;
  border: 2rpx solid transparent;
  transition: $transition-base;
  margin-bottom: $spacing-xs;

  &:last-child {
    margin-bottom: 0;
  }

  &--active {
    border-color: $color-accent;
    background-color: rgba(139, 115, 85, 0.04);
  }

  &:active {
    background-color: $color-bg-secondary;
  }
}

.radio-dot {
  flex-shrink: 0;
  width: 40rpx;
  height: 40rpx;
  border-radius: $radius-full;
  border: 2rpx solid $color-border;
  @include flex-center;
  margin-top: 4rpx;
  transition: $transition-base;

  &--checked {
    border-color: $color-accent;
    background-color: $color-accent;

    &::after {
      content: '✓';
      font-size: $font-xs;
      color: $color-white;
      font-weight: 600;
    }
  }
}

.address-option-info {
  flex: 1;
  min-width: 0;
}

.address-option-top {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: 4rpx;

  .address-option-name {
    font-size: $font-base;
    font-weight: 500;
    color: $color-text-primary;
  }

  .address-option-phone {
    font-size: $font-sm;
    color: $color-text-tertiary;
  }
}

.address-option-detail {
  font-size: $font-sm;
  color: $color-text-secondary;
  line-height: 1.5;
  @include ellipsis(2);
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.order-item {
  display: flex;
  gap: $spacing-sm;
}

.order-item-thumb {
  flex-shrink: 0;
  width: 120rpx;
  height: 120rpx;
  border-radius: $radius-sm;
  background-color: $color-bg-secondary;
}

.order-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.order-item-title {
  font-size: $font-sm;
  color: $color-text-primary;
  font-weight: 500;
  @include ellipsis;
  letter-spacing: 1rpx;
}

.order-item-specs {
  display: flex;
  gap: 8rpx;
}

.order-item-spec {
  font-size: $font-xs;
  color: $color-text-tertiary;
  letter-spacing: 1rpx;
}

.order-item-bottom {
  @include flex-between;
}

.order-item-price {
  font-size: $font-sm;
  color: $color-accent;
  font-weight: 600;
}

.order-item-qty {
  font-size: $font-xs;
  color: $color-text-tertiary;
}

.fee-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.fee-row {
  @include flex-between;
  padding: $spacing-xs 0;

  &--total {
    padding-top: $spacing-sm;
    border-top: 1rpx solid $color-border;
    margin-top: $spacing-xs;
  }
}

.fee-label {
  font-size: $font-sm;
  color: $color-text-secondary;
  letter-spacing: 1rpx;
}

.fee-value {
  font-size: $font-sm;
  color: $color-text-primary;
  letter-spacing: 1rpx;

  &--discount {
    color: $color-error;
  }

  &--accent {
    font-size: $font-md;
    color: $color-accent;
    font-weight: 700;
  }
}

.coupon-row {
  &:active {
    opacity: 0.7;
  }
}

.coupon-right {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.coupon-discount {
  font-size: $font-sm;
  color: $color-error;
  font-weight: 500;
}

.coupon-placeholder {
  font-size: $font-sm;
  color: $morandi-beige;
}

.coupon-arrow {
  font-size: $font-lg;
  color: $color-text-tertiary;
  transition: $transition-base;

  &--open {
    transform: rotate(90deg);
  }
}

.coupon-list {
  padding: $spacing-sm 0 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.coupon-card {
  display: flex;
  align-items: center;
  padding: $spacing-sm;
  background-color: $color-bg-secondary;
  border-radius: $radius-base;
  border: 2rpx solid transparent;
  transition: $transition-base;
  position: relative;

  &--selected {
    border-color: $color-accent;
    background-color: rgba(139, 115, 85, 0.06);
  }

  &:active {
    transform: scale(0.98);
  }
}

.coupon-card-left {
  flex-shrink: 0;
  width: 140rpx;
  @include flex-center;
  flex-direction: column;
  border-right: 2rpx dashed $color-border;
  padding-right: $spacing-sm;
  margin-right: $spacing-sm;

  .coupon-amount {
    font-size: $font-lg;
    color: $color-accent;
    font-weight: 700;
    letter-spacing: 1rpx;
  }

  .coupon-condition {
    font-size: $font-xs;
    color: $color-text-tertiary;
    margin-top: 4rpx;
  }
}

.coupon-card-right {
  flex: 1;
  min-width: 0;

  .coupon-name {
    display: block;
    font-size: $font-sm;
    color: $color-text-primary;
    font-weight: 500;
    @include ellipsis;
  }

  .coupon-date {
    display: block;
    font-size: $font-xs;
    color: $color-text-tertiary;
    margin-top: 4rpx;
  }
}

.coupon-check {
  position: absolute;
  top: $spacing-xs;
  right: $spacing-xs;
  width: 36rpx;
  height: 36rpx;
  border-radius: $radius-full;
  background-color: $color-accent;
  @include flex-center;
  font-size: $font-xs;
  color: $color-white;
  font-weight: 600;
}

.coupon-none {
  @include flex-center;
  padding: $spacing-sm;

  .coupon-none-text {
    font-size: $font-sm;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;
  }

  &:active {
    opacity: 0.7;
  }
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-base;
  border-radius: $radius-base;
  border: 2rpx solid $color-border;
  transition: $transition-base;

  &--active {
    border-color: $color-accent;
    background-color: rgba(139, 115, 85, 0.04);
  }

  &:active {
    background-color: $color-bg-secondary;
  }
}

.payment-icon {
  font-size: 40rpx;

  &--wechat {
    opacity: 0.9;
  }

  &--alipay {
    opacity: 0.9;
  }
}

.payment-name {
  flex: 1;
  font-size: $font-base;
  color: $color-text-primary;
  letter-spacing: 2rpx;
}

.remark-input {
  width: 100%;
  min-height: 120rpx;
  padding: $spacing-sm;
  background-color: $color-bg-secondary;
  border-radius: $radius-base;
  font-size: $font-sm;
  color: $color-text-primary;
  line-height: 1.6;
  letter-spacing: 1rpx;
}

.remark-placeholder {
  color: $color-text-placeholder;
  font-size: $font-sm;
}

.bottom-spacer {
  height: 180rpx;
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

.bottom-total {
  flex: 1;
  display: flex;
  align-items: baseline;

  .bottom-total-label {
    font-size: $font-sm;
    color: $color-text-secondary;
    letter-spacing: 1rpx;
  }

  .bottom-total-price {
    font-size: $font-xl;
    color: $color-accent;
    font-weight: 700;
    letter-spacing: 1rpx;
  }
}

.pay-btn {
  flex: 1;
  height: 88rpx;
  @include flex-center;
  background-color: $color-accent;
  border-radius: $radius-full;
  transition: $transition-base;

  &:active {
    opacity: 0.85;
    transform: scale(0.97);
  }

  &--loading {
    background-color: $morandi-brown;
    pointer-events: none;
  }

  .pay-btn-text {
    font-size: $font-md;
    color: $color-white;
    letter-spacing: 4rpx;
    font-weight: 600;
  }
}

.success-page {
  @include flex-center;
  min-height: 100vh;
  background-color: $color-bg;
}

.success-content {
  @include flex-center;
  flex-direction: column;
  padding: $spacing-xl $spacing-lg;
  animation: fadeInUp 0.6s ease both;
}

.success-icon-wrap {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  @include flex-center;
  margin-bottom: $spacing-lg;

  .success-circle {
    position: absolute;
    width: 160rpx;
    height: 160rpx;
    border-radius: $radius-full;
    background-color: $color-success;
    opacity: 0.15;
    animation: pulse 2s ease infinite;
  }

  .success-check {
    position: relative;
    z-index: 2;
    font-size: 72rpx;
    color: $color-success;
    font-weight: 700;
    animation: fadeInScale 0.5s ease 0.3s both;
  }
}

.success-title {
  font-size: $font-xl;
  font-weight: 600;
  color: $color-text-primary;
  letter-spacing: 4rpx;
  margin-bottom: $spacing-sm;
}

.success-order-no {
  font-size: $font-sm;
  color: $color-text-tertiary;
  letter-spacing: 1rpx;
  margin-bottom: $spacing-xl;
}

.success-actions {
  display: flex;
  gap: $spacing-base;
  width: 100%;
  margin-bottom: $spacing-lg;
}

.success-btn {
  flex: 1;
  height: 88rpx;
  @include flex-center;
  border-radius: $radius-full;
  transition: $transition-base;

  &:active {
    transform: scale(0.97);
  }

  &--primary {
    background-color: $color-accent;

    .success-btn-text--primary {
      color: $color-white;
      font-weight: 600;
    }
  }

  &--outline {
    background-color: transparent;
    border: 2rpx solid $morandi-beige;

    .success-btn-text--outline {
      color: $morandi-beige;
    }
  }

  .success-btn-text {
    font-size: $font-base;
    letter-spacing: 2rpx;
  }
}

.share-btn {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-md;
  border-radius: $radius-full;
  border: 2rpx solid $color-border;
  transition: $transition-base;

  &:active {
    background-color: $color-bg-secondary;
    transform: scale(0.97);
  }

  .share-btn-icon {
    font-size: $font-md;
    color: $morandi-beige;
  }

  .share-btn-text {
    font-size: $font-sm;
    color: $color-text-secondary;
    letter-spacing: 2rpx;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.15;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.08;
  }
}
</style>
