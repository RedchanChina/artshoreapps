<template>
  <view class="home-page">
    <view class="hero-section">
      <swiper
        class="hero-swiper"
        :autoplay="true"
        :interval="4000"
        :duration="800"
        :circular="true"
        easing-function="easeInOutCubic"
        @change="onHeroSwiperChange"
      >
        <swiper-item v-for="(item, idx) in heroList" :key="idx">
          <image
            class="hero-image"
            :src="item.image"
            mode="aspectFill"
          />
        </swiper-item>
      </swiper>

      <view class="hero-overlay-top">
        <image class="hero-logo" src="/static/logo.png" mode="aspectFit" />
      </view>

      <view class="hero-overlay-bottom">
        <view class="hero-slogan">
          <text class="slogan-cn">让生活多一点艺术</text>
          <text class="slogan-en">More Art In Life</text>
        </view>
        <view class="hero-dots">
          <view
            v-for="(_, idx) in heroList"
            :key="idx"
            class="dot"
            :class="{ 'dot--active': heroCurrent === idx }"
          />
        </view>
      </view>
    </view>

    <view class="section categories-section">
      <view class="section-header">
        <text class="section-title">精选展区</text>
        <text class="section-subtitle">Curated Collections</text>
      </view>
      <view class="categories-grid">
        <view
          v-for="(cat, idx) in categories"
          :key="idx"
          class="category-card"
          :class="'category-card--' + idx"
          @tap="onCategoryTap(cat)"
        >
          <image class="category-bg" :src="cat.image" mode="aspectFill" />
          <view class="category-mask" />
          <view class="category-content">
            <text class="category-name">{{ cat.name }}</text>
            <text class="category-subtitle">{{ cat.subtitle }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="section arrivals-section">
      <view class="section-header">
        <view class="section-title-group">
          <view class="accent-line" />
          <text class="section-title">限量新品</text>
        </view>
        <text class="section-more" @tap="onArrivalsMore">查看全部 ›</text>
      </view>
      <scroll-view class="arrivals-scroll" scroll-x :show-scrollbar="false">
        <view class="arrivals-list">
          <view
            v-for="(item, idx) in newArrivals"
            :key="idx"
            class="arrival-card"
            :class="{ 'arrival-card--sold-out': item.soldOut }"
            @tap="onArrivalTap(item)"
          >
            <view class="arrival-image-wrap">
              <image class="arrival-image" :src="item.image" mode="aspectFill" />
              <view v-if="item.soldOut" class="sold-out-tag">
                <text class="sold-out-text">售罄</text>
              </view>
              <view v-if="!item.soldOut && item.countdown" class="countdown-tag">
                <text class="countdown-text">{{ item.countdown }}</text>
              </view>
            </view>
            <view class="arrival-info">
              <text class="arrival-title">{{ item.title }}</text>
              <view class="arrival-artist-row">
                <text class="arrival-artist">{{ item.artist }}</text>
                <text class="arrival-edition">{{ item.edition }}</text>
              </view>
              <view class="arrival-price-row">
                <text class="arrival-price">¥{{ item.price }}</text>
                <text v-if="item.originalPrice" class="arrival-original-price">¥{{ item.originalPrice }}</text>
              </view>
            </view>
            <view class="arrival-signature">
              <text class="signature-text">{{ item.signature }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="section artist-section">
      <view class="section-header">
        <view class="section-title-group">
          <view class="accent-line" />
          <text class="section-title">艺术家专区</text>
        </view>
        <text class="section-more" @tap="onArtistMore">更多 ›</text>
      </view>
      <scroll-view class="artist-scroll" scroll-x :show-scrollbar="false">
        <view class="artist-list">
          <view
            v-for="(item, idx) in artists"
            :key="idx"
            class="artist-card"
            @tap="onArtistTap(item)"
          >
            <image class="artist-avatar" :src="item.avatar" mode="aspectFill" />
            <text class="artist-name">{{ item.name }}</text>
            <text class="artist-tag">{{ item.tag }}</text>
            <image class="artist-work" :src="item.workImage" mode="aspectFill" />
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="section store-section">
      <view class="section-header">
        <view class="section-title-group">
          <view class="accent-line" />
          <text class="section-title">线下门店</text>
        </view>
      </view>
      <view class="store-card">
        <image class="store-image" :src="storeInfo.image" mode="aspectFill" />
        <view class="store-info">
          <text class="store-name">{{ storeInfo.name }}</text>
          <view class="store-detail-row">
            <text class="store-icon">📍</text>
            <text class="store-address">{{ storeInfo.address }}</text>
          </view>
          <view class="store-detail-row">
            <text class="store-icon">🕐</text>
            <text class="store-hours">{{ storeInfo.hours }}</text>
          </view>
          <view class="store-nav-btn" @tap="onNavigate">
            <text class="store-nav-text">🗺 导航</text>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-spacer" />

    <CustomTabBar :current="0" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import CustomTabBar from '@/components/CustomTabBar.vue'

const heroCurrent = ref(0)

const heroList = [
  {
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=abstract%20oil%20painting%20morandi%20colors%20soft%20beige%20minimalist%20art&image_size=landscape_16_9',
  },
  {
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=serene%20landscape%20watercolor%20muted%20tones%20gallery%20art&image_size=landscape_16_9',
  },
  {
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=contemporary%20art%20still%20life%20warm%20neutral%20palette%20elegant&image_size=landscape_16_9',
  },
]

const categories = [
  {
    name: '摄影',
    subtitle: 'Photography',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=artistic%20photography%20black%20white%20moody%20film%20grain&image_size=landscape_16_9',
  },
  {
    name: '插画',
    subtitle: 'Illustration',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=delicate%20illustration%20botanical%20soft%20watercolor%20pastel&image_size=landscape_16_9',
  },
]

const newArrivals = [
  {
    id: '1',
    title: '晨雾中的远山',
    artist: '林清远',
    price: 2680,
    originalPrice: 3200,
    edition: '12/50',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=misty%20mountain%20landscape%20chinese%20ink%20wash%20painting&image_size=portrait_4_3',
    soldOut: false,
    countdown: '',
    signature: '清远',
  },
  {
    id: '2',
    title: '静物·陶与花',
    artist: '苏婉清',
    price: 1880,
    originalPrice: null,
    edition: '28/30',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=still%20life%20ceramic%20vase%20wildflowers%20morandi%20palette&image_size=portrait_4_3',
    soldOut: false,
    countdown: '',
    signature: '婉清',
  },
  {
    id: '3',
    title: '城市光影 No.7',
    artist: '陈默',
    price: 4280,
    originalPrice: null,
    edition: '5/20',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=urban%20city%20lights%20abstract%20photography%20night&image_size=portrait_4_3',
    soldOut: true,
    countdown: '',
    signature: '陈默',
  },
  {
    id: '4',
    title: '春日迟迟',
    artist: '赵含章',
    price: 1560,
    originalPrice: 1980,
    edition: '35/80',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spring%20garden%20cherry%20blossom%20soft%20light%20painting&image_size=portrait_4_3',
    soldOut: false,
    countdown: '02:15:30',
    signature: '含章',
  },
  {
    id: '5',
    title: '海的记忆 II',
    artist: '周海潮',
    price: 5960,
    originalPrice: null,
    edition: '3/15',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ocean%20waves%20abstract%20blue%20grey%20oil%20painting%20texture&image_size=portrait_4_3',
    soldOut: false,
    countdown: '',
    signature: '海潮',
  },
]

const artists = [
  {
    id: 'a1',
    name: '林清远',
    tag: '知名',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20asian%20male%20artist%20elegant%20neutral%20background&image_size=portrait_4_3',
    workImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ink%20wash%20mountain%20landscape%20monochrome%20chinese%20art&image_size=portrait_4_3',
  },
  {
    id: 'a2',
    name: '苏婉清',
    tag: '新锐',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20asian%20female%20artist%20soft%20light%20neutral&image_size=portrait_4_3',
    workImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=botanical%20still%20life%20watercolor%20delicate%20flowers&image_size=portrait_4_3',
  },
  {
    id: 'a3',
    name: '陈默',
    tag: '知名',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20male%20photographer%20urban%20moody&image_size=portrait_4_3',
    workImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=city%20night%20photography%20neon%20reflections&image_size=portrait_4_3',
  },
  {
    id: 'a4',
    name: '赵含章',
    tag: '新锐',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20young%20female%20painter%20gentle%20warm&image_size=portrait_4_3',
    workImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spring%20landscape%20cherry%20blossom%20oil%20painting&image_size=portrait_4_3',
  },
  {
    id: 'a5',
    name: '周海潮',
    tag: '知名',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20mature%20male%20artist%20contemplative&image_size=portrait_4_3',
    workImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=abstract%20ocean%20waves%20blue%20grey%20oil%20painting&image_size=portrait_4_3',
  },
  {
    id: 'a6',
    name: '白鹿',
    tag: '新锐',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20young%20androgynous%20artist%20minimal&image_size=portrait_4_3',
    workImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20abstract%20geometric%20art%20beige%20cream&image_size=portrait_4_3',
  },
]

const storeInfo = {
  name: 'ArtShop 旗舰空间',
  image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20art%20gallery%20interior%20white%20walls%20warm%20lighting&image_size=landscape_16_9',
  address: '上海市黄浦区南京东路233号 3F',
  hours: '周一至周日 10:00 - 21:00',
  latitude: 31.2362,
  longitude: 121.4753,
}

const onHeroSwiperChange = (e: any) => {
  heroCurrent.value = e.detail.current
}

const onCategoryTap = (cat: { name: string }) => {
  uni.navigateTo({ url: `/pages/category/index?name=${cat.name}` })
}

const onArrivalTap = (item: { id: string }) => {
  uni.navigateTo({ url: `/pages/artwork/detail?id=${item.id}` })
}

const onArrivalsMore = () => {
  uni.navigateTo({ url: '/pages/artwork/list?type=new' })
}

const onArtistTap = (item: { id: string }) => {
  uni.navigateTo({ url: `/pages/artist/index?id=${item.id}` })
}

const onArtistMore = () => {
  uni.navigateTo({ url: '/pages/artist/list' })
}

const onNavigate = () => {
  uni.openLocation({
    latitude: storeInfo.latitude,
    longitude: storeInfo.longitude,
    name: storeInfo.name,
    address: storeInfo.address,
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

.home-page {
  min-height: 100vh;
  background-color: $color-bg;
  padding-bottom: 120rpx;
}

.hero-section {
  position: relative;
  width: 100%;
  height: 920rpx;
  overflow: hidden;

  .hero-swiper {
    width: 100%;
    height: 100%;
  }

  .hero-image {
    width: 100%;
    height: 100%;
  }

  .hero-overlay-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 80rpx 48rpx 0;
    z-index: 2;
  }

  .hero-logo {
    width: 120rpx;
    height: 120rpx;
    opacity: 0.9;
  }

  .hero-overlay-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 80rpx 48rpx 64rpx;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.15) 60%, transparent 100%);
    z-index: 2;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  .hero-slogan {
    display: flex;
    flex-direction: column;
  }

  .slogan-cn {
    font-family: 'Georgia', 'Noto Serif SC', serif;
    font-size: 52rpx;
    color: #ffffff;
    letter-spacing: 6rpx;
    line-height: 1.3;
    text-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.3);
  }

  .slogan-en {
    font-family: 'Georgia', serif;
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.75);
    letter-spacing: 4rpx;
    margin-top: 12rpx;
    text-shadow: 0 1rpx 8rpx rgba(0, 0, 0, 0.2);
  }

  .hero-dots {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 12rpx;
  }

  .dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: $radius-full;
    background-color: rgba(255, 255, 255, 0.4);
    transition: $transition-base;

    &--active {
      width: 32rpx;
      background-color: rgba(255, 255, 255, 0.9);
    }
  }
}

.section {
  padding: 0 32rpx;
  margin-top: 48rpx;
}

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.accent-line {
  width: 6rpx;
  height: 36rpx;
  background-color: $color-accent;
  border-radius: $radius-full;
}

.section-title {
  font-family: 'Georgia', 'Noto Serif SC', serif;
  font-size: $font-lg;
  font-weight: 600;
  color: $color-text-primary;
  letter-spacing: 2rpx;
}

.section-subtitle {
  font-family: 'Georgia', serif;
  font-size: $font-sm;
  color: $color-text-tertiary;
  letter-spacing: 2rpx;
}

.section-more {
  font-size: $font-sm;
  color: $color-text-secondary;
  letter-spacing: 1rpx;
}

.categories-grid {
  display: flex;
  gap: 24rpx;
}

.category-card {
  flex: 1;
  position: relative;
  height: 360rpx;
  border-radius: $radius-lg;
  overflow: hidden;
  transition: $transition-base;

  &:active {
    transform: scale(0.97);
  }

  .category-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: transform 0.5s ease;
  }

  &:active .category-bg {
    transform: scale(1.05);
  }

  .category-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.5) 0%,
      rgba(0, 0, 0, 0.1) 50%,
      transparent 100%
    );
  }

  .category-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 32rpx;
    z-index: 1;
  }

  .category-name {
    font-family: 'Georgia', 'Noto Serif SC', serif;
    font-size: $font-xl;
    color: #ffffff;
    letter-spacing: 4rpx;
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
  }

  .category-subtitle {
    font-family: 'Georgia', serif;
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 3rpx;
    margin-top: 8rpx;
  }
}

.arrivals-scroll {
  width: 100%;
  white-space: nowrap;
}

.arrivals-list {
  display: inline-flex;
  gap: 24rpx;
  padding-right: 32rpx;
}

.arrival-card {
  display: inline-flex;
  flex-direction: column;
  width: 320rpx;
  background-color: $color-white;
  border-radius: $radius-lg;
  box-shadow: 0 4rpx 16rpx rgba(180, 170, 160, 0.15);
  overflow: hidden;
  transition: $transition-base;
  position: relative;

  &:active {
    transform: scale(0.97);
    box-shadow: 0 2rpx 8rpx rgba(180, 170, 160, 0.1);
  }

  &--sold-out {
    opacity: 0.7;
  }

  .arrival-image-wrap {
    position: relative;
    width: 100%;
    height: 400rpx;
    overflow: hidden;
  }

  .arrival-image {
    width: 100%;
    height: 100%;
  }

  .sold-out-tag {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    background-color: $color-error;
    padding: 6rpx 20rpx;
    border-radius: $radius-base;
  }

  .sold-out-text {
    font-size: $font-xs;
    color: #ffffff;
    letter-spacing: 2rpx;
  }

  .countdown-tag {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12rpx 20rpx;
    background: linear-gradient(to top, rgba(139, 115, 85, 0.9), transparent);
  }

  .countdown-text {
    font-size: $font-xs;
    color: #ffffff;
    letter-spacing: 1rpx;
    font-variant-numeric: tabular-nums;
  }

  .arrival-info {
    padding: 20rpx 24rpx 16rpx;
  }

  .arrival-title {
    font-family: 'Georgia', 'Noto Serif SC', serif;
    font-size: $font-base;
    color: $color-text-primary;
    letter-spacing: 1rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .arrival-artist-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10rpx;
  }

  .arrival-artist {
    font-size: $font-sm;
    color: $color-text-secondary;
    letter-spacing: 1rpx;
  }

  .arrival-edition {
    font-size: $font-xs;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;
    font-variant-numeric: tabular-nums;
  }

  .arrival-price-row {
    display: flex;
    align-items: baseline;
    gap: 12rpx;
    margin-top: 12rpx;
  }

  .arrival-price {
    font-size: $font-md;
    color: $color-accent;
    font-weight: 600;
    letter-spacing: 1rpx;
  }

  .arrival-original-price {
    font-size: $font-xs;
    color: $color-text-tertiary;
    text-decoration: line-through;
  }

  .arrival-signature {
    padding: 0 24rpx 20rpx;
  }

  .signature-text {
    font-family: 'Georgia', 'Noto Serif SC', serif;
    font-size: $font-xs;
    color: $morandi-brown;
    letter-spacing: 2rpx;
    font-style: italic;
  }
}

.artist-scroll {
  width: 100%;
  white-space: nowrap;
}

.artist-list {
  display: inline-flex;
  gap: 28rpx;
  padding-right: 32rpx;
}

.artist-card {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  width: 200rpx;
  transition: $transition-base;

  &:active {
    transform: scale(0.96);
  }

  .artist-avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: $radius-full;
    border: 4rpx solid $color-border;
  }

  .artist-name {
    font-family: 'Georgia', 'Noto Serif SC', serif;
    font-size: $font-sm;
    color: $color-text-primary;
    margin-top: 16rpx;
    letter-spacing: 2rpx;
  }

  .artist-tag {
    font-size: $font-xs;
    color: $color-accent-light;
    background-color: $color-bg-secondary;
    padding: 4rpx 16rpx;
    border-radius: $radius-full;
    margin-top: 8rpx;
    letter-spacing: 1rpx;
  }

  .artist-work {
    width: 200rpx;
    height: 160rpx;
    border-radius: $radius-base;
    margin-top: 16rpx;
  }
}

.store-section {
  .store-card {
    display: flex;
    background-color: $color-white;
    border-radius: $radius-lg;
    box-shadow: 0 4rpx 16rpx rgba(180, 170, 160, 0.15);
    overflow: hidden;
  }

  .store-image {
    width: 280rpx;
    height: 320rpx;
    flex-shrink: 0;
  }

  .store-info {
    flex: 1;
    padding: 28rpx 24rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 16rpx;
  }

  .store-name {
    font-family: 'Georgia', 'Noto Serif SC', serif;
    font-size: $font-md;
    color: $color-text-primary;
    letter-spacing: 2rpx;
    font-weight: 600;
  }

  .store-detail-row {
    display: flex;
    align-items: flex-start;
    gap: 10rpx;
  }

  .store-icon {
    font-size: $font-sm;
    flex-shrink: 0;
    line-height: 1.6;
  }

  .store-address,
  .store-hours {
    font-size: $font-sm;
    color: $color-text-secondary;
    letter-spacing: 1rpx;
    line-height: 1.6;
  }

  .store-nav-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    align-self: flex-start;
    padding: 12rpx 32rpx;
    background-color: $color-accent;
    border-radius: $radius-base;
    margin-top: 8rpx;
    transition: $transition-base;

    &:active {
      opacity: 0.85;
      transform: scale(0.97);
    }
  }

  .store-nav-text {
    font-size: $font-sm;
    color: #ffffff;
    letter-spacing: 2rpx;
  }
}

.bottom-spacer {
  height: 48rpx;
}
</style>
