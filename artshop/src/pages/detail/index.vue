<template>
  <view class="detail-page">
    <scroll-view class="page-scroll" scroll-y :enhanced="true" :bounces="false">
      <view class="hero">
        <swiper
          class="hero-swiper"
          :current="currentImageIndex"
          :circular="false"
          :duration="300"
          @change="onSwiperChange"
        >
          <swiper-item v-for="(img, index) in artwork.images" :key="index">
            <image
              :src="img"
              mode="aspectFill"
              class="hero-img"
              @click="previewImage(index)"
            />
          </swiper-item>
        </swiper>

        <view class="hero-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
          <view class="nav-back" @click="goBack">
            <text class="nav-back-text">←</text>
          </view>
          <text class="img-counter">{{ currentImageIndex + 1 }}/{{ artwork.images.length }}</text>
        </view>
      </view>

      <view class="info">
        <text class="info-title">{{ artwork.title }}</text>
        <view class="info-artist" @click="goToArtist">
          <text class="info-artist-name">{{ artwork.artistName }}</text>
        </view>
        <text class="info-price">¥{{ formatPrice(currentPrice) }}</text>
        <text class="info-edition">Edition {{ artwork.limitedEdition.current }}/{{ artwork.limitedEdition.total }}</text>
        <text class="info-specs">{{ selectedSize }} · {{ selectedMaterial }} · {{ selectedFrame }} · {{ artwork.year }}</text>

        <view class="divider" />

        <text class="info-desc">{{ artwork.description }}</text>

        <view class="info-note" v-if="artwork.artistNote">
          <text class="info-note-text">"{{ artwork.artistNote }}"</text>
        </view>
      </view>

      <view class="specs">
        <view class="spec-group">
          <text class="spec-label">SIZE</text>
          <view class="spec-chips">
            <view
              v-for="size in uniqueSizes"
              :key="size"
              :class="['spec-chip', { 'spec-chip--active': selectedSize === size, 'spec-chip--disabled': !isSizeAvailable(size) }]"
              @click="selectSize(size)"
            >
              <text class="spec-chip-text">{{ size }}</text>
            </view>
          </view>
        </view>

        <view class="spec-group">
          <text class="spec-label">MATERIAL</text>
          <view class="spec-chips">
            <view
              v-for="material in uniqueMaterials"
              :key="material"
              :class="['spec-chip', { 'spec-chip--active': selectedMaterial === material, 'spec-chip--disabled': !isMaterialAvailable(material) }]"
              @click="selectMaterial(material)"
            >
              <text class="spec-chip-text">{{ material }}</text>
            </view>
          </view>
        </view>

        <view class="spec-group">
          <text class="spec-label">FRAME</text>
          <view class="spec-chips">
            <view
              v-for="frame in uniqueFrames"
              :key="frame"
              :class="['spec-chip', { 'spec-chip--active': selectedFrame === frame, 'spec-chip--disabled': !isFrameAvailable(frame) }]"
              @click="selectFrame(frame)"
            >
              <text class="spec-chip-text">{{ frame }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="preview-links">
        <text class="preview-link" @click="goTo3DPreview">View in 3D →</text>
        <text class="preview-link" @click="goToARPreview">View in AR →</text>
      </view>

      <view class="section">
        <text class="section-heading">More by {{ artwork.artistName }}</text>
        <scroll-view class="artist-scroll" scroll-x :show-scrollbar="false">
          <view class="artist-scroll-inner">
            <view
              v-for="work in artistWorks"
              :key="work.id"
              class="artist-work"
              @click="goToDetail(work.id)"
            >
              <image :src="work.image" mode="aspectFill" class="artist-work-img" />
              <text class="artist-work-title">{{ work.title }}</text>
              <text class="artist-work-price">¥{{ formatPrice(work.price) }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="section">
        <text class="section-heading">You may also like</text>
        <view class="related-grid">
          <view
            v-for="item in relatedWorks"
            :key="item.id"
            class="related-item"
            @click="goToDetail(item.id)"
          >
            <image :src="item.image" mode="aspectFill" class="related-img" />
            <text class="related-title">{{ item.title }}</text>
            <text class="related-artist">{{ item.artistName }}</text>
            <text class="related-price">¥{{ formatPrice(item.price) }}</text>
          </view>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>

    <view class="bottom-bar">
      <view class="fav-action" @click="toggleFavorite">
        <text :class="['fav-text', { 'fav-text--active': isFavorited }]">♡</text>
      </view>
      <view class="cart-action" @click="addToCart">
        <text class="cart-action-text">ADD TO CART</text>
      </view>
      <view class="buy-action" @click="buyNow">
        <text class="buy-action-text">BUY NOW</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'

const IMG_BASE = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt='
const IMG_SIZE = '&image_size=portrait_4_3'

const artwork = ref({
  id: 'art-001',
  title: '静谧时光',
  artistName: '林墨白',
  artistId: 'artist-001',
  images: [
    IMG_BASE + encodeURIComponent('abstract oil painting morandi colors serene composition gallery quality') + IMG_SIZE,
    IMG_BASE + encodeURIComponent('abstract painting detail texture brushstrokes morandi palette close up') + IMG_SIZE,
    IMG_BASE + encodeURIComponent('framed painting on white wall morandi style interior display') + IMG_SIZE,
    IMG_BASE + encodeURIComponent('oil painting canvas texture close up morandi earth tones') + IMG_SIZE,
    IMG_BASE + encodeURIComponent('artwork gallery exhibition morandi palette contemporary art') + IMG_SIZE,
  ],
  price: 2680,
  category: 'Giclée',
  description:
    '《静谧时光》以莫兰迪色系为基调，通过层叠的抽象形态与柔和的光影变化，营造出一种超越时间的宁静氛围。画面中，几何与有机形态交织，仿佛时间在此凝固，邀请观者放慢脚步，感受当下的美好。每一笔触都经过反复推敲，色彩的微妙变化在画面中流淌，如同晨光穿过薄雾，温柔而坚定。',
  specifications: [
    { size: '60×80cm', material: 'Giclée', frameStyle: 'White Frame', price: 2680, stock: 12 },
    { size: '60×80cm', material: 'Giclée', frameStyle: 'No Frame', price: 1980, stock: 8 },
    { size: '60×80cm', material: 'Oil on Canvas', frameStyle: 'White Frame', price: 12800, stock: 5 },
    { size: '60×80cm', material: 'Oil on Canvas', frameStyle: 'No Frame', price: 10800, stock: 3 },
    { size: '80×100cm', material: 'Giclée', frameStyle: 'White Frame', price: 4800, stock: 20 },
    { size: '80×100cm', material: 'Giclée', frameStyle: 'No Frame', price: 3800, stock: 15 },
    { size: '80×100cm', material: 'Oil on Canvas', frameStyle: 'White Frame', price: 22800, stock: 2 },
    { size: '80×100cm', material: 'Oil on Canvas', frameStyle: 'No Frame', price: 19800, stock: 1 },
  ],
  limitedEdition: { total: 50, current: 12 },
  year: '2024',
  artistNote:
    '这件作品诞生于一个清晨，阳光透过工作室的窗户洒在画布上，那一刻的宁静让我决定用最纯粹的色彩来记录这种感受。希望每一位看到这幅画的人，都能在忙碌的生活中找到属于自己的静谧时光。',
})

const artistWorks = ref([
  {
    id: 'art-002',
    title: '晨雾',
    image: IMG_BASE + encodeURIComponent('watercolor landscape misty mountains morandi tones') + IMG_SIZE,
    price: 8600,
  },
  {
    id: 'art-003',
    title: '山水间',
    image: IMG_BASE + encodeURIComponent('abstract ink painting minimalist morandi style') + IMG_SIZE,
    price: 12000,
  },
  {
    id: 'art-004',
    title: '沉思',
    image: IMG_BASE + encodeURIComponent('oil portrait contemplative morandi tones figure') + IMG_SIZE,
    price: 15600,
  },
  {
    id: 'art-005',
    title: '大地之歌',
    image: IMG_BASE + encodeURIComponent('mixed media abstract earth tones morandi texture') + IMG_SIZE,
    price: 9800,
  },
])

const relatedWorks = ref([
  {
    id: 'art-006',
    title: '几何诗意',
    artistName: '陈素雅',
    image: IMG_BASE + encodeURIComponent('minimalist geometric art print morandi pastel') + IMG_SIZE,
    price: 5600,
  },
  {
    id: 'art-007',
    title: '柔光',
    artistName: '张静远',
    image: IMG_BASE + encodeURIComponent('contemporary abstract soft colors morandi painting') + IMG_SIZE,
    price: 7200,
  },
  {
    id: 'art-008',
    title: '自然形态',
    artistName: '王清和',
    image: IMG_BASE + encodeURIComponent('modern organic shapes art morandi neutral tones') + IMG_SIZE,
    price: 6400,
  },
  {
    id: 'art-009',
    title: '静谧蓝',
    artistName: '李墨然',
    image: IMG_BASE + encodeURIComponent('abstract expressionism muted blue morandi canvas') + IMG_SIZE,
    price: 8800,
  },
])

const currentImageIndex = ref(0)
const isFavorited = ref(false)
const statusBarHeight = ref(0)

const selectedSize = ref('60×80cm')
const selectedMaterial = ref('Giclée')
const selectedFrame = ref('White Frame')

const uniqueSizes = computed(() => [...new Set(artwork.value.specifications.map((s) => s.size))])
const uniqueMaterials = computed(() => [...new Set(artwork.value.specifications.map((s) => s.material))])
const uniqueFrames = computed(() => [...new Set(artwork.value.specifications.map((s) => s.frameStyle))])

const currentSpec = computed(() =>
  artwork.value.specifications.find(
    (s) => s.size === selectedSize.value && s.material === selectedMaterial.value && s.frameStyle === selectedFrame.value,
  ),
)

const currentPrice = computed(() => currentSpec.value?.price ?? artwork.value.price)
const currentStock = computed(() => currentSpec.value?.stock ?? 0)

function formatPrice(price: number): string {
  return price.toLocaleString('zh-CN')
}

function isSizeAvailable(size: string): boolean {
  return artwork.value.specifications.some((s) => s.size === size && s.stock > 0)
}

function isMaterialAvailable(material: string): boolean {
  return artwork.value.specifications.some(
    (s) => s.size === selectedSize.value && s.material === material && s.stock > 0,
  )
}

function isFrameAvailable(frame: string): boolean {
  return artwork.value.specifications.some(
    (s) =>
      s.size === selectedSize.value &&
      s.material === selectedMaterial.value &&
      s.frameStyle === frame &&
      s.stock > 0,
  )
}

function selectSize(size: string) {
  if (!isSizeAvailable(size)) return
  selectedSize.value = size
  const match = artwork.value.specifications.find((s) => s.size === size && s.stock > 0)
  if (match) {
    selectedMaterial.value = match.material
    const frameMatch = artwork.value.specifications.find(
      (s) => s.size === size && s.material === match.material && s.stock > 0,
    )
    if (frameMatch) {
      selectedFrame.value = frameMatch.frameStyle
    }
  }
}

function selectMaterial(material: string) {
  if (!isMaterialAvailable(material)) return
  selectedMaterial.value = material
  const match = artwork.value.specifications.find(
    (s) => s.size === selectedSize.value && s.material === material && s.stock > 0,
  )
  if (match) {
    selectedFrame.value = match.frameStyle
  }
}

function selectFrame(frame: string) {
  if (!isFrameAvailable(frame)) return
  selectedFrame.value = frame
}

function onSwiperChange(e: any) {
  currentImageIndex.value = e.detail.current
}

function previewImage(index: number) {
  uni.previewImage({
    current: index,
    urls: artwork.value.images,
  })
}

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function goToArtist() {
  uni.navigateTo({ url: `/pages/artist/index?id=${artwork.value.artistId}` })
}

function goTo3DPreview() {
  uni.navigateTo({ url: `/pages/ar-preview/index?id=${artwork.value.id}&mode=3d` })
}

function goToARPreview() {
  uni.navigateTo({ url: `/pages/ar-preview/index?id=${artwork.value.id}&mode=ar` })
}

function goToDetail(id: string) {
  uni.redirectTo({ url: `/pages/detail/index?id=${id}` })
}

function toggleFavorite() {
  isFavorited.value = !isFavorited.value
  uni.showToast({
    title: isFavorited.value ? '已收藏' : '已取消收藏',
    icon: 'none',
    duration: 1000,
  })
}

function addToCart() {
  if (!currentSpec.value || currentStock.value <= 0) {
    uni.showToast({ title: '该规格暂无库存', icon: 'none' })
    return
  }
  uni.showToast({ title: '已加入购物车', icon: 'none' })
}

function buyNow() {
  if (!currentSpec.value || currentStock.value <= 0) {
    uni.showToast({ title: '该规格暂无库存', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pages/order/confirm?artworkId=${artwork.value.id}&size=${selectedSize.value}&material=${selectedMaterial.value}&frameStyle=${selectedFrame.value}`,
  })
}

onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight ?? 0
})

onShareAppMessage(() => ({
  title: `${artwork.value.title} — ${artwork.value.artistName}`,
  path: `/pages/detail/index?id=${artwork.value.id}`,
  imageUrl: artwork.value.images[0],
}))
</script>

<style lang="scss">
@import '@/styles/mixins.scss';

.detail-page {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  background: $color-surface;
}

.page-scroll {
  width: 100%;
  height: 100vh;
}

.hero {
  position: relative;
  width: 100%;

  .hero-swiper {
    width: 100%;
    height: 75vh;
  }

  .hero-img {
    width: 100%;
    height: 100%;
  }

  .hero-nav {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    @include flex-between;
    padding: 0 $space-lg;
    padding-bottom: $space-sm;
    z-index: 10;
    pointer-events: none;

    > * {
      pointer-events: auto;
    }
  }

  .nav-back {
    @include flex-center;

    .nav-back-text {
      @include sans-body;
      font-size: $font-lg;
      color: $color-ink;
      line-height: 1;
    }

    &:active {
      opacity: 0.5;
    }
  }

  .img-counter {
    @include sans-body;
    font-size: $font-xs;
    color: $color-ink-tertiary;
    letter-spacing: 0.05em;
  }
}

.info {
  padding: $space-xl $space-lg;

  .info-title {
    @include serif-heading;
    font-size: 44rpx;
    line-height: 1.2;
    display: block;
  }

  .info-artist {
    margin-top: $space-sm;

    .info-artist-name {
      @include sans-body;
      font-size: $font-base;
      color: $color-ink-secondary;
      letter-spacing: 0.02em;
    }

    &:active {
      opacity: 0.5;
    }
  }

  .info-price {
    @include sans-body;
    font-size: $font-md;
    color: $color-ink;
    font-weight: 500;
    display: block;
    margin-top: $space-md;
    letter-spacing: 0.02em;
  }

  .info-edition {
    @include sans-body;
    font-size: $font-xs;
    color: $color-ink-tertiary;
    display: block;
    margin-top: $space-xs;
    letter-spacing: 0.03em;
  }

  .info-specs {
    @include sans-body;
    font-size: $font-sm;
    color: $color-ink-tertiary;
    display: block;
    margin-top: $space-sm;
    letter-spacing: 0.02em;
  }

  .divider {
    @include divider;
    margin: $space-lg 0;
  }

  .info-desc {
    @include sans-body;
    font-size: $font-base;
    color: $color-ink-secondary;
    line-height: 1.85;
    display: block;
    letter-spacing: 0.01em;
  }

  .info-note {
    margin-top: $space-lg;
    padding-left: $space-md;
    border-left: 2rpx solid $color-ink-faint;

    .info-note-text {
      @include serif-heading;
      font-size: $font-base;
      color: $color-ink-secondary;
      font-style: italic;
      line-height: 1.85;
    }
  }
}

.specs {
  padding: $space-xl $space-lg;
  border-top: 1rpx solid $color-rule;

  .spec-group {
    margin-bottom: $space-lg;

    &:last-child {
      margin-bottom: 0;
    }

    .spec-label {
      @include sans-body;
      font-size: $font-xs;
      color: $color-ink-tertiary;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      display: block;
      margin-bottom: $space-sm;
    }

    .spec-chips {
      display: flex;
      flex-wrap: wrap;
      gap: $space-sm;
    }

    .spec-chip {
      padding: $space-sm $space-md;
      border: 1rpx solid $color-ink-faint;
      background: transparent;
      transition: all $duration-fast $ease-out;

      &:active {
        opacity: 0.7;
      }

      &--active {
        background: $color-ink;
        border-color: $color-ink;

        .spec-chip-text {
          color: $color-surface;
        }
      }

      &--disabled {
        opacity: 0.3;
        pointer-events: none;
      }

      .spec-chip-text {
        @include sans-body;
        font-size: $font-sm;
        color: $color-ink;
        letter-spacing: 0.02em;
      }
    }
  }
}

.preview-links {
  padding: $space-lg $space-lg $space-xl;
  border-top: 1rpx solid $color-rule;
  display: flex;
  gap: $space-xl;

  .preview-link {
    @include serif-heading;
    font-size: $font-base;
    color: $color-ink;
    text-decoration: underline;
    text-underline-offset: 4rpx;

    &:active {
      opacity: 0.5;
    }
  }
}

.section {
  padding: $space-xl $space-lg;
  border-top: 1rpx solid $color-rule;

  .section-heading {
    @include serif-heading;
    font-size: $font-lg;
    display: block;
    margin-bottom: $space-lg;
  }
}

.artist-scroll {
  margin: 0 -#{$space-lg};

  .artist-scroll-inner {
    display: flex;
    gap: $space-md;
    padding: 0 $space-lg;
  }

  .artist-work {
    flex-shrink: 0;
    width: 200rpx;

    .artist-work-img {
      width: 200rpx;
      height: 268rpx;
    }

    .artist-work-title {
      @include sans-body;
      font-size: $font-sm;
      color: $color-ink;
      display: block;
      margin-top: $space-sm;
      @include ellipsis;
    }

    .artist-work-price {
      @include sans-body;
      font-size: $font-xs;
      color: $color-ink-tertiary;
      display: block;
      margin-top: $space-xxs;
    }

    &:active {
      opacity: 0.7;
    }
  }
}

.related-grid {
  display: flex;
  flex-wrap: wrap;
  gap: $space-md;

  .related-item {
    width: calc(50% - #{$space-md} / 2);

    .related-img {
      width: 100%;
      height: 340rpx;
    }

    .related-title {
      @include sans-body;
      font-size: $font-sm;
      color: $color-ink;
      display: block;
      margin-top: $space-sm;
      @include ellipsis;
    }

    .related-artist {
      @include sans-body;
      font-size: $font-xs;
      color: $color-ink-tertiary;
      display: block;
      margin-top: $space-xxs;
    }

    .related-price {
      @include sans-body;
      font-size: $font-sm;
      color: $color-ink;
      display: block;
      margin-top: $space-xxs;
    }

    &:active {
      opacity: 0.7;
    }
  }
}

.bottom-spacer {
  height: 180rpx;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  padding: $space-sm $space-lg;
  background: $color-surface;
  border-top: 1rpx solid $color-rule;
  gap: $space-sm;
  @include safe-area-bottom;

  .fav-action {
    width: 88rpx;
    height: 80rpx;
    @include flex-center;

    .fav-text {
      @include sans-body;
      font-size: $font-lg;
      color: $color-ink-tertiary;
      transition: color $duration-fast $ease-out;
    }

    .fav-text--active {
      color: $color-ink;
    }

    &:active {
      opacity: 0.5;
    }
  }

  .cart-action {
    flex: 1;
    height: 80rpx;
    @include btn-outline;
    max-width: 50%;

    .cart-action-text {
      @include sans-body;
      font-size: $font-sm;
      color: $color-ink;
      font-weight: 500;
      letter-spacing: 0.08em;
    }

    &:active {
      .cart-action-text {
        color: $color-surface;
      }
    }
  }

  .buy-action {
    flex: 1;
    height: 80rpx;
    @include btn-primary;
    max-width: 50%;

    .buy-action-text {
      @include sans-body;
      font-size: $font-sm;
      color: $color-surface;
      font-weight: 500;
      letter-spacing: 0.08em;
    }
  }
}
</style>
