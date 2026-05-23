<template>
  <view class="ar-preview-page">
    <view class="top-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="mode-toggle">
        <view
          :class="['toggle-option', { 'toggle-option--active': mode === '3d' }]"
          @click="mode = '3d'"
        >
          <text class="toggle-option__text">3D预览</text>
        </view>
        <view
          :class="['toggle-option', { 'toggle-option--active': mode === 'ar' }]"
          @click="mode = 'ar'"
        >
          <text class="toggle-option__text">AR摆放</text>
        </view>
      </view>
      <view class="top-action" @click="handleTopAction">
        <text class="top-action__icon">{{ mode === '3d' ? '↻' : '📷' }}</text>
      </view>
    </view>

    <view class="preview-area">
      <view class="preview-3d" v-show="mode === '3d'">
        <ArtworkViewer3D
          ref="viewer3dRef"
          :imageUrl="artworkImage"
          :material="selectedMaterial"
          :frameStyle="selectedFrame"
          :width="artworkWidth"
          :height="artworkHeight"
        />
      </view>

      <view class="preview-ar" v-show="mode === 'ar'">
        <view class="ar-camera-bg">
          <view class="ar-camera-placeholder">
            <text class="ar-camera-icon">📷</text>
            <text class="ar-camera-label">摄像头画面</text>
            <text class="ar-camera-note">完整AR需原生插件支持</text>
          </view>
        </view>
        <view
          class="ar-frame-overlay"
          :style="{
            transform: `translate(${arFrame.x}px, ${arFrame.y}px) scale(${arFrame.scale})`,
            width: arFrameWidth + 'rpx',
            height: arFrameHeight + 'rpx',
          }"
          @touchstart="onArTouchStart"
          @touchmove="onArTouchMove"
          @touchend="onArTouchEnd"
        >
          <view class="ar-frame-border" :class="[`ar-frame-border--${frameClass}`]">
            <image
              :src="artworkImage"
              mode="aspectFill"
              class="ar-frame-image"
            />
          </view>
          <view class="ar-frame-shadow" />
        </view>
        <view class="ar-size-guide">
          <text class="ar-size-text">{{ selectedSize }} · {{ selectedMaterial }}</text>
        </view>
        <view class="ar-controls">
          <view class="ar-scale-group">
            <view class="ar-scale-btn" @click="scaleArFrame(-0.1)">
              <text class="ar-scale-icon">−</text>
            </view>
            <text class="ar-scale-value">{{ Math.round(arFrame.scale * 100) }}%</text>
            <view class="ar-scale-btn" @click="scaleArFrame(0.1)">
              <text class="ar-scale-icon">+</text>
            </view>
          </view>
          <view class="ar-place-btn" @click="placeArFrame">
            <text class="ar-place-text">放置</text>
          </view>
          <view class="ar-screenshot-btn" @click="takeScreenshot">
            <text class="ar-screenshot-icon">📷</text>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-panel" :style="{ paddingBottom: safeAreaBottom + 'px' }">
      <scroll-view class="panel-scroll" scroll-x :show-scrollbar="false">
        <view class="spec-section">
          <text class="spec-label">材质</text>
          <view class="spec-chips">
            <view
              v-for="m in materials"
              :key="m"
              :class="['spec-chip', { 'spec-chip--active': selectedMaterial === m }]"
              @click="selectedMaterial = m"
            >
              <text class="spec-chip-text">{{ m }}</text>
            </view>
          </view>
        </view>

        <view class="spec-divider" />

        <view class="spec-section">
          <text class="spec-label">装裱</text>
          <view class="spec-chips">
            <view
              v-for="f in frames"
              :key="f"
              :class="['spec-chip', { 'spec-chip--active': selectedFrame === f }]"
              @click="selectedFrame = f"
            >
              <view
                v-if="f !== '无框'"
                class="frame-color-dot"
                :style="{ backgroundColor: frameDotColor(f) }"
              />
              <text class="spec-chip-text">{{ f }}</text>
            </view>
          </view>
        </view>

        <view class="spec-divider" />

        <view class="spec-section">
          <text class="spec-label">尺寸</text>
          <view class="spec-chips">
            <view
              v-for="s in sizes"
              :key="s.label"
              :class="['spec-chip', { 'spec-chip--active': selectedSize === s.label }]"
              @click="selectSize(s)"
            >
              <text class="spec-chip-text">{{ s.label }}</text>
            </view>
          </view>
        </view>
      </scroll-view>

      <view class="cart-row">
        <view class="price-display">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ formatPrice(currentPrice) }}</text>
        </view>
        <view class="cart-btn" @click="addToCart">
          <text class="cart-btn-text">加入购物车</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import ArtworkViewer3D from '@/components/ArtworkViewer3D.vue'

const IMG_BASE = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt='
const IMG_SIZE = '&image_size=portrait_4_3'

const mode = ref<'3d' | 'ar'>('3d')
const statusBarHeight = ref(0)
const safeAreaBottom = ref(0)

const viewer3dRef = ref<InstanceType<typeof ArtworkViewer3D> | null>(null)

const materials = ['艺术微喷', '亚克力三明治']
const frames = ['黑框', '白框', '铁灰框', '无框']
const sizes = [
  { label: '40×50cm', w: 40, h: 50, price: 3800 },
  { label: '60×80cm', w: 60, h: 80, price: 5800 },
  { label: '80×100cm', w: 80, h: 100, price: 8800 },
  { label: '100×120cm', w: 100, h: 120, price: 12800 },
]

const selectedMaterial = ref('艺术微喷')
const selectedFrame = ref('黑框')
const selectedSize = ref('60×80cm')

const artworkImage = ref(
  IMG_BASE + encodeURIComponent('abstract oil painting morandi colors serene composition gallery quality') + IMG_SIZE
)

const currentSizeObj = computed(() => sizes.find((s) => s.label === selectedSize.value) || sizes[1])
const artworkWidth = computed(() => currentSizeObj.value.w)
const artworkHeight = computed(() => currentSizeObj.value.h)
const currentPrice = computed(() => {
  let base = currentSizeObj.value.price
  if (selectedMaterial.value === '亚克力三明治') base += 800
  if (selectedFrame.value !== '无框') base += 400
  return base
})

const arFrame = ref({ x: 0, y: 0, scale: 1 })
let arTouchStart = { x: 0, y: 0, frameX: 0, frameY: 0 }

const arFrameWidth = computed(() => {
  const ratio = artworkWidth.value / artworkHeight.value
  return Math.round(400 * ratio)
})
const arFrameHeight = computed(() => 400)

const frameClass = computed(() => {
  const map: Record<string, string> = {
    '黑框': 'black',
    '白框': 'white',
    '铁灰框': 'iron',
    '无框': 'none',
  }
  return map[selectedFrame.value] || 'black'
})

function formatPrice(price: number): string {
  return price.toLocaleString('zh-CN')
}

function frameDotColor(frame: string): string {
  const map: Record<string, string> = {
    '黑框': '#2c2c2c',
    '白框': '#f0ece8',
    '铁灰框': '#7a7a7a',
  }
  return map[frame] || '#999'
}

function selectSize(s: { label: string; w: number; h: number }) {
  selectedSize.value = s.label
}

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function handleTopAction() {
  if (mode.value === '3d') {
    viewer3dRef.value?.resetView()
  } else {
    takeScreenshot()
  }
}

function onArTouchStart(e: any) {
  const touch = e.touches[0]
  arTouchStart = {
    x: touch.clientX,
    y: touch.clientY,
    frameX: arFrame.value.x,
    frameY: arFrame.value.y,
  }
}

function onArTouchMove(e: any) {
  const touch = e.touches[0]
  const dx = touch.clientX - arTouchStart.x
  const dy = touch.clientY - arTouchStart.y
  arFrame.value.x = arTouchStart.frameX + dx
  arFrame.value.y = arTouchStart.frameY + dy
}

function onArTouchEnd() {}

function scaleArFrame(delta: number) {
  const next = Math.round((arFrame.value.scale + delta) * 10) / 10
  arFrame.value.scale = Math.max(0.3, Math.min(2.0, next))
}

function placeArFrame() {
  uni.showToast({ title: '已放置', icon: 'none', duration: 1000 })
}

function takeScreenshot() {
  uni.showToast({ title: '截图已保存（模拟）', icon: 'none', duration: 1500 })
}

function addToCart() {
  uni.showToast({ title: '已加入购物车', icon: 'none', duration: 1000 })
}

onLoad((options) => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight ?? 0
  safeAreaBottom.value = systemInfo.safeArea?.bottom
    ? systemInfo.windowHeight - systemInfo.safeArea.bottom
    : 0

  if (options?.mode === 'ar') {
    mode.value = 'ar'
  }
  if (options?.id) {
    // TODO: fetch artwork data by id
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.ar-preview-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #f0ece8;
  display: flex;
  flex-direction: column;
}

.top-bar {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  padding: 12rpx $spacing-base;
  background-color: rgba(240, 236, 232, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1rpx solid $color-border;

  .back-btn {
    width: 64rpx;
    height: 64rpx;
    border-radius: $radius-full;
    background-color: rgba(44, 44, 44, 0.06);
    @include flex-center;
    transition: $transition-base;

    &:active {
      background-color: rgba(44, 44, 44, 0.12);
      transform: scale(0.94);
    }

    .back-icon {
      font-size: 40rpx;
      color: $color-text-primary;
      font-weight: 300;
      margin-top: -2rpx;
    }
  }

  .mode-toggle {
    flex: 1;
    display: flex;
    justify-content: center;
    gap: 0;
    margin: 0 $spacing-base;
  }

  .toggle-option {
    padding: $spacing-xs $spacing-md;
    border-radius: $radius-full;
    transition: $transition-base;
    cursor: pointer;

    &__text {
      font-size: $font-base;
      color: $color-text-tertiary;
      letter-spacing: 2rpx;
      font-weight: 400;
    }

    &--active {
      background-color: $color-accent;

      .toggle-option__text {
        color: $color-white;
        font-weight: 500;
      }
    }

    &:active {
      transform: scale(0.96);
    }
  }

  .top-action {
    width: 64rpx;
    height: 64rpx;
    border-radius: $radius-full;
    background-color: rgba(44, 44, 44, 0.06);
    @include flex-center;
    transition: $transition-base;

    &:active {
      background-color: rgba(44, 44, 44, 0.12);
      transform: scale(0.94);
    }

    &__icon {
      font-size: 32rpx;
    }
  }
}

.preview-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.preview-3d {
  width: 100%;
  height: 100%;
}

.preview-ar {
  width: 100%;
  height: 100%;
  position: relative;
}

.ar-camera-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 50%, #1a1a1a 100%);
}

.ar-camera-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  @include flex-center;
  flex-direction: column;
  gap: $spacing-sm;

  .ar-camera-icon {
    font-size: 80rpx;
    opacity: 0.4;
  }

  .ar-camera-label {
    font-size: $font-md;
    color: rgba(255, 255, 255, 0.5);
    letter-spacing: 2rpx;
  }

  .ar-camera-note {
    font-size: $font-xs;
    color: rgba(255, 255, 255, 0.3);
    letter-spacing: 1rpx;
    margin-top: $spacing-xs;
  }
}

.ar-frame-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: -200rpx;
  margin-top: -200rpx;
  z-index: 5;
  transition: none;
}

.ar-frame-border {
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.4);

  &--black {
    border: 8rpx solid #2c2c2c;
  }

  &--white {
    border: 8rpx solid #f0ece8;
  }

  &--iron {
    border: 8rpx solid #7a7a7a;
  }

  &--none {
    border: none;
    border-radius: 4rpx;
  }

  .ar-frame-image {
    width: 100%;
    height: 100%;
  }
}

.ar-frame-shadow {
  position: absolute;
  bottom: -20rpx;
  left: 10%;
  right: 10%;
  height: 30rpx;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.25) 0%, transparent 70%);
  pointer-events: none;
}

.ar-size-guide {
  position: absolute;
  bottom: 200rpx;
  left: 0;
  right: 0;
  @include flex-center;
  z-index: 6;

  .ar-size-text {
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 2rpx;
    padding: $spacing-xs $spacing-base;
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: $radius-full;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
}

.ar-controls {
  position: absolute;
  bottom: 40rpx;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-md;
  z-index: 6;
  padding: 0 $spacing-lg;

  .ar-scale-group {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: $radius-full;
    padding: $spacing-xs $spacing-sm;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .ar-scale-btn {
    width: 56rpx;
    height: 56rpx;
    border-radius: $radius-full;
    background-color: rgba(255, 255, 255, 0.15);
    @include flex-center;
    transition: $transition-base;

    &:active {
      background-color: rgba(255, 255, 255, 0.3);
    }

    .ar-scale-icon {
      font-size: $font-lg;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 300;
    }
  }

  .ar-scale-value {
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.8);
    min-width: 72rpx;
    text-align: center;
    letter-spacing: 1rpx;
  }

  .ar-place-btn {
    height: 72rpx;
    padding: 0 $spacing-lg;
    border-radius: $radius-full;
    background-color: $color-accent;
    @include flex-center;
    transition: $transition-base;

    &:active {
      opacity: 0.85;
      transform: scale(0.96);
    }

    .ar-place-text {
      font-size: $font-base;
      color: $color-white;
      letter-spacing: 3rpx;
      font-weight: 500;
    }
  }

  .ar-screenshot-btn {
    width: 72rpx;
    height: 72rpx;
    border-radius: $radius-full;
    background-color: rgba(0, 0, 0, 0.5);
    @include flex-center;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition: $transition-base;

    &:active {
      background-color: rgba(0, 0, 0, 0.7);
      transform: scale(0.94);
    }

    .ar-screenshot-icon {
      font-size: 36rpx;
    }
  }
}

.bottom-panel {
  position: relative;
  z-index: 10;
  background-color: rgba(250, 250, 248, 0.96);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-top: 1rpx solid $color-border;

  .panel-scroll {
    white-space: nowrap;
    padding: $spacing-sm $spacing-base;
  }

  .spec-section {
    display: inline-flex;
    align-items: center;
    gap: $spacing-sm;
    padding-right: $spacing-md;

    .spec-label {
      font-size: $font-xs;
      color: $color-text-tertiary;
      letter-spacing: 2rpx;
      flex-shrink: 0;
    }

    .spec-chips {
      display: inline-flex;
      gap: $spacing-xs;
    }

    .spec-chip {
      display: inline-flex;
      align-items: center;
      gap: 6rpx;
      padding: $spacing-xs $spacing-sm;
      background-color: $color-bg-secondary;
      border: 2rpx solid transparent;
      border-radius: $radius-base;
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

      .spec-chip-text {
        font-size: $font-xs;
        color: $color-text-secondary;
        letter-spacing: 1rpx;
        white-space: nowrap;
      }

      .frame-color-dot {
        width: 16rpx;
        height: 16rpx;
        border-radius: $radius-full;
        border: 1rpx solid rgba(0, 0, 0, 0.1);
        flex-shrink: 0;
      }
    }
  }

  .spec-divider {
    display: inline-block;
    width: 1rpx;
    height: 40rpx;
    background-color: $color-border;
    margin: 0 $spacing-xs;
    vertical-align: middle;
  }
}

.cart-row {
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-base;
  gap: $spacing-base;

  .price-display {
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
  }

  .cart-btn {
    flex: 1;
    height: 80rpx;
    @include flex-center;
    border-radius: $radius-base;
    background-color: $color-accent;
    transition: $transition-base;

    &:active {
      opacity: 0.85;
      transform: scale(0.97);
    }

    .cart-btn-text {
      font-size: $font-base;
      color: $color-white;
      letter-spacing: 3rpx;
      font-weight: 500;
    }
  }
}
</style>
