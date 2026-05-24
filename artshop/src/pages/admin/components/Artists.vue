<template>
  <view class="artists-manage">
    <view class="page-header">
      <text class="page-title">艺术家管理</text>
      <view class="btn-primary" @tap="openForm()">
        <text class="btn-text">+ 添加艺术家</text>
      </view>
    </view>

    <view class="card-grid">
      <view class="artist-card" v-for="item in list" :key="item._id">
        <view class="card-avatar">
          <image v-if="item.avatar" :src="item.avatar" class="avatar-img" mode="aspectFill" />
          <view v-else class="avatar-placeholder">{{ (item.name || '?')[0] }}</view>
        </view>
        <view class="card-info">
          <text class="card-name">{{ item.name }}</text>
          <text class="card-bio">{{ item.bio }}</text>
          <text class="card-followers">{{ item.followerCount || 0 }} 关注</text>
        </view>
        <view class="card-actions">
          <text class="action-link" @tap="openForm(item)">编辑</text>
          <text class="action-link action-danger" @tap="confirmDelete(item)">删除</text>
        </view>
      </view>
    </view>
    <view class="empty-state" v-if="list.length === 0 && !loading">
      <text>暂无艺术家数据</text>
    </view>

    <view class="modal-mask" v-if="showForm" @tap="showForm = false">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">{{ editingId ? '编辑艺术家' : '添加艺术家' }}</text>
        <scroll-view scroll-y class="form-scroll">
          <view class="form-group">
            <text class="form-label">姓名 *</text>
            <input class="form-input" v-model="form.name" placeholder="艺术家姓名" />
          </view>
          <view class="form-group">
            <text class="form-label">头像URL</text>
            <input class="form-input" v-model="form.avatar" placeholder="头像图片URL" />
          </view>
          <view class="form-group">
            <text class="form-label">简介</text>
            <input class="form-input" v-model="form.bio" placeholder="一句话简介" />
          </view>
          <view class="form-group">
            <text class="form-label">故事</text>
            <textarea class="form-textarea" v-model="form.story" placeholder="艺术家故事/介绍" />
          </view>
          <view class="form-group">
            <text class="form-label">荣誉（逗号分隔）</text>
            <input class="form-input" v-model="form.honorsStr" placeholder="奖项1,奖项2" />
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
import { ref, onMounted } from 'vue'
import { getArtistList } from '@/api/artist'
import { adminAddArtist, adminUpdateArtist, adminDeleteArtist } from '@/api/admin'

const list = ref<any[]>([])
const loading = ref(false)
const showForm = ref(false)
const editingId = ref('')

const form = ref<any>({ name: '', avatar: '', bio: '', story: '', honorsStr: '' })

async function loadList() {
  loading.value = true
  try {
    const res = await getArtistList({ page: 1, pageSize: 100 })
    list.value = res.list
  } catch (e) {}
  loading.value = false
}

function openForm(item?: any) {
  if (item) {
    editingId.value = item._id
    form.value = {
      name: item.name, avatar: item.avatar, bio: item.bio,
      story: item.story, honorsStr: (item.honors || []).join(','),
    }
  } else {
    editingId.value = ''
    form.value = { name: '', avatar: '', bio: '', story: '', honorsStr: '' }
  }
  showForm.value = true
}

async function submitForm() {
  if (!form.value.name) {
    uni.showToast({ title: '请填写姓名', icon: 'none' })
    return
  }
  try {
    const data: any = {
      name: form.value.name, avatar: form.value.avatar, bio: form.value.bio,
      story: form.value.story,
      honors: form.value.honorsStr ? form.value.honorsStr.split(',').map((t: string) => t.trim()) : [],
    }
    if (editingId.value) {
      await adminUpdateArtist(editingId.value, data)
      uni.showToast({ title: '更新成功', icon: 'success' })
    } else {
      await adminAddArtist(data)
      uni.showToast({ title: '添加成功', icon: 'success' })
    }
    showForm.value = false
    loadList()
  } catch (e: any) {
    uni.showToast({ title: e.message || '操作失败', icon: 'none' })
  }
}

function confirmDelete(item: any) {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除艺术家「${item.name}」吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await adminDeleteArtist(item._id)
          uni.showToast({ title: '已删除', icon: 'success' })
          loadList()
        } catch (e: any) {
          uni.showToast({ title: e.message || '删除失败', icon: 'none' })
        }
      }
    },
  })
}

onMounted(() => loadList())
</script>

<style lang="scss" scoped>
.page-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
}
.page-title { font-size: 18px; font-weight: 600; color: #1a1a1a; }
.btn-primary { background: #1a1a2e; border-radius: 8px; padding: 8px 16px; cursor: pointer; }
.btn-text { color: #fff; font-size: 13px; }
.btn-cancel { background: #f0f0f0; border-radius: 8px; padding: 8px 16px; cursor: pointer; }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.artist-card {
  background: #fff; border-radius: 12px; padding: 16px;
  display: flex; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.card-avatar { flex-shrink: 0; }
.avatar-img { width: 48px; height: 48px; border-radius: 50%; }
.avatar-placeholder {
  width: 48px; height: 48px; border-radius: 50%; background: #1a1a2e; color: #fff;
  display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 600;
}
.card-info { flex: 1; min-width: 0; }
.card-name { display: block; font-size: 15px; font-weight: 600; color: #1a1a1a; }
.card-bio { display: block; font-size: 12px; color: #999; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-followers { display: block; font-size: 11px; color: #8b7355; margin-top: 4px; }
.card-actions { display: flex; flex-direction: column; gap: 6px; justify-content: center; }
.action-link { color: #8b7355; font-size: 12px; cursor: pointer; }
.action-danger { color: #e74c3c; }
.empty-state { text-align: center; padding: 40px; color: #999; }
.modal-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); z-index: 200;
  display: flex; align-items: center; justify-content: center;
}
.modal-content {
  background: #fff; border-radius: 16px; width: 90%; max-width: 500px;
  max-height: 85vh; display: flex; flex-direction: column;
}
.modal-title { font-size: 16px; font-weight: 600; padding: 20px 24px 12px; border-bottom: 1px solid #f0f0f0; }
.form-scroll { max-height: 55vh; padding: 16px 24px; }
.form-group { margin-bottom: 14px; }
.form-label { display: block; font-size: 13px; color: #666; margin-bottom: 6px; }
.form-input {
  width: 100%; border: 1px solid #e8e8e8; border-radius: 8px;
  padding: 10px 12px; font-size: 14px; box-sizing: border-box;
}
.form-textarea {
  width: 100%; border: 1px solid #e8e8e8; border-radius: 8px;
  padding: 10px 12px; font-size: 13px; min-height: 80px; box-sizing: border-box;
}
.modal-actions {
  display: flex; gap: 12px; padding: 16px 24px 20px;
  border-top: 1px solid #f0f0f0; justify-content: flex-end;
}
</style>
