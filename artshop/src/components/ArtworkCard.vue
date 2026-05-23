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
      <text
        v-if="showLimited && artwork.stock <= 10 && artwork.stock > 0"
        class="artwork-card__edition"
      >ED. {{ artwork.stock }}/50</text>
      <text
        class="artwork-card__favorite"
        :class="{ 'artwork-card__favorite--active': isFavorited }"
        @tap.stop="handleFavorite"
      >{{ isFavorited ? '♥' : '♡' }}</text>
    </view>

    <view class="artwork-card__info">
      <text class="artwork-card__title">{{ artwork.title }}</text>
      <text v-if="showArtist" class="artwork-card__artist">{{ artwork.artistName }}</text>
      <text v-if="showPrice" class="artwork-card__price">¥{{ artwork.price }}</text>
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
@import '@/styles/mixins.scss';

.artwork-card {
  @include gallery-item;
  background: transparent;

  &--active {
    opacity: 0.85;
  }

  &--skeleton {
    pointer-events: none;
  }

  &__image-wrapper {
    position: relative;
    width: 100%;
    padding-bottom: 133.33%;
    overflow: hidden;
  }

  &__image {
    position: absolute;
    top: 0;
    left: 0;
    @include image-cover;
  }

  &__edition {
    position: absolute;
    top: $space-sm;
    left: $space-sm;
    @include sans-body;
    font-size: $font-xxs;
    color: $color-surface;
    letter-spacing: 0.1em;
  }

  &__favorite {
    position: absolute;
    top: $space-sm;
    right: $space-sm;
    font-size: $font-md;
    color: $color-surface;
    transition: opacity $duration-base $ease-out;

    &--active {
      color: $color-surface;
    }
  }

  &__info {
    padding: $space-sm 0 0;
  }

  &__title {
    display: block;
    @include serif-heading;
    font-size: $font-base;
    @include ellipsis;
  }

  &__artist {
    display: block;
    margin-top: $space-xxs;
    @include sans-body;
    font-size: $font-xs;
    @include ellipsis;
  }

  &__price {
    display: block;
    margin-top: $space-xxs;
    @include sans-body;
    font-size: $font-sm;
    color: $color-ink;
  }

  &__skeleton-image {
    width: 100%;
    padding-bottom: 133.33%;
    @include skeleton-loading;
  }

  &__skeleton-title {
    width: 70%;
    height: 28rpx;
    margin-top: $space-sm;
    @include skeleton-loading;
  }

  &__skeleton-text {
    width: 50%;
    height: 22rpx;
    margin-top: $space-xs;
    @include skeleton-loading;

    &--short {
      width: 35%;
    }
  }
}
</style>
