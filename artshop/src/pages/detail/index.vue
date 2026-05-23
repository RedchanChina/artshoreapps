<template>
  <view class="detail-page">
    <view class="artwork-display">
      <swiper
        class="artwork-swiper"
        :current="currentImageIndex"
        :duration="300"
        :circular="false"
        @change="onSwiperChange"
      >
        <swiper-item v-for="(img, index) in artwork.images" :key="index">
          <image
            :src="img"
            mode="aspectFit"
            class="artwork-image"
            @click="previewImage(index)"
          />
        </swiper-item>
      </swiper>

      <view class="swiper-indicators" v-if="artwork.images.length > 1">
        <view
          v-for="(_, index) in artwork.images"
          :key="index"
          :class="['indicator-dot', { 'indicator-dot--active': index === currentImageIndex }]"
        />
      </view>
    </view>

    <view class="top-controls" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="top-right-group">
        <view class="image-counter">
          <text class="counter-text">{{ currentImageIndex + 1 }}/{{ artwork.images.length }}</text>
        </view>
        <view class="share-btn">
          <button class="share-btn-inner" open-type="share">
            <text class="share-icon">⬆</text>
          </button>
        </view>
      </view>
    </view>

    <view :class="['info-panel', { 'info-panel--expanded': panelExpanded }]">
      <view
        class="panel-handle"
        @click="togglePanel"
        @touchstart="onHandleTouchStart"
        @touchmove.stop.prevent="onHandleTouchMove"
        @touchend="onHandleTouchEnd"
      >
        <view class="handle-bar" />
      </view>

      <scroll-view
        class="panel-scroll"
        :scroll-y="panelExpanded"
        :enhanced="true"
        :bounces="false"
      >
        <view class="info-basic">
          <text class="artwork-title">{{ artwork.title }}</text>
          <view class="artist-row" @click="goToArtist">
            <text class="artist-name">{{ artwork.artistName }}</text>
            <text class="artist-arrow">›</text>
          </view>
          <view class="price-row">
            <view class="price-tag">
              <text class="price-symbol">¥</text>
              <text class="price-value">{{ formatPrice(currentPrice) }}</text>
              <text
                class="price-original"
                v-if="artwork.originalPrice && currentPrice < artwork.originalPrice"
              >
                ¥{{ formatPrice(artwork.originalPrice) }}
              </text>
            </view>
            <view class="limited-badge" v-if="artwork.limitedEdition">
              <text class="limited-text">限量 {{ artwork.limitedEdition.current }}/{{ artwork.limitedEdition.total }}</text>
            </view>
          </view>
          <view class="quick-specs">
            <view class="spec-chip-sm">
              <text class="spec-chip-label">尺寸</text>
              <text class="spec-chip-value">{{ selectedSize }}</text>
            </view>
            <view class="spec-dot" />
            <view class="spec-chip-sm">
              <text class="spec-chip-label">材质</text>
              <text class="spec-chip-value">{{ selectedMaterial }}</text>
            </view>
            <view class="spec-dot" />
            <view class="spec-chip-sm">
              <text class="spec-chip-label">装裱</text>
              <text class="spec-chip-value">{{ selectedFrame }}</text>
            </view>
            <view class="spec-dot" />
            <view class="spec-chip-sm">
              <text class="spec-chip-label">年份</text>
              <text class="spec-chip-value">{{ artwork.year }}</text>
            </view>
          </view>
        </view>

        <view class="info-expanded" v-show="panelExpanded">
          <view class="section-block">
            <text class="section-label">作品介绍</text>
            <text class="description-text">{{ artwork.description }}</text>
          </view>

          <view class="section-block" v-if="artwork.artistNote">
            <text class="section-label">艺术家寄语</text>
            <view class="artist-note-block">
              <text class="artist-note-text">"{{ artwork.artistNote }}"</text>
            </view>
          </view>

          <view class="section-block">
            <text class="section-label">规格选择</text>
            <view class="spec-selector">
              <view class="spec-group">
                <text class="spec-group-title">尺寸</text>
                <view class="spec-chips">
                  <view
                    v-for="size in uniqueSizes"
                    :key="size"
                    :class="[
                      'spec-chip',
                      { 'spec-chip--active': selectedSize === size },
                      { 'spec-chip--disabled': !isSizeAvailable(size) }
                    ]"
                    @click="selectSize(size)"
                  >
                    <text class="spec-chip-text">{{ size }}</text>
                  </view>
                </view>
              </view>
              <view class="spec-group">
                <text class="spec-group-title">材质</text>
                <view class="spec-chips">
                  <view
                    v-for="material in uniqueMaterials"
                    :key="material"
                    :class="[
                      'spec-chip',
                      { 'spec-chip--active': selectedMaterial === material },
                      { 'spec-chip--disabled': !isMaterialAvailable(material) }
                    ]"
                    @click="selectMaterial(material)"
                  >
                    <text class="spec-chip-text">{{ material }}</text>
                  </view>
                </view>
              </view>
              <view class="spec-group">
                <text class="spec-group-title">装裱</text>
                <view class="spec-chips">
                  <view
                    v-for="frame in uniqueFrames"
                    :key="frame"
                    :class="[
                      'spec-chip',
                      { 'spec-chip--active': selectedFrame === frame },
                      { 'spec-chip--disabled': !isFrameAvailable(frame) }
                    ]"
                    @click="selectFrame(frame)"
                  >
                    <text class="spec-chip-text">{{ frame }}</text>
                  </view>
                </view>
              </view>
            </view>
            <view class="spec-status" v-if="currentSpec">
              <text class="stock-text" :class="{ 'stock-text--low': currentStock <= 5 }">
                库存 {{ currentStock }} 件
              </text>
            </view>
            <view class="spec-status" v-else>
              <text class="unavailable-text">该规格组合暂无库存</text>
            </view>
          </view>

          <view class="section-block">
            <view class="ar-buttons">
              <view class="ar-btn" @click="goTo3DPreview">
                <text class="ar-icon">◎</text>
                <text class="ar-text">3D预览</text>
              </view>
              <view class="ar-btn ar-btn--accent" @click="goToARPreview">
                <text class="ar-icon">▣</text>
                <text class="ar-text">AR摆放</text>
              </view>
            </view>
          </view>

          <view class="section-block">
            <text class="section-title">该艺术家的其他作品</text>
            <scroll-view class="artist-works-scroll" scroll-x :show-scrollbar="false">
              <view class="artist-works-list">
                <view
                  v-for="work in artistWorks"
                  :key="work.id"
                  class="artist-work-card"
                  @click="goToDetail(work.id)"
                >
                  <image :src="work.image" mode="aspectFill" class="work-thumb" />
                  <view class="work-info">
                    <text class="work-title">{{ work.title }}</text>
                    <text class="work-price">¥{{ formatPrice(work.price) }}</text>
                  </view>
                </view>
              </view>
            </scroll-view>
          </view>

          <view class="section-block">
            <text class="section-title">相似风格作品</text>
            <view class="related-grid">
              <view
                v-for="item in relatedWorks"
                :key="item.id"
                class="related-card"
                @click="goToDetail(item.id)"
              >
                <image :src="item.image" mode="aspectFill" class="related-thumb" />
                <view class="related-info">
                  <text class="related-title">{{ item.title }}</text>
                  <text class="related-artist">{{ item.artistName }}</text>
                  <text class="related-price">¥{{ formatPrice(item.price) }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="bottom-spacer" />
        </view>
      </scroll-view>
    </view>

    <view class="bottom-bar" :style="{ paddingBottom: safeAreaBottom + 'px' }">
      <view class="fav-btn" @click="toggleFavorite">
        <text :class="['fav-icon', { 'fav-icon--active': isFavorited }]">♥</text>
      </view>
      <view class="action-btns">
        <view class="cart-btn" @click="addToCart">
          <text class="cart-btn-text">加入购物车</text>
        </view>
        <view class="buy-btn" @click="buyNow">
          <text class="buy-btn-text">立即购买</text>
        </view>
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
  price: 12800,
  originalPrice: 15800,
  category: '油画',
  description:
    '《静谧时光》是林墨白2024年的代表作品，以莫兰迪色系为基调，通过层叠的抽象形态与柔和的光影变化，营造出一种超越时间的宁静氛围。画面中，几何与有机形态交织，仿佛时间在此凝固，邀请观者放慢脚步，感受当下的美好。每一笔触都经过反复推敲，色彩的微妙变化在画面中流淌，如同晨光穿过薄雾，温柔而坚定。作品在抽象与具象之间找到了独特的平衡点，既有东方美学的含蓄内敛，又融入了当代艺术的自由表达。',
  specifications: [
    { size: '60×80cm', material: '布面油画', frameStyle: '实木画框', price: 12800, stock: 12 },
    { size: '60×80cm', material: '布面油画', frameStyle: '无框', price: 10800, stock: 8 },
    { size: '60×80cm', material: '纸本版画', frameStyle: '实木画框', price: 4800, stock: 20 },
    { size: '60×80cm', material: '纸本版画', frameStyle: '无框', price: 3800, stock: 15 },
    { size: '80×100cm', material: '布面油画', frameStyle: '实木画框', price: 22800, stock: 5 },
    { size: '80×100cm', material: '布面油画', frameStyle: '无框', price: 19800, stock: 3 },
    { size: '80×100cm', material: '纸本版画', frameStyle: '实木画框', price: 6800, stock: 25 },
    { size: '80×100cm', material: '纸本版画', frameStyle: '无框', price: 5800, stock: 18 },
  ],
  limitedEdition: { total: 50, current: 12 },
  year: '2024',
  sales: 11,
  stock: 39,
  rating: 4.9,
  tags: ['抽象', '莫兰迪', '现代艺术'],
  artistNote:
    '这件作品诞生于一个清晨，阳光透过工作室的窗户洒在画布上，那一刻的宁静让我决定用最纯粹的色彩来记录这种感受。希望每一位看到这幅画的人，都能在忙碌的生活中找到属于自己的静谧时光。',
  createdAt: '2024-03-15',
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
const panelExpanded = ref(false)
const isFavorited = ref(false)
const statusBarHeight = ref(0)
const safeAreaBottom = ref(0)

const selectedSize = ref('60×80cm')
const selectedMaterial = ref('布面油画')
const selectedFrame = ref('实木画框')

let handleTouchStartY = 0

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

function togglePanel() {
  panelExpanded.value = !panelExpanded.value
}

function onHandleTouchStart(e: any) {
  handleTouchStartY = e.touches[0].clientY
}

function onHandleTouchMove() {}

function onHandleTouchEnd(e: any) {
  const deltaY = e.changedTouches[0].clientY - handleTouchStartY
  if (deltaY < -40 && !panelExpanded.value) {
    panelExpanded.value = true
  } else if (deltaY > 40 && panelExpanded.value) {
    panelExpanded.value = false
  }
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

onLoad((options) => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight ?? 0
  safeAreaBottom.value = systemInfo.safeArea?.bottom ? systemInfo.windowHeight - systemInfo.safeArea.bottom : 0

  if (options?.id) {
    // TODO: fetch artwork detail by id
  }
})

onShareAppMessage(() => ({
  title: `${artwork.value.title} - ${artwork.value.artistName}`,
  path: `/pages/detail/index?id=${artwork.value.id}`,
  imageUrl: artwork.value.images[0],
}))
</script>

<style lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.detail-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #0a0a0a;
}

.artwork-display {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;

  .artwork-swiper {
    width: 100%;
    height: 100%;
  }

  .artwork-image {
    width: 100%;
    height: 100%;
  }

  .swiper-indicators {
    position: absolute;
    bottom: 380rpx;
    left: 0;
    right: 0;
    @include flex-center;
    gap: 12rpx;
    z-index: 2;
    padding-bottom: 24rpx;
  }

  .indicator-dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: $radius-full;
    background-color: rgba(255, 255, 255, 0.35);
    transition: $transition-base;

    &--active {
      width: 32rpx;
      border-radius: 6rpx;
      background-color: rgba(255, 255, 255, 0.85);
    }
  }
}

.top-controls {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 30;
  @include flex-between;
  padding: 16rpx $spacing-base;
  padding-top: 16rpx;

  .back-btn {
    width: 72rpx;
    height: 72rpx;
    border-radius: $radius-full;
    background-color: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    @include flex-center;

    .back-icon {
      font-size: 44rpx;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 300;
      margin-top: -4rpx;
    }

    &:active {
      background-color: rgba(0, 0, 0, 0.5);
    }
  }

  .top-right-group {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  .image-counter {
    height: 56rpx;
    padding: 0 20rpx;
    border-radius: $radius-full;
    background-color: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    @include flex-center;

    .counter-text {
      font-size: $font-sm;
      color: rgba(255, 255, 255, 0.85);
      letter-spacing: 2rpx;
    }
  }

  .share-btn {
    width: 72rpx;
    height: 72rpx;
    border-radius: $radius-full;
    background-color: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    @include flex-center;
    overflow: hidden;
    padding: 0;

    .share-btn-inner {
      width: 100%;
      height: 100%;
      @include flex-center;
      background: transparent;
      border: none;
      padding: 0;
      margin: 0;
      line-height: 1;

      &::after {
        border: none;
      }
    }

    .share-icon {
      font-size: 32rpx;
      color: rgba(255, 255, 255, 0.9);
    }

    &:active {
      background-color: rgba(0, 0, 0, 0.5);
    }
  }
}

.info-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 110rpx;
  height: 400rpx;
  z-index: 10;
  background: rgba(250, 250, 248, 0.94);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-radius: $radius-xl $radius-xl 0 0;
  box-shadow: 0 -8rpx 40rpx rgba(0, 0, 0, 0.08);
  transition: height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &--expanded {
    height: calc(100vh - 180rpx);
  }

  .panel-handle {
    @include flex-center;
    padding: 16rpx 0 8rpx;
    cursor: pointer;

    .handle-bar {
      width: 64rpx;
      height: 8rpx;
      border-radius: $radius-full;
      background-color: $color-border;
    }
  }

  .panel-scroll {
    height: calc(100% - 48rpx);
    overflow: hidden;
  }
}

.info-basic {
  padding: 0 $spacing-lg $spacing-md;

  .artwork-title {
    display: block;
    font-size: $font-xl;
    font-weight: 600;
    color: $color-text-primary;
    font-family: 'Georgia', 'Noto Serif SC', serif;
    letter-spacing: 4rpx;
    line-height: 1.3;
  }

  .artist-row {
    display: flex;
    align-items: center;
    margin-top: $spacing-xs;
    gap: 4rpx;

    .artist-name {
      font-size: $font-base;
      color: $color-text-secondary;
      letter-spacing: 2rpx;
    }

    .artist-arrow {
      font-size: $font-lg;
      color: $color-accent;
      font-weight: 300;
    }

    &:active {
      opacity: 0.7;
    }
  }

  .price-row {
    display: flex;
    align-items: center;
    margin-top: $spacing-sm;
    gap: $spacing-sm;

    .price-tag {
      display: flex;
      align-items: baseline;
      gap: 4rpx;

      .price-symbol {
        font-size: $font-base;
        color: $color-accent;
        font-weight: 500;
      }

      .price-value {
        font-size: $font-xl;
        color: $color-accent;
        font-weight: 700;
        letter-spacing: 2rpx;
      }

      .price-original {
        font-size: $font-sm;
        color: $color-text-tertiary;
        text-decoration: line-through;
        margin-left: 8rpx;
      }
    }

    .limited-badge {
      height: 40rpx;
      padding: 0 16rpx;
      border-radius: $radius-full;
      background-color: rgba(139, 115, 85, 0.1);
      @include flex-center;

      .limited-text {
        font-size: $font-xs;
        color: $color-accent;
        letter-spacing: 2rpx;
        font-weight: 500;
      }
    }
  }

  .quick-specs {
    display: flex;
    align-items: center;
    margin-top: $spacing-sm;
    gap: 0;
    flex-wrap: wrap;

    .spec-chip-sm {
      display: flex;
      align-items: center;
      gap: 6rpx;
      padding: 0 $spacing-sm;

      .spec-chip-label {
        font-size: $font-xs;
        color: $color-text-tertiary;
      }

      .spec-chip-value {
        font-size: $font-xs;
        color: $color-text-secondary;
        letter-spacing: 1rpx;
      }
    }

    .spec-dot {
      width: 6rpx;
      height: 6rpx;
      border-radius: $radius-full;
      background-color: $color-border;
    }
  }
}

.info-expanded {
  padding: 0 $spacing-lg;

  .section-block {
    padding: $spacing-md 0;
    border-top: 1rpx solid $color-border;

    &:first-child {
      border-top: none;
    }
  }

  .section-label {
    display: block;
    font-size: $font-md;
    font-weight: 600;
    color: $color-text-primary;
    letter-spacing: 2rpx;
    margin-bottom: $spacing-sm;
  }

  .section-title {
    @include section-title;
    margin-bottom: $spacing-base;
  }

  .description-text {
    display: block;
    font-size: $font-base;
    color: $color-text-secondary;
    line-height: 1.8;
    letter-spacing: 1rpx;
  }

  .artist-note-block {
    padding: $spacing-base;
    background-color: $color-bg-secondary;
    border-radius: $radius-lg;
    border-left: 6rpx solid $color-accent-light;
  }

  .artist-note-text {
    font-size: $font-base;
    color: $color-text-secondary;
    line-height: 1.8;
    font-style: italic;
    letter-spacing: 1rpx;
  }
}

.spec-selector {
  .spec-group {
    margin-bottom: $spacing-base;

    &:last-child {
      margin-bottom: 0;
    }

    .spec-group-title {
      display: block;
      font-size: $font-sm;
      color: $color-text-tertiary;
      margin-bottom: $spacing-xs;
      letter-spacing: 2rpx;
    }

    .spec-chips {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-sm;
    }

    .spec-chip {
      padding: $spacing-sm $spacing-base;
      background-color: $color-bg-secondary;
      border-radius: $radius-base;
      border: 2rpx solid transparent;
      transition: $transition-base;

      &:active {
        transform: scale(0.96);
      }

      &--active {
        border-color: $color-accent;
        background-color: rgba(139, 115, 85, 0.08);

        .spec-chip-text {
          color: $color-accent;
          font-weight: 500;
        }
      }

      &--disabled {
        opacity: 0.35;
        pointer-events: none;
      }

      .spec-chip-text {
        font-size: $font-sm;
        color: $color-text-secondary;
        letter-spacing: 1rpx;
      }
    }
  }
}

.spec-status {
  margin-top: $spacing-sm;

  .stock-text {
    font-size: $font-sm;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;

    &--low {
      color: $color-error;
    }
  }

  .unavailable-text {
    font-size: $font-sm;
    color: $color-error;
    letter-spacing: 1rpx;
  }
}

.ar-buttons {
  display: flex;
  gap: $spacing-base;

  .ar-btn {
    flex: 1;
    @include flex-center;
    gap: $spacing-xs;
    height: 96rpx;
    border-radius: $radius-lg;
    background-color: $color-bg-secondary;
    border: 2rpx solid $color-border;
    transition: $transition-base;

    &:active {
      transform: scale(0.97);
      opacity: 0.85;
    }

    .ar-icon {
      font-size: $font-lg;
      color: $color-text-secondary;
    }

    .ar-text {
      font-size: $font-base;
      color: $color-text-primary;
      letter-spacing: 2rpx;
      font-weight: 500;
    }

    &--accent {
      background-color: $color-accent;
      border-color: $color-accent;

      .ar-icon {
        color: $color-white;
      }

      .ar-text {
        color: $color-white;
      }

      &:active {
        opacity: 0.85;
      }
    }
  }
}

.artist-works-scroll {
  margin: 0 -#{$spacing-lg};
  padding-left: $spacing-lg;

  .artist-works-list {
    display: flex;
    gap: $spacing-base;
    padding-right: $spacing-lg;
  }

  .artist-work-card {
    flex-shrink: 0;
    width: 240rpx;
    @include gallery-card;

    .work-thumb {
      width: 240rpx;
      height: 300rpx;
    }

    .work-info {
      padding: $spacing-sm;

      .work-title {
        display: block;
        font-size: $font-sm;
        color: $color-text-primary;
        @include ellipsis;
        letter-spacing: 1rpx;
      }

      .work-price {
        display: block;
        font-size: $font-xs;
        color: $color-accent;
        margin-top: 4rpx;
        font-weight: 500;
      }
    }

    &:active {
      box-shadow: $shadow-base;
      transform: scale(0.97);
    }
  }
}

.related-grid {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-base;

  .related-card {
    width: calc(50% - #{$spacing-base} / 2);
    @include gallery-card;

    .related-thumb {
      width: 100%;
      height: 280rpx;
    }

    .related-info {
      padding: $spacing-sm;

      .related-title {
        display: block;
        font-size: $font-sm;
        color: $color-text-primary;
        @include ellipsis;
        letter-spacing: 1rpx;
      }

      .related-artist {
        display: block;
        font-size: $font-xs;
        color: $color-text-tertiary;
        margin-top: 4rpx;
      }

      .related-price {
        display: block;
        font-size: $font-sm;
        color: $color-accent;
        margin-top: 6rpx;
        font-weight: 500;
      }
    }

    &:active {
      box-shadow: $shadow-base;
      transform: scale(0.97);
    }
  }
}

.bottom-spacer {
  height: 160rpx;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-base;
  background: rgba(250, 250, 248, 0.96);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-top: 1rpx solid $color-border;
  gap: $spacing-sm;

  .fav-btn {
    width: 88rpx;
    height: 88rpx;
    @include flex-center;
    border-radius: $radius-full;
    border: 2rpx solid $color-border;
    background-color: $color-white;
    transition: $transition-base;

    .fav-icon {
      font-size: 40rpx;
      color: $color-text-tertiary;
      transition: $transition-base;
    }

    .fav-icon--active {
      color: $morandi-rose;
    }

    &:active {
      transform: scale(0.92);
    }
  }

  .action-btns {
    flex: 1;
    display: flex;
    gap: $spacing-sm;
  }

  .cart-btn {
    flex: 1;
    height: 88rpx;
    @include flex-center;
    border-radius: $radius-base;
    border: 2rpx solid $morandi-beige;
    background-color: transparent;
    transition: $transition-base;

    .cart-btn-text {
      font-size: $font-base;
      color: $morandi-beige;
      letter-spacing: 2rpx;
      font-weight: 500;
    }

    &:active {
      background-color: rgba(196, 182, 166, 0.1);
      transform: scale(0.97);
    }
  }

  .buy-btn {
    flex: 1;
    height: 88rpx;
    @include flex-center;
    border-radius: $radius-base;
    background-color: $color-accent;
    transition: $transition-base;

    .buy-btn-text {
      font-size: $font-base;
      color: $color-white;
      letter-spacing: 2rpx;
      font-weight: 500;
    }

    &:active {
      opacity: 0.85;
      transform: scale(0.97);
    }
  }
}
</style>
