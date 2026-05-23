<template>
  <view class="skeleton-screen">
    <view
      v-for="i in count"
      :key="i"
      class="skeleton-screen__item"
      :class="`skeleton-screen__item--${type}`"
    >
      <template v-if="type === 'card'">
        <view class="skeleton-screen__card-image" />
        <view class="skeleton-screen__text-line skeleton-screen__text-line--long" />
        <view class="skeleton-screen__text-line skeleton-screen__text-line--medium" />
      </template>

      <template v-if="type === 'detail'">
        <view class="skeleton-screen__detail-image" />
        <view class="skeleton-screen__text-line skeleton-screen__text-line--title" />
        <view class="skeleton-screen__text-line skeleton-screen__text-line--long" />
        <view class="skeleton-screen__text-line skeleton-screen__text-line--medium" />
        <view class="skeleton-screen__text-line skeleton-screen__text-line--short" />
      </template>

      <template v-if="type === 'text'">
        <view class="skeleton-screen__text-line skeleton-screen__text-line--long" />
        <view class="skeleton-screen__text-line skeleton-screen__text-line--medium" />
        <view class="skeleton-screen__text-line skeleton-screen__text-line--long" />
        <view class="skeleton-screen__text-line skeleton-screen__text-line--short" />
      </template>

      <template v-if="type === 'list'">
        <view class="skeleton-screen__list-thumb" />
        <view class="skeleton-screen__list-content">
          <view class="skeleton-screen__text-line skeleton-screen__text-line--long" />
          <view class="skeleton-screen__text-line skeleton-screen__text-line--medium" />
        </view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  type?: 'card' | 'detail' | 'text' | 'list'
  count?: number
}>(), {
  type: 'card',
  count: 3,
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.skeleton-screen {
  &__item {
    margin-bottom: $spacing-base;

    &--card {
      background-color: $color-white;
      border-radius: $radius-lg;
      overflow: hidden;
      padding-bottom: $spacing-base;
    }

    &--detail {
      padding: $spacing-base;
    }

    &--text {
      padding: $spacing-base;
    }

    &--list {
      display: flex;
      align-items: flex-start;
      padding: $spacing-base;
      background-color: $color-white;
      border-radius: $radius-lg;
    }
  }

  &__card-image {
    width: 100%;
    padding-bottom: 133.33%;
    @include skeleton-loading;
    border-radius: $radius-lg $radius-lg 0 0;
  }

  &__detail-image {
    width: 100%;
    height: 500rpx;
    @include skeleton-loading;
    border-radius: $radius-lg;
    margin-bottom: $spacing-base;
  }

  &__list-thumb {
    width: 120rpx;
    height: 120rpx;
    @include skeleton-loading;
    border-radius: $radius-base;
    flex-shrink: 0;
  }

  &__list-content {
    flex: 1;
    margin-left: $spacing-base;
  }

  &__text-line {
    @include skeleton-loading;
    height: 28rpx;
    margin-bottom: $spacing-sm;

    &--title {
      height: 40rpx;
      width: 60%;
      margin-bottom: $spacing-base;
    }

    &--long {
      width: 85%;
    }

    &--medium {
      width: 60%;
    }

    &--short {
      width: 40%;
    }
  }
}
</style>
