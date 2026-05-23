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

      <view
        v-for="i in skeletonCount"
        v-if="loading"
        :key="`skeleton-${i}`"
        class="gallery-grid__skeleton-item"
      >
        <ArtworkCard :artwork="null" />
      </view>
    </view>

    <EmptyState
      v-if="!loading && artworks.length === 0"
      icon="🖼️"
      title="暂无作品"
      description="这里还没有作品，去看看其他分类吧"
    />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Artwork } from '@/types/artwork'
import ArtworkCard from './ArtworkCard.vue'
import EmptyState from './EmptyState.vue'

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
@import '@/styles/variables.scss';

.gallery-grid {
  width: 100%;

  &__container {
    display: grid;
    gap: $spacing-base;

    &--2 {
      grid-template-columns: repeat(2, 1fr);
    }

    &--3 {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__skeleton-item {
    break-inside: avoid;
  }
}
</style>
