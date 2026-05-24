<template>
  <view class="checkout-page">
    <view v-if="!paymentSuccess" class="checkout-content">
      <scroll-view class="checkout-scroll" scroll-y enhanced :show-scrollbar="false">
        <view class="shipping-section" @tap="onAddressTap">
          <view v-if="currentAddress" class="address-info">
            <view class="address-top">
              <text class="address-name">{{ currentAddress.name }}</text>
              <text class="address-phone">{{ currentAddress.phone }}</text>
            </view>
            <text class="address-detail">
              {{ currentAddress.province }}{{ currentAddress.city }}{{ currentAddress.district }}{{ currentAddress.detail }}
            </text>
          </view>
          <view v-else class="address-empty" @tap="onAddAddress">
            <text class="address-empty-text">添加收货地址 →</text>
          </view>
          <view class="section-divider" />
        </view>

        <view v-if="showAddressPicker" class="address-picker">
          <view
            v-for="addr in userStore.addresses"
            :key="addr.id"
            class="address-option"
            @tap="selectAddress(addr.id)"
          >
            <text class="address-radio">{{ selectedAddressId === addr.id ? '●' : '○' }}</text>
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

        <view class="items-section">
          <text class="section-label">订单商品</text>
          <view class="order-items">
            <view
              v-for="item in selectedItems"
              :key="item.artworkId"
              class="order-item"
            >
              <image :src="item.image" mode="aspectFill" class="order-item-thumb" />
              <view class="order-item-info">
                <text class="order-item-title">{{ item.title }}</text>
                <text class="order-item-spec">{{ item.spec.size }} · {{ item.spec.material }}</text>
                <view class="order-item-bottom">
                  <text class="order-item-price">¥{{ formatPrice(item.unitPrice) }}</text>
                  <text class="order-item-qty">×{{ item.quantity }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="section-divider" />

        <view class="fee-section">
          <view class="fee-row">
            <text class="fee-label">运费</text>
            <text class="fee-value">{{ shippingFee > 0 ? '¥' + formatPrice(shippingFee) : '免运费' }}</text>
          </view>

          <view class="fee-row coupon-row" @tap="showCouponPicker = !showCouponPicker">
            <text class="fee-label">优惠券</text>
            <view class="coupon-right">
              <text v-if="selectedCoupon" class="coupon-discount">-¥{{ formatPrice(selectedCoupon.discount) }}</text>
              <text v-else class="coupon-link">使用优惠券 →</text>
            </view>
          </view>

          <view v-if="showCouponPicker && availableCoupons.length > 0" class="coupon-list">
            <view
              v-for="coupon in availableCoupons"
              :key="coupon.id"
              class="coupon-item"
              @tap="selectCoupon(coupon)"
            >
              <text class="coupon-radio">{{ selectedCouponId === coupon.id ? '●' : '○' }}</text>
              <view class="coupon-item-info">
                <text class="coupon-item-amount">¥{{ formatPrice(coupon.discount) }}</text>
                <text class="coupon-item-name">{{ coupon.name }}</text>
                <text class="coupon-item-condition">Min. ¥{{ formatPrice(coupon.minAmount) }}</text>
              </view>
            </view>
            <view class="coupon-none" @tap="selectCoupon(null)">
              <text class="coupon-none-text">不使用优惠券</text>
            </view>
          </view>

          <view v-if="discountAmount > 0" class="fee-row">
            <text class="fee-label">优惠</text>
            <text class="fee-value fee-value--discount">-¥{{ formatPrice(discountAmount) }}</text>
          </view>

          <view class="fee-row fee-row--total">
            <text class="fee-label">合计</text>
            <text class="fee-value fee-value--total">¥{{ formatPrice(actualPrice) }}</text>
          </view>
        </view>

        <view class="section-divider" />

        <view class="payment-section">
          <text class="section-label">支付方式</text>
          <view class="payment-options">
            <view class="payment-option" @tap="paymentMethod = 'WECHAT'">
              <text class="payment-radio">{{ paymentMethod === 'WECHAT' ? '●' : '○' }}</text>
              <text class="payment-name">微信支付</text>
            </view>
            <view class="payment-option" @tap="paymentMethod = 'ALIPAY'">
              <text class="payment-radio">{{ paymentMethod === 'ALIPAY' ? '●' : '○' }}</text>
              <text class="payment-name">支付宝</text>
            </view>
          </view>
        </view>

        <view class="section-divider" />

        <view class="remark-section">
          <text class="section-label">备注</text>
          <input
            v-model="remark"
            class="remark-input"
            placeholder="选填"
            placeholder-class="remark-placeholder"
            :maxlength="200"
          />
        </view>

        <view class="bottom-spacer" />
      </scroll-view>

      <view class="bottom-bar" :style="{ paddingBottom: safeAreaBottom + 'px' }">
        <view class="bottom-total">
          <text class="bottom-total-label">合计</text>
          <text class="bottom-total-price">¥{{ formatPrice(actualPrice) }}</text>
        </view>
        <view
          :class="['pay-btn', { 'pay-btn--loading': isPaying }]"
          @tap="onPay"
        >
          <text class="pay-btn-text">{{ isPaying ? '支付中...' : '立即支付' }}</text>
        </view>
      </view>
    </view>

    <view v-else class="success-page">
      <view class="success-content">
        <text class="success-check">✓</text>
        <text class="success-title">订单已确认</text>
        <text class="success-order-no">{{ orderNo }}</text>
        <view class="success-actions">
          <text class="success-link" @tap="goToOrderDetail">查看订单 →</text>
          <text class="success-link" @tap="goToHome">返回首页 →</text>
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
  uni.navigateTo({ url: '/pages/user/addresses' })
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
  if (selectedItems.value.length === 0) return

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
  uni.navigateTo({ url: `/pages/order/index` })
}

function goToHome() {
  uni.switchTab({ url: '/pages/index/index' })
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
@import '@/styles/mixins.scss';
.checkout-page {
  min-height: 100vh;
  background-color: $color-surface;
}

.checkout-content {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.checkout-scroll {
  flex: 1;
  padding: 0 $space-lg;
  padding-bottom: 180rpx;
}

.shipping-section {
  padding: $space-xl 0 $space-md;
}

.address-info {
  .address-top {
    display: flex;
    align-items: center;
    gap: $space-sm;
    margin-bottom: $space-xs;
  }

  .address-name {
    @include serif-heading;
    font-size: $font-md;
  }

  .address-phone {
    @include sans-body;
    font-size: $font-sm;
  }

  .address-detail {
    @include sans-body;
    font-size: $font-sm;
    line-height: 1.6;
  }
}

.address-empty {
  padding: $space-lg 0;

  .address-empty-text {
    @include sans-body;
    font-size: $font-base;
    color: $color-ink-secondary;
    letter-spacing: 0.04em;
  }
}

.section-divider {
  @include divider;
  margin: $space-md 0;
}

.address-picker {
  padding: $space-md 0;
}

.address-option {
  display: flex;
  align-items: flex-start;
  gap: $space-md;
  padding: $space-md 0;
  border-bottom: 1rpx solid $color-rule;

  .address-radio {
    font-size: $font-md;
    color: $color-ink-tertiary;
    padding-top: $space-xs;
  }
}

.address-option-info {
  flex: 1;
  min-width: 0;
}

.address-option-top {
  display: flex;
  align-items: center;
  gap: $space-sm;
  margin-bottom: $space-xs;

  .address-option-name {
    @include serif-heading;
    font-size: $font-base;
  }

  .address-option-phone {
    @include sans-body;
    font-size: $font-sm;
  }
}

.address-option-detail {
  @include sans-body;
  font-size: $font-sm;
  line-height: 1.5;
  @include ellipsis(2);
}

.items-section {
  padding: $space-md 0;

  .section-label {
    @include serif-heading;
    font-size: $font-md;
    display: block;
    margin-bottom: $space-md;
  }
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: $space-md;
}

.order-item {
  display: flex;
  gap: $space-md;
}

.order-item-thumb {
  flex-shrink: 0;
  width: 100rpx;
  height: 100rpx;
  border-radius: $radius-xs;
  background-color: $color-surface-warm;
}

.order-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.order-item-title {
  @include serif-heading;
  font-size: $font-sm;
  @include ellipsis;
}

.order-item-spec {
  @include sans-body;
  font-size: $font-xs;
}

.order-item-bottom {
  @include flex-between;
}

.order-item-price {
  font-family: $font-sans;
  font-size: $font-sm;
  color: $color-ink;
  font-weight: 500;
}

.order-item-qty {
  @include sans-body;
  font-size: $font-xs;
}

.fee-section {
  padding: $space-md 0;
  display: flex;
  flex-direction: column;
  gap: $space-sm;
}

.fee-row {
  @include flex-between;
  padding: $space-xs 0;

  &--total {
    padding-top: $space-md;
    border-top: 1rpx solid $color-rule;
    margin-top: $space-xs;
  }
}

.fee-label {
  @include sans-body;
  font-size: $font-sm;
  letter-spacing: 0.04em;
}

.fee-value {
  @include sans-body;
  font-size: $font-sm;
  color: $color-ink;

  &--discount {
    color: $color-error;
  }

  &--total {
    @include serif-heading;
    font-size: $font-md;
  }
}

.coupon-row {
  &:active {
    opacity: 0.6;
  }
}

.coupon-right {
  display: flex;
  align-items: center;
  gap: $space-xs;
}

.coupon-discount {
  @include sans-body;
  font-size: $font-sm;
  color: $color-error;
}

.coupon-link {
  @include sans-body;
  font-size: $font-sm;
  color: $color-ink-secondary;
  letter-spacing: 0.04em;
}

.coupon-list {
  padding: $space-md 0 0;
  display: flex;
  flex-direction: column;
  gap: $space-md;
}

.coupon-item {
  display: flex;
  align-items: flex-start;
  gap: $space-md;
  padding: $space-md 0;
  border-bottom: 1rpx solid $color-rule;

  .coupon-radio {
    font-size: $font-md;
    color: $color-ink-tertiary;
    padding-top: $space-xs;
  }
}

.coupon-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $space-xxs;

  .coupon-item-amount {
    @include serif-heading;
    font-size: $font-md;
  }

  .coupon-item-name {
    @include sans-body;
    font-size: $font-sm;
  }

  .coupon-item-condition {
    @include sans-body;
    font-size: $font-xs;
  }
}

.coupon-none {
  @include flex-center;
  padding: $space-sm 0;

  .coupon-none-text {
    @include sans-body;
    font-size: $font-sm;
    letter-spacing: 0.04em;
  }
}

.payment-section {
  padding: $space-md 0;

  .section-label {
    @include serif-heading;
    font-size: $font-md;
    display: block;
    margin-bottom: $space-md;
  }
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: $space-md;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: $space-md;

  .payment-radio {
    font-size: $font-md;
    color: $color-ink-tertiary;
  }

  .payment-name {
    @include sans-body;
    font-size: $font-base;
    color: $color-ink;
    letter-spacing: 0.04em;
  }
}

.remark-section {
  padding: $space-md 0;

  .section-label {
    @include serif-heading;
    font-size: $font-md;
    display: block;
    margin-bottom: $space-md;
  }
}

.remark-input {
  width: 100%;
  height: 72rpx;
  font-family: $font-sans;
  font-size: $font-sm;
  color: $color-ink;
  border: none;
  border-bottom: 1rpx solid $color-rule;
  background: transparent;
  letter-spacing: 0.01em;
}

.remark-placeholder {
  color: $color-ink-tertiary;
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
  @include flex-between;
  padding: $space-md $space-lg;
  background-color: $color-surface;
  border-top: 1rpx solid $color-rule;
}

.bottom-total {
  display: flex;
  flex-direction: column;

  .bottom-total-label {
    @include sans-body;
    font-size: $font-xs;
    letter-spacing: 0.04em;
  }

  .bottom-total-price {
    @include serif-heading;
    font-size: $font-lg;
  }
}

.pay-btn {
  @include btn-primary;
  height: 80rpx;
  padding: 0 $space-xl;

  &--loading {
    background-color: $color-ink-tertiary;
    pointer-events: none;
  }

  .pay-btn-text {
    font-size: $font-sm;
    letter-spacing: 0.08em;
  }
}

.success-page {
  @include flex-center;
  min-height: 100vh;
  background-color: $color-surface;
}

.success-content {
  @include flex-center;
  flex-direction: column;
  gap: $space-lg;
}

.success-check {
  font-size: $font-display;
  color: $color-ink;
  font-weight: 300;
}

.success-title {
  @include serif-heading;
  font-size: $font-xl;
}

.success-order-no {
  @include sans-body;
  font-size: $font-sm;
}

.success-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-md;
  margin-top: $space-xl;
}

.success-link {
  @include sans-body;
  font-size: $font-sm;
  color: $color-ink-secondary;
  letter-spacing: 0.04em;

  &:active {
    opacity: 0.6;
  }
}

@media (min-width: 768px) {
  .checkout-page {
    @include responsive-container;
  }

  .checkout-scroll {
    @include desktop-scrollbar;
  }

  .checkout-content {
    @media (min-width: 1024px) {
      @include desktop-sidebar(1fr, 400px);
      overflow: hidden;
    }
  }

  .checkout-scroll {
    @media (min-width: 1024px) {
      overflow-y: auto;
      padding-right: $space-2xl;
    }
  }

  .shipping-section {
    padding: $space-2xl 0 $space-lg;
  }

  .items-section {
    padding: $space-lg 0;

    .section-label {
      font-size: $font-lg;
    }
  }

  .order-item-thumb {
    width: 70px;
    height: 70px;
  }

  .order-item-title {
    font-size: $font-base;
  }

  .fee-section {
    padding: $space-lg 0;
  }

  .payment-section {
    padding: $space-lg 0;

    .section-label {
      font-size: $font-lg;
    }
  }

  .payment-options {
    flex-direction: row;
    gap: $space-xl;
  }

  .remark-section {
    padding: $space-lg 0;
  }

  .bottom-bar {
    @include responsive-container;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    padding: $space-lg $space-2xl;
  }

  .pay-btn {
    @include hover-lift;
    cursor: pointer;
  }
}
</style>
