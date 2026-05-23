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
        <text class="custom-tab-bar__icon">{{ tab.icon }}</text>
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
  { icon: '🏠', label: '首页', path: '/pages/index/index' },
  { icon: '🖼️', label: '作品', path: '/pages/artwork/index' },
  { icon: '🎨', label: '艺术家', path: '/pages/artist/index' },
  { icon: '👤', label: '我的', path: '/pages/profile/index' },
]

const handleTabChange = (index: number) => {
  if (props.current === index) return
  emit('change', index)
  uni.switchTab({ url: tabs[index].path })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background-color: $color-white;
  border-top: 1rpx solid $color-border;

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 110rpx;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
  }

  &__item {
    @include flex-center;
    flex-direction: column;
    flex: 1;
    gap: 4rpx;
    transition: $transition-base;

    &--active {
      .custom-tab-bar__icon {
        transform: scale(1.1);
      }
    }
  }

  &__icon {
    font-size: 44rpx;
    transition: $transition-base;
  }

  &__label {
    font-size: $font-xs;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;

    .custom-tab-bar__item--active & {
      color: $color-accent;
      font-weight: 500;
    }
  }
}
</style>
