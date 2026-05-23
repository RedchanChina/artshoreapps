<template>
  <view
    class="artist-card"
    hover-class="artist-card--active"
    @tap="handleClick"
  >
    <view class="artist-card__avatar-wrapper">
      <image
        class="artist-card__avatar"
        :src="artist.avatar"
        mode="aspectFill"
      />
    </view>

    <view class="artist-card__content">
      <text class="artist-card__name">{{ artist.name }}</text>
      <text class="artist-card__bio">{{ artist.bio }}</text>
      <text class="artist-card__followers">{{ artist.followerCount }} 人关注</text>
    </view>

    <view
      class="artist-card__follow-btn"
      :class="{ 'artist-card__follow-btn--followed': artist.isFollowing }"
      @tap.stop="handleFollow"
    >
      <text class="artist-card__follow-text">
        {{ artist.isFollowing ? '已关注' : '+ 关注' }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Artist } from '@/types/artist'

const props = defineProps<{
  artist: Artist
}>()

const emit = defineEmits<{
  click: [artist: Artist]
  follow: [artist: Artist]
}>()

const handleClick = () => {
  emit('click', props.artist)
}

const handleFollow = () => {
  emit('follow', props.artist)
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.artist-card {
  display: flex;
  align-items: center;
  padding: $spacing-base;
  background-color: $color-white;
  border-radius: $radius-lg;
  transition: $transition-base;

  &--active {
    transform: scale(0.98);
    background-color: $color-bg-secondary;
  }

  &__avatar-wrapper {
    width: 96rpx;
    height: 96rpx;
    border-radius: $radius-full;
    overflow: hidden;
    flex-shrink: 0;
    border: 2rpx solid $color-border;
  }

  &__avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__content {
    flex: 1;
    margin-left: $spacing-base;
    overflow: hidden;
  }

  &__name {
    display: block;
    font-size: $font-md;
    font-weight: 500;
    color: $color-text-primary;
    @include ellipsis;
    letter-spacing: 1rpx;
  }

  &__bio {
    display: block;
    margin-top: $spacing-xs;
    font-size: $font-sm;
    color: $color-text-secondary;
    @include ellipsis(2);
    line-height: 1.5;
  }

  &__followers {
    display: block;
    margin-top: $spacing-xs;
    font-size: $font-xs;
    color: $color-text-tertiary;
  }

  &__follow-btn {
    flex-shrink: 0;
    margin-left: $spacing-sm;
    padding: $spacing-xs $spacing-base;
    border: 2rpx solid $morandi-beige;
    border-radius: $radius-full;
    background-color: transparent;
    transition: $transition-base;

    &--followed {
      border-color: $color-border;
      background-color: $color-bg-secondary;
    }
  }

  &__follow-text {
    font-size: $font-sm;
    color: $morandi-beige;
    letter-spacing: 1rpx;

    .artist-card__follow-btn--followed & {
      color: $color-text-tertiary;
    }
  }
}
</style>
