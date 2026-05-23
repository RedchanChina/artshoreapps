<template>
  <view class="home-page">
    <view class="hero">
      <view class="desktop-nav">
        <image class="nav-logo" src="/static/logo.png" mode="heightFix" />
        <view class="nav-links">
          <text class="nav-link">Works</text>
          <text class="nav-link">Artists</text>
          <text class="nav-link">Community</text>
          <text class="nav-link">About</text>
        </view>
        <view class="nav-actions">
          <text class="nav-action">Cart (0)</text>
          <text class="nav-action">Account</text>
        </view>
      </view>
      <image
        class="hero-image"
        :src="heroImage"
        mode="aspectFill"
      />
      <view class="hero-brand">
        <image class="brand-logo" src="/static/logo.png" mode="heightFix" />
      </view>
      <view class="hero-slogan">
        <text class="slogan-cn">让生活多一点艺术</text>
        <text class="slogan-en">More Art In Life</text>
      </view>
      <view class="hero-scroll-indicator">
        <view class="scroll-line" />
      </view>
    </view>

    <view class="section categories-section">
      <view
        v-for="(cat, idx) in categories"
        :key="idx"
        class="category-block"
        @tap="onCategoryTap(cat)"
      >
        <image class="category-image" :src="cat.image" mode="aspectFill" />
        <view class="category-text">
          <text class="category-name-en">{{ cat.nameEn }}</text>
          <text class="category-name-cn">{{ cat.nameCn }}</text>
        </view>
      </view>
    </view>

    <view class="section editions-section">
      <view class="section-heading">
        <text class="section-title">Limited Editions</text>
      </view>
      <scroll-view class="editions-scroll" scroll-x :show-scrollbar="false">
        <view class="editions-list">
          <view
            v-for="(item, idx) in editions"
            :key="idx"
            class="edition-item"
            @tap="onArrivalTap(item)"
          >
            <view class="edition-image-wrap">
              <image class="edition-image" :src="item.image" mode="aspectFill" />
              <view v-if="item.soldOut" class="sold-out-overlay">
                <text class="sold-out-text">SOLD OUT</text>
              </view>
            </view>
            <text class="edition-title">{{ item.title }}</text>
            <text class="edition-price">¥{{ item.price }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="section artists-section">
      <view class="section-heading">
        <text class="section-title">Artists</text>
      </view>
      <scroll-view class="artists-scroll" scroll-x :show-scrollbar="false">
        <view class="artists-list">
          <view
            v-for="(item, idx) in artists"
            :key="idx"
            class="artist-item"
            @tap="onArtistTap(item)"
          >
            <image class="artist-avatar" :src="item.avatar" mode="aspectFill" />
            <text class="artist-name">{{ item.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="section store-section">
      <view class="store-link" @tap="onNavigate">
        <text class="store-text">Visit Us — Shanghai</text>
        <text class="store-arrow">→</text>
      </view>
    </view>

    <view class="bottom-spacer" />
  </view>
</template>

<script setup lang="ts">
import { onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'

const heroImage = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=abstract%20oil%20painting%20morandi%20colors%20soft%20beige%20minimalist%20art&image_size=landscape_16_9'

const categories = [
  {
    nameEn: 'Photography',
    nameCn: '摄影',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=artistic%20photography%20black%20white%20moody%20film%20grain&image_size=landscape_16_9',
  },
  {
    nameEn: 'Illustration',
    nameCn: '插画',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=delicate%20illustration%20botanical%20soft%20watercolor%20pastel&image_size=landscape_16_9',
  },
]

const editions = [
  {
    id: '1',
    title: '晨雾中的远山',
    price: 2680,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=misty%20mountain%20landscape%20chinese%20ink%20wash%20painting&image_size=portrait_4_3',
    soldOut: false,
  },
  {
    id: '2',
    title: '静物·陶与花',
    price: 1880,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=still%20life%20ceramic%20vase%20wildflowers%20morandi%20palette&image_size=portrait_4_3',
    soldOut: false,
  },
  {
    id: '3',
    title: '城市光影 No.7',
    price: 4280,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=urban%20city%20lights%20abstract%20photography%20night&image_size=portrait_4_3',
    soldOut: true,
  },
  {
    id: '4',
    title: '春日迟迟',
    price: 1560,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spring%20garden%20cherry%20blossom%20soft%20light%20painting&image_size=portrait_4_3',
    soldOut: false,
  },
  {
    id: '5',
    title: '海的记忆 II',
    price: 5960,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ocean%20waves%20abstract%20blue%20grey%20oil%20painting%20texture&image_size=portrait_4_3',
    soldOut: false,
  },
]

const artists = [
  {
    id: 'a1',
    name: '林清远',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20asian%20male%20artist%20elegant%20neutral%20background&image_size=portrait_4_3',
  },
  {
    id: 'a2',
    name: '苏婉清',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20asian%20female%20artist%20soft%20light%20neutral&image_size=portrait_4_3',
  },
  {
    id: 'a3',
    name: '陈默',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20male%20photographer%20urban%20moody&image_size=portrait_4_3',
  },
  {
    id: 'a4',
    name: '赵含章',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20young%20female%20painter%20gentle%20warm&image_size=portrait_4_3',
  },
  {
    id: 'a5',
    name: '周海潮',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20mature%20male%20artist%20contemplative&image_size=portrait_4_3',
  },
  {
    id: 'a6',
    name: '白鹿',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20young%20androgynous%20artist%20minimal&image_size=portrait_4_3',
  },
]

const onCategoryTap = (cat: { nameCn: string }) => {
  uni.navigateTo({ url: `/pages/category/index?name=${cat.nameCn}` })
}

const onArrivalTap = (item: { id: string }) => {
  uni.navigateTo({ url: `/pages/artwork/detail?id=${item.id}` })
}

const onArtistTap = (item: { id: string }) => {
  uni.navigateTo({ url: `/pages/artist/index?id=${item.id}` })
}

const onNavigate = () => {
  uni.openLocation({
    latitude: 31.2362,
    longitude: 121.4753,
    name: 'ArtShop 旗舰空间',
    address: '上海市黄浦区南京东路233号 3F',
  })
}

onReachBottom(() => {
  console.log('reach bottom')
})

onPullDownRefresh(() => {
  setTimeout(() => {
    uni.stopPullDownRefresh()
  }, 1000)
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.home-page {
  min-height: 100vh;
  background-color: $color-surface;
}

.hero {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;

  .hero-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .hero-brand {
    position: absolute;
    top: 0;
    left: 0;
    padding: 80rpx 48rpx 0;
    z-index: 2;
  }

  .brand-logo {
    height: 48rpx;
  }

  .hero-slogan {
    position: absolute;
    bottom: 120rpx;
    left: 48rpx;
    z-index: 2;
    display: flex;
    flex-direction: column;
  }

  .slogan-cn {
    font-family: $font-serif;
    font-size: 56rpx;
    font-weight: 400;
    color: #ffffff;
    letter-spacing: 0.04em;
    line-height: 1.2;
  }

  .slogan-en {
    font-family: $font-sans;
    font-size: $font-sm;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 0.15em;
    margin-top: 16rpx;
    text-transform: uppercase;
  }

  .hero-scroll-indicator {
    position: absolute;
    bottom: 48rpx;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    width: 1rpx;
    height: 48rpx;
    background-color: rgba(255, 255, 255, 0.25);
    overflow: hidden;
  }

  .scroll-line {
    width: 100%;
    height: 100%;
    background-color: #ffffff;
    animation: scrollPulse 2s $ease-out-expo infinite;
  }
}

@keyframes scrollPulse {
  0% {
    transform: translateY(-100%);
  }
  50% {
    transform: translateY(0%);
  }
  100% {
    transform: translateY(100%);
  }
}

.section {
  padding: 0;
}

.categories-section {
  @include responsive-container($max-width);
  margin-top: $space-3xl;
  padding-left: 0;
  padding-right: 0;
  display: flex;
  flex-direction: column;
  gap: $space-2xl;

  .category-block {
    position: relative;
    width: 100%;
    height: 560rpx;
    overflow: hidden;
    @include gallery-item;

    .category-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .category-text {
      position: absolute;
      bottom: 0;
      left: 0;
      padding: $space-2xl $space-lg;
      z-index: 1;
      display: flex;
      flex-direction: column;
    }

    .category-name-en {
      @include serif-heading;
      font-size: $font-xxl;
      color: #ffffff;
      letter-spacing: 0.02em;
      line-height: 1.1;
    }

    .category-name-cn {
      font-family: $font-sans;
      font-size: $font-sm;
      color: rgba(255, 255, 255, 0.65);
      letter-spacing: 0.1em;
      margin-top: 12rpx;
    }
  }
}

.editions-section {
  @include responsive-container($max-width);
  margin-top: $space-4xl;
  padding-left: $space-lg;
  padding-right: $space-lg;

  .section-heading {
    margin-bottom: $space-xl;
  }

  .section-title {
    @include serif-heading;
    font-size: $font-xl;
  }

  .editions-scroll {
    width: 100%;
    white-space: nowrap;
  }

  .editions-list {
    display: inline-flex;
    gap: $space-lg;
    padding-right: $space-lg;
  }

  .edition-item {
    display: inline-flex;
    flex-direction: column;
    width: 280rpx;
    @include gallery-item;

    .edition-image-wrap {
      position: relative;
      width: 280rpx;
      height: 373rpx;
      overflow: hidden;
    }

    .edition-image {
      width: 100%;
      height: 100%;
    }

    .sold-out-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sold-out-text {
      font-family: $font-sans;
      font-size: $font-sm;
      font-weight: 500;
      color: $color-ink;
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }

    .edition-title {
      @include serif-heading;
      font-size: $font-base;
      margin-top: $space-md;
      @include ellipsis;
    }

    .edition-price {
      @include sans-body;
      font-size: $font-sm;
      margin-top: $space-xs;
      font-variant-numeric: tabular-nums;
    }
  }
}

.artists-section {
  @include responsive-container($max-width);
  margin-top: $space-4xl;
  padding-left: $space-lg;
  padding-right: $space-lg;

  .section-heading {
    margin-bottom: $space-xl;
  }

  .section-title {
    @include serif-heading;
    font-size: $font-xl;
  }

  .artists-scroll {
    width: 100%;
    white-space: nowrap;
  }

  .artists-list {
    display: inline-flex;
    gap: $space-xl;
    padding-right: $space-lg;
  }

  .artist-item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    width: 120rpx;
    @include gallery-item;

    .artist-avatar {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
    }

    .artist-name {
      @include serif-heading;
      font-size: $font-sm;
      margin-top: $space-sm;
      text-align: center;
      white-space: nowrap;
    }
  }
}

.store-section {
  @include responsive-container($max-width);
  margin-top: $space-4xl;
  padding-left: $space-lg;
  padding-right: $space-lg;

  .store-link {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: $space-2xl 0;
    border-top: 1rpx solid $color-rule;
    border-bottom: 1rpx solid $color-rule;
    transition: all $duration-base $ease-out-expo;

    &:active {
      opacity: 0.6;
    }
  }

  .store-text {
    @include serif-heading;
    font-size: $font-lg;
    letter-spacing: 0.03em;
  }

  .store-arrow {
    font-family: $font-sans;
    font-size: $font-lg;
    color: $color-ink-secondary;
    transition: transform $duration-base $ease-out-expo;
  }

  &:active .store-arrow {
    transform: translateX(8rpx);
  }
}

.bottom-spacer {
  height: $space-4xl;
  @include safe-area-bottom;
}

.desktop-nav {
  display: none;
}

@media (min-width: 768px) {
  .hero {
    max-height: 85vh;

    .desktop-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10;
      padding: 20px 48px;
      background: rgba(26, 26, 26, 0.35);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .nav-logo {
      height: 28px;
    }

    .nav-links {
      display: flex;
      gap: 32px;
    }

    .nav-link {
      font-family: $font-sans;
      font-size: 13px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.8);
      letter-spacing: 0.08em;
      cursor: pointer;
      transition: color $duration-base $ease-out;

      &:hover {
        color: #ffffff;
      }
    }

    .nav-actions {
      display: flex;
      gap: 24px;
    }

    .nav-action {
      font-family: $font-sans;
      font-size: 13px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.8);
      letter-spacing: 0.05em;
      cursor: pointer;
      transition: color $duration-base $ease-out;

      &:hover {
        color: #ffffff;
      }
    }

    .hero-brand {
      display: none;
    }

    .hero-slogan {
      left: 48px;
      bottom: 64px;
    }

    .slogan-cn {
      font-size: 36px;
    }

    .slogan-en {
      font-size: 14px;
      margin-top: 12px;
    }

    .hero-scroll-indicator {
      bottom: 32px;
    }
  }

  .categories-section {
    flex-direction: row;
    gap: 24px;

    .category-block {
      flex: 1;
      height: 400px;
      @include hover-lift;
    }
  }

  .editions-section {
    .editions-scroll {
      overflow: visible;
      white-space: normal;
    }

    .editions-list {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      padding-right: 0;
    }

    .edition-item {
      width: auto;
      @include hover-lift;

      .edition-image-wrap {
        width: 100%;
        height: 0;
        padding-bottom: 133%;
        position: relative;
      }
    }
  }

  .artists-section {
    .artists-scroll {
      overflow: visible;
      white-space: normal;
    }

    .artists-list {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 24px;
      padding-right: 0;
    }

    .artist-item {
      width: auto;
      @include hover-lift;

      .artist-avatar {
        width: 80px;
        height: 80px;
      }
    }
  }

  .store-section {
    .store-link {
      padding: 64px 0;
      cursor: pointer;
      transition: all $duration-base $ease-out-expo;

      &:hover .store-arrow {
        transform: translateX(8px);
      }
    }

    .store-text {
      font-size: 24px;
    }

    .store-arrow {
      font-size: 24px;
    }
  }

  .bottom-spacer {
    height: 160px;
  }
}

@media (min-width: 1024px) {
  .hero {
    .slogan-cn {
      font-size: 48px;
    }

    .slogan-en {
      font-size: 16px;
      margin-top: 16px;
    }
  }

  .categories-section {
    .category-block {
      height: 480px;
    }
  }

  .store-section {
    .store-text {
      font-size: 28px;
    }

    .store-arrow {
      font-size: 28px;
    }
  }
}
</style>
