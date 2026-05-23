<template>
  <view v-if="!artwork" class="artwork-card artwork-card--skeleton">
    <view class="artwork-card__image-wrapper">
      <view class="artwork-card__skeleton-image" />
    </view>
    <view class="artwork-card__info">
      <view class="artwork-card__skeleton-title" />
      <view class="artwork-card__skeleton-text" />
      <view class="artwork-card__skeleton-text artwork-card__skeleton-text--short" />
    </view>
  </view>

  <view
    v-else
    class="artwork-card"
    hover-class="artwork-card--active"
    @tap="handleClick"
  >
    <view class="artwork-card__image-wrapper">
      <image
        class="artwork-card__image"
        :src="artwork.image"
        mode="aspectFill"
        lazy-load
      />
      <view
        v-if="showLimited && artwork.stock <= 10 && artwork.stock > 0"
        class="artwork-card__badge"
      >
        限量{{ artwork.stock }}件
      </view>
      <view
        class="artwork-card__favorite"
        :class="{ 'artwork-card__favorite--active': isFavorited }"
        @tap.stop="handleFavorite"
      >
        <text class="artwork-card__favorite-icon">{{ isFavorited ? '♥' : '♡' }}</text>
      </view>
    </view>

    <view class="artwork-card__info">
      <text class="artwork-card__title">{{ artwork.title }}</text>
      <text v-if="showArtist" class="artwork-card__artist">{{ artwork.artistName }}</text>
      <view v-if="showPrice" class="artwork-card__price-row">
        <text class="artwork-card__price">¥{{ artwork.price }}</text>
        <text
          v-if="artwork.originalPrice && artwork.originalPrice > artwork.price"
          class="artwork-card__original-price"
        >¥{{ artwork.originalPrice }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Artwork } from '@/types/artwork'

const props = withDefaults(defineProps<{
  artwork: Artwork | null
  showArtist?: boolean
  showPrice?: boolean
  showLimited?: boolean
}>(), {
  showArtist: true,
  showPrice: true,
  showLimited: true,
})

const emit = defineEmits<{
  click: [artwork: Artwork]
  favorite: [artwork: Artwork]
}>()

const isFavorited = ref(false)

const handleClick = () => {
  if (props.artwork) {
    emit('click', props.artwork)
  }
}

const handleFavorite = () => {
  if (props.artwork) {
    isFavorited.value = !isFavorited.value
    emit('favorite', props.artwork)
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.artwork-card {
  @include gallery-card;
  border: none;
  background-color: $color-white;

  &--active {
    transform: scale(1.02);
    box-shadow: $shadow-base;
  }

  &--skeleton {
    pointer-events: none;
  }

  &__image-wrapper {
    position: relative;
    width: 100%;
    padding-bottom: 133.33%;
    overflow: hidden;
    border-radius: $radius-lg $radius-lg 0 0;
  }

  &__image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__badge {
    position: absolute;
    top: $spacing-sm;
    left: $spacing-sm;
    padding: $spacing-xs $spacing-sm;
    background-color: rgba(139, 115, 85, 0.85);
    color: $color-white;
    font-size: $font-xs;
    border-radius: $radius-sm;
    letter-spacing: 1rpx;
  }

  &__favorite {
    position: absolute;
    top: $spacing-sm;
    right: $spacing-sm;
    width: 56rpx;
    height: 56rpx;
    @include flex-center;
    background-color: rgba(255, 255, 255, 0.85);
    border-radius: $radius-full;
    transition: $transition-base;

    &--active {
      background-color: rgba(201, 169, 166, 0.2);
    }
  }

  &__favorite-icon {
    font-size: $font-md;
    color: $morandi-rose;
  }

  &__info {
    padding: $spacing-sm $spacing-base $spacing-base;
  }

  &__title {
    display: block;
    font-size: $font-base;
    font-weight: 500;
    color: $color-text-primary;
    @include ellipsis;
    letter-spacing: 1rpx;
  }

  &__artist {
    display: block;
    margin-top: $spacing-xs;
    font-size: $font-sm;
    color: $color-text-secondary;
    @include ellipsis;
  }

  &__price-row {
    display: flex;
    align-items: baseline;
    margin-top: $spacing-xs;
    gap: $spacing-xs;
  }

  &__price {
    font-size: $font-md;
    font-weight: 600;
    color: $color-accent;
  }

  &__original-price {
    font-size: $font-xs;
    color: $color-text-tertiary;
    text-decoration: line-through;
  }

  &__skeleton-image {
    width: 100%;
    padding-bottom: 133.33%;
    @include skeleton-loading;
    border-radius: $radius-lg $radius-lg 0 0;
  }

  &__skeleton-title {
    width: 70%;
    height: 32rpx;
    margin-top: $spacing-sm;
    @include skeleton-loading;
  }

  &__skeleton-text {
    width: 50%;
    height: 24rpx;
    margin-top: $spacing-xs;
    @include skeleton-loading;

    &--short {
      width: 35%;
    }
  }
}
</style>
