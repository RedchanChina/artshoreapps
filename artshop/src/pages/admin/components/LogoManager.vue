<template>
  <view class="logo-manager">
    <view class="section-header">
      <text class="section-title">LOGO 管理</text>
      <text class="section-desc">上传并管理商店 LOGO，将自动应用到整个应用</text>
    </view>

    <view class="preview-section">
      <text class="label">当前 LOGO</text>
      <view class="preview-box">
        <image :src="appStore.logoUrl" class="preview-logo" mode="aspectFit" />
      </view>
      <text class="logo-status" v-if="appStore.isUsingCustomLogo">正在使用自定义 LOGO</text>
      <text class="logo-status" v-else>正在使用默认 LOGO</text>
    </view>

    <view class="upload-section">
      <text class="label">上传新 LOGO</text>
      <view class="upload-area" @tap="handleUpload">
        <view class="upload-placeholder" v-if="!tempImage">
          <text class="upload-icon">上传图片</text>
          <text class="upload-text">点击选择图片</text>
          <text class="upload-hint">推荐比例 4:1，支持 PNG、JPG</text>
        </view>
        <image v-else :src="tempImage" class="upload-preview" mode="aspectFit" />
      </view>

      <view class="upload-actions" v-if="tempImage">
        <text class="cancel-btn" @tap="clearTempImage">取消</text>
        <text class="save-btn" @tap="saveLogo" :class="{ disabled: uploading }">{{ uploading ? '保存中...' : '保存并应用' }}</text>
      </view>
    </view>

    <view class="reset-section" v-if="appStore.isUsingCustomLogo">
      <text class="label">重置为默认</text>
      <text class="reset-btn" @tap="confirmReset">恢复默认 LOGO</text>
    </view>

    <view class="tips-section">
      <text class="tips-title">使用提示</text>
      <view class="tips-list">
        <text class="tip-item">上传后将立即更新应用内所有 LOGO 显示</text>
        <text class="tip-item">建议使用透明背景的 PNG 格式图片</text>
        <text class="tip-item">图片尺寸建议：宽度 1200px，高度 300px</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const tempImage = ref<string>('')
const uploading = ref(false)

function handleUpload() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/png,image/jpeg,image/jpg'
  input.onchange = (e: any) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event: any) => {
        tempImage.value = event.target.result
        uni.showToast({
          title: '已选择图片',
          icon: 'success',
          duration: 1500,
        })
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

function clearTempImage() {
  tempImage.value = ''
}

function saveLogo() {
  if (!tempImage.value) {
    uni.showToast({
      title: '请先选择图片',
      icon: 'none',
    })
    return
  }
  
  if (uploading.value) return

  uploading.value = true

  uni.showLoading({
    title: '保存中...',
    mask: true,
  })

  setTimeout(() => {
    appStore.setCustomLogo(tempImage.value)
    tempImage.value = ''
    uploading.value = false
    uni.hideLoading()
    uni.showToast({
      title: 'LOGO 已更新',
      icon: 'success',
      duration: 2000,
    })
  }, 800)
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

onMounted(() => {
  appStore.loadStoredLogo()
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.logo-manager {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.section-header {
  margin-bottom: $space-2xl;
}

.section-title {
  display: block;
  font-family: $font-serif;
  font-size: $font-xl;
  font-weight: 400;
  color: $color-text-primary;
  margin-bottom: $space-sm;
}

.section-desc {
  display: block;
  font-family: $font-sans;
  font-size: $font-sm;
  color: $color-text-secondary;
}

.preview-section,
.upload-section,
.reset-section {
  margin-bottom: $space-2xl;
}

.label {
  display: block;
  font-family: $font-sans;
  font-size: $font-sm;
  font-weight: 500;
  color: $color-text-primary;
  margin-bottom: $space-md;
}

.preview-box {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: $space-xl;
  background-color: $color-bg-secondary;
  border-radius: $radius-lg;
  border: 1px dashed $color-border;
}

.preview-logo {
  height: 80px;
  max-width: 100%;
}

.logo-status {
  display: block;
  text-align: center;
  margin-top: $space-md;
  font-family: $font-sans;
  font-size: $font-sm;
  color: $color-success;
}

.upload-area {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background-color: $color-bg-secondary;
  border-radius: $radius-lg;
  border: 1px dashed $color-border;
  cursor: pointer;
  transition: all $duration-fast;
  margin-bottom: $space-md;
}

.upload-area:active {
  background-color: #FAFAF8;
  border-color: $color-accent;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-icon {
  font-family: $font-sans;
  font-size: $font-lg;
  font-weight: 500;
  color: $color-accent;
  margin-bottom: $space-sm;
}

.upload-text {
  font-family: $font-sans;
  font-size: $font-sm;
  color: $color-text-primary;
  margin-bottom: $space-xs;
}

.upload-hint {
  font-family: $font-sans;
  font-size: $font-xs;
  color: $color-text-tertiary;
}

.upload-preview {
  height: 180px;
  max-width: 100%;
}

.upload-actions {
  display: flex;
  justify-content: flex-end;
  gap: $space-md;
}

.cancel-btn {
  padding: $space-sm $space-lg;
  font-family: $font-sans;
  font-size: $font-sm;
  color: $color-text-secondary;
  cursor: pointer;
  transition: color $duration-fast;
}

.save-btn {
  padding: $space-sm $space-lg;
  font-family: $font-sans;
  font-size: $font-sm;
  color: $color-white;
  background-color: $color-accent;
  border-radius: $radius-base;
  cursor: pointer;
  transition: all $duration-fast;
}

.save-btn:hover {
  background-color: $color-accent-hover;
}

.save-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-btn {
  display: inline-block;
  padding: $space-sm $space-lg;
  font-family: $font-sans;
  font-size: $font-sm;
  color: $color-error;
  border: 1px solid $color-error;
  border-radius: $radius-base;
  cursor: pointer;
  transition: all $duration-fast;
}

.reset-btn:hover {
  background-color: #FFF5F5;
}

.tips-section {
  padding: $space-md;
  background-color: #F5F9F5;
  border: 1px solid #D4E5D4;
  border-radius: $radius-lg;
}

.tips-title {
  display: block;
  font-family: $font-sans;
  font-size: $font-sm;
  font-weight: 500;
  color: $color-success;
  margin-bottom: $space-sm;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: $space-xs;
}

.tip-item {
  font-family: $font-sans;
  font-size: $font-xs;
  color: $color-success;
}
</style>
