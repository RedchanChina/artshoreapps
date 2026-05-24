<template>
  <view class="logo-manager">
    <view class="card">
      <view class="card-header">
        <text class="card-title">LOGO 管理</text>
        <text class="card-desc">上传并管理商店 LOGO，将自动应用到整个应用</text>
      </view>

      <view class="preview-section">
        <text class="section-label">当前 LOGO 预览</text>
        <view class="preview-box">
          <image :src="appStore.logoUrl" class="preview-logo" mode="aspectFit" />
        </view>
        <text class="logo-status" v-if="appStore.isUsingCustomLogo">
          ✨ 正在使用自定义 LOGO
        </text>
        <text class="logo-status" v-else>
          📄 正在使用默认 LOGO
        </text>
      </view>

      <view class="upload-section">
        <text class="section-label">上传新 LOGO</text>
        <view class="upload-area" @tap="chooseImage">
          <view class="upload-placeholder" v-if="!tempImage">
            <text class="upload-icon">📷</text>
            <text class="upload-text">点击选择图片</text>
            <text class="upload-hint">推荐比例 4:1，支持 PNG、JPG</text>
          </view>
          <image v-else :src="tempImage" class="upload-preview" mode="aspectFit" />
        </view>

        <view class="upload-actions" v-if="tempImage">
          <text class="cancel-btn" @tap="clearTempImage">取消</text>
          <text class="save-btn" @tap="saveLogo" :class="{ disabled: uploading }">
            {{ uploading ? '上传中...' : '保存并应用' }}
          </text>
        </view>
      </view>

      <view class="reset-section" v-if="appStore.isUsingCustomLogo">
        <text class="section-label">重置为默认 LOGO</text>
        <text class="reset-btn" @tap="confirmReset">
          恢复默认 LOGO
        </text>
      </view>

      <view class="tips-section">
        <text class="tips-title">使用提示</text>
        <view class="tips-list">
          <text class="tip-item">• 上传后将立即更新应用内所有 LOGO 显示</text>
          <text class="tip-item">• 建议使用透明背景的 PNG 格式图片</text>
          <text class="tip-item">• 图片尺寸建议：宽度 1200px，高度 300px</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const tempImage = ref<string>('')
const uploading = ref(false)

function chooseImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      if (res.tempFilePaths && res.tempFilePaths[0]) {
        tempImage.value = res.tempFilePaths[0]
      }
    },
  })
}

function clearTempImage() {
  tempImage.value = ''
}

function saveLogo() {
  if (!tempImage.value) return
  if (uploading.value) return

  uploading.value = true

  setTimeout(() => {
    appStore.setCustomLogo(tempImage.value)
    tempImage.value = ''
    uploading.value = false
    uni.showToast({
      title: 'LOGO 已更新',
      icon: 'success',
    })
  }, 500)
}

function confirmReset() {
  uni.showModal({
    title: '确认重置',
    content: '确定要恢复默认 LOGO 吗？',
    success: (res) => {
      if (res.confirm) {
        appStore.resetToDefaultLogo()
        uni.showToast({
          title: '已恢复默认',
          icon: 'success',
        })
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.logo-manager {
  padding: 8px;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
}

.card-header {
  margin-bottom: 28px;
}

.card-title {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.card-desc {
  display: block;
  font-size: 13px;
  color: #8c8c8c;
}

.section-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 12px;
}

.preview-section {
  margin-bottom: 32px;
}

.preview-box {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px dashed #d9d9d9;
}

.preview-logo {
  height: 80px;
  max-width: 100%;
}

.logo-status {
  display: block;
  text-align: center;
  margin-top: 12px;
  font-size: 13px;
  color: #52c41a;
}

.upload-section {
  margin-bottom: 32px;
}

.upload-area {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px dashed #d9d9d9;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
}

.upload-area:hover {
  border-color: #8b7355;
  background: #fffaf5;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 14px;
  color: #262626;
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 12px;
  color: #8c8c8c;
}

.upload-preview {
  height: 180px;
  max-width: 100%;
}

.upload-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  padding: 10px 24px;
  font-size: 14px;
  color: #595959;
  cursor: pointer;
}

.save-btn {
  padding: 10px 24px;
  font-size: 14px;
  color: #fff;
  background: #8b7355;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover {
  background: #7a6449;
}

.save-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-section {
  margin-bottom: 32px;
}

.reset-btn {
  display: inline-block;
  padding: 10px 24px;
  font-size: 14px;
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: #fff2f0;
}

.tips-section {
  padding: 16px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
}

.tips-title {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #389e0d;
  margin-bottom: 8px;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tip-item {
  font-size: 12px;
  color: #52c41a;
}
</style>
