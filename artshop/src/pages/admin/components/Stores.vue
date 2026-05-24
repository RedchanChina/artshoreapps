<template>
  <view class="stores-manage">
    <view class="page-header">
      <text class="page-title">门店与展览管理</text>
      <view class="header-btns">
        <view class="btn-primary" @tap="openStoreForm()"><text class="btn-text">+ 门店</text></view>
        <view class="btn-primary" @tap="openExhibitionForm()"><text class="btn-text">+ 展览</text></view>
      </view>
    </view>

    <view class="section-label">门店列表</view>
    <view class="card-list" v-if="stores.length > 0">
      <view class="item-card" v-for="item in stores" :key="item._id">
        <view class="card-info">
          <text class="card-name">{{ item.name }}</text>
          <text class="card-detail">{{ item.address }}</text>
          <text class="card-detail">{{ item.businessHours }} · {{ item.phone }}</text>
        </view>
        <view class="card-actions">
          <text class="action-link" @tap="openStoreForm(item)">编辑</text>
          <text class="action-link action-danger" @tap="deleteStore(item)">删除</text>
        </view>
      </view>
    </view>
    <view class="empty-state" v-else><text>暂无门店</text></view>

    <view class="section-label" style="margin-top: 24px;">展览列表</view>
    <view class="card-list" v-if="exhibitions.length > 0">
      <view class="item-card" v-for="item in exhibitions" :key="item._id">
        <view class="card-info">
          <text class="card-name">{{ item.title }}</text>
          <text class="card-detail">{{ item.location }}</text>
          <text class="card-detail">{{ item.startDate?.slice(0,10) }} ~ {{ item.endDate?.slice(0,10) }}</text>
        </view>
        <view class="card-actions">
          <text class="action-link" @tap="openExhibitionForm(item)">编辑</text>
          <text class="action-link action-danger" @tap="deleteExhibition(item)">删除</text>
        </view>
      </view>
    </view>
    <view class="empty-state" v-else><text>暂无展览</text></view>

    <view class="modal-mask" v-if="showForm" @tap="showForm = false">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">{{ formType === 'store' ? (editingId ? '编辑门店' : '添加门店') : (editingId ? '编辑展览' : '添加展览') }}</text>
        <scroll-view scroll-y class="form-scroll">
          <template v-if="formType === 'store'">
            <view class="form-group"><text class="form-label">门店名称 *</text><input class="form-input" v-model="storeForm.name" placeholder="门店名称" /></view>
            <view class="form-group"><text class="form-label">地址</text><input class="form-input" v-model="storeForm.address" placeholder="详细地址" /></view>
            <view class="form-row">
              <view class="form-group form-half"><text class="form-label">营业时间</text><input class="form-input" v-model="storeForm.businessHours" placeholder="10:00-22:00" /></view>
              <view class="form-group form-half"><text class="form-label">电话</text><input class="form-input" v-model="storeForm.phone" placeholder="联系电话" /></view>
            </view>
            <view class="form-row">
              <view class="form-group form-half"><text class="form-label">纬度</text><input class="form-input" v-model="storeForm.latitude" type="digit" placeholder="31.2345" /></view>
              <view class="form-group form-half"><text class="form-label">经度</text><input class="form-input" v-model="storeForm.longitude" type="digit" placeholder="121.4737" /></view>
            </view>
          </template>
          <template v-else>
            <view class="form-group"><text class="form-label">展览名称 *</text><input class="form-input" v-model="exhibitionForm.title" placeholder="展览名称" /></view>
            <view class="form-group"><text class="form-label">地点</text><input class="form-input" v-model="exhibitionForm.location" placeholder="展览地点" /></view>
            <view class="form-row">
              <view class="form-group form-half"><text class="form-label">开始日期</text><input class="form-input" v-model="exhibitionForm.startDate" placeholder="2025-01-01" /></view>
              <view class="form-group form-half"><text class="form-label">结束日期</text><input class="form-input" v-model="exhibitionForm.endDate" placeholder="2025-06-30" /></view>
            </view>
            <view class="form-group"><text class="form-label">票价</text><input class="form-input" v-model="exhibitionForm.ticketPrice" type="digit" placeholder="0=免费" /></view>
            <view class="form-group"><text class="form-label">描述</text><textarea class="form-textarea" v-model="exhibitionForm.description" placeholder="展览描述" /></view>
          </template>
        </scroll-view>
        <view class="modal-actions">
          <view class="btn-cancel" @tap="showForm = false"><text>取消</text></view>
          <view class="btn-primary" @tap="submitForm"><text class="btn-text">保存</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getStoreLocations, getExhibitions } from '@/api/store'
import { adminAddStore, adminUpdateStore, adminDeleteStore, adminAddExhibition, adminUpdateExhibition, adminDeleteExhibition } from '@/api/admin'

const stores = ref<any[]>([])
const exhibitions = ref<any[]>([])
const showForm = ref(false)
const formType = ref<'store' | 'exhibition'>('store')
const editingId = ref('')

const storeForm = ref<any>({ name: '', address: '', businessHours: '', phone: '', latitude: '', longitude: '' })
const exhibitionForm = ref<any>({ title: '', location: '', startDate: '', endDate: '', ticketPrice: '', description: '' })

async function loadStores() { try { stores.value = await getStoreLocations() } catch (e) {} }
async function loadExhibitions() { try { const res = await getExhibitions({ page: 1, pageSize: 50 }); exhibitions.value = res.list } catch (e) {} }

function openStoreForm(item?: any) {
  formType.value = 'store'
  if (item) { editingId.value = item._id; storeForm.value = { name: item.name, address: item.address, businessHours: item.businessHours, phone: item.phone, latitude: String(item.latitude || ''), longitude: String(item.longitude || '') } }
  else { editingId.value = ''; storeForm.value = { name: '', address: '', businessHours: '', phone: '', latitude: '', longitude: '' } }
  showForm.value = true
}

function openExhibitionForm(item?: any) {
  formType.value = 'exhibition'
  if (item) { editingId.value = item._id; exhibitionForm.value = { title: item.title, location: item.location, startDate: item.startDate?.slice(0,10), endDate: item.endDate?.slice(0,10), ticketPrice: String(item.ticketPrice || 0), description: item.description } }
  else { editingId.value = ''; exhibitionForm.value = { title: '', location: '', startDate: '', endDate: '', ticketPrice: '', description: '' } }
  showForm.value = true
}

async function submitForm() {
  try {
    if (formType.value === 'store') {
      if (!storeForm.value.name) { uni.showToast({ title: '请填写门店名称', icon: 'none' }); return }
      const data: any = { ...storeForm.value, latitude: Number(storeForm.value.latitude) || 0, longitude: Number(storeForm.value.longitude) || 0 }
      if (editingId.value) { await adminUpdateStore(editingId.value, data); uni.showToast({ title: '更新成功', icon: 'success' }) }
      else { await adminAddStore(data); uni.showToast({ title: '添加成功', icon: 'success' }) }
      loadStores()
    } else {
      if (!exhibitionForm.value.title) { uni.showToast({ title: '请填写展览名称', icon: 'none' }); return }
      const data: any = { ...exhibitionForm.value, startDate: exhibitionForm.value.startDate + 'T08:00:00.000Z', endDate: exhibitionForm.value.endDate + 'T18:00:00.000Z', ticketPrice: Number(exhibitionForm.value.ticketPrice) || 0 }
      if (editingId.value) { await adminUpdateExhibition(editingId.value, data); uni.showToast({ title: '更新成功', icon: 'success' }) }
      else { await adminAddExhibition(data); uni.showToast({ title: '添加成功', icon: 'success' }) }
      loadExhibitions()
    }
    showForm.value = false
  } catch (e: any) { uni.showToast({ title: e.message || '操作失败', icon: 'none' }) }
}

function deleteStore(item: any) {
  uni.showModal({ title: '确认删除', content: `删除门店「${item.name}」？`, success: async (r) => { if (r.confirm) { try { await adminDeleteStore(item._id); uni.showToast({ title: '已删除', icon: 'success' }); loadStores() } catch (e: any) { uni.showToast({ title: e.message, icon: 'none' }) } } } })
}

function deleteExhibition(item: any) {
  uni.showModal({ title: '确认删除', content: `删除展览「${item.title}」？`, success: async (r) => { if (r.confirm) { try { await adminDeleteExhibition(item._id); uni.showToast({ title: '已删除', icon: 'success' }); loadExhibitions() } catch (e: any) { uni.showToast({ title: e.message, icon: 'none' }) } } } })
}

onMounted(() => { loadStores(); loadExhibitions() })
</script>

<style lang="scss" scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-title { font-size: 18px; font-weight: 600; color: #1a1a1a; }
.header-btns { display: flex; gap: 8px; }
.btn-primary { background: #1a1a2e; border-radius: 8px; padding: 8px 16px; cursor: pointer; }
.btn-text { color: #fff; font-size: 13px; }
.btn-cancel { background: #f0f0f0; border-radius: 8px; padding: 8px 16px; cursor: pointer; }
.section-label { font-size: 14px; font-weight: 600; color: #666; margin-bottom: 12px; }
.card-list { display: flex; flex-direction: column; gap: 10px; }
.item-card { background: #fff; border-radius: 12px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.card-info { flex: 1; min-width: 0; }
.card-name { display: block; font-size: 14px; font-weight: 500; color: #1a1a1a; }
.card-detail { display: block; font-size: 12px; color: #999; margin-top: 2px; }
.card-actions { flex-shrink: 0; display: flex; gap: 8px; }
.action-link { color: #8b7355; font-size: 12px; cursor: pointer; }
.action-danger { color: #e74c3c; }
.empty-state { text-align: center; padding: 24px; color: #999; font-size: 13px; }
.modal-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; }
.modal-content { background: #fff; border-radius: 16px; width: 90%; max-width: 500px; max-height: 85vh; display: flex; flex-direction: column; }
.modal-title { font-size: 16px; font-weight: 600; padding: 20px 24px 12px; border-bottom: 1px solid #f0f0f0; }
.form-scroll { max-height: 55vh; padding: 16px 24px; }
.form-group { margin-bottom: 14px; }
.form-label { display: block; font-size: 13px; color: #666; margin-bottom: 6px; }
.form-input { width: 100%; border: 1px solid #e8e8e8; border-radius: 8px; padding: 10px 12px; font-size: 14px; box-sizing: border-box; }
.form-textarea { width: 100%; border: 1px solid #e8e8e8; border-radius: 8px; padding: 10px 12px; font-size: 13px; min-height: 60px; box-sizing: border-box; }
.form-row { display: flex; gap: 12px; }
.form-half { flex: 1; }
.modal-actions { display: flex; gap: 12px; padding: 16px 24px 20px; border-top: 1px solid #f0f0f0; justify-content: flex-end; }
</style>
