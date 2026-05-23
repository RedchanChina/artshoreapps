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
    <text class="artist-card__name">{{ artist.name }}</text>
    <text
      class="artist-card__follow"
      :class="{ 'artist-card__follow--following': artist.isFollowing }"
      @tap.stop="handleFollow"
    >{{ artist.isFollowing ? 'Following' : 'Follow' }}</text>
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
@import '@/styles/mixins.scss';

.artist-card {
  display: flex;
  align-items: center;
  padding: $space-md 0;
  transition: opacity $duration-base $ease-out;

  &--active {
    opacity: 0.85;
  }

  &__avatar-wrapper {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
  }

  &__avatar {
    @include image-cover;
  }

  &__name {
    flex: 1;
    margin-left: $space-md;
    @include serif-heading;
    font-size: $font-md;
    @include ellipsis;
  }

  &__follow {
    flex-shrink: 0;
    @include sans-body;
    font-size: $font-xs;
    color: $color-ink;
    letter-spacing: 0.08em;
    text-transform: uppercase;

    &--following {
      color: $color-ink-tertiary;
    }
  }
}
</style>
