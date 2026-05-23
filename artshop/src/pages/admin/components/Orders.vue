<template>
  <view class="orders-manage">
    <view class="page-header">
      <text class="page-title">订单管理</text>
    </view>
    <view class="filter-bar">
      <picker :range="statusOptions" @change="onStatusChange">
        <view class="filter-picker">{{ statusLabels[currentStatus] || '全部状态' }}</view>
      </picker>
    </view>
    <view class="order-list" v-if="list.length > 0">
      <view class="order-card" v-for="item in list" :key="item._id">
        <view class="order-header">
          <text class="order-id">订单号: {{ item._id?.slice(-8) }}</text>
          <text :class="['order-status', 'status-' + (item.status || '').toLowerCase()]">{{ statusLabels[item.status] || item.status }}</text>
        </view>
        <view class="order-body">
          <view class="order-item" v-for="(oi, idx) in (item.items || []).slice(0, 3)" :key="idx">
            <text class="oi-title">{{ oi.artworkTitle }}</text>
            <text class="oi-price">¥{{ oi.subtotal }}</text>
          </view>
          <view v-if="(item.items || []).length > 3" class="order-more">
            <text>还有 {{ item.items.length - 3 }} 件商品</text>
          </view>
        </view>
        <view class="order-footer">
          <text class="order-total">实付: ¥{{ item.actualPrice }}</text>
          <view class="order-actions">
            <view v-if="item.status === 'PENDING_PAYMENT'" class="btn-sm btn-danger" @tap="updateStatus(item._id, 'AFTER_SALE')">
              <text>取消</text>
            </view>
            <view v-if="item.status === 'PENDING_SHIPMENT'" class="btn-sm btn-primary" @tap="updateStatus(item._id, 'SHIPPED')">
              <text>发货</text>
            </view>
          </view>
        </view>
        <text class="order-time">{{ item.createdAt }}</text>
      </view>
    </view>
    <view class="empty-state" v-else-if="!loading"><text>暂无订单</text></view>
    <view class="load-more" v-if="hasMore" @tap="loadMore"><text>加载更多</text></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminGetOrders, adminUpdateOrderStatus } from '@/api/admin'
import type { OrderStatus } from '@/types/order'

const list = ref<any[]>([])
const loading = ref(false)
const currentStatus = ref('')
const page = ref(1)
const hasMore = ref(false)

const statusOptions = ['全部', 'PENDING_PAYMENT', 'PENDING_SHIPMENT', 'SHIPPED', 'COMPLETED', 'AFTER_SALE']
const statusLabels: Record<string, string> = {
  '': '全部状态',
  PENDING_PAYMENT: '待付款',
  PENDING_SHIPMENT: '待发货',
  SHIPPED: '已发货',
  COMPLETED: '已完成',
  AFTER_SALE: '售后中',
}

async function loadList() {
  loading.value = true
  try {
    const params: any = { page: page.value, pageSize: 20 }
    if (currentStatus.value) params.status = currentStatus.value as OrderStatus
    const res = await adminGetOrders(params)
    if (page.value === 1) { list.value = res.list } else { list.value.push(...res.list) }
    hasMore.value = list.value.length < res.total
  } catch (e) { console.error(e) }
  loading.value = false
}

function onStatusChange(e: any) {
  const idx = e.detail.value
  currentStatus.value = idx === 0 ? '' : statusOptions[idx]
  page.value = 1
  loadList()
}

function loadMore() { page.value++; loadList() }

async function updateStatus(id: string, status: string) {
  try {
    await adminUpdateOrderStatus(id, status as OrderStatus)
    uni.showToast({ title: '状态已更新', icon: 'success' })
    page.value = 1
    loadList()
  } catch (e: any) {
    uni.showToast({ title: e.message || '操作失败', icon: 'none' })
  }
}

onMounted(() => loadList())
</script>

<style lang="scss" scoped>
.page-header { margin-bottom: 16px; }
.page-title { font-size: 18px; font-weight: 600; color: #1a1a1a; }
.filter-bar { margin-bottom: 16px; }
.filter-picker {
  background: #fff; border: 1px solid #e8e8e8; border-radius: 8px;
  padding: 8px 16px; font-size: 13px; color: #666; display: inline-block;
}
.order-list { display: flex; flex-direction: column; gap: 12px; }
.order-card {
  background: #fff; border-radius: 12px; padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.order-id { font-size: 13px; color: #999; }
.order-status { font-size: 12px; padding: 2px 8px; border-radius: 10px; }
.status-pending_payment { background: #fff3e0; color: #e65100; }
.status-pending_shipment { background: #e3f2fd; color: #1565c0; }
.status-shipped { background: #e8f5e9; color: #2e7d32; }
.status-completed { background: #f5f5f5; color: #666; }
.status-after_sale { background: #fce4ec; color: #c62828; }
.order-body { border-top: 1px solid #f0f0f0; padding-top: 8px; }
.order-item { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
.oi-title { color: #333; }
.oi-price { color: #1a1a2e; font-weight: 500; }
.order-more { font-size: 12px; color: #999; padding: 4px 0; }
.order-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; border-top: 1px solid #f0f0f0; padding-top: 10px; }
.order-total { font-size: 15px; font-weight: 600; color: #1a1a2e; }
.order-actions { display: flex; gap: 8px; }
.btn-sm { padding: 4px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; }
.btn-primary { background: #1a1a2e; color: #fff; }
.btn-danger { background: #e74c3c; color: #fff; }
.order-time { display: block; font-size: 11px; color: #ccc; margin-top: 8px; }
.empty-state { text-align: center; padding: 40px; color: #999; }
.load-more { text-align: center; padding: 16px; color: #8b7355; cursor: pointer; font-size: 13px; }
</style>
