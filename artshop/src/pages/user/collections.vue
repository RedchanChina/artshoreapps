<template>
  <view class="collections-page">
    <view class="segmented-tabs">
      <view
        class="seg-tab"
        :class="{ 'seg-tab--active': currentTab === 'artworks' }"
        @tap="currentTab = 'artworks'"
      >
        <text class="seg-tab-text">作品</text>
      </view>
      <view
        class="seg-tab"
        :class="{ 'seg-tab--active': currentTab === 'artists' }"
        @tap="currentTab = 'artists'"
      >
        <text class="seg-tab-text">艺术家</text>
      </view>
      <view class="seg-indicator" :class="{ 'seg-indicator--right': currentTab === 'artists' }" />
    </view>

    <view v-if="currentTab === 'artworks'" class="tab-content">
      <view v-if="artworkList.length > 0" class="artworks-grid">
        <view
          v-for="item in artworkList"
          :key="item.id"
          class="artwork-item"
        >
          <view class="artwork-item-inner" @tap="onArtworkTap(item)">
            <image class="artwork-image" :src="item.image" mode="aspectFill" />
            <view class="artwork-info">
              <text class="artwork-title">{{ item.title }}</text>
              <text class="artwork-artist">{{ item.artistName }}</text>
            </view>
          </view>
          <view class="artwork-remove" @tap.stop="onRemoveArtwork(item)">
            <text class="artwork-remove-icon">✕</text>
          </view>
        </view>
      </view>

      <EmptyState
        v-else
        icon="🖼️"
        title="暂无收藏作品"
        description="去发现心仪的艺术作品吧"
        action-text="去逛逛"
        @action="onGoGallery"
      />
    </view>

    <view v-if="currentTab === 'artists'" class="tab-content">
      <view v-if="artistList.length > 0" class="artists-list">
        <view
          v-for="item in artistList"
          :key="item.id"
          class="artist-item"
        >
          <image class="artist-avatar" :src="item.avatar" mode="aspectFill" />
          <view class="artist-info">
            <text class="artist-name">{{ item.name }}</text>
            <text class="artist-bio">{{ item.bio }}</text>
            <text class="artist-followers">{{ item.followerCount }} 人关注</text>
          </view>
          <view
            class="artist-unfollow"
            :class="{ 'artist-unfollow--following': item.isFollowing }"
            @tap.stop="onToggleFollow(item)"
          >
            <text class="artist-unfollow-text">{{ item.isFollowing ? '已关注' : '关注' }}</text>
          </view>
        </view>
      </view>

      <EmptyState
        v-else
        icon="🎨"
        title="暂无关注艺术家"
        description="关注喜欢的艺术家，获取最新动态"
        action-text="去发现"
        @action="onGoGallery"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import type { Artwork } from '@/types/artwork'
import type { Artist } from '@/types/artist'

const currentTab = ref<'artworks' | 'artists'>('artworks')

const artworkList = ref<Artwork[]>([
  {
    id: 'a1',
    title: '晨雾中的远山',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=misty%20mountain%20landscape%20chinese%20ink%20wash%20painting&image_size=portrait_4_3',
    images: [],
    artistName: '林清远',
    artistId: 'ar1',
    category: '国画',
    price: 2680,
    originalPrice: 3200,
    description: '',
    specifications: [],
    sales: 12,
    stock: 38,
    rating: 4.8,
    tags: ['山水', '水墨'],
    createdAt: '2026-03-15',
  },
  {
    id: 'a2',
    title: '静物·陶与花',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=still%20life%20ceramic%20vase%20wildflowers%20morandi%20palette&image_size=portrait_4_3',
    images: [],
    artistName: '苏婉清',
    artistId: 'ar2',
    category: '水彩',
    price: 1880,
    description: '',
    specifications: [],
    sales: 8,
    stock: 22,
    rating: 4.9,
    tags: ['静物', '水彩'],
    createdAt: '2026-02-20',
  },
  {
    id: 'a4',
    title: '春日迟迟',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spring%20garden%20cherry%20blossom%20soft%20light%20painting&image_size=portrait_4_3',
    images: [],
    artistName: '赵含章',
    artistId: 'ar4',
    category: '油画',
    price: 1560,
    originalPrice: 1980,
    description: '',
    specifications: [],
    sales: 25,
    stock: 55,
    rating: 4.7,
    tags: ['风景', '花卉'],
    createdAt: '2026-04-01',
  },
  {
    id: 'a5',
    title: '海的记忆 II',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ocean%20waves%20abstract%20blue%20grey%20oil%20painting%20texture&image_size=portrait_4_3',
    images: [],
    artistName: '周海潮',
    artistId: 'ar5',
    category: '油画',
    price: 5960,
    description: '',
    specifications: [],
    sales: 5,
    stock: 10,
    rating: 4.9,
    tags: ['抽象', '海洋'],
    createdAt: '2026-01-10',
  },
])

const artistList = ref<Artist[]>([
  {
    id: 'ar1',
    name: '林清远',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20asian%20male%20artist%20elegant%20neutral%20background&image_size=portrait_4_3',
    bio: '水墨山水画家，追求自然与心灵的对话',
    representativeWorks: [],
    followerCount: 1280,
    isFollowing: true,
    story: '',
    exhibitions: [],
    honors: [],
    createdAt: '2025-06-01',
  },
  {
    id: 'ar2',
    name: '苏婉清',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20asian%20female%20artist%20soft%20light%20neutral&image_size=portrait_4_3',
    bio: '静物水彩艺术家，用色彩记录生活中的美',
    representativeWorks: [],
    followerCount: 860,
    isFollowing: true,
    story: '',
    exhibitions: [],
    honors: [],
    createdAt: '2025-08-15',
  },
  {
    id: 'ar5',
    name: '周海潮',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20mature%20male%20artist%20contemplative&image_size=portrait_4_3',
    bio: '抽象油画艺术家，探索海洋与记忆的深层联系',
    representativeWorks: [],
    followerCount: 2150,
    isFollowing: true,
    story: '',
    exhibitions: [],
    honors: [],
    createdAt: '2025-03-20',
  },
])

const onArtworkTap = (item: Artwork) => {
  uni.navigateTo({ url: `/pages/detail/index?id=${item.id}` })
}

const onRemoveArtwork = (item: Artwork) => {
  uni.showModal({
    title: '取消收藏',
    content: `确定取消收藏「${item.title}」吗？`,
    success: (res) => {
      if (res.confirm) {
        artworkList.value = artworkList.value.filter((a) => a.id !== item.id)
      }
    },
  })
}

const onToggleFollow = (item: Artist) => {
  if (item.isFollowing) {
    uni.showModal({
      title: '取消关注',
      content: `确定取消关注「${item.name}」吗？`,
      success: (res) => {
        if (res.confirm) {
          item.isFollowing = false
          item.followerCount--
        }
      },
    })
  } else {
    item.isFollowing = true
    item.followerCount++
  }
}

const onGoGallery = () => {
  uni.navigateTo({ url: '/pages/gallery/index' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.collections-page {
  min-height: 100vh;
  background-color: $color-bg;
}

.segmented-tabs {
  position: relative;
  display: flex;
  background-color: $color-white;
  padding: $spacing-sm $spacing-md;
  margin-bottom: $spacing-sm;

  .seg-tab {
    flex: 1;
    @include flex-center;
    padding: $spacing-sm 0;
    transition: $transition-base;
  }

  .seg-tab-text {
    font-size: $font-base;
    color: $color-text-secondary;
    letter-spacing: 2rpx;
    transition: $transition-base;
  }

  .seg-tab--active .seg-tab-text {
    color: $color-accent;
    font-weight: 600;
  }

  .seg-indicator {
    position: absolute;
    bottom: $spacing-sm;
    left: $spacing-md;
    width: calc(50% - #{$spacing-md});
    height: 6rpx;
    background-color: $color-accent;
    border-radius: $radius-full;
    transition: transform 0.3s ease;

    &--right {
      transform: translateX(100%);
    }
  }
}

.tab-content {
  padding: $spacing-base $spacing-md;
}

.artworks-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-base;
}

.artwork-item {
  position: relative;

  .artwork-item-inner {
    background-color: $color-white;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
    overflow: hidden;
    transition: $transition-base;

    &:active {
      transform: scale(0.98);
    }
  }

  .artwork-image {
    width: 100%;
    height: 320rpx;
  }

  .artwork-info {
    padding: $spacing-sm $spacing-base $spacing-base;
  }

  .artwork-title {
    display: block;
    font-size: $font-base;
    color: $color-text-primary;
    @include ellipsis;
    letter-spacing: 1rpx;
  }

  .artwork-artist {
    display: block;
    font-size: $font-sm;
    color: $color-text-secondary;
    margin-top: $spacing-xs;
    @include ellipsis;
  }

  .artwork-remove {
    position: absolute;
    top: $spacing-sm;
    right: $spacing-sm;
    width: 48rpx;
    height: 48rpx;
    @include flex-center;
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: $radius-full;
    transition: $transition-base;

    &:active {
      opacity: 0.7;
      transform: scale(0.9);
    }
  }

  .artwork-remove-icon {
    font-size: $font-sm;
    color: $color-white;
  }
}

.artists-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.artist-item {
  display: flex;
  align-items: center;
  padding: $spacing-base;
  background-color: $color-white;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  transition: $transition-base;

  &:active {
    transform: scale(0.98);
  }

  .artist-avatar {
    width: 96rpx;
    height: 96rpx;
    border-radius: $radius-full;
    border: 4rpx solid $color-border;
    flex-shrink: 0;
  }

  .artist-info {
    flex: 1;
    margin-left: $spacing-base;
    overflow: hidden;
  }

  .artist-name {
    display: block;
    font-size: $font-md;
    font-weight: 600;
    color: $color-text-primary;
    letter-spacing: 2rpx;
  }

  .artist-bio {
    display: block;
    font-size: $font-sm;
    color: $color-text-secondary;
    margin-top: 6rpx;
    @include ellipsis(2);
    line-height: 1.5;
  }

  .artist-followers {
    display: block;
    font-size: $font-xs;
    color: $color-text-tertiary;
    margin-top: 6rpx;
    letter-spacing: 1rpx;
  }

  .artist-unfollow {
    flex-shrink: 0;
    padding: $spacing-xs $spacing-base;
    border-radius: $radius-full;
    border: 2rpx solid $color-border;
    transition: $transition-base;

    &:active {
      transform: scale(0.95);
    }

    &--following {
      background-color: $color-bg-secondary;
      border-color: transparent;
    }
  }

  .artist-unfollow-text {
    font-size: $font-sm;
    color: $color-text-secondary;
    letter-spacing: 1rpx;

    .artist-unfollow--following & {
      color: $color-text-tertiary;
    }
  }
}
</style>
