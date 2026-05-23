<template>
  <view class="empty-state">
    <text class="empty-state__icon">{{ icon }}</text>
    <text class="empty-state__title">{{ title }}</text>
    <text v-if="description" class="empty-state__description">{{ description }}</text>
    <view
      v-if="actionText"
      class="empty-state__action"
      @tap="handleAction"
    >
      <text class="empty-state__action-text">{{ actionText }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  title: string
  description?: string
  actionText?: string
}>(), {
  icon: '🎨',
})

const emit = defineEmits<{
  action: []
}>()

const handleAction = () => {
  emit('action')
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.empty-state {
  @include flex-center;
  flex-direction: column;
  padding: $spacing-xl $spacing-lg;
  text-align: center;

  &__icon {
    font-size: 96rpx;
    margin-bottom: $spacing-md;
  }

  &__title {
    font-size: $font-md;
    font-weight: 500;
    color: $color-text-primary;
    letter-spacing: 2rpx;
    margin-bottom: $spacing-xs;
  }

  &__description {
    font-size: $font-sm;
    color: $color-text-tertiary;
    line-height: 1.6;
    max-width: 480rpx;
  }

  &__action {
    margin-top: $spacing-md;
    padding: $spacing-sm $spacing-lg;
    background-color: transparent;
    border: 2rpx solid $morandi-beige;
    border-radius: $radius-full;
    transition: $transition-base;

    &:active {
      opacity: 0.85;
      transform: scale(0.97);
    }
  }

  &__action-text {
    font-size: $font-sm;
    color: $morandi-beige;
    letter-spacing: 2rpx;
  }
}
</style>
