<template>
  <view class="search-page">
    <view class="search-header">
      <view class="search-input-wrap">
        <view class="search-input-wrap__inner">
          <text class="search-input-wrap__icon">🔍</text>
          <input
            class="search-input-wrap__input"
            v-model="keyword"
            placeholder="搜索作品/艺术家"
            placeholder-class="search-input-wrap__placeholder"
            confirm-type="search"
            :focus="isFocused"
            @confirm="handleSearch"
            @focus="isFocused = true"
            @blur="isFocused = false"
          />
          <view
            v-if="keyword"
            class="search-input-wrap__clear"
            @tap="handleClear"
          >
            <text class="search-input-wrap__clear-icon">✕</text>
          </view>
        </view>
        <view class="search-input-wrap__cancel" @tap="handleCancel">
          <text class="search-input-wrap__cancel-text">取消</text>
        </view>
      </view>
    </view>

    <view v-if="!hasSearched" class="search-suggestions">
      <view class="search-section" v-if="appStore.searchHistory.length > 0">
        <view class="search-section__header">
          <text class="search-section__title">搜索历史</text>
          <view class="search-section__action" @tap="handleClearHistory">
            <text class="search-section__action-icon">🗑</text>
            <text class="search-section__action-text">清空</text>
          </view>
        </view>
        <view class="search-tags">
          <view
            v-for="(item, index) in appStore.searchHistory"
            :key="'history-' + index"
            class="search-tag search-tag--history"
            @tap="handleTagTap(item)"
          >
            <text class="search-tag__text">{{ item }}</text>
          </view>
        </view>
      </view>

      <view class="search-section">
        <view class="search-section__header">
          <text class="search-section__title">热门搜索</text>
        </view>
        <view class="search-tags">
          <view
            v-for="(item, index) in hotSearches"
            :key="'hot-' + index"
            class="search-tag"
            :class="[
              index < 3 ? 'search-tag--hot' : 'search-tag--normal',
            ]"
            @tap="handleTagTap(item)"
          >
            <text class="search-tag__rank" v-if="index < 3">{{ index + 1 }}</text>
            <text class="search-tag__text">{{ item }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="search-results">
      <view class="result-tabs">
        <view
          class="result-tabs__item"
          :class="{ 'result-tabs__item--active': activeTab === 'artwork' }"
          @tap="activeTab = 'artwork'"
        >
          <text class="result-tabs__text">作品</text>
          <view v-if="activeTab === 'artwork'" class="result-tabs__indicator" />
        </view>
        <view
          class="result-tabs__item"
          :class="{ 'result-tabs__item--active': activeTab === 'artist' }"
          @tap="activeTab = 'artist'"
        >
          <text class="result-tabs__text">艺术家</text>
          <view v-if="activeTab === 'artist'" class="result-tabs__indicator" />
        </view>
      </view>

      <scroll-view class="result-content" scroll-y enhanced>
        <template v-if="isLoading">
          <SkeletonScreen type="card" :count="4" v-if="activeTab === 'artwork'" />
          <SkeletonScreen type="list" :count="4" v-else />
        </template>

        <template v-else>
          <template v-if="activeTab === 'artwork'">
            <GalleryGrid
              v-if="artworkResults.length > 0"
              :artworks="artworkResults"
              :columns="2"
              @item-click="handleArtworkClick"
              @item-favorite="handleArtworkFavorite"
            />
            <EmptyState
              v-else
              icon="🖼️"
              title="未找到相关作品"
              description="换个关键词试试吧"
            />
          </template>

          <template v-else>
            <view v-if="artistResults.length > 0" class="artist-list">
              <ArtistCard
                v-for="artist in artistResults"
                :key="artist.id"
                :artist="artist"
                @click="handleArtistClick"
                @follow="handleArtistFollow"
              />
            </view>
            <EmptyState
              v-else
              icon="🎨"
              title="未找到相关艺术家"
              description="换个关键词试试吧"
            />
          </template>
        </template>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useArtworkStore } from '@/stores/artwork'
import type { Artwork } from '@/types/artwork'
import type { Artist } from '@/types/artist'
import GalleryGrid from '@/components/GalleryGrid.vue'
import ArtistCard from '@/components/ArtistCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import SkeletonScreen from '@/components/SkeletonScreen.vue'

const appStore = useAppStore()
const artworkStore = useArtworkStore()

const keyword = ref('')
const isFocused = ref(false)
const hasSearched = ref(false)
const isLoading = ref(false)
const activeTab = ref<'artwork' | 'artist'>('artwork')

const hotSearches = [
  '限量版画',
  '风光摄影',
  '治愈插画',
  '抽象艺术',
  '莫兰迪',
  '城市摄影',
]

const imgBase = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt='

const mockArtworkResults: Artwork[] = [
  {
    id: 's1',
    title: '莫兰迪色系·静物',
    image: imgBase + 'morandi+still+life+painting+soft+tones&image_size=portrait_4_3',
    images: [],
    artistName: '陈静物',
    artistId: 'sa1',
    category: 'illustration',
    price: 1680,
    originalPrice: 2180,
    description: '莫兰迪色系的静物画作',
    specifications: [{ size: 'M', material: 'giclee', frameStyle: 'white', price: 1680, stock: 8 }],
    sales: 42,
    stock: 8,
    rating: 4.9,
    tags: ['莫兰迪', '静物', '限量版画'],
    createdAt: '2026-05-20',
  },
  {
    id: 's2',
    title: '晨光中的远山',
    image: imgBase + 'morning+light+mountains+misty+landscape+photography&image_size=portrait_4_3',
    images: [],
    artistName: '林清远',
    artistId: 'sa2',
    category: 'photography',
    price: 1280,
    description: '晨光洒在远山之上的风光摄影',
    specifications: [{ size: 'M', material: 'giclee', frameStyle: 'iron-grey', price: 1280, stock: 15 }],
    sales: 78,
    stock: 15,
    rating: 4.8,
    tags: ['风光摄影', '山水', '晨光'],
    createdAt: '2026-05-18',
  },
  {
    id: 's3',
    title: '治愈系·猫咪午后',
    image: imgBase + 'healing+cat+afternoon+sunlight+cozy+illustration&image_size=portrait_4_3',
    images: [],
    artistName: '李暖暖',
    artistId: 'sa3',
    category: 'illustration',
    price: 560,
    originalPrice: 720,
    description: '午后阳光下慵懒的猫咪',
    specifications: [{ size: 'S', material: 'giclee', frameStyle: 'white', price: 560, stock: 50 }],
    sales: 210,
    stock: 50,
    rating: 4.9,
    tags: ['治愈插画', '猫咪', '午后'],
    createdAt: '2026-05-17',
  },
  {
    id: 's4',
    title: '抽象·流动的时光',
    image: imgBase + 'abstract+fluid+art+flowing+colors+contemporary&image_size=portrait_4_3',
    images: [],
    artistName: '赵无极',
    artistId: 'sa4',
    category: 'illustration',
    price: 3200,
    description: '流动色彩中的抽象艺术',
    specifications: [{ size: 'XL', material: 'acrylic', frameStyle: 'black', price: 3200, stock: 5 }],
    sales: 18,
    stock: 5,
    rating: 4.7,
    tags: ['抽象艺术', '流动', '当代'],
    createdAt: '2026-05-15',
  },
  {
    id: 's5',
    title: '城市天际线·暮色',
    image: imgBase + 'city+skyline+dusk+golden+hour+urban+photography&image_size=portrait_4_3',
    images: [],
    artistName: '陈墨白',
    artistId: 'sa5',
    category: 'photography',
    price: 960,
    description: '暮色中的城市天际线',
    specifications: [{ size: 'M', material: 'giclee', frameStyle: 'black', price: 960, stock: 25 }],
    sales: 95,
    stock: 25,
    rating: 4.6,
    tags: ['城市摄影', '天际线', '暮色'],
    createdAt: '2026-05-13',
  },
  {
    id: 's6',
    title: '限量版画·春日花园',
    image: imgBase + 'limited+edition+print+spring+garden+flowers+art&image_size=portrait_4_3',
    images: [],
    artistName: '王水色',
    artistId: 'sa6',
    category: 'illustration',
    price: 2200,
    description: '限量50版的春日花园版画',
    specifications: [{ size: 'L', material: 'giclee', frameStyle: 'white', price: 2200, stock: 10 }],
    sales: 32,
    stock: 10,
    rating: 4.8,
    tags: ['限量版画', '花园', '春日'],
    createdAt: '2026-05-11',
  },
]

const mockArtistResults: Artist[] = [
  {
    id: 'sa1',
    name: '陈静物',
    avatar: imgBase + 'artist+portrait+morandi+style+elegant&image_size=portrait_4_3',
    bio: '专注莫兰迪色系静物创作，用柔和色调诠释日常之美',
    representativeWorks: ['s1'],
    followerCount: 3280,
    isFollowing: false,
    story: '在莫兰迪的色彩世界中，寻找生活的诗意',
    exhibitions: [{ name: '静物之美', date: '2026-03', location: '上海当代艺术馆' }],
    honors: ['2025年度新锐艺术家'],
    createdAt: '2025-06-01',
  },
  {
    id: 'sa2',
    name: '林清远',
    avatar: imgBase + 'landscape+photographer+portrait+outdoor&image_size=portrait_4_3',
    bio: '风光摄影师，用镜头捕捉自然最动人的瞬间',
    representativeWorks: ['s2'],
    followerCount: 8920,
    isFollowing: true,
    story: '行走在山川之间，记录光影的每一次对话',
    exhibitions: [{ name: '山川回响', date: '2026-01', location: '北京798艺术区' }],
    honors: ['国际风光摄影大赛金奖'],
    createdAt: '2024-12-01',
  },
  {
    id: 'sa3',
    name: '李暖暖',
    avatar: imgBase + 'cute+illustrator+portrait+warm+style&image_size=portrait_4_3',
    bio: '治愈系插画师，用温暖笔触描绘生活中的小确幸',
    representativeWorks: ['s3'],
    followerCount: 15600,
    isFollowing: false,
    story: '希望每一幅画都能带给你一点点温暖',
    exhibitions: [{ name: '温暖日常', date: '2025-11', location: '杭州良渚文化艺术中心' }],
    honors: ['最受欢迎治愈系插画师'],
    createdAt: '2024-08-15',
  },
  {
    id: 'sa4',
    name: '赵无极',
    avatar: imgBase + 'abstract+artist+portrait+contemporary+art&image_size=portrait_4_3',
    bio: '当代抽象艺术家，探索色彩与形态的无限可能',
    representativeWorks: ['s4'],
    followerCount: 5430,
    isFollowing: false,
    story: '在抽象与具象之间，寻找艺术的本质',
    exhibitions: [{ name: '流动的边界', date: '2026-04', location: '深圳当代艺术馆' }],
    honors: ['亚洲当代艺术新锐奖'],
    createdAt: '2025-03-20',
  },
]

const artworkResults = ref<Artwork[]>([])
const artistResults = ref<Artist[]>([])

function doSearch(kw: string) {
  if (!kw.trim()) return
  keyword.value = kw
  hasSearched.value = true
  isLoading.value = true
  activeTab.value = 'artwork'
  appStore.addSearchHistory(kw.trim())

  setTimeout(() => {
    const lower = kw.toLowerCase()
    artworkResults.value = mockArtworkResults.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.artistName.toLowerCase().includes(lower) ||
        item.tags.some((tag) => tag.toLowerCase().includes(lower)),
    )
    artistResults.value = mockArtistResults.filter(
      (item) =>
        item.name.toLowerCase().includes(lower) ||
        item.bio.toLowerCase().includes(lower),
    )
    if (artworkResults.value.length === 0 && artistResults.value.length > 0) {
      activeTab.value = 'artist'
    }
    isLoading.value = false
  }, 600)
}

function handleSearch() {
  doSearch(keyword.value)
}

function handleClear() {
  keyword.value = ''
  hasSearched.value = false
  artworkResults.value = []
  artistResults.value = []
  isFocused.value = true
}

function handleCancel() {
  uni.navigateBack({ delta: 1 })
}

function handleTagTap(text: string) {
  doSearch(text)
}

function handleClearHistory() {
  uni.showModal({
    title: '提示',
    content: '确定清空搜索历史吗？',
    success: (res) => {
      if (res.confirm) {
        appStore.clearSearchHistory()
      }
    },
  })
}

function handleArtworkClick(artwork: Artwork) {
  uni.navigateTo({ url: `/pages/detail/index?id=${artwork.id}` })
}

function handleArtworkFavorite(artwork: Artwork) {}

function handleArtistClick(artist: Artist) {
  uni.navigateTo({ url: `/pages/artist/index?id=${artist.id}` })
}

function handleArtistFollow(artist: Artist) {}

onMounted(() => {
  isFocused.value = true
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.search-page {
  min-height: 100vh;
  background-color: $color-bg;
  display: flex;
  flex-direction: column;
}

.search-header {
  background-color: $color-white;
  padding: $spacing-sm $spacing-base;
  padding-top: calc(#{$spacing-sm} + var(--status-bar-height, 0px));
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  gap: $spacing-sm;

  &__inner {
    flex: 1;
    display: flex;
    align-items: center;
    height: 80rpx;
    background-color: $color-bg-secondary;
    border-radius: $radius-full;
    padding: 0 $spacing-base;
    gap: $spacing-sm;
    transition: $transition-base;
  }

  &__icon {
    font-size: $font-md;
    flex-shrink: 0;
  }

  &__input {
    flex: 1;
    height: 100%;
    font-size: $font-md;
    color: $color-text-primary;
    background-color: transparent;
  }

  &__placeholder {
    color: $color-text-placeholder;
    font-size: $font-base;
    letter-spacing: 1rpx;
  }

  &__clear {
    width: 44rpx;
    height: 44rpx;
    @include flex-center;
    flex-shrink: 0;
    border-radius: $radius-full;
    background-color: $color-border;
    transition: $transition-base;

    &:active {
      opacity: 0.7;
    }
  }

  &__clear-icon {
    font-size: $font-xs;
    color: $color-text-tertiary;
  }

  &__cancel {
    flex-shrink: 0;
    padding: $spacing-xs 0;

    &:active {
      opacity: 0.7;
    }
  }

  &__cancel-text {
    font-size: $font-base;
    color: $color-accent;
    letter-spacing: 1rpx;
  }
}

.search-suggestions {
  flex: 1;
  padding: $spacing-md $spacing-base;
}

.search-section {
  margin-bottom: $spacing-lg;

  &__header {
    @include flex-between;
    margin-bottom: $spacing-base;
  }

  &__title {
    font-size: $font-md;
    font-weight: 600;
    color: $color-text-primary;
    letter-spacing: 2rpx;
    padding-left: $spacing-sm;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 6rpx;
      height: 60%;
      background-color: $color-accent;
      border-radius: $radius-full;
    }
  }

  &__action {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-sm;

    &:active {
      opacity: 0.7;
    }
  }

  &__action-icon {
    font-size: $font-sm;
  }

  &__action-text {
    font-size: $font-sm;
    color: $color-text-tertiary;
  }
}

.search-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.search-tag {
  display: inline-flex;
  align-items: center;
  padding: $spacing-xs $spacing-md;
  border-radius: $radius-full;
  transition: $transition-base;

  &:active {
    transform: scale(0.96);
    opacity: 0.85;
  }

  &--history {
    background-color: $color-bg-secondary;
    border: 1rpx solid $color-border;

    .search-tag__text {
      color: $color-text-secondary;
    }
  }

  &--hot {
    background-color: rgba($morandi-rose, 0.12);
    border: 1rpx solid rgba($morandi-rose, 0.25);

    .search-tag__text {
      color: $morandi-rose;
    }

    .search-tag__rank {
      color: $color-white;
      background-color: $morandi-rose;
    }
  }

  &--normal {
    background-color: rgba($morandi-blue, 0.1);
    border: 1rpx solid rgba($morandi-blue, 0.2);

    .search-tag__text {
      color: $morandi-blue;
    }
  }

  &__rank {
    width: 32rpx;
    height: 32rpx;
    @include flex-center;
    font-size: 18rpx;
    font-weight: 600;
    border-radius: $radius-sm;
    margin-right: $spacing-xs;
    flex-shrink: 0;
  }

  &__text {
    font-size: $font-sm;
    letter-spacing: 1rpx;
  }
}

.search-results {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.result-tabs {
  display: flex;
  background-color: $color-white;
  border-bottom: 1rpx solid $color-bg-secondary;
  position: sticky;
  top: 0;
  z-index: 99;

  &__item {
    flex: 1;
    @include flex-center;
    height: 88rpx;
    position: relative;
    transition: $transition-base;

    &--active {
      .result-tabs__text {
        color: $color-accent;
        font-weight: 600;
      }
    }
  }

  &__text {
    font-size: $font-md;
    color: $color-text-secondary;
    letter-spacing: 2rpx;
    transition: $transition-base;
  }

  &__indicator {
    position: absolute;
    bottom: 0;
    width: 48rpx;
    height: 6rpx;
    background-color: $color-accent;
    border-radius: $radius-full;
  }
}

.result-content {
  flex: 1;
  height: 0;
  padding: $spacing-base;
}

.artist-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}
</style>
