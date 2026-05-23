<template>
  <view class="artworks-manage">
    <view class="page-header">
      <text class="page-title">作品管理</text>
      <view class="btn-primary" @tap="openForm()">
        <text class="btn-text">+ 添加作品</text>
      </view>
    </view>

    <view class="filter-bar">
      <input class="search-input" v-model="keyword" placeholder="搜索作品..." @confirm="loadList" />
      <picker :range="categories" @change="onCategoryChange">
        <view class="filter-picker">{{ currentCategory || '全部分类' }}</view>
      </picker>
    </view>

    <view class="data-table" v-if="list.length > 0">
      <view class="table-row table-header">
        <text class="col-image">图片</text>
        <text class="col-title">标题</text>
        <text class="col-artist">艺术家</text>
        <text class="col-price">价格</text>
        <text class="col-stock">库存</text>
        <text class="col-actions">操作</text>
      </view>
      <view class="table-row" v-for="item in list" :key="item._id">
        <view class="col-image">
          <image v-if="item.image" :src="item.image" class="thumb" mode="aspectFill" />
          <view v-else class="thumb-placeholder">无图</view>
        </view>
        <text class="col-title">{{ item.title }}</text>
        <text class="col-artist">{{ item.artistName }}</text>
        <text class="col-price">¥{{ item.price }}</text>
        <text class="col-stock">{{ item.stock }}</text>
        <view class="col-actions">
          <text class="action-link" @tap="openForm(item)">编辑</text>
          <text class="action-link action-danger" @tap="confirmDelete(item)">删除</text>
        </view>
      </view>
    </view>
    <view class="empty-state" v-else-if="!loading">
      <text>暂无作品数据</text>
    </view>
    <view class="load-more" v-if="hasMore" @tap="loadMore">
      <text>加载更多</text>
    </view>

    <view class="modal-mask" v-if="showForm" @tap="showForm = false">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">{{ editingId ? '编辑作品' : '添加作品' }}</text>
        <scroll-view scroll-y class="form-scroll">
          <view class="form-group">
            <text class="form-label">标题 *</text>
            <input class="form-input" v-model="form.title" placeholder="作品标题" />
          </view>
          <view class="form-group">
            <text class="form-label">艺术家</text>
            <picker :range="artistNames" @change="onArtistPick">
              <view class="form-picker">{{ form.artistName || '选择艺术家' }}</view>
            </picker>
          </view>
          <view class="form-group">
            <text class="form-label">分类</text>
            <picker :range="categoryOptions" @change="onFormCategoryPick">
              <view class="form-picker">{{ form.category || '选择分类' }}</view>
            </picker>
          </view>
          <view class="form-row">
            <view class="form-group form-half">
              <text class="form-label">价格 *</text>
              <input class="form-input" v-model="form.price" type="digit" placeholder="0" />
            </view>
            <view class="form-group form-half">
              <text class="form-label">原价</text>
              <input class="form-input" v-model="form.originalPrice" type="digit" placeholder="可选" />
            </view>
          </view>
          <view class="form-group">
            <text class="form-label">库存</text>
            <input class="form-input" v-model="form.stock" type="number" placeholder="0" />
          </view>
          <view class="form-group">
            <text class="form-label">图片URL</text>
            <input class="form-input" v-model="form.image" placeholder="作品主图URL" />
          </view>
          <view class="form-group">
            <text class="form-label">描述</text>
            <textarea class="form-textarea" v-model="form.description" placeholder="作品描述" />
          </view>
          <view class="form-group">
            <text class="form-label">标签（逗号分隔）</text>
            <input class="form-input" v-model="form.tagsStr" placeholder="限量,摄影,风景" />
          </view>
          <view class="form-group">
            <text class="form-label">规格（JSON格式）</text>
            <textarea class="form-textarea" v-model="form.specsStr" placeholder='[{"size":"30×40cm","material":"纯棉纸","frameStyle":"原木框","price":2800,"stock":10}]' />
          </view>
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
import { ref, onMounted, computed } from 'vue'
import { getArtworkList } from '@/api/artwork'
import { adminAddArtwork, adminUpdateArtwork, adminDeleteArtwork } from '@/api/admin'
import { getArtistList } from '@/api/artist'
import type { Artwork } from '@/types/artwork'

const list = ref<any[]>([])
const loading = ref(false)
const keyword = ref('')
const currentCategory = ref('')
const page = ref(1)
const hasMore = ref(false)
const showForm = ref(false)
const editingId = ref('')
const artists = ref<any[]>([])

const categories = ['全部', 'photography', 'illustration']
const categoryOptions = ['photography', 'illustration']

const form = ref<any>({
  title: '', artistName: '', artistId: '', category: 'photography',
  price: '', originalPrice: '', stock: '', image: '', description: '', tagsStr: '', specsStr: '',
})

const artistNames = computed(() => artists.value.map((a) => a.name))

async function loadArtists() {
  try {
    const res = await getArtistList({ page: 1, pageSize: 100 })
    artists.value = res.list
  } catch (e) { console.error(e) }
}

async function loadList() {
  loading.value = true
  try {
    const filter: any = {}
    if (currentCategory.value) filter.category = currentCategory.value
    if (keyword.value) filter.keyword = keyword.value
    filter.sortBy = 'newest'
    const res = await getArtworkList({ page: page.value, pageSize: 20, filter })
    if (page.value === 1) {
      list.value = res.list
    } else {
      list.value.push(...res.list)
    }
    hasMore.value = list.value.length < res.total
  } catch (e) { console.error(e) }
  loading.value = false
}

function onCategoryChange(e: any) {
  const idx = e.detail.value
  currentCategory.value = idx === 0 ? '' : categories[idx]
  page.value = 1
  loadList()
}

function loadMore() {
  page.value++
  loadList()
}

function openForm(item?: any) {
  if (item) {
    editingId.value = item._id
    form.value = {
      title: item.title, artistName: item.artistName, artistId: item.artistId,
      category: item.category, price: String(item.price),
      originalPrice: item.originalPrice ? String(item.originalPrice) : '',
      stock: String(item.stock), image: item.image, description: item.description,
      tagsStr: (item.tags || []).join(','), specsStr: JSON.stringify(item.specifications || []),
    }
  } else {
    editingId.value = ''
    form.value = {
      title: '', artistName: '', artistId: '', category: 'photography',
      price: '', originalPrice: '', stock: '', image: '', description: '', tagsStr: '', specsStr: '',
    }
  }
  showForm.value = true
}

function onArtistPick(e: any) {
  const idx = e.detail.value
  const artist = artists.value[idx]
  if (artist) {
    form.value.artistName = artist.name
    form.value.artistId = artist._id
  }
}

function onFormCategoryPick(e: any) {
  form.value.category = categoryOptions[e.detail.value]
}

async function submitForm() {
  if (!form.value.title || !form.value.price) {
    uni.showToast({ title: '请填写标题和价格', icon: 'none' })
    return
  }
  try {
    const data: any = {
      title: form.value.title,
      artistName: form.value.artistName,
      artistId: form.value.artistId,
      category: form.value.category,
      price: Number(form.value.price),
      stock: Number(form.value.stock) || 0,
      image: form.value.image,
      description: form.value.description,
      tags: form.value.tagsStr ? form.value.tagsStr.split(',').map((t: string) => t.trim()) : [],
    }
    if (form.value.originalPrice) data.originalPrice = Number(form.value.originalPrice)
    try { data.specifications = JSON.parse(form.value.specsStr || '[]') } catch { data.specifications = [] }

    if (editingId.value) {
      await adminUpdateArtwork(editingId.value, data)
      uni.showToast({ title: '更新成功', icon: 'success' })
    } else {
      await adminAddArtwork(data)
      uni.showToast({ title: '添加成功', icon: 'success' })
    }
    showForm.value = false
    page.value = 1
    loadList()
  } catch (e: any) {
    uni.showToast({ title: e.message || '操作失败', icon: 'none' })
  }
}

function confirmDelete(item: any) {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除作品「${item.title}」吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await adminDeleteArtwork(item._id)
          uni.showToast({ title: '已删除', icon: 'success' })
          page.value = 1
          loadList()
        } catch (e: any) {
          uni.showToast({ title: e.message || '删除失败', icon: 'none' })
        }
      }
    },
  })
}

onMounted(() => {
  loadArtists()
  loadList()
})
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.page-title { font-size: 18px; font-weight: 600; color: #1a1a1a; }
.btn-primary {
  background: #1a1a2e; border-radius: 8px; padding: 8px 16px; cursor: pointer;
}
.btn-text { color: #fff; font-size: 13px; }
.btn-cancel {
  background: #f0f0f0; border-radius: 8px; padding: 8px 16px; cursor: pointer;
}
.filter-bar {
  display: flex; gap: 12px; margin-bottom: 16px;
}
.search-input {
  flex: 1; background: #fff; border: 1px solid #e8e8e8; border-radius: 8px;
  padding: 8px 12px; font-size: 13px;
}
.filter-picker {
  background: #fff; border: 1px solid #e8e8e8; border-radius: 8px;
  padding: 8px 16px; font-size: 13px; color: #666;
}
.data-table {
  background: #fff; border-radius: 12px; overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.table-row {
  display: flex; align-items: center; padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0; font-size: 13px;
}
.table-header {
  background: #fafafa; font-weight: 600; color: #666;
}
.col-image { width: 50px; flex-shrink: 0; }
.col-title { flex: 2; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-artist { flex: 1.5; }
.col-price { width: 70px; }
.col-stock { width: 50px; text-align: center; }
.col-actions { width: 80px; text-align: right; }
.thumb { width: 40px; height: 40px; border-radius: 4px; }
.thumb-placeholder {
  width: 40px; height: 40px; border-radius: 4px; background: #f0f0f0;
  display: flex; align-items: center; justify-content: center; font-size: 10px; color: #ccc;
}
.action-link { color: #8b7355; margin-left: 8px; cursor: pointer; font-size: 12px; }
.action-danger { color: #e74c3c; }
.empty-state { text-align: center; padding: 40px; color: #999; }
.load-more { text-align: center; padding: 16px; color: #8b7355; cursor: pointer; font-size: 13px; }
.modal-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); z-index: 200;
  display: flex; align-items: center; justify-content: center;
}
.modal-content {
  background: #fff; border-radius: 16px; width: 90%; max-width: 600px;
  max-height: 85vh; display: flex; flex-direction: column;
}
.modal-title {
  font-size: 16px; font-weight: 600; padding: 20px 24px 12px;
  border-bottom: 1px solid #f0f0f0;
}
.form-scroll { max-height: 55vh; padding: 16px 24px; }
.form-group { margin-bottom: 14px; }
.form-label { display: block; font-size: 13px; color: #666; margin-bottom: 6px; }
.form-input {
  width: 100%; border: 1px solid #e8e8e8; border-radius: 8px;
  padding: 10px 12px; font-size: 14px; box-sizing: border-box;
}
.form-textarea {
  width: 100%; border: 1px solid #e8e8e8; border-radius: 8px;
  padding: 10px 12px; font-size: 13px; min-height: 60px; box-sizing: border-box;
}
.form-picker {
  border: 1px solid #e8e8e8; border-radius: 8px; padding: 10px 12px;
  font-size: 14px; color: #333;
}
.form-row { display: flex; gap: 12px; }
.form-half { flex: 1; }
.modal-actions {
  display: flex; gap: 12px; padding: 16px 24px 20px;
  border-top: 1px solid #f0f0f0; justify-content: flex-end;
}
@media (max-width: 767px) {
  .col-artist, .col-stock { display: none; }
  .table-row { padding: 10px 12px; }
}
</style>
