<template>
  <view class="order-page">
    <view class="tab-bar">
      <scroll-view scroll-x class="tab-scroll" :show-scrollbar="false">
        <view class="tab-list">
          <view
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-item"
            :class="{ 'tab-item--active': currentTab === tab.key }"
            @tap="onTabChange(tab.key)"
          >
            <text class="tab-item-text">{{ tab.label }}</text>
            <view v-if="currentTab === tab.key" class="tab-item-indicator" />
          </view>
        </view>
      </scroll-view>
    </view>

    <scroll-view
      class="order-list-wrap"
      scroll-y
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <view v-if="filteredOrders.length > 0" class="order-list">
        <view
          v-for="order in filteredOrders"
          :key="order.id"
          class="order-item"
          @tap="onOrderTap(order)"
        >
          <view class="order-top">
            <text class="order-number">{{ order.id }}</text>
            <text class="order-status">{{ getStatusLabel(order.status) }}</text>
          </view>

          <view
            v-for="(item, idx) in order.items"
            :key="idx"
            class="order-product"
          >
            <image :src="item.artworkImage" mode="aspectFill" class="order-thumb" />
            <view class="order-product-info">
              <text class="order-product-title">{{ item.artworkTitle }}</text>
              <text class="order-product-spec">{{ item.spec.size }} · {{ item.spec.material }}</text>
            </view>
            <text class="order-product-price">¥{{ item.subtotal.toLocaleString('zh-CN') }}</text>
          </view>

          <view class="order-bottom">
            <text class="order-date">{{ order.createdAt }}</text>
            <view class="order-actions">
              <text
                v-if="order.status === 'PENDING_PAYMENT'"
                class="order-action"
                @tap.stop="onPay(order)"
              >Pay</text>
              <text
                v-if="order.status === 'SHIPPED'"
                class="order-action"
                @tap.stop="onConfirmReceive(order)"
              >Confirm</text>
              <text
                v-if="order.status === 'COMPLETED' || order.status === 'SHIPPED'"
                class="order-action"
                @tap.stop="onAfterSale(order)"
              >Refund</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="!loading && filteredOrders.length === 0" class="empty-state">
        <text class="empty-text">No orders yet</text>
      </view>

      <view v-if="loading" class="loading-more">
        <text class="loading-more-text">Loading...</text>
      </view>

      <view v-if="!hasMore && filteredOrders.length > 0" class="no-more">
        <text class="no-more-text">—</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Order } from '@/types/order'
import { OrderStatus } from '@/types/order'

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'PENDING_PAYMENT', label: 'Pending' },
  { key: 'PENDING_SHIPMENT', label: 'Processing' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'AFTER_SALE', label: 'Refund' },
]

const currentTab = ref('all')
const loading = ref(false)
const isRefreshing = ref(false)
const hasMore = ref(true)

const mockOrders = ref<Order[]>([
  {
    id: 'ORD20260501001',
    userId: 'u1',
    items: [
      {
        artworkId: 'a1',
        artworkTitle: 'Misty Mountains',
        artworkImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=misty%20mountain%20landscape%20chinese%20ink%20wash%20painting&image_size=portrait_4_3',
        artistName: 'Lin Qingyuan',
        spec: { size: '60×80cm', material: 'Giclée', frameStyle: 'Natural wood' },
        quantity: 1,
        unitPrice: 2680,
        subtotal: 2680,
      },
    ],
    totalPrice: 2680,
    shippingFee: 0,
    discountAmount: 0,
    actualPrice: 2680,
    status: OrderStatus.PENDING_PAYMENT,
    shippingInfo: '',
    paymentMethod: 'WECHAT' as any,
    paymentTime: '',
    remark: '',
    createdAt: '2026-05-01',
    updatedAt: '2026-05-01',
  },
  {
    id: 'ORD20260428002',
    userId: 'u1',
    items: [
      {
        artworkId: 'a2',
        artworkTitle: 'Still Life · Vase & Flowers',
        artworkImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=still%20life%20ceramic%20vase%20wildflowers%20morandi%20palette&image_size=portrait_4_3',
        artistName: 'Su Wanqing',
        spec: { size: '40×50cm', material: 'Watercolor', frameStyle: 'White frame' },
        quantity: 1,
        unitPrice: 1880,
        subtotal: 1880,
      },
      {
        artworkId: 'a5',
        artworkTitle: 'Memory of the Sea II',
        artworkImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ocean%20waves%20abstract%20blue%20grey%20oil%20painting%20texture&image_size=portrait_4_3',
        artistName: 'Zhou Haichao',
        spec: { size: '80×100cm', material: 'Oil on canvas', frameStyle: 'Unframed' },
        quantity: 1,
        unitPrice: 5960,
        subtotal: 5960,
      },
    ],
    totalPrice: 7840,
    shippingFee: 0,
    discountAmount: 200,
    actualPrice: 7640,
    status: OrderStatus.PENDING_SHIPMENT,
    shippingInfo: '',
    paymentMethod: 'WECHAT' as any,
    paymentTime: '2026-04-28',
    remark: '',
    createdAt: '2026-04-28',
    updatedAt: '2026-04-28',
  },
  {
    id: 'ORD20260420003',
    userId: 'u1',
    items: [
      {
        artworkId: 'a4',
        artworkTitle: 'Lingering Spring',
        artworkImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spring%20garden%20cherry%20blossom%20soft%20light%20painting&image_size=portrait_4_3',
        artistName: 'Zhao Hanzhang',
        spec: { size: '50×60cm', material: 'Giclée', frameStyle: 'Gold frame' },
        quantity: 1,
        unitPrice: 1560,
        subtotal: 1560,
      },
    ],
    totalPrice: 1560,
    shippingFee: 0,
    discountAmount: 0,
    actualPrice: 1560,
    status: OrderStatus.SHIPPED,
    shippingInfo: 'SF Express SF1234567890',
    paymentMethod: 'WECHAT' as any,
    paymentTime: '2026-04-20',
    remark: '',
    createdAt: '2026-04-20',
    updatedAt: '2026-04-22',
  },
  {
    id: 'ORD20260410004',
    userId: 'u1',
    items: [
      {
        artworkId: 'a3',
        artworkTitle: 'City Light No.7',
        artworkImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=urban%20city%20lights%20abstract%20photography%20night&image_size=portrait_4_3',
        artistName: 'Chen Mo',
        spec: { size: '70×90cm', material: 'Limited print', frameStyle: 'Black frame' },
        quantity: 1,
        unitPrice: 4280,
        subtotal: 4280,
      },
    ],
    totalPrice: 4280,
    shippingFee: 0,
    discountAmount: 100,
    actualPrice: 4180,
    status: OrderStatus.COMPLETED,
    shippingInfo: '',
    paymentMethod: 'WECHAT' as any,
    paymentTime: '2026-04-10',
    remark: '',
    createdAt: '2026-04-10',
    updatedAt: '2026-04-15',
  },
  {
    id: 'ORD20260325005',
    userId: 'u1',
    items: [
      {
        artworkId: 'a6',
        artworkTitle: 'Geometric Meditation',
        artworkImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20abstract%20geometric%20art%20beige%20cream&image_size=portrait_4_3',
        artistName: 'Bai Lu',
        spec: { size: '40×40cm', material: 'Print', frameStyle: 'Natural wood' },
        quantity: 1,
        unitPrice: 980,
        subtotal: 980,
      },
    ],
    totalPrice: 980,
    shippingFee: 0,
    discountAmount: 0,
    actualPrice: 980,
    status: OrderStatus.AFTER_SALE,
    shippingInfo: '',
    paymentMethod: 'WECHAT' as any,
    paymentTime: '2026-03-25',
    remark: '',
    createdAt: '2026-03-25',
    updatedAt: '2026-03-28',
  },
])

const filteredOrders = computed(() => {
  if (currentTab.value === 'all') return mockOrders.value
  return mockOrders.value.filter((o) => o.status === currentTab.value)
})

const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    PENDING_PAYMENT: 'Pending',
    PENDING_SHIPMENT: 'Processing',
    SHIPPED: 'Shipped',
    COMPLETED: 'Completed',
    AFTER_SALE: 'Refund',
  }
  return map[status] || status
}

const onTabChange = (key: string) => {
  currentTab.value = key
}

const onRefresh = () => {
  isRefreshing.value = true
  setTimeout(() => {
    isRefreshing.value = false
  }, 1000)
}

const onLoadMore = () => {
  if (loading.value || !hasMore.value) return
  loading.value = true
  setTimeout(() => {
    hasMore.value = false
    loading.value = false
  }, 1000)
}

const onOrderTap = (order: Order) => {
  uni.navigateTo({ url: `/pages/order/detail?id=${order.id}` })
}

const onPay = (order: Order) => {
  uni.navigateTo({ url: `/pages/checkout/index` })
}

const onConfirmReceive = (order: Order) => {
  uni.showModal({
    title: '',
    content: 'Confirm receipt?',
    success: (res) => {
      if (res.confirm) {
        order.status = OrderStatus.COMPLETED
      }
    },
  })
}

const onAfterSale = (order: Order) => {
  uni.navigateTo({ url: `/pages/order/aftersale?id=${order.id}` })
}
</script>

<style lang="scss" scoped>
@import '@/styles/mixins.scss';
.order-page {
  min-height: 100vh;
  background-color: $color-surface;
  display: flex;
  flex-direction: column;
}

.tab-bar {
  background-color: $color-surface;
  border-bottom: 1rpx solid $color-rule;
  position: sticky;
  top: 0;
  z-index: 10;

  .tab-scroll {
    width: 100%;
    white-space: nowrap;
  }

  .tab-list {
    display: inline-flex;
    padding: 0 $space-sm;
  }

  .tab-item {
    position: relative;
    padding: $space-md $space-md;
    @include flex-center;
    flex-direction: column;

    &--active {
      .tab-item-text {
        color: $color-ink;
      }
    }
  }

  .tab-item-text {
    @include sans-body;
    font-size: $font-sm;
    color: $color-ink-tertiary;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }

  .tab-item-indicator {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 32rpx;
    height: 2rpx;
    background-color: $color-ink;
  }
}

.order-list-wrap {
  flex: 1;
  padding: 0 $space-lg;
}

.order-list {
  display: flex;
  flex-direction: column;
}

.order-item {
  padding: $space-xl 0;
  border-bottom: 1rpx solid $color-rule;
}

.order-top {
  @include flex-between;
  margin-bottom: $space-md;
}

.order-number {
  @include sans-body;
  font-size: $font-xs;
  letter-spacing: 0.02em;
}

.order-status {
  @include sans-body;
  font-size: $font-xs;
  color: $color-ink-secondary;
  letter-spacing: 0.04em;
}

.order-product {
  display: flex;
  align-items: center;
  gap: $space-md;
  margin-bottom: $space-sm;
}

.order-thumb {
  flex-shrink: 0;
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-xs;
  background-color: $color-surface-warm;
}

.order-product-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: $space-xxs;
}

.order-product-title {
  @include serif-heading;
  font-size: $font-sm;
  @include ellipsis;
}

.order-product-spec {
  @include sans-body;
  font-size: $font-xs;
}

.order-product-price {
  @include sans-body;
  font-size: $font-sm;
  color: $color-ink;
  flex-shrink: 0;
}

.order-bottom {
  @include flex-between;
  margin-top: $space-md;
}

.order-date {
  @include sans-body;
  font-size: $font-xs;
  color: $color-ink-tertiary;
}

.order-actions {
  display: flex;
  gap: $space-lg;
}

.order-action {
  @include sans-body;
  font-size: $font-sm;
  color: $color-ink-secondary;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  &:active {
    color: $color-ink;
  }
}

.empty-state {
  @include flex-center;
  padding: $space-4xl 0;
}

.empty-text {
  @include serif-heading;
  font-size: $font-md;
  color: $color-ink-tertiary;
}

.loading-more,
.no-more {
  @include flex-center;
  padding: $space-lg 0;
}

.loading-more-text {
  @include sans-body;
  font-size: $font-sm;
  color: $color-ink-tertiary;
}

.no-more-text {
  @include sans-body;
  font-size: $font-sm;
  color: $color-ink-tertiary;
}

@media (min-width: 768px) {
  .order-page {
    @include responsive-container($max-width-narrow);
  }

  .order-list-wrap {
    @include desktop-scrollbar;
    padding: 0 $space-xl;
  }

  .tab-bar {
    .tab-list {
      padding: 0 $space-md;
    }

    .tab-item {
      padding: $space-lg $space-lg;

      &-text {
        font-size: $font-base;
      }
    }
  }

  .order-item {
    padding: $space-2xl 0;
  }

  .order-top {
    margin-bottom: $space-lg;
  }

  .order-number {
    font-size: $font-xs;
  }

  .order-status {
    font-size: $font-xs;
  }

  .order-product {
    gap: $space-lg;
    margin-bottom: $space-md;
  }

  .order-thumb {
    width: 60px;
    height: 60px;
  }

  .order-product-title {
    font-size: $font-base;
  }

  .order-product-spec {
    font-size: $font-sm;
  }

  .order-product-price {
    font-size: $font-base;
  }

  .order-bottom {
    margin-top: $space-lg;
  }

  .order-action {
    cursor: pointer;

    &:hover {
      color: $color-ink;
    }
  }
}
</style>
