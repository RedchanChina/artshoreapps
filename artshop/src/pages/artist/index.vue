<template>
  <view class="artist-page">
    <view class="artist-nav">
      <view class="nav-back" @click="goBack">
        <text class="nav-back-text">←</text>
      </view>
    </view>

    <scroll-view
      class="artist-scroll"
      scroll-y
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onPullDownRefresh"
      enhanced
      :bounces="false"
    >
      <view class="artist-header">
        <image class="artist-avatar" :src="artist.avatar" mode="aspectFill" />
        <text class="artist-name">{{ artist.name }}</text>
        <text class="artist-bio">{{ artist.bio }}</text>
        <text class="follow-link" @click="toggleFollow">{{ artist.isFollowing ? 'Following' : 'Follow →' }}</text>
      </view>

      <view class="artist-stats">
        <text class="stats-text">{{ artistWorks.length }} Works · {{ formatCount(artist.followerCount) }} Followers</text>
      </view>

      <view class="section-divider" />

      <view class="tab-bar">
        <view
          v-for="tab in tabs"
          :key="tab.value"
          class="tab-item"
          :class="{ 'tab-item--active': activeTab === tab.value }"
          @click="switchTab(tab.value)"
        >
          <text class="tab-item-text">{{ tab.label }}</text>
          <view v-if="activeTab === tab.value" class="tab-item-indicator" />
        </view>
      </view>

      <view class="tab-content">
        <view v-show="activeTab === 'works'" class="tab-panel">
          <view class="works-grid">
            <view
              v-for="item in filteredWorks"
              :key="item.id"
              class="work-card"
              @click="goToDetail(item.id)"
            >
              <view class="work-card-image-wrap">
                <image class="work-card-image" :src="item.image" mode="aspectFill" lazy-load />
              </view>
              <view class="work-card-info">
                <text class="work-card-title">{{ item.title }}</text>
                <text class="work-card-price">¥{{ formatPrice(item.price) }}</text>
              </view>
            </view>
          </view>
        </view>

        <view v-show="activeTab === 'story'" class="tab-panel">
          <view class="story-content">
            <view class="story-section">
              <text class="story-heading">Philosophy</text>
              <text class="story-paragraph">{{ storyContent.philosophy }}</text>
            </view>

            <view class="story-section">
              <text class="story-heading">Journey</text>
              <text class="story-paragraph">{{ storyContent.journey }}</text>
            </view>

            <view class="story-section">
              <text class="story-heading">Interview</text>
              <view class="interview-block">
                <view class="interview-item" v-for="(qa, index) in interviewQA" :key="index">
                  <text class="interview-question">Q: {{ qa.question }}</text>
                  <text class="interview-answer">A: {{ qa.answer }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-show="activeTab === 'exhibitions'" class="tab-panel">
          <view class="timeline">
            <view
              v-for="(item, index) in artist.exhibitions"
              :key="index"
              class="timeline-item"
            >
              <text class="timeline-year">{{ item.date }}</text>
              <text class="timeline-name">{{ item.name }}</text>
              <text class="timeline-location">{{ item.location }}</text>
            </view>
          </view>
        </view>

        <view v-show="activeTab === 'message'" class="tab-panel">
          <view class="message-area">
            <view class="message-list">
              <view
                v-for="(msg, index) in messages"
                :key="index"
                :class="['message-row', msg.from === 'artist' ? 'message-row--left' : 'message-row--right']"
              >
                <view :class="['message-bubble', msg.from === 'artist' ? 'message-bubble--left' : 'message-bubble--right']">
                  <text class="message-text">{{ msg.text }}</text>
                  <text class="message-time">{{ msg.time }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="message-input-bar" :style="{ paddingBottom: safeAreaBottom + 'px' }">
            <input
              class="message-input"
              v-model="inputText"
              placeholder="Type a message..."
              placeholder-class="message-input-placeholder"
              confirm-type="send"
              @confirm="sendMessage"
            />
            <text class="send-link" @click="sendMessage">Send →</text>
          </view>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const IMG_BASE = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt='
const IMG_SIZE = '&image_size=portrait_4_3'

const artist = ref({
  id: 'artist-001',
  name: 'Lin Mobai',
  avatar: IMG_BASE + encodeURIComponent('artist portrait photo asian man elegant studio lighting morandi tones') + IMG_SIZE,
  bio: 'Contemporary abstract artist known for merging Morandi palettes with Eastern aesthetics. Works held in multiple museum collections.',
  followerCount: 12680,
  isFollowing: false,
  representativeWorks: [
    {
      id: 'art-001',
      title: 'Serene Hours',
      image: IMG_BASE + encodeURIComponent('abstract oil painting morandi colors serene composition gallery quality') + IMG_SIZE,
    },
    {
      id: 'art-002',
      title: 'Morning Mist',
      image: IMG_BASE + encodeURIComponent('watercolor landscape misty mountains morandi tones') + IMG_SIZE,
    },
    {
      id: 'art-003',
      title: 'Between Mountains',
      image: IMG_BASE + encodeURIComponent('abstract ink painting minimalist morandi style') + IMG_SIZE,
    },
  ],
  exhibitions: [
    { name: 'Stillness · Realm — Solo Exhibition', date: '2025', location: 'Shanghai Museum of Contemporary Art' },
    { name: 'Eastern Abstraction — Group Show', date: '2024', location: 'Beijing 798 Art District' },
    { name: 'Color & Meditation — Biennale', date: '2023', location: 'Venice Biennale China Pavilion' },
    { name: 'New Ink — International Tour', date: '2022', location: 'Tokyo Mori Art Museum' },
    { name: 'After Morandi — Joint Exhibition', date: '2021', location: 'Shanghai Long Museum' },
    { name: 'Blank Space — Solo Exhibition', date: '2020', location: 'Hangzhou CAA Art Museum' },
    { name: 'Youth Power — Emerging Artists', date: '2019', location: 'Shenzhen OCAT' },
  ],
  honors: [],
  story: '',
  createdAt: '2019-06-15',
})

const storyContent = {
  philosophy: 'My work revolves around two core concepts: stillness and realm. In the clamor of contemporary life, I seek to create a spiritual space for contemplation through subtle shifts in color and restrained forms. The Morandi palette has been a profound inspiration — those low-saturation grays are not silent, but contain deep breaths. I integrate the Eastern aesthetic of "leaving blank" into abstract expression, making the void and the solid equally important.',
  journey: 'Graduated from the China Academy of Art Oil Painting Department in 2014, then studied in Bologna, Italy, where Morandi once worked. After returning, I established my studio in Hangzhou, systematically exploring the fusion of Morandi palettes and Eastern ink spirit. From figurative still life, to semi-abstract landscape imagery, to pure color meditation — each transformation deepened my self-understanding.',
}

const interviewQA = [
  {
    question: 'How do you see Morandi\'s influence on contemporary art?',
    answer: 'Morandi taught us the true meaning of "less is more." His still lifes appear simple yet contain profound reflections on time, existence, and perception. In today\'s age of information overload, this restrained expression carries even greater power.',
  },
  {
    question: 'What role does Eastern aesthetics play in your work?',
    answer: 'Eastern aesthetics is the foundation of my practice. The "leaving blank" in Chinese landscape painting is not merely a compositional technique — it is a philosophical stance acknowledging human limitation while respecting nature\'s infinity.',
  },
]

const tabs = [
  { label: 'Works', value: 'works' },
  { label: 'Story', value: 'story' },
  { label: 'Exhibitions', value: 'exhibitions' },
  { label: 'Message', value: 'message' },
]

const artistWorks = ref([
  {
    id: 'art-001',
    title: 'Serene Hours',
    image: IMG_BASE + encodeURIComponent('abstract oil painting morandi colors serene composition gallery quality') + IMG_SIZE,
    price: 12800,
    category: 'all',
    isLimited: true,
    sales: 56,
    createdAt: '2025-03-15',
  },
  {
    id: 'art-002',
    title: 'Morning Mist',
    image: IMG_BASE + encodeURIComponent('watercolor landscape misty mountains morandi tones') + IMG_SIZE,
    price: 8600,
    category: 'all',
    isLimited: false,
    sales: 120,
    createdAt: '2025-01-20',
  },
  {
    id: 'art-003',
    title: 'Between Mountains',
    image: IMG_BASE + encodeURIComponent('abstract ink painting minimalist morandi style') + IMG_SIZE,
    price: 12000,
    category: 'all',
    isLimited: true,
    sales: 28,
    createdAt: '2024-11-08',
  },
  {
    id: 'art-004',
    title: 'Contemplation',
    image: IMG_BASE + encodeURIComponent('oil portrait contemplative morandi tones figure') + IMG_SIZE,
    price: 15600,
    category: 'all',
    isLimited: false,
    sales: 15,
    createdAt: '2024-09-12',
  },
  {
    id: 'art-005',
    title: 'Song of the Earth',
    image: IMG_BASE + encodeURIComponent('mixed media abstract earth tones morandi texture') + IMG_SIZE,
    price: 9800,
    category: 'all',
    isLimited: true,
    sales: 67,
    createdAt: '2024-07-25',
  },
  {
    id: 'art-006',
    title: 'Light Notes',
    image: IMG_BASE + encodeURIComponent('photography light shadow architectural morandi minimal') + IMG_SIZE,
    price: 3200,
    category: 'photography',
    isLimited: false,
    sales: 200,
    createdAt: '2025-02-10',
  },
])

const activeTab = ref('works')
const isRefreshing = ref(false)
const inputText = ref('')
const safeAreaBottom = ref(0)

const messages = ref([
  { from: 'artist', text: 'Hello! Glad you\'re interested in my work. Feel free to ask anything.', time: '14:30' },
  { from: 'user', text: 'I really love "Serene Hours". Could you tell me about the creative background?', time: '14:32' },
  { from: 'artist', text: 'Thank you! "Serene Hours" was created in early 2024, during a period when I meditated every morning in my studio. This painting is a visual expression of that tranquil state.', time: '14:35' },
])

const filteredWorks = computed(() => {
  return [...artistWorks.value].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

function formatCount(count: number): string {
  if (count >= 10000) return (count / 10000).toFixed(1) + 'w'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k'
  return String(count)
}

function formatPrice(price: number): string {
  return price.toLocaleString('zh-CN')
}

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function toggleFollow() {
  artist.value.isFollowing = !artist.value.isFollowing
  if (artist.value.isFollowing) {
    artist.value.followerCount++
  } else {
    artist.value.followerCount--
  }
}

function switchTab(value: string) {
  activeTab.value = value
}

function goToDetail(id: string) {
  uni.navigateTo({ url: `/pages/detail/index?id=${id}` })
}

function onPullDownRefresh() {
  isRefreshing.value = true
  setTimeout(() => {
    isRefreshing.value = false
  }, 1000)
}

function sendMessage() {
  if (!inputText.value.trim()) return
  const now = new Date()
  const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')
  messages.value.push({ from: 'user', text: inputText.value.trim(), time: timeStr })
  inputText.value = ''

  setTimeout(() => {
    const replyTime = new Date()
    const replyTimeStr = replyTime.getHours().toString().padStart(2, '0') + ':' + replyTime.getMinutes().toString().padStart(2, '0')
    messages.value.push({
      from: 'artist',
      text: 'Thank you for your message. I\'ll get back to you shortly.',
      time: replyTimeStr,
    })
  }, 1000)
}

onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  safeAreaBottom.value = systemInfo.safeArea?.bottom
    ? systemInfo.windowHeight - systemInfo.safeArea.bottom
    : 0
})
</script>

<style lang="scss" scoped>
@import '@/styles/mixins.scss';
.artist-page {
  min-height: 100vh;
  background-color: $color-surface;
}

.artist-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: $space-md $space-lg;
  padding-top: calc(env(safe-area-inset-top) + $space-md);
  background-color: $color-surface;

  .nav-back {
    display: inline-block;
  }

  .nav-back-text {
    @include sans-body;
    font-size: $font-md;
    color: $color-ink;
    letter-spacing: 0.02em;
  }
}

.artist-scroll {
  height: 100vh;
  padding-top: 104rpx;
}

.artist-header {
  @include flex-center;
  flex-direction: column;
  padding: $space-xl $space-lg;
  gap: $space-sm;
}

.artist-avatar {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  flex-shrink: 0;
  margin-bottom: $space-md;
}

.artist-name {
  @include serif-heading;
  font-size: $font-xxl;
}

.artist-bio {
  @include sans-body;
  font-size: $font-sm;
  text-align: center;
  line-height: 1.7;
  max-width: 560rpx;
  @include ellipsis(3);
}

.follow-link {
  @include sans-body;
  font-size: $font-sm;
  color: $color-ink-secondary;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-top: $space-sm;

  &:active {
    color: $color-ink;
  }
}

.artist-stats {
  @include flex-center;
  padding: $space-sm 0 $space-md;

  .stats-text {
    @include sans-body;
    font-size: $font-sm;
    color: $color-ink-tertiary;
    letter-spacing: 0.04em;
  }
}

.section-divider {
  @include divider;
  margin: 0 $space-lg;
}

.tab-bar {
  display: flex;
  padding: 0 $space-lg;
  border-bottom: 1rpx solid $color-rule;
  position: sticky;
  top: 104rpx;
  z-index: 50;
  background-color: $color-surface;
}

.tab-item {
  position: relative;
  padding: $space-md $space-md $space-sm;
  @include flex-center;
  flex-direction: column;
  margin-right: $space-lg;

  &--active {
    .tab-item-text {
      color: $color-ink;
    }
  }
}

.tab-item-text {
  @include sans-body;
  font-size: $font-sm;
  color: $color-ink-tertiary;
  letter-spacing: 0.04em;
}

.tab-item-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32rpx;
  height: 2rpx;
  background-color: $color-ink;
}

.tab-content {
  min-height: 60vh;
}

.tab-panel {
  padding: $space-lg;
}

.works-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $space-md;
}

.work-card {
  &:active {
    opacity: 0.85;
  }
}

.work-card-image-wrap {
  position: relative;
  width: 100%;
  padding-bottom: 133%;
  overflow: hidden;
}

.work-card-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  @include image-cover;
}

.work-card-info {
  padding: $space-sm 0;
}

.work-card-title {
  @include serif-heading;
  font-size: $font-sm;
  display: block;
  @include ellipsis;
}

.work-card-price {
  @include sans-body;
  font-size: $font-sm;
  color: $color-ink-secondary;
  display: block;
  margin-top: $space-xs;
}

.story-content {
  display: flex;
  flex-direction: column;
  gap: $space-3xl;
}

.story-section {
  display: flex;
  flex-direction: column;
  gap: $space-md;
}

.story-heading {
  @include serif-heading;
  font-size: $font-lg;
  display: block;
}

.story-paragraph {
  @include sans-body;
  font-size: $font-base;
  line-height: 2;
  text-indent: 2em;
}

.interview-block {
  display: flex;
  flex-direction: column;
  gap: $space-xl;
}

.interview-item {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
}

.interview-question {
  @include serif-heading;
  font-size: $font-base;
  line-height: 1.6;
}

.interview-answer {
  @include sans-body;
  font-size: $font-base;
  line-height: 1.8;
}

.timeline {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  padding: $space-lg 0;
  border-bottom: 1rpx solid $color-rule;
  display: flex;
  flex-direction: column;
  gap: $space-xs;

  &:last-child {
    border-bottom: none;
  }
}

.timeline-year {
  @include sans-body;
  font-size: $font-xs;
  color: $color-ink-tertiary;
  letter-spacing: 0.04em;
}

.timeline-name {
  @include serif-heading;
  font-size: $font-base;
}

.timeline-location {
  @include sans-body;
  font-size: $font-sm;
}

.message-area {
  display: flex;
  flex-direction: column;
  min-height: 500rpx;
  padding-bottom: 120rpx;
}

.message-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $space-md;
}

.message-row {
  display: flex;

  &--left {
    justify-content: flex-start;
  }

  &--right {
    justify-content: flex-end;
  }
}

.message-bubble {
  max-width: 70%;
  padding: $space-md;

  &--left {
    background-color: $color-surface-warm;
    border-radius: $radius-xs;
  }

  &--right {
    background-color: $color-ink;
    border-radius: $radius-xs;
  }
}

.message-text {
  font-size: $font-sm;
  line-height: 1.7;
  letter-spacing: 0.01em;
  display: block;

  .message-bubble--left & {
    color: $color-ink;
  }

  .message-bubble--right & {
    color: $color-surface;
  }
}

.message-time {
  font-size: $font-xxs;
  display: block;
  margin-top: $space-xs;

  .message-bubble--left & {
    color: $color-ink-tertiary;
  }

  .message-bubble--right & {
    color: rgba(255, 255, 255, 0.5);
  }
}

.message-input-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: $space-md;
  padding: $space-md $space-lg;
  background-color: $color-surface;
  border-top: 1rpx solid $color-rule;
}

.message-input {
  flex: 1;
  height: 72rpx;
  padding: 0 $space-md;
  font-family: $font-sans;
  font-size: $font-sm;
  color: $color-ink;
  border: none;
  border-bottom: 1rpx solid $color-rule;
  background: transparent;
}

.message-input-placeholder {
  color: $color-ink-tertiary;
  font-size: $font-sm;
}

.send-link {
  @include sans-body;
  font-size: $font-sm;
  color: $color-ink-secondary;
  letter-spacing: 0.04em;
  flex-shrink: 0;

  &:active {
    color: $color-ink;
  }
}

.bottom-spacer {
  height: 160rpx;
}

@media (min-width: $breakpoint-md) {
  .artist-page {
    @include responsive-container;
  }

  .artist-scroll {
    @include desktop-scrollbar;
  }

  .artist-header {
    flex-direction: row;
    align-items: center;
    padding: $space-2xl $space-xl;
    gap: $space-xl;
    text-align: left;
  }

  .artist-avatar {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 0;
  }

  .artist-name {
    font-size: $font-xxl;
  }

  .artist-bio {
    text-align: left;
    max-width: none;
  }

  .artist-stats {
    justify-content: flex-end;
    padding: 0 $space-xl $space-md;
  }

  .follow-link {
    margin-top: $space-sm;
    cursor: pointer;

    &:hover {
      color: $color-ink;
    }
  }

  .tab-bar {
    padding: 0 $space-xl;
  }

  .tab-item {
    padding: $space-lg $space-lg $space-md;
    margin-right: $space-xl;
  }

  .tab-panel {
    padding: $space-xl;
  }

  .works-grid {
    @include desktop-grid(3, $space-lg);
  }

  .work-card {
    @include hover-lift;
    cursor: pointer;
  }

  .story-content {
    max-width: $max-width-narrow;
    margin: 0 auto;
  }

  .story-paragraph {
    font-size: $font-md;
    line-height: 2.2;
  }

  .interview-question {
    font-size: $font-md;
  }

  .interview-answer {
    font-size: $font-md;
    line-height: 2;
  }

  .timeline-item {
    padding: $space-xl 0;
  }

  .timeline-name {
    font-size: $font-md;
  }

  .message-input-bar {
    @include responsive-container;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
  }
}

@media (min-width: $breakpoint-lg) {
  .works-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .artist-header {
    padding: $space-3xl $space-2xl;
  }

  .tab-panel {
    padding: $space-2xl;
  }
}
</style>
