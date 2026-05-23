<template>
  <view class="addresses-page">
    <view v-if="addressList.length > 0" class="address-list">
      <view
        v-for="item in addressList"
        :key="item.id"
        class="address-card"
      >
        <view class="address-card-main" @tap="onSelectAddress(item)">
          <view class="address-top-row">
            <text class="address-name">{{ item.name }}</text>
            <text class="address-phone">{{ item.phone }}</text>
            <view v-if="item.isDefault" class="address-default-badge">
              <text class="address-default-text">默认</text>
            </view>
          </view>
          <text class="address-detail">{{ item.province }}{{ item.city }}{{ item.district }}{{ item.detail }}</text>
        </view>

        <view class="address-card-actions">
          <view
            class="address-action"
            :class="{ 'address-action--active': item.isDefault }"
            @tap="onSetDefault(item)"
          >
            <view class="address-action-radio" :class="{ 'address-action-radio--checked': item.isDefault }" />
            <text class="address-action-label">默认地址</text>
          </view>
          <view class="address-action-group">
            <view class="address-action" @tap="onEdit(item)">
              <text class="address-action-icon">✎</text>
              <text class="address-action-label">编辑</text>
            </view>
            <view class="address-action" @tap="onDelete(item)">
              <text class="address-action-icon">✕</text>
              <text class="address-action-label">删除</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <EmptyState
      v-else
      icon="📍"
      title="暂无收货地址"
      description="添加一个收货地址，方便购物"
      action-text="添加地址"
      @action="onAdd"
    />

    <view class="add-btn-wrap">
      <view class="add-btn" @tap="onAdd">
        <text class="add-btn-text">+ 新增收货地址</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import type { Address } from '@/types/user'

const addressList = ref<Address[]>([
  {
    id: 'addr1',
    userId: 'u1',
    name: '张三',
    phone: '138****6789',
    province: '上海市',
    city: '上海市',
    district: '黄浦区',
    detail: '南京东路233号 ArtShop旗舰空间 3F',
    isDefault: true,
  },
  {
    id: 'addr2',
    userId: 'u1',
    name: '张三',
    phone: '138****6789',
    province: '浙江省',
    city: '杭州市',
    district: '西湖区',
    detail: '文三路478号华星科技大厦 12楼',
    isDefault: false,
  },
  {
    id: 'addr3',
    userId: 'u1',
    name: '李四',
    phone: '139****1234',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '798艺术区 陶瓷一街 6号院',
    isDefault: false,
  },
])

const onAdd = () => {
  uni.navigateTo({ url: '/pages/user/address-edit' })
}

const onEdit = (item: Address) => {
  uni.navigateTo({ url: `/pages/user/address-edit?id=${item.id}` })
}

const onDelete = (item: Address) => {
  uni.showModal({
    title: '删除地址',
    content: '确定要删除该收货地址吗？',
    success: (res) => {
      if (res.confirm) {
        addressList.value = addressList.value.filter((a) => a.id !== item.id)
      }
    },
  })
}

const onSetDefault = (item: Address) => {
  if (item.isDefault) return
  addressList.value.forEach((addr) => {
    addr.isDefault = addr.id === item.id
  })
}

const onSelectAddress = (item: Address) => {
  const pages = getCurrentPages()
  const prevPage = pages[pages.length - 2] as any
  if (prevPage && prevPage.$vm && prevPage.$vm.onSelectAddress) {
    prevPage.$vm.onSelectAddress(item)
    uni.navigateBack()
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.addresses-page {
  min-height: 100vh;
  background-color: $color-bg;
  padding: $spacing-base $spacing-md;
  padding-bottom: 160rpx;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.address-card {
  background-color: $color-white;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  overflow: hidden;
  transition: $transition-base;

  &:active {
    box-shadow: $shadow-base;
  }
}

.address-card-main {
  padding: $spacing-base;
}

.address-top-row {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
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

.address-default-badge {
  padding: 2rpx 12rpx;
  background-color: rgba(168, 181, 162, 0.2);
  border-radius: $radius-full;
}

.address-default-text {
  font-size: $font-xs;
  color: $morandi-green;
  letter-spacing: 1rpx;
}

.address-detail {
  display: block;
  margin-top: $spacing-sm;
  font-size: $font-base;
  color: $color-text-secondary;
  line-height: 1.6;
  letter-spacing: 1rpx;
}

.address-card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-sm $spacing-base;
  border-top: 1rpx solid $color-bg-secondary;
}

.address-action {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: $spacing-xs $spacing-sm;
  transition: $transition-base;

  &:active {
    opacity: 0.7;
  }
}

.address-action-radio {
  width: 32rpx;
  height: 32rpx;
  border-radius: $radius-full;
  border: 2rpx solid $color-border;
  @include flex-center;
  transition: $transition-base;

  &--checked {
    border-color: $morandi-green;
    background-color: $morandi-green;

    &::after {
      content: '';
      width: 14rpx;
      height: 14rpx;
      background-color: $color-white;
      border-radius: $radius-full;
    }
  }
}

.address-action-label {
  font-size: $font-sm;
  color: $color-text-tertiary;
  letter-spacing: 1rpx;

  .address-action--active & {
    color: $morandi-green;
  }
}

.address-action-group {
  display: flex;
  gap: $spacing-base;
}

.address-action-icon {
  font-size: $font-sm;
  color: $color-text-tertiary;
}

.add-btn-wrap {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-base $spacing-md;
  padding-bottom: calc(env(safe-area-inset-bottom) + #{$spacing-base});
  background-color: $color-white;
  box-shadow: 0 -4rpx 16rpx rgba(180, 170, 160, 0.08);
}

.add-btn {
  width: 100%;
  @include flex-center;
  padding: $spacing-base 0;
  background-color: $color-accent;
  border-radius: $radius-lg;
  transition: $transition-base;

  &:active {
    opacity: 0.85;
    transform: scale(0.98);
  }
}

.add-btn-text {
  font-size: $font-md;
  color: $color-white;
  letter-spacing: 2rpx;
  font-weight: 500;
}
</style>
