<template>
  <view class="custom-tab-bar">
    <view class="custom-tab-bar__inner">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        class="custom-tab-bar__item"
        :class="{ 'custom-tab-bar__item--active': current === index }"
        @tap="handleTabChange(index)"
      >
        <text class="custom-tab-bar__label">{{ tab.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  current: number
}>()

const emit = defineEmits<{
  change: [index: number]
}>()

const tabs = [
  { label: '首页', path: '/pages/index/index' },
  { label: '作品', path: '/pages/gallery/index' },
  { label: '艺术家', path: '/pages/artist/index' },
  { label: '我的', path: '/pages/user/index' },
]

const handleTabChange = (index: number) => {
  if (props.current === index) return
  emit('change', index)
  uni.switchTab({ url: tabs[index].path })
}
</script>

<style lang="scss" scoped>
@import '@/styles/mixins.scss';

.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background-color: $color-surface;
  border-top: 1rpx solid $color-rule;

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 100rpx;
    @include safe-area-bottom;
  }

  &__item {
    @include flex-center;
    flex: 1;
    height: 100%;
  }

  &__label {
    @include sans-body;
    font-size: $font-xs;
    color: $color-ink-tertiary;
    letter-spacing: 0.06em;

    .custom-tab-bar__item--active & {
      color: $color-ink;
      font-weight: 500;
    }
  }
}
</style>
