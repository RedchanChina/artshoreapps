<template>
  <view class="empty-state">
    <text class="empty-state__title">{{ title }}</text>
    <text v-if="description" class="empty-state__description">{{ description }}</text>
    <text
      v-if="actionText"
      class="empty-state__action"
      @tap="handleAction"
    >{{ actionText }}</text>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  actionText?: string
}>()

const emit = defineEmits<{
  action: []
}>()

const handleAction = () => {
  emit('action')
}
</script>

<style lang="scss" scoped>
@import '@/styles/mixins.scss';

.empty-state {
  @include flex-center;
  flex-direction: column;
  padding: $space-3xl $space-lg;
  text-align: center;

  &__title {
    @include serif-heading;
    font-size: $font-md;
    letter-spacing: 0.04em;
  }

  &__description {
    @include sans-body;
    font-size: $font-sm;
    margin-top: $space-sm;
    line-height: 1.6;
    max-width: 480rpx;
  }

  &__action {
    @include sans-body;
    font-size: $font-sm;
    color: $color-ink;
    margin-top: $space-lg;
    letter-spacing: 0.06em;
    text-decoration: underline;
    text-underline-offset: 4rpx;
  }
}
</style>
