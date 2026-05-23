<template>
  <view class="price-tag" :class="`price-tag--${size}`">
    <text class="price-tag__symbol">¥</text>
    <text class="price-tag__value">{{ formattedPrice }}</text>
    <text
      v-if="originalPrice && originalPrice > price"
      class="price-tag__original"
    >¥{{ formattedOriginalPrice }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  price: number
  originalPrice?: number
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md',
})

const formattedPrice = computed(() => {
  return props.price % 1 === 0 ? props.price.toString() : props.price.toFixed(2)
})

const formattedOriginalPrice = computed(() => {
  if (!props.originalPrice) return ''
  return props.originalPrice % 1 === 0
    ? props.originalPrice.toString()
    : props.originalPrice.toFixed(2)
})
</script>

<style lang="scss" scoped>
@import '@/styles/mixins.scss';

.price-tag {
  display: inline-flex;
  align-items: baseline;
  gap: 2rpx;

  &--sm {
    .price-tag__symbol { font-size: $font-xs; }
    .price-tag__value { font-size: $font-sm; }
    .price-tag__original { font-size: $font-xxs; }
  }

  &--md {
    .price-tag__symbol { font-size: $font-sm; }
    .price-tag__value { font-size: $font-md; }
    .price-tag__original { font-size: $font-xs; }
  }

  &--lg {
    .price-tag__symbol { font-size: $font-base; }
    .price-tag__value { font-size: $font-xl; }
    .price-tag__original { font-size: $font-sm; }
  }

  &__symbol {
    @include sans-body;
    color: $color-ink;
  }

  &__value {
    @include sans-body;
    color: $color-ink;
    font-weight: 500;
  }

  &__original {
    @include sans-body;
    color: $color-ink-tertiary;
    text-decoration: line-through;
    margin-left: $space-xs;
  }
}
</style>
