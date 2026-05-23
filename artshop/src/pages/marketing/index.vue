<template>
  <view class="marketing-page">
    <view class="marketing-header safe-area-top">
      <view class="header-top">
        <text class="header-title">营销中心</text>
        <text class="header-subtitle">Marketing</text>
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

    <scroll-view class="marketing-content" scroll-y enhanced :bounces="false">
      <view class="tab-panel" v-if="activeTab === 0">
        <view class="section-title-group">
          <view class="accent-line" />
          <text class="section-title">可领取优惠券</text>
        </view>
        <view class="coupon-list">
          <view
            v-for="coupon in availableCoupons"
            :key="coupon.id"
            class="coupon-card"
            :class="'coupon-card--' + coupon.type"
          >
            <view class="coupon-card__left">
              <text class="coupon-card__symbol">¥</text>
              <text class="coupon-card__amount">{{ coupon.amount }}</text>
            </view>
            <view class="coupon-card__divider" />
            <view class="coupon-card__right">
              <view class="coupon-card__type-tag" :class="'coupon-card__type-tag--' + coupon.type">
                <text class="coupon-card__type-text">{{ coupon.typeLabel }}</text>
              </view>
              <text class="coupon-card__condition">{{ coupon.condition }}</text>
              <text class="coupon-card__date">{{ coupon.validDate }}</text>
              <view
                class="coupon-card__btn"
                :class="{ 'coupon-card__btn--claimed': coupon.claimed }"
                @tap="onClaimCoupon(coupon)"
              >
                <text class="coupon-card__btn-text">{{ coupon.claimed ? '已领取' : '领取' }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="section-title-group" style="margin-top: 40rpx;">
          <view class="accent-line" />
          <text class="section-title">已使用 / 已过期</text>
        </view>
        <view class="coupon-list">
          <view
            v-for="coupon in expiredCoupons"
            :key="coupon.id"
            class="coupon-card coupon-card--expired"
          >
            <view class="coupon-card__left">
              <text class="coupon-card__symbol">¥</text>
              <text class="coupon-card__amount">{{ coupon.amount }}</text>
            </view>
            <view class="coupon-card__divider" />
            <view class="coupon-card__right">
              <view class="coupon-card__type-tag coupon-card__type-tag--expired">
                <text class="coupon-card__type-text">{{ coupon.typeLabel }}</text>
              </view>
              <text class="coupon-card__condition">{{ coupon.condition }}</text>
              <text class="coupon-card__date">{{ coupon.validDate }}</text>
              <view class="coupon-card__status-tag">
                <text class="coupon-card__status-text">{{ coupon.statusLabel }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="tab-panel" v-if="activeTab === 1">
        <view class="member-card">
          <view class="member-card__bg" />
          <view class="member-card__content">
            <view class="member-card__top">
              <view class="member-card__level-row">
                <text class="member-card__level-icon">✦</text>
                <text class="member-card__level-name">{{ membership.levelName }}</text>
              </view>
              <text class="member-card__points">{{ membership.points }} 积分</text>
            </view>
            <view class="member-card__since">
              <text class="member-card__since-text">会员始于 {{ membership.sinceDate }}</text>
            </view>
            <view class="member-card__progress-section">
              <view class="member-card__progress-info">
                <text class="member-card__progress-label">距下一等级</text>
                <text class="member-card__progress-value">{{ membership.points }} / {{ membership.nextLevelPoints }}</text>
              </view>
              <view class="member-card__progress-bar">
                <view
                  class="member-card__progress-fill"
                  :style="{ width: progressPercent + '%' }"
                />
              </view>
            </view>
          </view>
        </view>

        <view class="section-title-group" style="margin-top: 40rpx;">
          <view class="accent-line" />
          <text class="section-title">会员权益对比</text>
        </view>
        <view class="benefits-table">
          <view class="benefits-table__header">
            <view class="benefits-table__header-cell benefits-table__header-cell--label" />
            <view
              v-for="tier in memberTiers"
              :key="tier.key"
              class="benefits-table__header-cell"
              :class="{ 'benefits-table__header-cell--current': tier.key === levelKeyMap[membership.level] }"
            >
              <text class="benefits-table__tier-name">{{ tier.name }}</text>
            </view>
          </view>
          <view
            v-for="(benefit, idx) in allBenefits"
            :key="idx"
            class="benefits-table__row"
          >
            <view class="benefits-table__cell benefits-table__cell--label">
              <text class="benefits-table__benefit-name">{{ benefit.name }}</text>
            </view>
            <view
              v-for="tier in memberTiers"
              :key="tier.key"
              class="benefits-table__cell"
              :class="{ 'benefits-table__cell--current': tier.key === levelKeyMap[membership.level] }"
            >
              <text v-if="benefit[tier.key]" class="benefits-table__check">✓</text>
              <text v-else class="benefits-table__dash">—</text>
            </view>
          </view>
        </view>

        <view class="upgrade-btn" @tap="onUpgrade">
          <text class="upgrade-btn__text">{{ membership.level < 2 ? '升级会员' : '续费会员' }}</text>
        </view>

        <view class="section-title-group" style="margin-top: 40rpx;">
          <view class="accent-line" />
          <text class="section-title">积分记录</text>
        </view>
        <view class="points-history">
          <view
            v-for="record in pointsHistory"
            :key="record.id"
            class="points-record"
          >
            <view class="points-record__info">
              <text class="points-record__desc">{{ record.description }}</text>
              <text class="points-record__date">{{ record.date }}</text>
            </view>
            <text
              class="points-record__change"
              :class="{ 'points-record__change--plus': record.change > 0 }"
            >
              {{ record.change > 0 ? '+' : '' }}{{ record.change }}
            </text>
          </view>
        </view>
      </view>

      <view class="tab-panel" v-if="activeTab === 2">
        <view class="section-title-group">
          <view class="accent-line" />
          <text class="section-title">即将开售</text>
          <view class="notify-bell" @tap="onToggleNotify">
            <text class="notify-bell__icon">{{ notifyOn ? '🔔' : '🔕' }}</text>
          </view>
        </view>
        <view class="limited-list">
          <view
            v-for="item in upcomingItems"
            :key="item.id"
            class="limited-card"
          >
            <view class="limited-card__cover-wrap">
              <image class="limited-card__cover" :src="item.cover" mode="aspectFill" lazy-load />
              <view class="limited-card__countdown-overlay">
                <text class="limited-card__countdown-label">距开售</text>
                <view class="limited-card__countdown-timer">
                  <text class="limited-card__countdown-num">{{ item.countdown.days }}</text>
                  <text class="limited-card__countdown-unit">天</text>
                  <text class="limited-card__countdown-num">{{ item.countdown.hours }}</text>
                  <text class="limited-card__countdown-unit">时</text>
                  <text class="limited-card__countdown-num">{{ item.countdown.mins }}</text>
                  <text class="limited-card__countdown-unit">分</text>
                </view>
              </view>
              <view class="limited-card__edition-tag">
                <text class="limited-card__edition-text">限量 {{ item.totalCount }} 份</text>
              </view>
            </view>
            <view class="limited-card__body">
              <text class="limited-card__title">{{ item.title }}</text>
              <text class="limited-card__artist">{{ item.artist }}</text>
              <view class="limited-card__footer">
                <text class="limited-card__price">¥{{ item.price }}</text>
                <view class="limited-card__reserve-btn" @tap="onReserve(item)">
                  <text class="limited-card__reserve-text">预约</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="section-title-group" style="margin-top: 40rpx;">
          <view class="accent-line" />
          <text class="section-title">正在发售</text>
        </view>
        <view class="limited-list">
          <view
            v-for="item in onSaleItems"
            :key="item.id"
            class="limited-card"
          >
            <view class="limited-card__cover-wrap">
              <image class="limited-card__cover" :src="item.cover" mode="aspectFill" lazy-load />
              <view class="limited-card__remaining">
                <text class="limited-card__remaining-text">剩余 {{ item.remaining }} / {{ item.totalCount }}</text>
              </view>
              <view v-if="item.remaining === 0" class="limited-card__sold-out-overlay">
                <text class="limited-card__sold-out-text">售罄</text>
              </view>
              <view class="limited-card__edition-tag">
                <text class="limited-card__edition-text">限量 {{ item.totalCount }} 份</text>
              </view>
            </view>
            <view class="limited-card__body">
              <text class="limited-card__title">{{ item.title }}</text>
              <text class="limited-card__artist">{{ item.artist }}</text>
              <view class="limited-card__footer">
                <text class="limited-card__price">¥{{ item.price }}</text>
                <view
                  v-if="item.remaining > 0"
                  class="limited-card__buy-btn"
                  @tap="onBuyNow(item)"
                >
                  <text class="limited-card__buy-text">立即购买</text>
                </view>
                <view v-else class="limited-card__buy-btn limited-card__buy-btn--disabled">
                  <text class="limited-card__buy-text">已售罄</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="tab-panel" v-if="activeTab === 3">
        <view class="share-poster">
          <view class="share-poster__card">
            <image class="share-poster__img" :src="sharePoster.cover" mode="aspectFill" />
            <view class="share-poster__overlay" />
            <view class="share-poster__content">
              <text class="share-poster__title">{{ sharePoster.title }}</text>
              <text class="share-poster__subtitle">{{ sharePoster.subtitle }}</text>
              <view class="share-poster__qrcode">
                <text class="share-poster__qrcode-text">扫码探索更多艺术</text>
              </view>
            </view>
          </view>
        </view>

        <view class="share-actions">
          <view class="share-btn share-btn--wechat" @tap="onShareWechat">
            <text class="share-btn__icon">💬</text>
            <text class="share-btn__label">微信好友</text>
          </view>
          <view class="share-btn share-btn--moments" @tap="onShareMoments">
            <text class="share-btn__icon">📷</text>
            <text class="share-btn__label">朋友圈</text>
          </view>
          <view class="share-btn share-btn--copy" @tap="onCopyLink">
            <text class="share-btn__icon">🔗</text>
            <text class="share-btn__label">复制链接</text>
          </view>
        </view>

        <view class="section-title-group" style="margin-top: 40rpx;">
          <view class="accent-line" />
          <text class="section-title">奖励规则</text>
        </view>
        <view class="reward-rules">
          <view
            v-for="rule in rewardRules"
            :key="rule.id"
            class="reward-rule"
          >
            <view class="reward-rule__icon-wrap">
              <text class="reward-rule__icon">{{ rule.icon }}</text>
            </view>
            <view class="reward-rule__info">
              <text class="reward-rule__desc">{{ rule.description }}</text>
              <text class="reward-rule__condition">{{ rule.condition }}</text>
            </view>
            <view class="reward-rule__points">
              <text class="reward-rule__points-value">+{{ rule.points }}</text>
              <text class="reward-rule__points-unit">积分</text>
            </view>
          </view>
        </view>

        <view class="section-title-group" style="margin-top: 40rpx;">
          <view class="accent-line" />
          <text class="section-title">我的分享记录</text>
        </view>
        <view class="share-history">
          <view
            v-for="record in shareHistory"
            :key="record.id"
            class="share-record"
          >
            <view class="share-record__info">
              <text class="share-record__desc">{{ record.description }}</text>
              <text class="share-record__date">{{ record.date }}</text>
            </view>
            <text class="share-record__points">+{{ record.points }} 积分</text>
          </view>
        </view>

        <view class="rewards-summary">
          <view class="rewards-summary__item">
            <text class="rewards-summary__value">{{ rewardsSummary.totalShares }}</text>
            <text class="rewards-summary__label">累计分享</text>
          </view>
          <view class="rewards-summary__divider" />
          <view class="rewards-summary__item">
            <text class="rewards-summary__value">{{ rewardsSummary.totalClicks }}</text>
            <text class="rewards-summary__label">访问人数</text>
          </view>
          <view class="rewards-summary__divider" />
          <view class="rewards-summary__item">
            <text class="rewards-summary__value">{{ rewardsSummary.totalPoints }}</text>
            <text class="rewards-summary__label">获得积分</text>
          </view>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const tabs = ['优惠券', '会员中心', '限量发售', '分享奖励']
const activeTab = ref(0)
const notifyOn = ref(true)

const indicatorWidth = 130
const indicatorLeft = computed(() => {
  const segmentWidth = 750 / tabs.length
  return activeTab.value * segmentWidth + (segmentWidth - indicatorWidth) / 2
})

const imgBase = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt='

interface Coupon {
  id: string
  type: string
  typeLabel: string
  amount: number
  condition: string
  validDate: string
  claimed: boolean
  statusLabel?: string
}

const availableCoupons = ref<Coupon[]>([
  {
    id: 'c1',
    type: 'deduction',
    typeLabel: '满减券',
    amount: 50,
    condition: '满299元可用',
    validDate: '2026.06.01 - 2026.06.30',
    claimed: false,
  },
  {
    id: 'c2',
    type: 'newproduct',
    typeLabel: '新品券',
    amount: 30,
    condition: '新品专区满199元可用',
    validDate: '2026.05.20 - 2026.07.20',
    claimed: false,
  },
  {
    id: 'c3',
    type: 'custom',
    typeLabel: '定制券',
    amount: 100,
    condition: '艺术品定制满999元可用',
    validDate: '2026.05.15 - 2026.08.15',
    claimed: false,
  },
  {
    id: 'c4',
    type: 'free',
    typeLabel: '无门槛券',
    amount: 15,
    condition: '无门槛',
    validDate: '2026.05.25 - 2026.06.25',
    claimed: false,
  },
  {
    id: 'c5',
    type: 'deduction',
    typeLabel: '满减券',
    amount: 80,
    condition: '满499元可用',
    validDate: '2026.06.01 - 2026.06.30',
    claimed: true,
  },
])

const expiredCoupons = ref<Coupon[]>([
  {
    id: 'c6',
    type: 'deduction',
    typeLabel: '满减券',
    amount: 30,
    condition: '满199元可用',
    validDate: '2026.03.01 - 2026.04.30',
    claimed: true,
    statusLabel: '已使用',
  },
  {
    id: 'c7',
    type: 'newproduct',
    typeLabel: '新品券',
    amount: 20,
    condition: '新品专区满99元可用',
    validDate: '2026.02.01 - 2026.03.31',
    claimed: true,
    statusLabel: '已过期',
  },
])

const membership = ref<{
  level: number
  levelName: string
  points: number
  nextLevelPoints: number
  sinceDate: string
}>({
  level: 1,
  levelName: '艺术会员',
  points: 2680,
  nextLevelPoints: 5000,
  sinceDate: '2024-03-15',
})

const progressPercent = computed(() => {
  return Math.min((membership.value.points / membership.value.nextLevelPoints) * 100, 100)
})

const levelKeyMap: Record<number, string> = {
  0: 'normal',
  1: 'art',
  2: 'collection',
}

const memberTiers: { key: string; name: string }[] = [
  { key: 'normal', name: '普通会员' },
  { key: 'art', name: '艺术会员' },
  { key: 'collection', name: '典藏会员' },
]

const allBenefits = [
  { name: '基础折扣', normal: true, art: true, collection: true },
  { name: '生日礼', normal: true, art: true, collection: true },
  { name: '9折优惠', normal: false, art: true, collection: true },
  { name: '免运费', normal: false, art: true, collection: true },
  { name: '专属新品', normal: false, art: true, collection: true },
  { name: '优先购', normal: false, art: true, collection: true },
  { name: '8.5折优惠', normal: false, art: false, collection: true },
  { name: '专属顾问', normal: false, art: false, collection: true },
  { name: '限量优先', normal: false, art: false, collection: true },
  { name: '年度礼盒', normal: false, art: false, collection: true },
]

const pointsHistory = ref([
  { id: 'ph1', description: '购买《晨雾中的远山》', date: '2026-05-20', change: 268 },
  { id: 'ph2', description: '每日签到', date: '2026-05-20', change: 10 },
  { id: 'ph3', description: '分享作品至朋友圈', date: '2026-05-19', change: 10 },
  { id: 'ph4', description: '好友下单奖励', date: '2026-05-18', change: 50 },
  { id: 'ph5', description: '兑换优惠券', date: '2026-05-17', change: -200 },
  { id: 'ph6', description: '购买《静谧之物》版画', date: '2026-05-15', change: 189 },
  { id: 'ph7', description: '每日签到', date: '2026-05-15', change: 10 },
])

interface LimitedItem {
  id: string
  title: string
  artist: string
  cover: string
  price: number
  totalCount: number
  remaining: number
  countdown?: { days: number; hours: number; mins: number }
  reserved?: boolean
}

const upcomingItems = ref<LimitedItem[]>([
  {
    id: 'l1',
    title: '「山间晨雾」限量版画',
    artist: '林清远',
    cover: imgBase + 'mountain+mist+limited+edition+art+print+chinese+ink+landscape&image_size=landscape_16_9',
    price: 1280,
    totalCount: 50,
    remaining: 50,
    countdown: { days: 3, hours: 12, mins: 45 },
    reserved: false,
  },
  {
    id: 'l2',
    title: '「城市夜曲」签名微喷',
    artist: '陈默',
    cover: imgBase + 'city+night+limited+print+photography+neon+urban&image_size=landscape_16_9',
    price: 860,
    totalCount: 100,
    remaining: 100,
    countdown: { days: 5, hours: 8, mins: 30 },
    reserved: false,
  },
])

const onSaleItems = ref<LimitedItem[]>([
  {
    id: 'l3',
    title: '「花间集·春」限量丝网版画',
    artist: '苏婉清',
    cover: imgBase + 'flower+spring+silkscreen+print+limited+edition+botanical+art&image_size=landscape_16_9',
    price: 1680,
    totalCount: 30,
    remaining: 8,
  },
  {
    id: 'l4',
    title: '「海的记忆II」艺术家签名版',
    artist: '周明远',
    cover: imgBase + 'ocean+memory+abstract+art+print+signed+limited+blue&image_size=landscape_16_9',
    price: 2200,
    totalCount: 20,
    remaining: 3,
  },
  {
    id: 'l5',
    title: '「静物·陶与花」原作微喷',
    artist: '苏婉清',
    cover: imgBase + 'still+life+ceramic+vase+flowers+morandi+giclee+print&image_size=landscape_16_9',
    price: 980,
    totalCount: 50,
    remaining: 0,
  },
])

const sharePoster = ref({
  cover: imgBase + 'art+gallery+exhibition+poster+morandi+elegant+minimalist&image_size=portrait_4_3',
  title: 'ArtShop · 发现艺术之美',
  subtitle: '每一件作品，都是一次灵魂的对话',
})

const rewardRules = ref([
  {
    id: 'r1',
    icon: '🎨',
    description: '分享作品',
    condition: '每日上限3次',
    points: 10,
  },
  {
    id: 'r2',
    icon: '🏪',
    description: '分享店铺',
    condition: '每日上限1次',
    points: 5,
  },
  {
    id: 'r3',
    icon: '🤝',
    description: '好友下单',
    condition: '好友首次购买成功',
    points: 50,
  },
])

const shareHistory = ref([
  { id: 'sh1', description: '分享《晨雾中的远山》至微信', date: '2026-05-20', points: 10 },
  { id: 'sh2', description: '分享店铺至朋友圈', date: '2026-05-19', points: 5 },
  { id: 'sh3', description: '好友购买《城市光影》版画', date: '2026-05-18', points: 50 },
  { id: 'sh4', description: '分享《静谧之物》至微信', date: '2026-05-17', points: 10 },
  { id: 'sh5', description: '分享店铺至微信', date: '2026-05-16', points: 5 },
])

const rewardsSummary = ref({
  totalShares: 28,
  totalClicks: 156,
  totalPoints: 380,
})

function onTabChange(idx: number) {
  activeTab.value = idx
}

function onClaimCoupon(coupon: Coupon) {
  if (coupon.claimed) return
  coupon.claimed = true
  uni.showToast({ title: '领取成功', icon: 'success' })
}

function onUpgrade() {
  uni.showToast({ title: '升级功能开发中', icon: 'none' })
}

function onToggleNotify() {
  notifyOn.value = !notifyOn.value
  uni.showToast({
    title: notifyOn.value ? '已开启开售提醒' : '已关闭开售提醒',
    icon: 'none',
  })
}

function onReserve(item: LimitedItem) {
  if (item.reserved) return
  item.reserved = true
  uni.showToast({ title: '预约成功', icon: 'success' })
}

function onBuyNow(item: LimitedItem) {
  uni.navigateTo({ url: `/pages/detail/index?id=${item.id}&limited=true` })
}

function onShareWechat() {
  uni.showToast({ title: '分享至微信好友', icon: 'none' })
}

function onShareMoments() {
  uni.showToast({ title: '分享至朋友圈', icon: 'none' })
}

function onCopyLink() {
  uni.setClipboardData({
    data: 'https://artshop.app/share/abc123',
    success: () => {
      uni.showToast({ title: '链接已复制', icon: 'success' })
    },
  })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.marketing-page {
  min-height: 100vh;
  background-color: $color-bg;
  display: flex;
  flex-direction: column;
}

.marketing-header {
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

.marketing-content {
  flex: 1;
  height: 0;
}

.tab-panel {
  padding: $spacing-base;
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-base;
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

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.coupon-card {
  display: flex;
  background-color: $color-white;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
  transition: $transition-base;
  position: relative;

  &:active {
    transform: scale(0.98);
  }

  &--deduction {
    .coupon-card__left {
      background: linear-gradient(135deg, $morandi-beige 0%, darken($morandi-beige, 5%) 100%);
    }
    .coupon-card__type-tag--deduction {
      background-color: rgba($morandi-beige, 0.15);
      .coupon-card__type-text {
        color: $morandi-beige;
      }
    }
  }

  &--newproduct {
    .coupon-card__left {
      background: linear-gradient(135deg, $morandi-rose 0%, darken($morandi-rose, 5%) 100%);
    }
    .coupon-card__type-tag--newproduct {
      background-color: rgba($morandi-rose, 0.15);
      .coupon-card__type-text {
        color: $morandi-rose;
      }
    }
  }

  &--custom {
    .coupon-card__left {
      background: linear-gradient(135deg, $morandi-purple 0%, darken($morandi-purple, 5%) 100%);
    }
    .coupon-card__type-tag--custom {
      background-color: rgba($morandi-purple, 0.15);
      .coupon-card__type-text {
        color: $morandi-purple;
      }
    }
  }

  &--free {
    .coupon-card__left {
      background: linear-gradient(135deg, $morandi-green 0%, darken($morandi-green, 5%) 100%);
    }
    .coupon-card__type-tag--free {
      background-color: rgba($morandi-green, 0.15);
      .coupon-card__type-text {
        color: $morandi-green;
      }
    }
  }

  &--expired {
    opacity: 0.55;

    .coupon-card__left {
      background: linear-gradient(135deg, $color-border 0%, darken($color-border, 5%) 100%);
    }
    .coupon-card__symbol,
    .coupon-card__amount {
      color: $color-text-tertiary;
    }
  }

  &__left {
    width: 200rpx;
    @include flex-center;
    flex-direction: column;
    flex-shrink: 0;
    padding: $spacing-base;
    position: relative;
  }

  &__symbol {
    font-size: $font-base;
    color: $color-white;
    font-weight: 500;
    letter-spacing: 1rpx;
  }

  &__amount {
    font-size: $font-xxl;
    color: $color-white;
    font-weight: 700;
    letter-spacing: 2rpx;
    line-height: 1.1;
  }

  &__divider {
    width: 2rpx;
    align-self: stretch;
    margin: 24rpx 0;
    border-left: 2rpx dashed $color-border;
  }

  &__right {
    flex: 1;
    padding: $spacing-base $spacing-md;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: $spacing-xs;
    position: relative;
  }

  &__type-tag {
    align-self: flex-start;
    padding: 2rpx 16rpx;
    border-radius: $radius-full;

    &--expired {
      background-color: $color-bg-secondary;
      .coupon-card__type-text {
        color: $color-text-tertiary;
      }
    }
  }

  &__type-text {
    font-size: $font-xs;
    letter-spacing: 1rpx;
  }

  &__condition {
    font-size: $font-sm;
    color: $color-text-primary;
    font-weight: 500;
    letter-spacing: 1rpx;
  }

  &__date {
    font-size: $font-xs;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;
  }

  &__btn {
    position: absolute;
    right: $spacing-md;
    top: 50%;
    transform: translateY(-50%);
    padding: $spacing-xs $spacing-md;
    background-color: $color-accent;
    border-radius: $radius-full;
    transition: $transition-base;

    &:active {
      opacity: 0.85;
      transform: translateY(-50%) scale(0.95);
    }

    &--claimed {
      background-color: $color-bg-secondary;

      .coupon-card__btn-text {
        color: $color-text-tertiary;
      }
    }
  }

  &__btn-text {
    font-size: $font-sm;
    color: $color-white;
    letter-spacing: 2rpx;
  }

  &__status-tag {
    position: absolute;
    right: $spacing-md;
    top: 50%;
    transform: translateY(-50%);
    padding: $spacing-xs $spacing-md;
    background-color: $color-bg-secondary;
    border-radius: $radius-full;
  }

  &__status-text {
    font-size: $font-sm;
    color: $color-text-tertiary;
    letter-spacing: 2rpx;
  }
}

.member-card {
  position: relative;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-base;

  &__bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, $morandi-blue 0%, $morandi-purple 50%, $morandi-rose 100%);
  }

  &__content {
    position: relative;
    z-index: 1;
    padding: $spacing-md;
  }

  &__top {
    @include flex-between;
  }

  &__level-row {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
  }

  &__level-icon {
    font-size: $font-md;
    color: $color-warning;
  }

  &__level-name {
    font-size: $font-lg;
    font-weight: 600;
    color: $color-white;
    letter-spacing: 2rpx;
  }

  &__points {
    font-size: $font-base;
    color: rgba(255, 255, 255, 0.85);
    letter-spacing: 1rpx;
  }

  &__since {
    margin-top: $spacing-sm;
  }

  &__since-text {
    font-size: $font-xs;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 1rpx;
  }

  &__progress-section {
    margin-top: $spacing-base;
    padding-top: $spacing-base;
    border-top: 1rpx solid rgba(255, 255, 255, 0.2);
  }

  &__progress-info {
    @include flex-between;
    margin-bottom: $spacing-sm;
  }

  &__progress-label {
    font-size: $font-xs;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 1rpx;
  }

  &__progress-value {
    font-size: $font-xs;
    color: rgba(255, 255, 255, 0.85);
    letter-spacing: 1rpx;
  }

  &__progress-bar {
    height: 8rpx;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: $radius-full;
    overflow: hidden;
  }

  &__progress-fill {
    height: 100%;
    background-color: $color-warning;
    border-radius: $radius-full;
    transition: width 0.6s ease;
  }
}

.benefits-table {
  background-color: $color-white;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;

  &__header {
    display: flex;
    background-color: $color-bg-secondary;
  }

  &__header-cell {
    flex: 1;
    @include flex-center;
    padding: $spacing-base $spacing-xs;
    text-align: center;

    &--label {
      flex: 1.2;
    }

    &--current {
      background-color: rgba($color-accent, 0.06);
    }
  }

  &__tier-name {
    font-size: $font-sm;
    font-weight: 600;
    color: $color-text-primary;
    letter-spacing: 1rpx;
  }

  &__row {
    display: flex;
    border-top: 1rpx solid $color-border;
  }

  &__cell {
    flex: 1;
    @include flex-center;
    padding: $spacing-sm $spacing-xs;

    &--label {
      flex: 1.2;
      justify-content: flex-start;
      padding-left: $spacing-base;
    }

    &--current {
      background-color: rgba($color-accent, 0.04);
    }
  }

  &__benefit-name {
    font-size: $font-sm;
    color: $color-text-secondary;
    letter-spacing: 1rpx;
  }

  &__check {
    font-size: $font-md;
    color: $morandi-green;
    font-weight: 600;
  }

  &__dash {
    font-size: $font-sm;
    color: $color-text-placeholder;
  }
}

.upgrade-btn {
  margin-top: $spacing-base;
  padding: $spacing-base 0;
  @include flex-center;
  background-color: $color-accent;
  border-radius: $radius-lg;
  transition: $transition-base;

  &:active {
    opacity: 0.85;
    transform: scale(0.98);
  }

  &__text {
    font-size: $font-md;
    color: $color-white;
    font-weight: 500;
    letter-spacing: 3rpx;
  }
}

.points-history {
  background-color: $color-white;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.points-record {
  @include flex-between;
  padding: $spacing-base $spacing-md;
  border-bottom: 1rpx solid $color-border;

  &:last-child {
    border-bottom: none;
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  &__desc {
    font-size: $font-sm;
    color: $color-text-primary;
    letter-spacing: 1rpx;
  }

  &__date {
    font-size: $font-xs;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;
  }

  &__change {
    font-size: $font-md;
    color: $color-text-tertiary;
    font-weight: 500;
    letter-spacing: 1rpx;

    &--plus {
      color: $morandi-green;
    }
  }
}

.notify-bell {
  margin-left: auto;
  padding: $spacing-xs;
  transition: $transition-base;

  &:active {
    transform: scale(0.9);
  }

  &__icon {
    font-size: $font-lg;
  }
}

.limited-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.limited-card {
  background-color: $color-white;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
  transition: $transition-base;

  &:active {
    transform: scale(0.98);
  }

  &__cover-wrap {
    position: relative;
    height: 360rpx;
  }

  &__cover {
    width: 100%;
    height: 100%;
  }

  &__countdown-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: $spacing-sm $spacing-md;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.55) 0%, transparent 100%);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__countdown-label {
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.85);
    letter-spacing: 2rpx;
  }

  &__countdown-timer {
    display: flex;
    align-items: center;
    gap: 4rpx;
  }

  &__countdown-num {
    font-size: $font-sm;
    color: $color-white;
    font-weight: 600;
    background-color: rgba(0, 0, 0, 0.4);
    padding: 2rpx 8rpx;
    border-radius: $radius-sm;
    letter-spacing: 1rpx;
  }

  &__countdown-unit {
    font-size: $font-xs;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 1rpx;
  }

  &__remaining {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: $spacing-sm $spacing-md;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.55) 0%, transparent 100%);
  }

  &__remaining-text {
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.85);
    letter-spacing: 1rpx;
  }

  &__sold-out-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.45);
    @include flex-center;
  }

  &__sold-out-text {
    font-size: $font-xl;
    color: $color-white;
    font-weight: 700;
    letter-spacing: 8rpx;
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
  }

  &__edition-tag {
    position: absolute;
    top: $spacing-sm;
    right: $spacing-sm;
    padding: 4rpx 16rpx;
    background-color: rgba($color-accent, 0.85);
    border-radius: $radius-full;
  }

  &__edition-text {
    font-size: $font-xs;
    color: $color-white;
    letter-spacing: 1rpx;
  }

  &__body {
    padding: $spacing-base $spacing-md;
  }

  &__title {
    font-family: 'Georgia', 'Noto Serif SC', serif;
    font-size: $font-md;
    color: $color-text-primary;
    font-weight: 600;
    letter-spacing: 2rpx;
  }

  &__artist {
    font-size: $font-sm;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;
    margin-top: 4rpx;
  }

  &__footer {
    @include flex-between;
    margin-top: $spacing-base;
  }

  &__price {
    font-size: $font-lg;
    color: $color-accent;
    font-weight: 600;
    letter-spacing: 1rpx;
  }

  &__reserve-btn {
    padding: $spacing-xs $spacing-md;
    background-color: $morandi-beige;
    border-radius: $radius-full;
    transition: $transition-base;

    &:active {
      opacity: 0.85;
      transform: scale(0.95);
    }
  }

  &__reserve-text {
    font-size: $font-sm;
    color: $color-white;
    letter-spacing: 2rpx;
  }

  &__buy-btn {
    padding: $spacing-xs $spacing-md;
    background-color: $color-accent;
    border-radius: $radius-full;
    transition: $transition-base;

    &:active {
      opacity: 0.85;
      transform: scale(0.95);
    }

    &--disabled {
      background-color: $color-bg-secondary;

      .limited-card__buy-text {
        color: $color-text-tertiary;
      }
    }
  }

  &__buy-text {
    font-size: $font-sm;
    color: $color-white;
    letter-spacing: 2rpx;
  }
}

.share-poster {
  margin-bottom: $spacing-base;

  &__card {
    position: relative;
    height: 600rpx;
    border-radius: $radius-lg;
    overflow: hidden;
    box-shadow: $shadow-base;
  }

  &__img {
    width: 100%;
    height: 100%;
  }

  &__overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 100%);
  }

  &__content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: $spacing-lg $spacing-md $spacing-md;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__title {
    font-family: 'Georgia', 'Noto Serif SC', serif;
    font-size: $font-lg;
    color: $color-white;
    font-weight: 600;
    letter-spacing: 3rpx;
  }

  &__subtitle {
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.75);
    letter-spacing: 2rpx;
    margin-top: $spacing-xs;
  }

  &__qrcode {
    margin-top: $spacing-md;
    padding: $spacing-xs $spacing-md;
    background-color: rgba(255, 255, 255, 0.15);
    border-radius: $radius-full;
    border: 1rpx solid rgba(255, 255, 255, 0.25);
  }

  &__qrcode-text {
    font-size: $font-xs;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 2rpx;
  }
}

.share-actions {
  display: flex;
  gap: $spacing-base;
  margin-bottom: $spacing-md;
}

.share-btn {
  flex: 1;
  @include flex-center;
  flex-direction: column;
  gap: $spacing-xs;
  padding: $spacing-base 0;
  background-color: $color-white;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  transition: $transition-base;

  &:active {
    transform: scale(0.96);
    box-shadow: $shadow-base;
  }

  &__icon {
    font-size: 44rpx;
  }

  &__label {
    font-size: $font-sm;
    color: $color-text-secondary;
    letter-spacing: 1rpx;
  }
}

.reward-rules {
  background-color: $color-white;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.reward-rule {
  @include flex-between;
  padding: $spacing-base $spacing-md;
  border-bottom: 1rpx solid $color-border;

  &:last-child {
    border-bottom: none;
  }

  &__icon-wrap {
    width: 64rpx;
    height: 64rpx;
    @include flex-center;
    background-color: $color-bg-secondary;
    border-radius: $radius-base;
    flex-shrink: 0;
  }

  &__icon {
    font-size: 32rpx;
  }

  &__info {
    flex: 1;
    margin-left: $spacing-base;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  &__desc {
    font-size: $font-base;
    color: $color-text-primary;
    font-weight: 500;
    letter-spacing: 1rpx;
  }

  &__condition {
    font-size: $font-xs;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;
  }

  &__points {
    @include flex-center;
    flex-direction: column;
    flex-shrink: 0;
  }

  &__points-value {
    font-size: $font-md;
    color: $color-accent;
    font-weight: 600;
    letter-spacing: 1rpx;
  }

  &__points-unit {
    font-size: $font-xs;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;
  }
}

.share-history {
  background-color: $color-white;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.share-record {
  @include flex-between;
  padding: $spacing-base $spacing-md;
  border-bottom: 1rpx solid $color-border;

  &:last-child {
    border-bottom: none;
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  &__desc {
    font-size: $font-sm;
    color: $color-text-primary;
    letter-spacing: 1rpx;
  }

  &__date {
    font-size: $font-xs;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;
  }

  &__points {
    font-size: $font-sm;
    color: $morandi-green;
    font-weight: 500;
    letter-spacing: 1rpx;
    flex-shrink: 0;
  }
}

.rewards-summary {
  margin-top: $spacing-base;
  display: flex;
  align-items: center;
  background-color: $color-white;
  border-radius: $radius-lg;
  padding: $spacing-lg $spacing-md;
  box-shadow: $shadow-sm;

  &__item {
    flex: 1;
    @include flex-center;
    flex-direction: column;
    gap: $spacing-xs;
  }

  &__value {
    font-size: $font-xl;
    color: $color-accent;
    font-weight: 700;
    letter-spacing: 1rpx;
  }

  &__label {
    font-size: $font-xs;
    color: $color-text-tertiary;
    letter-spacing: 2rpx;
  }

  &__divider {
    width: 2rpx;
    height: 60rpx;
    background-color: $color-border;
  }
}

.bottom-spacer {
  height: 160rpx;
}
</style>
