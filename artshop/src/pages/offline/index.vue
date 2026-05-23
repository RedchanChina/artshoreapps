<template>
  <view class="offline-page">
    <view class="offline-header safe-area-top">
      <view class="header-top">
        <text class="header-title">线下体验</text>
        <text class="header-subtitle">Offline</text>
      </view>
      <view class="tab-segmented">
        <view
          v-for="(tab, idx) in tabs"
          :key="idx"
          class="tab-segmented__item"
          :class="{ 'tab-segmented__item--active': activeTab === idx }"
          @tap="onTabChange(idx)"
        >
          <text class="tab-segmented__text">{{ tab }}</text>
        </view>
        <view
          class="tab-segmented__indicator"
          :style="{ left: indicatorLeft + 'rpx', width: indicatorWidth + 'rpx' }"
        />
      </view>
    </view>

    <scroll-view
      class="offline-content"
      scroll-y
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      enhanced
      :bounces="false"
    >
      <view class="tab-panel" v-if="activeTab === 0">
        <view
          v-for="store in stores"
          :key="store.id"
          class="store-card"
        >
          <image class="store-card__cover" :src="store.cover" mode="aspectFill" lazy-load />
          <view class="store-card__body">
            <text class="store-card__name">{{ store.name }}</text>
            <view class="store-card__info-row">
              <text class="store-card__label">地址</text>
              <text class="store-card__value">{{ store.address }}</text>
            </view>
            <view class="store-card__info-row">
              <text class="store-card__label">营业</text>
              <text class="store-card__value">{{ store.businessHours }}</text>
            </view>
            <view class="store-card__info-row">
              <text class="store-card__label">电话</text>
              <text class="store-card__value">{{ store.phone }}</text>
            </view>
            <view class="store-card__actions">
              <view class="store-card__btn store-card__btn--outline" @tap="onNavigate(store)">
                <text class="store-card__btn-icon">◎</text>
                <text class="store-card__btn-text">导航</text>
              </view>
              <view class="store-card__btn store-card__btn--accent" @tap="onReserve(store)">
                <text class="store-card__btn-text">预约到店</text>
              </view>
            </view>
          </view>
          <view class="store-photos">
            <view class="store-photos__header">
              <view class="section-title-group">
                <view class="accent-line" />
                <text class="section-title">实景照片</text>
              </view>
            </view>
            <scroll-view scroll-x :show-scrollbar="false" enhanced>
              <view class="store-photos__list">
                <image
                  v-for="(img, imgIdx) in store.images"
                  :key="imgIdx"
                  class="store-photos__item"
                  :src="img"
                  mode="aspectFill"
                  lazy-load
                  @tap="onPreviewImage(img, store.images)"
                />
              </view>
            </scroll-view>
          </view>
        </view>

        <view class="map-section">
          <view class="section-title-group" style="margin-bottom: 24rpx;">
            <view class="accent-line" />
            <text class="section-title">门店地图</text>
          </view>
          <view class="map-placeholder" @tap="onOpenMap">
            <image
              class="map-placeholder__bg"
              :src="mapPlaceholderImg"
              mode="aspectFill"
              lazy-load
            />
            <view class="map-placeholder__overlay" />
            <view class="map-placeholder__content">
              <text class="map-placeholder__icon">◎</text>
              <text class="map-placeholder__text">点击打开地图查看门店位置</text>
            </view>
          </view>
        </view>
      </view>

      <view class="tab-panel" v-if="activeTab === 1">
        <view class="section-title-group" style="margin-bottom: 24rpx;">
          <view class="accent-line" />
          <text class="section-title">即将开展</text>
        </view>
        <view class="exhibition-list">
          <view
            v-for="exhibition in upcomingExhibitions"
            :key="exhibition.id"
            class="exhibition-card"
            @tap="onExhibitionTap(exhibition)"
          >
            <view class="exhibition-card__cover-wrap">
              <image class="exhibition-card__cover" :src="exhibition.coverImage" mode="aspectFill" lazy-load />
              <view class="exhibition-card__overlay" />
              <view class="exhibition-card__cover-info">
                <text class="exhibition-card__cover-title">{{ exhibition.title }}</text>
                <text class="exhibition-card__cover-date">{{ exhibition.startDate }} — {{ exhibition.endDate }}</text>
              </view>
            </view>
            <view class="exhibition-card__body">
              <view class="exhibition-card__detail">
                <view class="exhibition-card__row">
                  <text class="exhibition-card__label">地点</text>
                  <text class="exhibition-card__value">{{ exhibition.location }}</text>
                </view>
                <view class="exhibition-card__row">
                  <text class="exhibition-card__label">票价</text>
                  <text class="exhibition-card__price" v-if="exhibition.ticketPrice > 0">¥{{ exhibition.ticketPrice }}</text>
                  <text class="exhibition-card__free" v-else>免费</text>
                </view>
              </view>
              <view class="exhibition-card__actions">
                <view
                  class="exhibition-card__btn exhibition-card__btn--outline"
                  @tap.stop="onExhibitionRegister(exhibition)"
                >
                  <text class="exhibition-card__btn-text">报名</text>
                </view>
                <view
                  class="exhibition-card__btn exhibition-card__btn--accent"
                  v-if="exhibition.ticketPrice > 0"
                  @tap.stop="onExhibitionBuyTicket(exhibition)"
                >
                  <text class="exhibition-card__btn-text">购票</text>
                </view>
              </view>
            </view>
            <view class="exhibition-card__checkin" @tap.stop="onCheckIn(exhibition)">
              <text class="exhibition-card__checkin-icon">📷</text>
              <text class="exhibition-card__checkin-text">现场打卡</text>
            </view>
          </view>
        </view>

        <view class="section-title-group" style="margin-bottom: 24rpx; margin-top: 48rpx;">
          <view class="accent-line" />
          <text class="section-title">往期展览</text>
        </view>
        <view class="exhibition-list">
          <view
            v-for="exhibition in pastExhibitions"
            :key="exhibition.id"
            class="exhibition-card exhibition-card--past"
          >
            <view class="exhibition-card__cover-wrap">
              <image class="exhibition-card__cover" :src="exhibition.coverImage" mode="aspectFill" lazy-load />
              <view class="exhibition-card__past-mask" />
              <view class="exhibition-card__past-tag">
                <text class="exhibition-card__past-tag-text">已结束</text>
              </view>
            </view>
            <view class="exhibition-card__body exhibition-card__body--past">
              <text class="exhibition-card__name--past">{{ exhibition.title }}</text>
              <text class="exhibition-card__date--past">{{ exhibition.startDate }} — {{ exhibition.endDate }}</text>
              <text class="exhibition-card__location--past">{{ exhibition.location }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="tab-panel" v-if="activeTab === 2">
        <view class="pickup-guide">
          <view class="pickup-guide__title">到店自提流程</view>
          <view class="pickup-guide__steps">
            <view class="pickup-step">
              <view class="pickup-step__number">
                <text class="pickup-step__number-text">1</text>
              </view>
              <text class="pickup-step__text">线上下单</text>
              <text class="pickup-step__sub">选择心仪的艺术品</text>
            </view>
            <view class="pickup-step__arrow">
              <text class="pickup-step__arrow-text">›</text>
            </view>
            <view class="pickup-step">
              <view class="pickup-step__number">
                <text class="pickup-step__number-text">2</text>
              </view>
              <text class="pickup-step__text">选择自提门店</text>
              <text class="pickup-step__sub">指定取货地点</text>
            </view>
            <view class="pickup-step__arrow">
              <text class="pickup-step__arrow-text">›</text>
            </view>
            <view class="pickup-step">
              <view class="pickup-step__number">
                <text class="pickup-step__number-text">3</text>
              </view>
              <text class="pickup-step__text">到店取货</text>
              <text class="pickup-step__sub">出示取货码即可</text>
            </view>
          </view>
        </view>

        <view class="section-title-group" style="margin-bottom: 24rpx; margin-top: 48rpx;">
          <view class="accent-line" />
          <text class="section-title">可自提门店</text>
        </view>
        <view class="pickup-stores">
          <view
            v-for="store in pickupStores"
            :key="store.id"
            class="pickup-store-card"
          >
            <view class="pickup-store-card__info">
              <text class="pickup-store-card__name">{{ store.name }}</text>
              <text class="pickup-store-card__address">{{ store.address }}</text>
              <text class="pickup-store-card__hours">{{ store.businessHours }}</text>
            </view>
            <view class="pickup-store-card__badge">
              <text class="pickup-store-card__badge-text">支持自提</text>
            </view>
          </view>
        </view>

        <view class="section-title-group" style="margin-bottom: 24rpx; margin-top: 48rpx;">
          <view class="accent-line" />
          <text class="section-title">我的自提订单</text>
        </view>
        <view class="pickup-orders">
          <view
            v-for="order in pickupOrders"
            :key="order.id"
            class="pickup-order-card"
          >
            <view class="pickup-order-card__header">
              <text class="pickup-order-card__order-no">订单号：{{ order.orderNo }}</text>
              <view class="pickup-order-card__status" :class="'pickup-order-card__status--' + order.status">
                <text class="pickup-order-card__status-text">{{ order.status === 'pending' ? '待取货' : '已取货' }}</text>
              </view>
            </view>
            <view class="pickup-order-card__body">
              <image class="pickup-order-card__artwork-img" :src="order.artworkImage" mode="aspectFill" lazy-load />
              <view class="pickup-order-card__detail">
                <text class="pickup-order-card__artwork-name">{{ order.artworkName }}</text>
                <text class="pickup-order-card__store">{{ order.storeName }}</text>
                <view class="pickup-order-card__free-badge" v-if="order.status === 'pending'">
                  <text class="pickup-order-card__free-badge-text">免运费</text>
                </view>
              </view>
            </view>
            <view class="pickup-order-card__qr" v-if="order.status === 'pending'" @tap="onShowQRCode(order)">
              <view class="pickup-order-card__qr-placeholder">
                <text class="pickup-order-card__qr-icon">⬜</text>
                <text class="pickup-order-card__qr-text">取货码</text>
              </view>
            </view>
          </view>
          <view class="empty-pickup" v-if="pickupOrders.length === 0">
            <text class="empty-pickup__icon">📦</text>
            <text class="empty-pickup__text">暂无自提订单</text>
          </view>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const tabs = ['线下门店', '展览活动', '到店自提']
const activeTab = ref(0)
const isRefreshing = ref(false)

const indicatorWidth = 140
const indicatorLeft = computed(() => {
  const segmentWidth = 750 / tabs.length
  return (activeTab.value * segmentWidth + (segmentWidth - indicatorWidth) / 2)
})

const imgBase = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt='

const stores = ref([
  {
    id: 's1',
    name: 'ArtShop 上海外滩旗舰店',
    cover: imgBase + 'elegant+art+gallery+store+interior+bund+shanghai+luxury&image_size=landscape_16_9',
    address: '上海市黄浦区中山东一路18号 外滩18号 2F',
    businessHours: '10:00 - 21:00（周一至周日）',
    phone: '021-63218888',
    latitude: 31.2397,
    longitude: 121.4918,
    images: [
      imgBase + 'art+gallery+interior+white+wall+paintings+display+modern&image_size=landscape_16_9',
      imgBase + 'art+store+counter+minimalist+design+framed+prints&image_size=landscape_16_9',
      imgBase + 'gallery+viewing+room+soft+light+art+exhibition+space&image_size=landscape_16_9',
      imgBase + 'art+shop+window+display+elegant+frames+street+view&image_size=landscape_16_9',
    ],
  },
  {
    id: 's2',
    name: 'ArtShop 北京798艺术空间',
    cover: imgBase + 'modern+art+gallery+798+beijing+industrial+loft+space&image_size=landscape_16_9',
    address: '北京市朝阳区酒仙桥路798艺术区 中二街 D06-6',
    businessHours: '10:00 - 20:00（周二至周日）',
    phone: '010-59789999',
    latitude: 39.9842,
    longitude: 116.4944,
    images: [
      imgBase + '798+art+district+gallery+interior+concrete+wall+modern&image_size=landscape_16_9',
      imgBase + 'art+exhibition+space+high+ceiling+industrial+beijing&image_size=landscape_16_9',
      imgBase + 'gallery+corner+art+prints+display+minimalist+shelf&image_size=landscape_16_9',
    ],
  },
  {
    id: 's3',
    name: 'ArtShop 深圳南山概念店',
    cover: imgBase + 'contemporary+art+concept+store+shenzhen+clean+white+interior&image_size=landscape_16_9',
    address: '深圳市南山区粤海街道科苑路15号 科兴科学园 B3单元',
    businessHours: '10:00 - 21:00（周一至周日）',
    phone: '0755-86016666',
    latitude: 22.5362,
    longitude: 113.9455,
    images: [
      imgBase + 'concept+store+art+display+scandinavian+interior+white&image_size=landscape_16_9',
      imgBase + 'art+shop+minimalist+interior+nordic+style+prints+wall&image_size=landscape_16_9',
    ],
  },
])

const mapPlaceholderImg = imgBase + 'shanghai+map+aerial+view+huangpu+river+city&image_size=landscape_16_9'

const upcomingExhibitions = ref([
  {
    id: 'ex1',
    title: '静谧之物：莫兰迪色系的当代静物',
    coverImage: imgBase + 'morandi+still+life+ceramic+vase+quiet+objects+painting+exhibition&image_size=landscape_16_9',
    startDate: '2026-06-01',
    endDate: '2026-07-15',
    location: 'ArtShop 上海外滩旗舰店',
    ticketPrice: 68,
    isRegistered: false,
  },
  {
    id: 'ex2',
    title: '城市呼吸：当代摄影中的都市诗意',
    coverImage: imgBase + 'urban+photography+city+breath+contemporary+art+exhibition&image_size=landscape_16_9',
    startDate: '2026-06-15',
    endDate: '2026-08-30',
    location: 'ArtShop 北京798艺术空间',
    ticketPrice: 48,
    isRegistered: false,
  },
  {
    id: 'ex3',
    title: '东方墨韵：水墨新语群展',
    coverImage: imgBase + 'chinese+ink+wash+painting+exhibition+contemporary+eastern+art&image_size=landscape_16_9',
    startDate: '2026-07-01',
    endDate: '2026-09-01',
    location: 'ArtShop 深圳南山概念店',
    ticketPrice: 0,
    isRegistered: false,
  },
])

const pastExhibitions = ref([
  {
    id: 'ex4',
    title: '春日印象：当代水墨的东方美学',
    coverImage: imgBase + 'spring+impression+chinese+ink+art+gallery+exhibition&image_size=landscape_16_9',
    startDate: '2026-03-01',
    endDate: '2026-05-15',
    location: 'ArtShop 上海外滩旗舰店',
    ticketPrice: 58,
    isRegistered: false,
  },
])

const pickupStores = computed(() => {
  return stores.value.map((s) => ({
    id: s.id,
    name: s.name,
    address: s.address,
    businessHours: s.businessHours,
  }))
})

const pickupOrders = ref([
  {
    id: 'po1',
    orderNo: 'AS202605200001',
    artworkName: '晨雾中的远山',
    artworkImage: imgBase + 'morning+mist+mountains+landscape+photography&image_size=landscape_16_9',
    storeName: 'ArtShop 上海外滩旗舰店',
    status: 'pending',
  },
  {
    id: 'po2',
    orderNo: 'AS202605180002',
    artworkName: '静谧之物·陶与花',
    artworkImage: imgBase + 'morandi+still+life+ceramic+flower+vase+painting&image_size=landscape_16_9',
    storeName: 'ArtShop 北京798艺术空间',
    status: 'pending',
  },
  {
    id: 'po3',
    orderNo: 'AS202605100003',
    artworkName: '城市黄昏',
    artworkImage: imgBase + 'city+dusk+golden+hour+urban+photography&image_size=landscape_16_9',
    storeName: 'ArtShop 深圳南山概念店',
    status: 'picked',
  },
])

function onTabChange(idx: number) {
  activeTab.value = idx
}

function onNavigate(store: { name: string; latitude: number; longitude: number; address: string }) {
  uni.openLocation({
    latitude: store.latitude,
    longitude: store.longitude,
    name: store.name,
    address: store.address,
    fail: () => {
      uni.showToast({ title: '无法打开地图', icon: 'none' })
    },
  })
}

function onReserve(store: { name: string; id: string }) {
  uni.showToast({ title: `已预约${store.name}`, icon: 'success' })
}

function onPreviewImage(current: string, urls: string[]) {
  uni.previewImage({ current, urls })
}

function onOpenMap() {
  const firstStore = stores.value[0]
  if (firstStore) {
    onNavigate(firstStore)
  }
}

function onExhibitionTap(exhibition: { id: string }) {
  uni.navigateTo({ url: `/pages/offline/detail?id=${exhibition.id}` })
}

function onExhibitionRegister(exhibition: { id: string; title: string; isRegistered: boolean }) {
  const target = upcomingExhibitions.value.find((e) => e.id === exhibition.id)
  if (target) {
    target.isRegistered = !target.isRegistered
    uni.showToast({
      title: target.isRegistered ? '报名成功' : '已取消报名',
      icon: 'success',
    })
  }
}

function onExhibitionBuyTicket(exhibition: { id: string; title: string }) {
  uni.showToast({ title: '正在跳转购票...', icon: 'none' })
}

function onCheckIn(exhibition: { id: string; title: string }) {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera'],
    success: () => {
      uni.showToast({ title: '打卡成功！', icon: 'success' })
    },
  })
}

function onShowQRCode(order: { id: string; orderNo: string }) {
  uni.showModal({
    title: '取货码',
    content: `订单号：${order.orderNo}\n\n请向店员出示此取货码`,
    showCancel: false,
    confirmText: '我知道了',
  })
}

function onRefresh() {
  isRefreshing.value = true
  setTimeout(() => {
    isRefreshing.value = false
  }, 1000)
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.offline-page {
  min-height: 100vh;
  background-color: $color-bg;
  display: flex;
  flex-direction: column;
}

.offline-header {
  background-color: $color-white;
  padding-bottom: $spacing-sm;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-top {
  padding: $spacing-base $spacing-md $spacing-sm;
  display: flex;
  align-items: baseline;
  gap: $spacing-sm;
}

.header-title {
  font-family: 'Georgia', 'Noto Serif SC', serif;
  font-size: $font-xl;
  font-weight: 600;
  color: $color-text-primary;
  letter-spacing: 4rpx;
}

.header-subtitle {
  font-family: 'Georgia', serif;
  font-size: $font-sm;
  color: $color-text-tertiary;
  letter-spacing: 2rpx;
}

.tab-segmented {
  display: flex;
  position: relative;
  margin: 0 $spacing-md;
  background-color: $color-bg-secondary;
  border-radius: $radius-full;
  padding: 4rpx;
  height: 72rpx;

  &__item {
    flex: 1;
    @include flex-center;
    position: relative;
    z-index: 1;
    transition: $transition-base;

    &--active {
      .tab-segmented__text {
        color: $color-text-primary;
        font-weight: 600;
      }
    }
  }

  &__text {
    font-size: $font-sm;
    color: $color-text-secondary;
    letter-spacing: 1rpx;
    transition: $transition-base;
  }

  &__indicator {
    position: absolute;
    top: 4rpx;
    height: 64rpx;
    background-color: $color-white;
    border-radius: $radius-full;
    box-shadow: $shadow-sm;
    transition: left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    z-index: 0;
  }
}

.offline-content {
  flex: 1;
  height: 0;
}

.tab-panel {
  padding: $spacing-base;
}

.store-card {
  background-color: $color-white;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
  margin-bottom: $spacing-md;
  transition: $transition-base;

  &:active {
    box-shadow: $shadow-base;
  }

  &__cover {
    width: 100%;
    height: 360rpx;
  }

  &__body {
    padding: $spacing-base $spacing-md;
  }

  &__name {
    font-family: 'Georgia', 'Noto Serif SC', serif;
    font-size: $font-md;
    font-weight: 600;
    color: $color-text-primary;
    letter-spacing: 2rpx;
    margin-bottom: $spacing-sm;
    display: block;
  }

  &__info-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: $spacing-xs;
    gap: $spacing-sm;
  }

  &__label {
    font-size: $font-xs;
    color: $color-text-tertiary;
    flex-shrink: 0;
    width: 64rpx;
    letter-spacing: 1rpx;
  }

  &__value {
    font-size: $font-sm;
    color: $color-text-secondary;
    letter-spacing: 1rpx;
    line-height: 1.5;
    flex: 1;
  }

  &__actions {
    display: flex;
    gap: $spacing-sm;
    margin-top: $spacing-base;
  }

  &__btn {
    @include flex-center;
    padding: $spacing-sm $spacing-md;
    border-radius: $radius-base;
    gap: $spacing-xs;
    transition: $transition-base;

    &:active {
      opacity: 0.85;
      transform: scale(0.97);
    }

    &--outline {
      border: 2rpx solid $morandi-beige;
      background-color: transparent;
    }

    &--accent {
      background-color: $color-accent;
      flex: 1;
    }
  }

  &__btn-icon {
    font-size: $font-sm;
    color: $morandi-beige;
  }

  &__btn-text {
    font-size: $font-sm;
    color: $color-white;
    letter-spacing: 2rpx;

    .store-card__btn--outline & {
      color: $morandi-beige;
    }
  }
}

.store-photos {
  padding: 0 $spacing-md $spacing-base;

  &__header {
    margin-bottom: $spacing-sm;
  }

  &__list {
    display: inline-flex;
    gap: $spacing-sm;
    padding-right: $spacing-base;
  }

  &__item {
    width: 240rpx;
    height: 180rpx;
    border-radius: $radius-base;
    flex-shrink: 0;
  }
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
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

.map-section {
  margin-top: $spacing-base;
}

.map-placeholder {
  position: relative;
  height: 360rpx;
  border-radius: $radius-lg;
  overflow: hidden;

  &__bg {
    width: 100%;
    height: 100%;
  }

  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.1) 50%, transparent 100%);
  }

  &__content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: $spacing-md $spacing-md $spacing-base;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-xs;
  }

  &__icon {
    font-size: $font-lg;
    color: $color-white;
  }

  &__text {
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.85);
    letter-spacing: 2rpx;
  }
}

.exhibition-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.exhibition-card {
  background-color: $color-white;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
  transition: $transition-base;
  position: relative;

  &:active {
    transform: scale(0.98);
    box-shadow: $shadow-base;
  }

  &--past {
    opacity: 0.65;
  }

  &__cover-wrap {
    position: relative;
    height: 400rpx;
    overflow: hidden;
  }

  &__cover {
    width: 100%;
    height: 100%;
  }

  &__overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, transparent 100%);
  }

  &__cover-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: $spacing-md $spacing-md $spacing-base;
  }

  &__cover-title {
    font-family: 'Georgia', 'Noto Serif SC', serif;
    font-size: $font-lg;
    color: #ffffff;
    font-weight: 600;
    letter-spacing: 3rpx;
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
    display: block;
  }

  &__cover-date {
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.75);
    letter-spacing: 2rpx;
    margin-top: $spacing-xs;
    display: block;
  }

  &__past-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.3);
  }

  &__past-tag {
    position: absolute;
    top: $spacing-base;
    right: $spacing-base;
    background-color: rgba(0, 0, 0, 0.5);
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-sm;
  }

  &__past-tag-text {
    font-size: $font-xs;
    color: rgba(255, 255, 255, 0.8);
    letter-spacing: 1rpx;
  }

  &__body {
    padding: $spacing-base $spacing-md;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    &--past {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  &__detail {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
  }

  &__label {
    font-size: $font-xs;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;
  }

  &__value {
    font-size: $font-sm;
    color: $color-text-primary;
    letter-spacing: 1rpx;
  }

  &__price {
    font-size: $font-md;
    color: $color-accent;
    font-weight: 600;
    letter-spacing: 1rpx;
  }

  &__free {
    font-size: $font-sm;
    color: $morandi-green;
    font-weight: 500;
    letter-spacing: 1rpx;
  }

  &__actions {
    display: flex;
    gap: $spacing-sm;
  }

  &__btn {
    @include flex-center;
    padding: $spacing-sm $spacing-md;
    border-radius: $radius-base;
    transition: $transition-base;

    &:active {
      opacity: 0.85;
      transform: scale(0.97);
    }

    &--outline {
      border: 2rpx solid $morandi-beige;
      background-color: transparent;
    }

    &--accent {
      background-color: $color-accent;
    }
  }

  &__btn-text {
    font-size: $font-sm;
    letter-spacing: 2rpx;

    .exhibition-card__btn--outline & {
      color: $morandi-beige;
    }

    .exhibition-card__btn--accent & {
      color: $color-white;
    }
  }

  &__checkin {
    position: absolute;
    top: $spacing-base;
    right: $spacing-base;
    display: flex;
    align-items: center;
    gap: 4rpx;
    padding: $spacing-xs $spacing-sm;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: $radius-full;
    box-shadow: $shadow-sm;
    z-index: 2;
    transition: $transition-base;

    &:active {
      transform: scale(0.95);
    }
  }

  &__checkin-icon {
    font-size: $font-sm;
  }

  &__checkin-text {
    font-size: $font-xs;
    color: $color-text-secondary;
    letter-spacing: 1rpx;
  }

  &__name--past {
    font-family: 'Georgia', 'Noto Serif SC', serif;
    font-size: $font-md;
    color: $color-text-secondary;
    letter-spacing: 2rpx;
    margin-bottom: $spacing-xs;
  }

  &__date--past {
    font-size: $font-xs;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;
    margin-bottom: 4rpx;
  }

  &__location--past {
    font-size: $font-xs;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;
  }
}

.pickup-guide {
  background-color: $color-white;
  border-radius: $radius-lg;
  padding: $spacing-md;
  box-shadow: $shadow-sm;

  &__title {
    font-family: 'Georgia', 'Noto Serif SC', serif;
    font-size: $font-md;
    font-weight: 600;
    color: $color-text-primary;
    letter-spacing: 2rpx;
    text-align: center;
    margin-bottom: $spacing-md;
  }

  &__steps {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 0 $spacing-sm;
  }
}

.pickup-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;

  &__number {
    width: 64rpx;
    height: 64rpx;
    border-radius: $radius-full;
    background-color: $morandi-beige;
    @include flex-center;
    margin-bottom: $spacing-sm;
  }

  &__number-text {
    font-size: $font-md;
    color: $color-white;
    font-weight: 600;
  }

  &__text {
    font-size: $font-sm;
    color: $color-text-primary;
    font-weight: 500;
    letter-spacing: 1rpx;
    margin-bottom: 4rpx;
  }

  &__sub {
    font-size: $font-xs;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;
  }

  &__arrow {
    @include flex-center;
    padding-top: 16rpx;
    flex-shrink: 0;
    width: 48rpx;
  }

  &__arrow-text {
    font-size: $font-lg;
    color: $color-border;
  }
}

.pickup-stores {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.pickup-store-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: $color-white;
  border-radius: $radius-lg;
  padding: $spacing-base $spacing-md;
  box-shadow: $shadow-sm;

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  &__name {
    font-size: $font-base;
    color: $color-text-primary;
    font-weight: 500;
    letter-spacing: 1rpx;
  }

  &__address {
    font-size: $font-xs;
    color: $color-text-secondary;
    letter-spacing: 1rpx;
    @include ellipsis;
  }

  &__hours {
    font-size: $font-xs;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;
  }

  &__badge {
    padding: $spacing-xs $spacing-sm;
    background-color: rgba($morandi-green, 0.12);
    border-radius: $radius-sm;
    flex-shrink: 0;
    margin-left: $spacing-sm;
  }

  &__badge-text {
    font-size: $font-xs;
    color: $morandi-green;
    letter-spacing: 1rpx;
    font-weight: 500;
  }
}

.pickup-orders {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.pickup-order-card {
  background-color: $color-white;
  border-radius: $radius-lg;
  padding: $spacing-base $spacing-md;
  box-shadow: $shadow-sm;

  &__header {
    @include flex-between;
    margin-bottom: $spacing-sm;
  }

  &__order-no {
    font-size: $font-xs;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;
  }

  &__status {
    padding: 4rpx $spacing-sm;
    border-radius: $radius-sm;

    &--pending {
      background-color: rgba($color-warning, 0.12);
    }

    &--picked {
      background-color: rgba($morandi-green, 0.12);
    }
  }

  &__status-text {
    font-size: $font-xs;
    letter-spacing: 1rpx;

    .pickup-order-card__status--pending & {
      color: $color-warning;
    }

    .pickup-order-card__status--picked & {
      color: $morandi-green;
    }
  }

  &__body {
    display: flex;
    gap: $spacing-base;
    align-items: center;
  }

  &__artwork-img {
    width: 120rpx;
    height: 120rpx;
    border-radius: $radius-base;
    flex-shrink: 0;
  }

  &__detail {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  &__artwork-name {
    font-size: $font-base;
    color: $color-text-primary;
    font-weight: 500;
    letter-spacing: 1rpx;
  }

  &__store {
    font-size: $font-xs;
    color: $color-text-secondary;
    letter-spacing: 1rpx;
  }

  &__free-badge {
    display: inline-flex;
    align-self: flex-start;
    padding: 2rpx $spacing-sm;
    background-color: rgba($morandi-green, 0.12);
    border-radius: $radius-sm;
    margin-top: 4rpx;
  }

  &__free-badge-text {
    font-size: 18rpx;
    color: $morandi-green;
    letter-spacing: 1rpx;
    font-weight: 500;
  }

  &__qr {
    margin-top: $spacing-base;
    padding-top: $spacing-base;
    border-top: 1rpx solid $color-bg-secondary;
  }

  &__qr-placeholder {
    @include flex-center;
    flex-direction: column;
    gap: $spacing-xs;
    padding: $spacing-md;
    background-color: $color-bg-secondary;
    border-radius: $radius-base;
    border: 2rpx dashed $color-border;
    transition: $transition-base;

    &:active {
      background-color: $color-border;
    }
  }

  &__qr-icon {
    font-size: $font-xl;
    color: $color-text-tertiary;
  }

  &__qr-text {
    font-size: $font-sm;
    color: $color-text-secondary;
    letter-spacing: 2rpx;
  }
}

.empty-pickup {
  @include flex-center;
  flex-direction: column;
  padding: $spacing-xl 0;

  &__icon {
    font-size: 80rpx;
    margin-bottom: $spacing-base;
  }

  &__text {
    font-size: $font-base;
    color: $color-text-tertiary;
    letter-spacing: 2rpx;
  }
}

.bottom-spacer {
  height: 160rpx;
}
</style>
