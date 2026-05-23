<template>
  <view class="artist-page">
    <view class="artist-nav safe-area-top">
      <view class="nav-back" @click="goBack">
        <text class="nav-back-icon">‹</text>
      </view>
      <text class="nav-title">艺术家主页</text>
      <view class="nav-share" @click="handleShare">
        <text class="nav-share-icon">⬆</text>
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
        <view class="header-main">
          <image class="artist-avatar" :src="artist.avatar" mode="aspectFill" />
          <view class="artist-info">
            <text class="artist-name">{{ artist.name }}</text>
            <text class="artist-bio">{{ artist.bio }}</text>
            <view class="artist-stats">
              <view class="stat-item">
                <text class="stat-value">{{ formatCount(artist.followerCount) }}</text>
                <text class="stat-label">关注者</text>
              </view>
              <view class="stat-divider" />
              <view class="stat-item">
                <text class="stat-value">{{ artistWorks.length }}</text>
                <text class="stat-label">作品</text>
              </view>
              <view class="stat-divider" />
              <view class="stat-item">
                <text class="stat-value">{{ artist.exhibitions.length }}</text>
                <text class="stat-label">展览</text>
              </view>
            </view>
            <view
              :class="['follow-btn', artist.isFollowing ? 'follow-btn--following' : 'follow-btn--default']"
              @click="toggleFollow"
            >
              <text class="follow-btn-text">{{ artist.isFollowing ? '已关注' : '+ 关注' }}</text>
            </view>
          </view>
        </view>

        <view class="representative-works">
          <text class="section-label">代表作品</text>
          <scroll-view class="works-carousel" scroll-x :show-scrollbar="false" enhanced>
            <view class="works-carousel-list">
              <view
                v-for="(work, index) in artist.representativeWorks"
                :key="index"
                class="work-thumb-card"
                @click="goToDetail(work.id)"
              >
                <image class="work-thumb-image" :src="work.image" mode="aspectFill" />
                <text class="work-thumb-title">{{ work.title }}</text>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>

      <view class="tab-navigation">
        <view
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab-item', { 'tab-item--active': activeTab === tab.value }]"
          @click="switchTab(tab.value)"
        >
          <text class="tab-text">{{ tab.label }}</text>
          <view v-if="activeTab === tab.value" class="tab-indicator" />
        </view>
      </view>

      <view class="tab-content">
        <view v-show="activeTab === 'works'" class="tab-panel">
          <view class="works-toolbar">
            <view class="filter-group">
              <view
                v-for="f in workFilters"
                :key="f.value"
                :class="['filter-chip', { 'filter-chip--active': activeFilter === f.value }]"
                @click="setFilter(f.value)"
              >
                <text class="filter-chip-text">{{ f.label }}</text>
              </view>
            </view>
            <view class="sort-group">
              <view
                v-for="s in sortOptions"
                :key="s.value"
                :class="['sort-chip', { 'sort-chip--active': activeSort === s.value }]"
                @click="setSort(s.value)"
              >
                <text class="sort-chip-text">{{ s.label }}</text>
              </view>
            </view>
          </view>

          <view class="works-grid">
            <view
              v-for="item in filteredWorks"
              :key="item.id"
              class="work-card fade-in-up"
              @click="goToDetail(item.id)"
            >
              <view class="work-card-image-wrap">
                <image class="work-card-image" :src="item.image" mode="aspectFill" lazy-load />
                <view v-if="item.isLimited" class="work-card-badge">
                  <text class="work-card-badge-text">限量</text>
                </view>
              </view>
              <view class="work-card-info">
                <text class="work-card-title">{{ item.title }}</text>
                <text class="work-card-price">¥{{ formatPrice(item.price) }}</text>
              </view>
            </view>
          </view>

          <view class="load-more" v-if="filteredWorks.length > 0">
            <view class="load-more-loading" v-if="loadingMore">
              <view class="load-more-spinner" />
              <text class="load-more-text">加载中...</text>
            </view>
            <text class="load-more-end" v-else-if="!hasMore">— 已浏览全部作品 —</text>
          </view>
        </view>

        <view v-show="activeTab === 'story'" class="tab-panel">
          <view class="story-content">
            <view class="story-section">
              <text class="story-heading">创作理念</text>
              <view class="story-block">
                <image
                  class="story-image"
                  :src="storyImages.philosophy"
                  mode="aspectFill"
                />
                <text class="story-paragraph">{{ storyContent.philosophy }}</text>
              </view>
            </view>

            <view class="story-section">
              <text class="story-heading">创作经历</text>
              <view class="story-block story-block--reverse">
                <image
                  class="story-image"
                  :src="storyImages.journey"
                  mode="aspectFill"
                />
                <text class="story-paragraph">{{ storyContent.journey }}</text>
              </view>
            </view>

            <view class="story-section">
              <text class="story-heading">艺术家访谈</text>
              <view class="interview-block">
                <view class="interview-item" v-for="(qa, index) in interviewQA" :key="index">
                  <view class="interview-question">
                    <text class="interview-q-label">Q</text>
                    <text class="interview-q-text">{{ qa.question }}</text>
                  </view>
                  <view class="interview-answer">
                    <text class="interview-a-label">A</text>
                    <text class="interview-a-text">{{ qa.answer }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-show="activeTab === 'exhibitions'" class="tab-panel">
          <view class="exhibition-section">
            <text class="exhibition-heading">展览经历</text>
            <view class="timeline">
              <view
                v-for="(item, index) in artist.exhibitions"
                :key="index"
                class="timeline-item"
              >
                <view class="timeline-dot" />
                <view v-if="index < artist.exhibitions.length - 1" class="timeline-line" />
                <view class="timeline-content">
                  <text class="timeline-year">{{ item.date }}</text>
                  <text class="timeline-name">{{ item.name }}</text>
                  <text class="timeline-location">{{ item.location }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="exhibition-section">
            <text class="exhibition-heading">荣誉奖项</text>
            <view class="honors-list">
              <view v-for="(honor, index) in artist.honors" :key="index" class="honor-item">
                <text class="honor-medal">🏅</text>
                <text class="honor-text">{{ honor }}</text>
              </view>
            </view>
          </view>

          <view class="exhibition-section">
            <text class="exhibition-heading">品牌合作</text>
            <view class="collab-list">
              <view v-for="(collab, index) in brandCollabs" :key="index" class="collab-item">
                <image class="collab-logo" :src="collab.logo" mode="aspectFill" />
                <text class="collab-name">{{ collab.name }}</text>
              </view>
            </view>
          </view>
        </view>

        <view v-show="activeTab === 'message'" class="tab-panel">
          <view class="message-area">
            <view class="message-list">
              <view
                v-for="(msg, index) in messages"
                :key="index"
                :class="['message-bubble', msg.from === 'artist' ? 'message-bubble--left' : 'message-bubble--right']"
              >
                <image
                  v-if="msg.from === 'artist'"
                  class="message-avatar"
                  :src="artist.avatar"
                  mode="aspectFill"
                />
                <view :class="['message-content', msg.from === 'artist' ? 'message-content--left' : 'message-content--right']">
                  <text class="message-text">{{ msg.text }}</text>
                  <text class="message-time">{{ msg.time }}</text>
                </view>
              </view>
            </view>

            <view class="quick-templates">
              <view
                v-for="(tpl, index) in quickTemplates"
                :key="index"
                class="template-chip"
                @click="sendQuickMessage(tpl)"
              >
                <text class="template-text">{{ tpl }}</text>
              </view>
            </view>
          </view>

          <view class="message-input-bar safe-area-bottom">
            <input
              class="message-input"
              v-model="inputText"
              placeholder="输入消息..."
              placeholder-class="message-input-placeholder"
              confirm-type="send"
              @confirm="sendMessage"
            />
            <view class="message-send-btn" @click="sendMessage">
              <text class="send-btn-text">发送</text>
            </view>
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
  name: '林墨白',
  avatar: IMG_BASE + encodeURIComponent('artist portrait photo asian man elegant studio lighting morandi tones') + IMG_SIZE,
  bio: '当代抽象艺术家，以莫兰迪色系与东方美学融合著称，作品被多家美术馆收藏，致力于在抽象与具象之间寻找宁静的平衡点',
  followerCount: 12680,
  isFollowing: false,
  representativeWorks: [
    {
      id: 'art-001',
      title: '静谧时光',
      image: IMG_BASE + encodeURIComponent('abstract oil painting morandi colors serene composition gallery quality') + IMG_SIZE,
    },
    {
      id: 'art-002',
      title: '晨雾',
      image: IMG_BASE + encodeURIComponent('watercolor landscape misty mountains morandi tones') + IMG_SIZE,
    },
    {
      id: 'art-003',
      title: '山水间',
      image: IMG_BASE + encodeURIComponent('abstract ink painting minimalist morandi style') + IMG_SIZE,
    },
  ],
  exhibitions: [
    { name: '「静·境」个人画展', date: '2025', location: '上海当代艺术馆' },
    { name: '「东方抽象」群展', date: '2024', location: '北京798艺术区' },
    { name: '「色彩与冥想」双年展', date: '2023', location: '威尼斯双年展中国馆' },
    { name: '「新水墨」国际巡展', date: '2022', location: '东京森美术馆' },
    { name: '「莫兰迪之后」联展', date: '2021', location: '上海龙美术馆' },
    { name: '「留白」个人画展', date: '2020', location: '杭州中国美术学院美术馆' },
    { name: '「青年力量」新锐艺术家展', date: '2019', location: '深圳OCAT当代艺术中心' },
  ],
  honors: [
    '2024 中国当代艺术奖·年度艺术家',
    '2023 约翰·莫尔绘画奖·提名',
    '2022 AAC艺术中国·年度青年艺术家',
    '2021 胡润艺术榜·新锐艺术家',
    '2020 罗中立奖学金·一等奖',
  ],
  story: '',
  createdAt: '2019-06-15',
})

const storyImages = {
  philosophy: IMG_BASE + encodeURIComponent('artist studio workspace warm light morandi palette brushes canvas') + IMG_SIZE,
  journey: IMG_BASE + encodeURIComponent('artist painting in nature outdoor easel landscape morandi colors') + IMG_SIZE,
}

const storyContent = {
  philosophy: '我的创作始终围绕"静"与"境"两个核心概念展开。在喧嚣的当代生活中，我试图通过色彩的微妙变化与形态的克制表达，为观者营造一个可以驻足沉思的精神空间。莫兰迪的色系给了我极大的启发——那些低饱和度的灰调并非沉默，而是蕴含着深沉的呼吸。我将东方美学中的"留白"理念融入抽象表达，让画面中的虚空与实体同等重要，每一处空白都是一次邀请，邀请观者用自己的想象去填补。',
  journey: '2014年毕业于中国美术学院油画系，随后赴意大利博洛尼亚深造，在莫兰迪曾经工作过的城市里，我度过了三年最纯粹的创作时光。回国后，我在杭州建立了自己的工作室，开始系统性地探索莫兰迪色系与东方水墨精神的融合。从最初的具象静物，到半抽象的山水意象，再到如今纯粹的色彩冥想，每一次转变都是对自我认知的深化。2020年的「留白」个展是我创作生涯的转折点，那之后我更加坚定地走向了抽象表达的道路。',
}

const interviewQA = [
  {
    question: '您如何看待莫兰迪对当代艺术的影响？',
    answer: '莫兰迪教会了我们"少即是多"的真正含义。他的静物画看似简单，实则蕴含着对时间、存在和感知的深刻思考。在信息过载的今天，这种克制的表达方式反而更具力量。他提醒我们，艺术不必总是声嘶力竭地呐喊，低声细语同样可以震撼人心。',
  },
  {
    question: '东方美学在您的创作中扮演什么角色？',
    answer: '东方美学是我创作的根基。中国山水画中的"留白"不仅是构图技巧，更是一种哲学态度——承认人的有限性，尊重自然的无限性。我在抽象画中保留大面积的"呼吸空间"，就是这种理念的当代转化。我希望我的作品既有东方的含蓄内敛，又有当代艺术的自由与开放。',
  },
  {
    question: '您对年轻艺术家有什么建议？',
    answer: '保持真诚，找到属于自己的节奏。艺术创作不是竞赛，不需要追赶潮流。花时间去理解自己真正关心什么，然后反复地、深入地去表达。不要害怕"慢"，因为真正的深度往往需要时间的沉淀。同时，多看、多感受，让生活本身成为你最大的灵感来源。',
  },
]

const brandCollabs = [
  { name: '无印良品', logo: IMG_BASE + encodeURIComponent('minimalist brand logo clean design neutral tones') + IMG_SIZE },
  { name: '梵克雅宝', logo: IMG_BASE + encodeURIComponent('luxury jewelry brand elegant logo gold tones') + IMG_SIZE },
  { name: '茑屋书店', logo: IMG_BASE + encodeURIComponent('bookstore brand logo artistic design warm tones') + IMG_SIZE },
]

const tabs = [
  { label: '作品集', value: 'works' },
  { label: '艺术家故事', value: 'story' },
  { label: '展览荣誉', value: 'exhibitions' },
  { label: '私信咨询', value: 'message' },
]

const workFilters = [
  { label: '全部', value: 'all' },
  { label: '摄影', value: 'photography' },
  { label: '插画', value: 'illustration' },
]

const sortOptions = [
  { label: '最新', value: 'newest' },
  { label: '热门', value: 'popular' },
]

const artistWorks = ref([
  {
    id: 'art-001',
    title: '静谧时光',
    image: IMG_BASE + encodeURIComponent('abstract oil painting morandi colors serene composition gallery quality') + IMG_SIZE,
    price: 12800,
    category: 'all',
    isLimited: true,
    sales: 56,
    createdAt: '2025-03-15',
  },
  {
    id: 'art-002',
    title: '晨雾',
    image: IMG_BASE + encodeURIComponent('watercolor landscape misty mountains morandi tones') + IMG_SIZE,
    price: 8600,
    category: 'all',
    isLimited: false,
    sales: 120,
    createdAt: '2025-01-20',
  },
  {
    id: 'art-003',
    title: '山水间',
    image: IMG_BASE + encodeURIComponent('abstract ink painting minimalist morandi style') + IMG_SIZE,
    price: 12000,
    category: 'all',
    isLimited: true,
    sales: 28,
    createdAt: '2024-11-08',
  },
  {
    id: 'art-004',
    title: '沉思',
    image: IMG_BASE + encodeURIComponent('oil portrait contemplative morandi tones figure') + IMG_SIZE,
    price: 15600,
    category: 'all',
    isLimited: false,
    sales: 15,
    createdAt: '2024-09-12',
  },
  {
    id: 'art-005',
    title: '大地之歌',
    image: IMG_BASE + encodeURIComponent('mixed media abstract earth tones morandi texture') + IMG_SIZE,
    price: 9800,
    category: 'all',
    isLimited: true,
    sales: 67,
    createdAt: '2024-07-25',
  },
  {
    id: 'art-006',
    title: '光影笔记',
    image: IMG_BASE + encodeURIComponent('photography light shadow architectural morandi minimal') + IMG_SIZE,
    price: 3200,
    category: 'photography',
    isLimited: false,
    sales: 200,
    createdAt: '2025-02-10',
  },
  {
    id: 'art-007',
    title: '城市呼吸',
    image: IMG_BASE + encodeURIComponent('urban photography cityscape morning light morandi tones') + IMG_SIZE,
    price: 2800,
    category: 'photography',
    isLimited: false,
    sales: 150,
    createdAt: '2024-12-05',
  },
  {
    id: 'art-008',
    title: '雨后',
    image: IMG_BASE + encodeURIComponent('rain photography street reflection morandi muted colors') + IMG_SIZE,
    price: 3600,
    category: 'photography',
    isLimited: true,
    sales: 88,
    createdAt: '2024-10-18',
  },
  {
    id: 'art-009',
    title: '梦境花园',
    image: IMG_BASE + encodeURIComponent('illustration dreamy garden flowers morandi pastel watercolor') + IMG_SIZE,
    price: 4200,
    category: 'illustration',
    isLimited: false,
    sales: 95,
    createdAt: '2025-04-02',
  },
  {
    id: 'art-010',
    title: '星河低语',
    image: IMG_BASE + encodeURIComponent('illustration starry night sky morandi purple blue whimsical') + IMG_SIZE,
    price: 5600,
    category: 'illustration',
    isLimited: true,
    sales: 42,
    createdAt: '2025-02-28',
  },
  {
    id: 'art-011',
    title: '森林密语',
    image: IMG_BASE + encodeURIComponent('illustration enchanted forest morandi green trees mystical') + IMG_SIZE,
    price: 3800,
    category: 'illustration',
    isLimited: false,
    sales: 110,
    createdAt: '2024-08-15',
  },
])

const activeTab = ref('works')
const activeFilter = ref('all')
const activeSort = ref('newest')
const isRefreshing = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)

const inputText = ref('')
const messages = ref([
  { from: 'artist', text: '你好！很高兴你对我的作品感兴趣。有任何问题都可以随时问我 😊', time: '14:30' },
  { from: 'user', text: '您好，我很喜欢「静谧时光」这幅作品，想了解一下创作背景', time: '14:32' },
  { from: 'artist', text: '谢谢你的喜爱！「静谧时光」创作于2024年初，那段时间我每天清晨都会在工作室冥想，这幅画就是那种宁静状态的视觉化表达。', time: '14:35' },
])

const quickTemplates = ['咨询作品', '定制需求', '合作洽谈']

const filteredWorks = computed(() => {
  let result = [...artistWorks.value]

  if (activeFilter.value !== 'all') {
    result = result.filter((item) => item.category === activeFilter.value)
  }

  if (activeSort.value === 'newest') {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } else {
    result.sort((a, b) => b.sales - a.sales)
  }

  return result
})

function formatCount(count: number): string {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return String(count)
}

function formatPrice(price: number): string {
  return price.toLocaleString('zh-CN')
}

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function handleShare() {
  uni.showToast({ title: '分享功能开发中', icon: 'none' })
}

function toggleFollow() {
  artist.value.isFollowing = !artist.value.isFollowing
  if (artist.value.isFollowing) {
    artist.value.followerCount++
    uni.showToast({ title: '关注成功', icon: 'none', duration: 1000 })
  } else {
    artist.value.followerCount--
    uni.showToast({ title: '已取消关注', icon: 'none', duration: 1000 })
  }
}

function switchTab(value: string) {
  activeTab.value = value
}

function setFilter(value: string) {
  activeFilter.value = value
}

function setSort(value: string) {
  activeSort.value = value
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

function sendQuickMessage(text: string) {
  const now = new Date()
  const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')
  messages.value.push({ from: 'user', text, time: timeStr })

  setTimeout(() => {
    let reply = ''
    if (text === '咨询作品') {
      reply = '好的，请问您对哪件作品感兴趣？我可以为您详细介绍作品的创作理念、材质和装裱方式。'
    } else if (text === '定制需求') {
      reply = '定制创作是我的特色服务之一。请告诉我您的需求，包括尺寸偏好、色彩倾向和预算范围，我会为您量身定制。'
    } else if (text === '合作洽谈') {
      reply = '非常期待与您的合作！无论是商业空间艺术配置、品牌联名还是展览策划，我都很乐意进一步沟通。'
    }
    const replyTime = new Date()
    const replyTimeStr = replyTime.getHours().toString().padStart(2, '0') + ':' + replyTime.getMinutes().toString().padStart(2, '0')
    messages.value.push({ from: 'artist', text: reply, time: replyTimeStr })
  }, 800)
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
      text: '感谢您的留言，我会尽快回复您。如需更详细的咨询，也可以添加工作室微信：linmobai_studio',
      time: replyTimeStr,
    })
  }, 1000)
}

onLoad((options) => {
  if (options?.id) {
    // TODO: fetch artist detail by id
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.artist-page {
  min-height: 100vh;
  background-color: $color-bg;
}

.artist-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  @include flex-between;
  padding: 16rpx $spacing-base;
  background: rgba(250, 250, 248, 0.92);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-bottom: 1rpx solid $color-border;

  .nav-back {
    width: 72rpx;
    height: 72rpx;
    border-radius: $radius-full;
    background-color: $color-bg-secondary;
    @include flex-center;

    .nav-back-icon {
      font-size: 44rpx;
      color: $color-text-primary;
      font-weight: 300;
      margin-top: -4rpx;
    }

    &:active {
      background-color: $color-border;
    }
  }

  .nav-title {
    font-size: $font-md;
    color: $color-text-primary;
    font-weight: 600;
    letter-spacing: 2rpx;
  }

  .nav-share {
    width: 72rpx;
    height: 72rpx;
    border-radius: $radius-full;
    background-color: $color-bg-secondary;
    @include flex-center;

    .nav-share-icon {
      font-size: 32rpx;
      color: $color-text-secondary;
    }

    &:active {
      background-color: $color-border;
    }
  }
}

.artist-scroll {
  height: 100vh;
  padding-top: 104rpx;
}

.artist-header {
  background-color: $color-white;
  padding: $spacing-lg $spacing-base;
  margin-bottom: $spacing-sm;

  .header-main {
    display: flex;
    gap: $spacing-base;
  }

  .artist-avatar {
    width: 200rpx;
    height: 200rpx;
    border-radius: $radius-full;
    flex-shrink: 0;
    border: 4rpx solid $color-bg-secondary;
  }

  .artist-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .artist-name {
    font-size: $font-xl;
    font-family: 'Georgia', 'Noto Serif SC', serif;
    font-weight: 700;
    color: $color-text-primary;
    letter-spacing: 4rpx;
    line-height: 1.2;
  }

  .artist-bio {
    font-size: $font-sm;
    color: $color-text-secondary;
    line-height: 1.6;
    margin-top: $spacing-xs;
    @include ellipsis(2);
    letter-spacing: 1rpx;
  }

  .artist-stats {
    display: flex;
    align-items: center;
    margin-top: $spacing-sm;
    gap: 0;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 $spacing-sm;

      .stat-value {
        font-size: $font-md;
        font-weight: 700;
        color: $color-text-primary;
        letter-spacing: 1rpx;
      }

      .stat-label {
        font-size: $font-xs;
        color: $color-text-tertiary;
        margin-top: 2rpx;
      }
    }

    .stat-divider {
      width: 1rpx;
      height: 40rpx;
      background-color: $color-border;
    }
  }

  .follow-btn {
    margin-top: $spacing-sm;
    height: 64rpx;
    @include flex-center;
    border-radius: $radius-full;
    transition: $transition-base;

    &:active {
      transform: scale(0.96);
    }

    &--default {
      background-color: $color-accent;

      .follow-btn-text {
        color: $color-white;
        font-weight: 600;
      }
    }

    &--following {
      background-color: transparent;
      border: 2rpx solid $color-border;

      .follow-btn-text {
        color: $color-text-tertiary;
        font-weight: 400;
      }
    }

    .follow-btn-text {
      font-size: $font-sm;
      letter-spacing: 2rpx;
    }
  }
}

.representative-works {
  margin-top: $spacing-md;

  .section-label {
    display: block;
    font-size: $font-sm;
    color: $color-text-tertiary;
    letter-spacing: 2rpx;
    margin-bottom: $spacing-sm;
  }

  .works-carousel {
    white-space: nowrap;
  }

  .works-carousel-list {
    display: flex;
    gap: $spacing-sm;
  }

  .work-thumb-card {
    flex-shrink: 0;
    width: 180rpx;
    @include gallery-card;

    .work-thumb-image {
      width: 180rpx;
      height: 220rpx;
    }

    .work-thumb-title {
      display: block;
      padding: $spacing-xs $spacing-sm $spacing-sm;
      font-size: $font-xs;
      color: $color-text-primary;
      @include ellipsis;
      letter-spacing: 1rpx;
    }

    &:active {
      transform: scale(0.96);
    }
  }
}

.tab-navigation {
  display: flex;
  background-color: $color-white;
  padding: 0 $spacing-base;
  border-bottom: 1rpx solid $color-bg-secondary;
  position: sticky;
  top: 104rpx;
  z-index: 50;

  .tab-item {
    flex: 1;
    @include flex-center;
    flex-direction: column;
    height: 88rpx;
    position: relative;
    transition: $transition-base;

    &--active {
      .tab-text {
        color: $color-accent;
        font-weight: 600;
      }
    }
  }

  .tab-text {
    font-size: $font-base;
    color: $color-text-secondary;
    letter-spacing: 1rpx;
    transition: $transition-base;
  }

  .tab-indicator {
    position: absolute;
    bottom: 0;
    width: 48rpx;
    height: 6rpx;
    background-color: $color-accent;
    border-radius: $radius-full;
  }
}

.tab-content {
  min-height: 60vh;
}

.tab-panel {
  padding: $spacing-base;
}

.works-toolbar {
  @include flex-between;
  margin-bottom: $spacing-base;

  .filter-group {
    display: flex;
    gap: $spacing-xs;
  }

  .filter-chip {
    padding: $spacing-xs $spacing-base;
    border-radius: $radius-full;
    background-color: $color-bg-secondary;
    transition: $transition-base;

    &--active {
      background-color: $color-accent;

      .filter-chip-text {
        color: $color-white;
      }
    }

    .filter-chip-text {
      font-size: $font-sm;
      color: $color-text-secondary;
      letter-spacing: 1rpx;
    }
  }

  .sort-group {
    display: flex;
    gap: $spacing-xs;
  }

  .sort-chip {
    padding: $spacing-xs $spacing-sm;

    &--active {
      .sort-chip-text {
        color: $color-accent;
        font-weight: 600;
      }
    }

    .sort-chip-text {
      font-size: $font-sm;
      color: $color-text-tertiary;
      letter-spacing: 1rpx;
    }
  }
}

.works-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-base;
}

.work-card {
  @include gallery-card;

  &-image-wrap {
    position: relative;
    width: 100%;
    padding-bottom: 133%;
    overflow: hidden;
  }

  &-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &-badge {
    position: absolute;
    top: $spacing-sm;
    left: $spacing-sm;
    padding: 4rpx $spacing-sm;
    background-color: rgba(139, 115, 85, 0.85);
    border-radius: $radius-sm;

    &-text {
      font-size: $font-xs;
      color: $color-white;
      letter-spacing: 1rpx;
    }
  }

  &-info {
    padding: $spacing-sm $spacing-sm $spacing-base;
  }

  &-title {
    display: block;
    font-size: $font-sm;
    color: $color-text-primary;
    font-weight: 500;
    @include ellipsis;
    letter-spacing: 1rpx;
  }

  &-price {
    display: block;
    margin-top: $spacing-xs;
    font-size: $font-base;
    color: $color-accent;
    font-weight: 600;
  }
}

.load-more {
  @include flex-center;
  padding: $spacing-lg 0;

  &-loading {
    @include flex-center;
    gap: $spacing-sm;
  }

  &-spinner {
    width: 32rpx;
    height: 32rpx;
    border: 3rpx solid $color-border;
    border-top-color: $morandi-beige;
    border-radius: $radius-full;
    animation: spin 0.8s linear infinite;
  }

  &-text {
    font-size: $font-sm;
    color: $color-text-tertiary;
  }

  &-end {
    font-size: $font-sm;
    color: $color-text-placeholder;
    letter-spacing: 2rpx;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.story-content {
  background-color: $color-white;
  border-radius: $radius-lg;
  padding: $spacing-lg;
}

.story-section {
  margin-bottom: $spacing-xl;

  &:last-child {
    margin-bottom: 0;
  }
}

.story-heading {
  display: block;
  font-size: $font-lg;
  font-family: 'Georgia', 'Noto Serif SC', serif;
  font-weight: 700;
  color: $color-text-primary;
  letter-spacing: 4rpx;
  margin-bottom: $spacing-base;
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

.story-block {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;

  &--reverse {
    flex-direction: column-reverse;
  }
}

.story-image {
  width: 100%;
  height: 360rpx;
  border-radius: $radius-lg;
}

.story-paragraph {
  font-size: $font-base;
  color: $color-text-secondary;
  line-height: 2;
  letter-spacing: 1rpx;
  text-indent: 2em;
}

.interview-block {
  padding: 0;
}

.interview-item {
  margin-bottom: $spacing-lg;

  &:last-child {
    margin-bottom: 0;
  }
}

.interview-question {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-sm;
}

.interview-q-label {
  width: 48rpx;
  height: 48rpx;
  @include flex-center;
  background-color: $color-accent;
  color: $color-white;
  font-size: $font-sm;
  font-weight: 700;
  border-radius: $radius-sm;
  flex-shrink: 0;
}

.interview-q-text {
  font-size: $font-base;
  color: $color-text-primary;
  font-weight: 600;
  line-height: 1.6;
  letter-spacing: 1rpx;
  padding-top: 8rpx;
}

.interview-answer {
  display: flex;
  gap: $spacing-sm;
  padding-left: $spacing-xs;
}

.interview-a-label {
  width: 48rpx;
  height: 48rpx;
  @include flex-center;
  background-color: $morandi-beige;
  color: $color-white;
  font-size: $font-sm;
  font-weight: 700;
  border-radius: $radius-sm;
  flex-shrink: 0;
}

.interview-a-text {
  font-size: $font-base;
  color: $color-text-secondary;
  line-height: 1.8;
  letter-spacing: 1rpx;
  padding-top: 8rpx;
}

.exhibition-section {
  background-color: $color-white;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-base;

  &:last-child {
    margin-bottom: 0;
  }
}

.exhibition-heading {
  display: block;
  font-size: $font-lg;
  font-family: 'Georgia', 'Noto Serif SC', serif;
  font-weight: 700;
  color: $color-text-primary;
  letter-spacing: 4rpx;
  margin-bottom: $spacing-lg;
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

.timeline {
  padding-left: $spacing-md;
}

.timeline-item {
  position: relative;
  padding-left: $spacing-lg;
  padding-bottom: $spacing-lg;

  &:last-child {
    padding-bottom: 0;
  }
}

.timeline-dot {
  position: absolute;
  left: -6rpx;
  top: 12rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: $radius-full;
  background-color: $color-accent;
  border: 4rpx solid $color-accent-light;
  z-index: 2;
}

.timeline-line {
  position: absolute;
  left: 0;
  top: 28rpx;
  bottom: 0;
  width: 2rpx;
  background-color: $color-border;
}

.timeline-content {
  display: flex;
  flex-direction: column;
}

.timeline-year {
  font-size: $font-sm;
  color: $color-accent;
  font-weight: 600;
  letter-spacing: 2rpx;
  margin-bottom: 4rpx;
}

.timeline-name {
  font-size: $font-base;
  color: $color-text-primary;
  font-weight: 500;
  letter-spacing: 1rpx;
  margin-bottom: 4rpx;
}

.timeline-location {
  font-size: $font-sm;
  color: $color-text-tertiary;
  letter-spacing: 1rpx;
}

.honors-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.honor-item {
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm;
  padding: $spacing-base;
  background-color: $color-bg-secondary;
  border-radius: $radius-lg;
  border-left: 6rpx solid $color-accent-light;
}

.honor-medal {
  font-size: $font-lg;
  flex-shrink: 0;
}

.honor-text {
  font-size: $font-base;
  color: $color-text-primary;
  line-height: 1.6;
  letter-spacing: 1rpx;
}

.collab-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-base;
}

.collab-item {
  width: calc(50% - #{$spacing-base} / 2);
  @include gallery-card;
  @include flex-center;
  flex-direction: column;
  padding: $spacing-base;
  gap: $spacing-sm;
}

.collab-logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: $radius-base;
}

.collab-name {
  font-size: $font-sm;
  color: $color-text-primary;
  font-weight: 500;
  letter-spacing: 2rpx;
}

.message-area {
  display: flex;
  flex-direction: column;
  min-height: 500rpx;
}

.message-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
  padding-bottom: $spacing-base;
}

.message-bubble {
  display: flex;
  gap: $spacing-sm;

  &--left {
    justify-content: flex-start;
  }

  &--right {
    justify-content: flex-end;
  }
}

.message-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: $radius-full;
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
  padding: $spacing-base;
  border-radius: $radius-lg;
  position: relative;

  &--left {
    background-color: $color-white;
    border-top-left-radius: $radius-sm;
  }

  &--right {
    background-color: $color-accent;
    border-top-right-radius: $radius-sm;
  }
}

.message-text {
  font-size: $font-base;
  line-height: 1.7;
  letter-spacing: 1rpx;

  .message-content--left & {
    color: $color-text-primary;
  }

  .message-content--right & {
    color: $color-white;
  }
}

.message-time {
  display: block;
  font-size: $font-xs;
  margin-top: $spacing-xs;

  .message-content--left & {
    color: $color-text-tertiary;
  }

  .message-content--right & {
    color: rgba(255, 255, 255, 0.7);
  }
}

.quick-templates {
  display: flex;
  gap: $spacing-sm;
  padding: $spacing-base 0;
  border-top: 1rpx solid $color-bg-secondary;
}

.template-chip {
  padding: $spacing-xs $spacing-base;
  border: 2rpx solid $color-accent-light;
  border-radius: $radius-full;
  background-color: rgba(139, 115, 85, 0.05);
  transition: $transition-base;

  &:active {
    background-color: rgba(139, 115, 85, 0.15);
    transform: scale(0.96);
  }
}

.template-text {
  font-size: $font-sm;
  color: $color-accent;
  letter-spacing: 1rpx;
}

.message-input-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-base;
  background: rgba(250, 250, 248, 0.96);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-top: 1rpx solid $color-border;
}

.message-input {
  flex: 1;
  height: 72rpx;
  padding: 0 $spacing-base;
  background-color: $color-bg-secondary;
  border-radius: $radius-full;
  font-size: $font-base;
  color: $color-text-primary;
}

.message-input-placeholder {
  color: $color-text-placeholder;
  font-size: $font-base;
}

.message-send-btn {
  height: 72rpx;
  padding: 0 $spacing-md;
  @include flex-center;
  background-color: $color-accent;
  border-radius: $radius-full;
  transition: $transition-base;

  &:active {
    opacity: 0.85;
    transform: scale(0.96);
  }
}

.send-btn-text {
  font-size: $font-sm;
  color: $color-white;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.bottom-spacer {
  height: 160rpx;
}
</style>
