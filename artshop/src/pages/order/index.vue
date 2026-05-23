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
          class="order-card"
          @tap="onOrderTap(order)"
        >
          <view class="order-card-header">
            <text class="order-number">订单号：{{ order.id }}</text>
            <view class="order-status-badge" :class="'order-status-badge--' + order.status">
              <text class="order-status-text">{{ getStatusLabel(order.status) }}</text>
            </view>
          </view>

          <view class="order-card-body">
            <scroll-view scroll-x class="order-thumbs-scroll" :show-scrollbar="false">
              <view class="order-thumbs">
                <image
                  v-for="(item, idx) in order.items"
                  :key="idx"
                  class="order-thumb"
                  :src="item.artworkImage"
                  mode="aspectFill"
                />
              </view>
            </scroll-view>
            <view class="order-summary">
              <text class="order-item-count">共{{ order.items.length }}件商品</text>
              <view class="order-price-row">
                <text class="order-price-label">合计：</text>
                <text class="order-price-value">¥{{ order.actualPrice }}</text>
              </view>
            </view>
          </view>

          <view class="order-card-footer">
            <text class="order-date">{{ order.createdAt }}</text>
            <view class="order-actions">
              <view
                v-if="order.status === 'PENDING_PAYMENT'"
                class="order-action order-action--primary"
                @tap.stop="onPay(order)"
              >
                <text class="order-action-text">付款</text>
              </view>
              <view
                v-if="order.status === 'SHIPPED'"
                class="order-action order-action--primary"
                @tap.stop="onConfirmReceive(order)"
              >
                <text class="order-action-text">确认收货</text>
              </view>
              <view
                v-if="order.status === 'COMPLETED'"
                class="order-action order-action--outline"
                @tap.stop="onReview(order)"
              >
                <text class="order-action-text">评价</text>
              </view>
              <view
                v-if="order.status === 'COMPLETED' || order.status === 'SHIPPED'"
                class="order-action order-action--outline"
                @tap.stop="onAfterSale(order)"
              >
                <text class="order-action-text">申请售后</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <EmptyState
        v-if="!loading && filteredOrders.length === 0"
        icon="📋"
        title="暂无订单"
        description="还没有相关订单，去逛逛吧"
        action-text="去逛逛"
        @action="onGoShopping"
      />

      <view v-if="loading" class="loading-more">
        <text class="loading-more-text">加载中...</text>
      </view>

      <view v-if="!hasMore && filteredOrders.length > 0" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import type { Order } from '@/types/order'
import { OrderStatus } from '@/types/order'

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'PENDING_PAYMENT', label: '待付款' },
  { key: 'PENDING_SHIPMENT', label: '待发货' },
  { key: 'SHIPPED', label: '已发货' },
  { key: 'COMPLETED', label: '已完成' },
  { key: 'AFTER_SALE', label: '售后' },
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
        artworkTitle: '晨雾中的远山',
        artworkImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=misty%20mountain%20landscape%20chinese%20ink%20wash%20painting&image_size=portrait_4_3',
        artistName: '林清远',
        spec: { size: '60×80cm', material: '艺术微喷', frameStyle: '原木画框' },
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
    createdAt: '2026-05-01 14:30',
    updatedAt: '2026-05-01 14:30',
  },
  {
    id: 'ORD20260428002',
    userId: 'u1',
    items: [
      {
        artworkId: 'a2',
        artworkTitle: '静物·陶与花',
        artworkImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=still%20life%20ceramic%20vase%20wildflowers%20morandi%20palette&image_size=portrait_4_3',
        artistName: '苏婉清',
        spec: { size: '40×50cm', material: '水彩原作', frameStyle: '白色画框' },
        quantity: 1,
        unitPrice: 1880,
        subtotal: 1880,
      },
      {
        artworkId: 'a5',
        artworkTitle: '海的记忆 II',
        artworkImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ocean%20waves%20abstract%20blue%20grey%20oil%20painting%20texture&image_size=portrait_4_3',
        artistName: '周海潮',
        spec: { size: '80×100cm', material: '油画原作', frameStyle: '无框' },
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
    paymentTime: '2026-04-28 10:15',
    remark: '',
    createdAt: '2026-04-28 10:12',
    updatedAt: '2026-04-28 10:15',
  },
  {
    id: 'ORD20260420003',
    userId: 'u1',
    items: [
      {
        artworkId: 'a4',
        artworkTitle: '春日迟迟',
        artworkImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spring%20garden%20cherry%20blossom%20soft%20light%20painting&image_size=portrait_4_3',
        artistName: '赵含章',
        spec: { size: '50×60cm', material: '艺术微喷', frameStyle: '金色画框' },
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
    shippingInfo: '顺丰快递 SF1234567890',
    paymentMethod: 'WECHAT' as any,
    paymentTime: '2026-04-20 09:30',
    remark: '',
    createdAt: '2026-04-20 09:28',
    updatedAt: '2026-04-22 16:00',
  },
  {
    id: 'ORD20260410004',
    userId: 'u1',
    items: [
      {
        artworkId: 'a3',
        artworkTitle: '城市光影 No.7',
        artworkImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=urban%20city%20lights%20abstract%20photography%20night&image_size=portrait_4_3',
        artistName: '陈默',
        spec: { size: '70×90cm', material: '摄影限量版', frameStyle: '黑色画框' },
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
    paymentTime: '2026-04-10 11:00',
    remark: '',
    createdAt: '2026-04-10 10:55',
    updatedAt: '2026-04-15 14:20',
  },
  {
    id: 'ORD20260325005',
    userId: 'u1',
    items: [
      {
        artworkId: 'a6',
        artworkTitle: '几何冥想',
        artworkImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20abstract%20geometric%20art%20beige%20cream&image_size=portrait_4_3',
        artistName: '白鹿',
        spec: { size: '40×40cm', material: '版画', frameStyle: '原木画框' },
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
    paymentTime: '2026-03-25 08:45',
    remark: '画框有轻微磕碰',
    createdAt: '2026-03-25 08:40',
    updatedAt: '2026-03-28 10:00',
  },
])

const filteredOrders = computed(() => {
  if (currentTab.value === 'all') return mockOrders.value
  return mockOrders.value.filter((o) => o.status === currentTab.value)
})

const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    PENDING_PAYMENT: '待付款',
    PENDING_SHIPMENT: '待发货',
    SHIPPED: '已发货',
    COMPLETED: '已完成',
    AFTER_SALE: '售后中',
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
  uni.navigateTo({ url: `/pages/order/pay?id=${order.id}` })
}

const onConfirmReceive = (order: Order) => {
  uni.showModal({
    title: '确认收货',
    content: '确认已收到商品吗？',
    success: (res) => {
      if (res.confirm) {
        order.status = OrderStatus.COMPLETED
      }
    },
  })
}

const onReview = (order: Order) => {
  uni.navigateTo({ url: `/pages/order/review?id=${order.id}` })
}

const onAfterSale = (order: Order) => {
  uni.navigateTo({ url: `/pages/order/aftersale?id=${order.id}` })
}

const onGoShopping = () => {
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.order-page {
  min-height: 100vh;
  background-color: $color-bg;
  display: flex;
  flex-direction: column;
}

.tab-bar {
  background-color: $color-white;
  border-bottom: 1rpx solid $color-border;
  position: sticky;
  top: 0;
  z-index: 10;

  .tab-scroll {
    width: 100%;
    white-space: nowrap;
  }

  .tab-list {
    display: inline-flex;
    padding: 0 $spacing-sm;
  }

  .tab-item {
    position: relative;
    padding: $spacing-base $spacing-base;
    @include flex-center;
    flex-direction: column;
    transition: $transition-base;

    &--active {
      .tab-item-text {
        color: $color-accent;
        font-weight: 600;
      }
    }
  }

  .tab-item-text {
    font-size: $font-base;
    color: $color-text-secondary;
    letter-spacing: 1rpx;
    white-space: nowrap;
  }

  .tab-item-indicator {
    position: absolute;
    bottom: 4rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 40rpx;
    height: 6rpx;
    background-color: $color-accent;
    border-radius: $radius-full;
  }
}

.order-list-wrap {
  flex: 1;
  padding: $spacing-base $spacing-md;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.order-card {
  background-color: $color-white;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  overflow: hidden;
  transition: $transition-base;

  &:active {
    box-shadow: $shadow-base;
  }
}

.order-card-header {
  @include flex-between;
  padding: $spacing-base $spacing-base $spacing-sm;
  border-bottom: 1rpx solid $color-bg-secondary;

  .order-number {
    font-size: $font-sm;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;
  }
}

.order-status-badge {
  padding: 4rpx 16rpx;
  border-radius: $radius-full;

  &--PENDING_PAYMENT {
    background-color: rgba(212, 184, 150, 0.2);
  }

  &--PENDING_SHIPMENT {
    background-color: rgba(154, 165, 180, 0.2);
  }

  &--SHIPPED {
    background-color: rgba(168, 181, 162, 0.2);
  }

  &--COMPLETED {
    background-color: rgba(184, 169, 201, 0.15);
  }

  &--AFTER_SALE {
    background-color: rgba(201, 160, 160, 0.2);
  }
}

.order-status-text {
  font-size: $font-xs;
  letter-spacing: 1rpx;

  .order-status-badge--PENDING_PAYMENT & {
    color: $color-warning;
  }

  .order-status-badge--PENDING_SHIPMENT & {
    color: $morandi-blue;
  }

  .order-status-badge--SHIPPED & {
    color: $morandi-green;
  }

  .order-status-badge--COMPLETED & {
    color: $morandi-purple;
  }

  .order-status-badge--AFTER_SALE & {
    color: $color-error;
  }
}

.order-card-body {
  padding: $spacing-base;

  .order-thumbs-scroll {
    width: 100%;
    white-space: nowrap;
  }

  .order-thumbs {
    display: inline-flex;
    gap: $spacing-sm;
  }

  .order-thumb {
    width: 120rpx;
    height: 120rpx;
    border-radius: $radius-base;
    flex-shrink: 0;
  }

  .order-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: $spacing-base;
  }

  .order-item-count {
    font-size: $font-sm;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;
  }

  .order-price-row {
    display: flex;
    align-items: baseline;
  }

  .order-price-label {
    font-size: $font-sm;
    color: $color-text-secondary;
    letter-spacing: 1rpx;
  }

  .order-price-value {
    font-size: $font-md;
    font-weight: 600;
    color: $color-accent;
    letter-spacing: 1rpx;
  }
}

.order-card-footer {
  @include flex-between;
  padding: $spacing-sm $spacing-base $spacing-base;
  border-top: 1rpx solid $color-bg-secondary;

  .order-date {
    font-size: $font-xs;
    color: $color-text-placeholder;
    letter-spacing: 1rpx;
  }

  .order-actions {
    display: flex;
    gap: $spacing-sm;
  }
}

.order-action {
  padding: $spacing-xs $spacing-base;
  border-radius: $radius-full;
  transition: $transition-base;

  &:active {
    transform: scale(0.96);
  }

  &--primary {
    background-color: $color-accent;
  }

  &--outline {
    background-color: transparent;
    border: 2rpx solid $color-border;
  }
}

.order-action-text {
  font-size: $font-sm;
  letter-spacing: 1rpx;

  .order-action--primary & {
    color: $color-white;
  }

  .order-action--outline & {
    color: $color-text-secondary;
  }
}

.loading-more,
.no-more {
  @include flex-center;
  padding: $spacing-lg 0;
}

.loading-more-text,
.no-more-text {
  font-size: $font-sm;
  color: $color-text-placeholder;
  letter-spacing: 1rpx;
}
</style>
