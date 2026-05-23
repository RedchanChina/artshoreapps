<template>
  <view class="gallery-grid">
    <view
      class="gallery-grid__container"
      :class="`gallery-grid__container--${columns}`"
    >
      <ArtworkCard
        v-for="item in artworks"
        :key="item.id"
        :artwork="item"
        :show-artist="true"
        :show-price="true"
        :show-limited="true"
        @click="handleItemClick"
        @favorite="handleItemFavorite"
      />

      <ArtworkCard
        v-for="i in skeletonCount"
        v-if="loading"
        :key="`skeleton-${i}`"
        :artwork="null"
      />
    </view>

    <view v-if="!loading && artworks.length === 0" class="gallery-grid__empty">
      <text class="gallery-grid__empty-text">No works found</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Artwork } from '@/types/artwork'
import ArtworkCard from './ArtworkCard.vue'

const props = withDefaults(defineProps<{
  artworks: Artwork[]
  columns?: 2 | 3
  loading?: boolean
}>(), {
  columns: 2,
  loading: false,
})

const emit = defineEmits<{
  'item-click': [artwork: Artwork]
  'item-favorite': [artwork: Artwork]
}>()

const skeletonCount = computed(() => props.columns * 3)

const handleItemClick = (artwork: Artwork) => {
  emit('item-click', artwork)
}

const handleItemFavorite = (artwork: Artwork) => {
  emit('item-favorite', artwork)
}
</script>

<style lang="scss" scoped>
@import '@/styles/mixins.scss';

.gallery-grid {
  width: 100%;

  &__container {
    display: grid;
    gap: $space-xs;

    &--2 {
      grid-template-columns: repeat(2, 1fr);
    }

    &--3 {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__empty {
    @include flex-center;
    padding: $space-3xl 0;
  }

  &__empty-text {
    @include sans-body;
    font-size: $font-sm;
    color: $color-ink-tertiary;
    letter-spacing: 0.04em;
  }
}
</style>
