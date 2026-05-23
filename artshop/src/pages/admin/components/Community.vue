<template>
  <view class="community-manage">
    <view class="page-header">
      <text class="page-title">社区管理</text>
      <view class="btn-primary" @tap="openArticleForm()">
        <text class="btn-text">+ 添加文章</text>
      </view>
    </view>
    <view class="section-label">文章列表</view>
    <view class="data-table" v-if="articles.length > 0">
      <view class="table-row" v-for="item in articles" :key="item._id">
        <view class="card-info">
          <text class="card-title">{{ item.title }}</text>
          <text class="card-meta">{{ item.author }} · {{ item.viewCount }} 阅读</text>
        </view>
        <view class="card-actions">
          <text class="action-link" @tap="openArticleForm(item)">编辑</text>
          <text class="action-link action-danger" @tap="deleteArticle(item)">删除</text>
        </view>
      </view>
    </view>
    <view class="empty-state" v-else><text>暂无文章</text></view>

    <view class="modal-mask" v-if="showForm" @tap="showForm = false">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">{{ editingId ? '编辑文章' : '添加文章' }}</text>
        <scroll-view scroll-y class="form-scroll">
          <view class="form-group">
            <text class="form-label">标题 *</text>
            <input class="form-input" v-model="form.title" placeholder="文章标题" />
          </view>
          <view class="form-group">
            <text class="form-label">封面图URL</text>
            <input class="form-input" v-model="form.coverImage" placeholder="封面图URL" />
          </view>
          <view class="form-group">
            <text class="form-label">摘要</text>
            <textarea class="form-textarea" v-model="form.summary" placeholder="文章摘要" />
          </view>
          <view class="form-group">
            <text class="form-label">正文内容</text>
            <textarea class="form-textarea form-content" v-model="form.content" placeholder="文章正文" />
          </view>
        </scroll-view>
        <view class="modal-actions">
          <view class="btn-cancel" @tap="showForm = false"><text>取消</text></view>
          <view class="btn-primary" @tap="submitArticle"><text class="btn-text">保存</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getArticles } from '@/api/community'
import { adminAddArticle, adminUpdateArticle, adminDeleteArticle } from '@/api/admin'

const articles = ref<any[]>([])
const showForm = ref(false)
const editingId = ref('')
const form = ref<any>({ title: '', coverImage: '', summary: '', content: '' })

async function loadArticles() {
  try {
    const res = await getArticles({ page: 1, pageSize: 50 })
    articles.value = res.list
  } catch (e) { console.error(e) }
}

function openArticleForm(item?: any) {
  if (item) {
    editingId.value = item._id
    form.value = { title: item.title, coverImage: item.coverImage, summary: item.summary, content: item.content }
  } else {
    editingId.value = ''
    form.value = { title: '', coverImage: '', summary: '', content: '' }
  }
  showForm.value = true
}

async function submitArticle() {
  if (!form.value.title) { uni.showToast({ title: '请填写标题', icon: 'none' }); return }
  try {
    if (editingId.value) {
      await adminUpdateArticle(editingId.value, form.value)
      uni.showToast({ title: '更新成功', icon: 'success' })
    } else {
      await adminAddArticle(form.value)
      uni.showToast({ title: '添加成功', icon: 'success' })
    }
    showForm.value = false
    loadArticles()
  } catch (e: any) { uni.showToast({ title: e.message || '操作失败', icon: 'none' }) }
}

function deleteArticle(item: any) {
  uni.showModal({
    title: '确认删除', content: `删除文章「${item.title}」？`,
    success: async (res) => {
      if (res.confirm) {
        try { await adminDeleteArticle(item._id); uni.showToast({ title: '已删除', icon: 'success' }); loadArticles() }
        catch (e: any) { uni.showToast({ title: e.message || '删除失败', icon: 'none' }) }
      }
    },
  })
}

onMounted(() => loadArticles())
</script>

<style lang="scss" scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-title { font-size: 18px; font-weight: 600; color: #1a1a1a; }
.btn-primary { background: #1a1a2e; border-radius: 8px; padding: 8px 16px; cursor: pointer; }
.btn-text { color: #fff; font-size: 13px; }
.btn-cancel { background: #f0f0f0; border-radius: 8px; padding: 8px 16px; cursor: pointer; }
.section-label { font-size: 14px; font-weight: 600; color: #666; margin-bottom: 12px; }
.data-table { background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.table-row { display: flex; align-items: center; padding: 14px 16px; border-bottom: 1px solid #f0f0f0; }
.card-info { flex: 1; min-width: 0; }
.card-title { display: block; font-size: 14px; font-weight: 500; color: #1a1a1a; }
.card-meta { display: block; font-size: 12px; color: #999; margin-top: 4px; }
.card-actions { flex-shrink: 0; display: flex; gap: 8px; }
.action-link { color: #8b7355; font-size: 12px; cursor: pointer; }
.action-danger { color: #e74c3c; }
.empty-state { text-align: center; padding: 40px; color: #999; }
.modal-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; }
.modal-content { background: #fff; border-radius: 16px; width: 90%; max-width: 600px; max-height: 85vh; display: flex; flex-direction: column; }
.modal-title { font-size: 16px; font-weight: 600; padding: 20px 24px 12px; border-bottom: 1px solid #f0f0f0; }
.form-scroll { max-height: 55vh; padding: 16px 24px; }
.form-group { margin-bottom: 14px; }
.form-label { display: block; font-size: 13px; color: #666; margin-bottom: 6px; }
.form-input { width: 100%; border: 1px solid #e8e8e8; border-radius: 8px; padding: 10px 12px; font-size: 14px; box-sizing: border-box; }
.form-textarea { width: 100%; border: 1px solid #e8e8e8; border-radius: 8px; padding: 10px 12px; font-size: 13px; min-height: 60px; box-sizing: border-box; }
.form-content { min-height: 150px; }
.modal-actions { display: flex; gap: 12px; padding: 16px 24px 20px; border-top: 1px solid #f0f0f0; justify-content: flex-end; }
</style>
