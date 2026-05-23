<template>
  <view class="community-page">
    <view class="community-header safe-area-top">
      <view class="header-top">
        <text class="header-title">艺术社区</text>
        <text class="header-subtitle">Community</text>
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
      class="community-content"
      scroll-y
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
      enhanced
      :bounces="false"
    >
      <view class="tab-panel" v-if="activeTab === 0">
        <view class="news-categories">
          <scroll-view scroll-x :show-scrollbar="false" enhanced>
            <view class="news-categories__inner">
              <view
                v-for="cat in newsCategories"
                :key="cat"
                class="news-cat-tag"
                :class="{ 'news-cat-tag--active': activeNewsCat === cat }"
                @tap="activeNewsCat = cat"
              >
                <text class="news-cat-tag__text">{{ cat }}</text>
              </view>
            </view>
          </scroll-view>
        </view>
        <view class="news-list">
          <view
            v-for="(article, idx) in filteredArticles"
            :key="article.id"
            class="article-card"
            @tap="onArticleTap(article)"
          >
            <image class="article-card__cover" :src="article.cover" mode="aspectFill" lazy-load />
            <view class="article-card__body">
              <text class="article-card__title">{{ article.title }}</text>
              <view class="article-card__meta">
                <text class="article-card__tag">{{ article.category }}</text>
                <text class="article-card__dot">·</text>
                <text class="article-card__date">{{ article.date }}</text>
                <text class="article-card__dot">·</text>
                <text class="article-card__reads">{{ article.readCount }} 阅读</text>
              </view>
            </view>
          </view>
        </view>
        <view class="load-more" v-if="articles.length > 0">
          <view class="load-more__loading" v-if="loadingMore">
            <view class="load-more__spinner" />
            <text class="load-more__text">加载中...</text>
          </view>
          <text class="load-more__end" v-else-if="!hasMore">— 已浏览全部资讯 —</text>
        </view>
      </view>

      <view class="tab-panel" v-if="activeTab === 1">
        <view class="gallery-intro">
          <text class="gallery-intro__title">沉浸式线上展厅</text>
          <text class="gallery-intro__desc">足不出户，漫步艺术空间</text>
        </view>
        <view class="exhibition-list">
          <view
            v-for="exhibition in exhibitions"
            :key="exhibition.id"
            class="exhibition-card"
            @tap="onExhibitionTap(exhibition)"
          >
            <view class="exhibition-card__cover-wrap">
              <image class="exhibition-card__cover" :src="exhibition.cover" mode="aspectFill" lazy-load />
              <view class="exhibition-card__overlay" />
              <view class="exhibition-card__cover-info">
                <text class="exhibition-card__cover-title">{{ exhibition.title }}</text>
                <text class="exhibition-card__cover-sub">{{ exhibition.theme }}</text>
              </view>
            </view>
            <view class="exhibition-card__footer">
              <view class="exhibition-card__detail">
                <view class="exhibition-card__row">
                  <text class="exhibition-card__label">策展人</text>
                  <text class="exhibition-card__value">{{ exhibition.curator }}</text>
                </view>
                <view class="exhibition-card__row">
                  <text class="exhibition-card__label">作品数</text>
                  <text class="exhibition-card__value">{{ exhibition.artworkCount }} 件</text>
                </view>
              </view>
              <view class="exhibition-card__btn" @tap.stop="onEnterGallery(exhibition)">
                <text class="exhibition-card__btn-text">进入展厅</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="tab-panel" v-if="activeTab === 2">
        <view class="hot-topics">
          <view class="hot-topics__header">
            <view class="section-title-group">
              <view class="accent-line" />
              <text class="section-title">热门话题</text>
            </view>
          </view>
          <scroll-view scroll-x :show-scrollbar="false" enhanced>
            <view class="hot-topics__list">
              <view
                v-for="topic in hotTopics"
                :key="topic.id"
                class="hot-topic-card"
                @tap="onTopicTap(topic)"
              >
                <image class="hot-topic-card__bg" :src="topic.cover" mode="aspectFill" lazy-load />
                <view class="hot-topic-card__mask" />
                <view class="hot-topic-card__content">
                  <text class="hot-topic-card__name">#{{ topic.name }}</text>
                  <text class="hot-topic-card__count">{{ topic.postCount }} 参与</text>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
        <view class="all-topics">
          <view class="all-topics__header">
            <view class="section-title-group">
              <view class="accent-line" />
              <text class="section-title">全部话题</text>
            </view>
          </view>
          <view class="topic-grid">
            <view
              v-for="topic in allTopics"
              :key="topic.id"
              class="topic-card"
              @tap="onTopicTap(topic)"
            >
              <image class="topic-card__cover" :src="topic.cover" mode="aspectFill" lazy-load />
              <view class="topic-card__info">
                <text class="topic-card__name">#{{ topic.name }}</text>
                <text class="topic-card__desc">{{ topic.description }}</text>
                <text class="topic-card__count">{{ topic.postCount }} 篇内容</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="tab-panel" v-if="activeTab === 3">
        <view class="showoff-list">
          <view class="waterfall">
            <view class="waterfall__col">
              <view
                v-for="post in leftPosts"
                :key="post.id"
                class="showoff-card"
                @tap="onShowoffTap(post)"
              >
                <image
                  class="showoff-card__image"
                  :src="post.image"
                  mode="widthFix"
                  lazy-load
                />
                <view class="showoff-card__body">
                  <text class="showoff-card__caption">{{ post.caption }}</text>
                  <view class="showoff-card__user-row">
                    <image class="showoff-card__avatar" :src="post.avatar" mode="aspectFill" />
                    <text class="showoff-card__username">{{ post.username }}</text>
                  </view>
                  <view class="showoff-card__actions">
                    <view class="showoff-card__action" @tap.stop="onLikePost(post)">
                      <text class="showoff-card__action-icon">{{ post.liked ? '♥' : '♡' }}</text>
                      <text class="showoff-card__action-count">{{ post.likeCount }}</text>
                    </view>
                    <view class="showoff-card__action" @tap.stop="onCommentPost(post)">
                      <text class="showoff-card__action-icon">💬</text>
                      <text class="showoff-card__action-count">{{ post.commentCount }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <view class="waterfall__col">
              <view
                v-for="post in rightPosts"
                :key="post.id"
                class="showoff-card"
                @tap="onShowoffTap(post)"
              >
                <image
                  class="showoff-card__image"
                  :src="post.image"
                  mode="widthFix"
                  lazy-load
                />
                <view class="showoff-card__body">
                  <text class="showoff-card__caption">{{ post.caption }}</text>
                  <view class="showoff-card__user-row">
                    <image class="showoff-card__avatar" :src="post.avatar" mode="aspectFill" />
                    <text class="showoff-card__username">{{ post.username }}</text>
                  </view>
                  <view class="showoff-card__actions">
                    <view class="showoff-card__action" @tap.stop="onLikePost(post)">
                      <text class="showoff-card__action-icon">{{ post.liked ? '♥' : '♡' }}</text>
                      <text class="showoff-card__action-count">{{ post.likeCount }}</text>
                    </view>
                    <view class="showoff-card__action" @tap.stop="onCommentPost(post)">
                      <text class="showoff-card__action-icon">💬</text>
                      <text class="showoff-card__action-count">{{ post.commentCount }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>

    <view class="fab-btn" v-if="activeTab === 3" @tap="onPublishShowoff">
      <text class="fab-btn__icon">✚</text>
      <text class="fab-btn__text">发布晒单</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const tabs = ['艺术资讯', '线上展厅', '话题广场', '用户晒单']
const activeTab = ref(0)
const activeNewsCat = ref('全部')
const isRefreshing = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)

const newsCategories = ['全部', '展览信息', '艺术家访谈', '艺术科普', '行业动态']

const indicatorWidth = 140
const indicatorLeft = computed(() => {
  const segmentWidth = 750 / tabs.length
  return (activeTab.value * segmentWidth + (segmentWidth - indicatorWidth) / 2)
})

const imgBase = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt='

const articles = ref([
  {
    id: '1',
    title: '春日印象：当代水墨的东方美学新表达',
    cover: imgBase + 'contemporary+chinese+ink+painting+spring+blossom+gallery+exhibition&image_size=landscape_16_9',
    category: '展览信息',
    date: '2026-05-20',
    readCount: 3842,
  },
  {
    id: '2',
    title: '对话林清远：在山水间寻找当代人的精神栖居',
    cover: imgBase + 'artist+interview+studio+ink+wash+painting+portrait&image_size=landscape_16_9',
    category: '艺术家访谈',
    date: '2026-05-18',
    readCount: 2156,
  },
  {
    id: '3',
    title: '什么是艺术微喷？带你了解版画收藏的基础知识',
    cover: imgBase + 'giclee+print+making+art+process+studio+fine+art&image_size=landscape_16_9',
    category: '艺术科普',
    date: '2026-05-15',
    readCount: 5621,
  },
  {
    id: '4',
    title: '2026年艺术市场趋势：年轻藏家崛起与数字化浪潮',
    cover: imgBase + 'art+market+auction+gallery+trend+modern+digital&image_size=landscape_16_9',
    category: '行业动态',
    date: '2026-05-12',
    readCount: 4287,
  },
  {
    id: '5',
    title: '苏婉清个展「花间集」：静物画中的诗意日常',
    cover: imgBase + 'still+life+flowers+painting+exhibition+soft+light+morandi&image_size=landscape_16_9',
    category: '展览信息',
    date: '2026-05-10',
    readCount: 1893,
  },
  {
    id: '6',
    title: '从莫兰迪到当下：低饱和度色彩为何经久不衰',
    cover: imgBase + 'morandi+color+palette+still+life+ceramic+bottles+art&image_size=landscape_16_9',
    category: '艺术科普',
    date: '2026-05-08',
    readCount: 6734,
  },
])

const filteredArticles = computed(() => {
  if (activeNewsCat.value === '全部') return articles.value
  return articles.value.filter((a) => a.category === activeNewsCat.value)
})

const exhibitions = ref([
  {
    id: 'e1',
    title: '春日印象',
    theme: '当代水墨的东方美学',
    cover: imgBase + 'spring+impression+chinese+ink+art+gallery+exhibition+cherry+blossom&image_size=landscape_16_9',
    curator: '周明远',
    artworkCount: 36,
  },
  {
    id: 'e2',
    title: '城市光影',
    theme: '都市摄影中的诗意瞬间',
    cover: imgBase + 'city+lights+urban+photography+night+neon+gallery&image_size=landscape_16_9',
    curator: '陈默',
    artworkCount: 24,
  },
  {
    id: 'e3',
    title: '静谧之物',
    theme: '莫兰迪色系的当代静物',
    cover: imgBase + 'morandi+still+life+ceramic+vase+quiet+objects+painting&image_size=landscape_16_9',
    curator: '苏婉清',
    artworkCount: 18,
  },
])

const hotTopics = ref([
  {
    id: 't1',
    name: '艺术生活',
    cover: imgBase + 'art+life+aesthetic+home+decor+painting+on+wall&image_size=landscape_16_9',
    postCount: 2863,
    description: '分享艺术融入日常的美好方式',
  },
  {
    id: 't2',
    name: '家居美学',
    cover: imgBase + 'home+aesthetic+interior+design+art+wall+minimalist&image_size=landscape_16_9',
    postCount: 4127,
    description: '打造有品位的艺术居住空间',
  },
])

const allTopics = ref([
  {
    id: 't1',
    name: '艺术生活',
    cover: imgBase + 'art+life+aesthetic+home+decor+painting+on+wall&image_size=landscape_16_9',
    postCount: 2863,
    description: '分享艺术融入日常的美好方式',
  },
  {
    id: 't2',
    name: '家居美学',
    cover: imgBase + 'home+aesthetic+interior+design+art+wall+minimalist&image_size=landscape_16_9',
    postCount: 4127,
    description: '打造有品位的艺术居住空间',
  },
  {
    id: 't3',
    name: '收藏心得',
    cover: imgBase + 'art+collection+gallery+framed+prints+display&image_size=landscape_16_9',
    postCount: 1548,
    description: '艺术品收藏的经验与感悟',
  },
  {
    id: 't4',
    name: '创作分享',
    cover: imgBase + 'artist+studio+painting+process+creative+workspace&image_size=landscape_16_9',
    postCount: 967,
    description: '记录创作过程与灵感来源',
  },
  {
    id: 't5',
    name: '看展日记',
    cover: imgBase + 'art+exhibition+visit+museum+gallery+walk&image_size=landscape_16_9',
    postCount: 2194,
    description: '分享你的看展体验与发现',
  },
])

const userPosts = ref([
  {
    id: 'p1',
    username: '小鱼爱画画',
    avatar: imgBase + 'cute+girl+avatar+illustration+soft+pastel&image_size=portrait_4_3',
    image: imgBase + 'art+print+on+white+wall+living+room+scandinavian+interior&image_size=portrait_4_3',
    caption: '新入手的《晨雾中的远山》，挂在客厅太美了！',
    likeCount: 128,
    commentCount: 23,
    liked: false,
  },
  {
    id: 'p2',
    username: '家居控Lily',
    avatar: imgBase + 'elegant+woman+avatar+neutral+background&image_size=portrait_4_3',
    image: imgBase + 'framed+art+bedroom+wall+cozy+minimalist+aesthetic&image_size=portrait_4_3',
    caption: '卧室换上了苏婉清的《静物·陶与花》，整个空间都温柔了',
    likeCount: 256,
    commentCount: 41,
    liked: false,
  },
  {
    id: 'p3',
    username: '艺术小白',
    avatar: imgBase + 'young+man+avatar+casual+friendly&image_size=portrait_4_3',
    image: imgBase + 'art+gallery+wall+multiple+frames+arrangement+home&image_size=portrait_4_3',
    caption: '第一次买版画，选了陈默的城市系列，质感超乎想象',
    likeCount: 89,
    commentCount: 15,
    liked: false,
  },
  {
    id: 'p4',
    username: '莫兰迪少女',
    avatar: imgBase + 'girl+avatar+artistic+soft+morandi+colors&image_size=portrait_4_3',
    image: imgBase + 'morandi+color+art+prints+display+shelf+decor&image_size=portrait_4_3',
    caption: '莫兰迪色系真的太治愈了，家里每个角落都是画',
    likeCount: 312,
    commentCount: 56,
    liked: false,
  },
  {
    id: 'p5',
    username: '设计师阿K',
    avatar: imgBase + 'male+designer+avatar+glasses+minimal&image_size=portrait_4_3',
    image: imgBase + 'large+art+canvas+office+wall+modern+workspace&image_size=portrait_4_3',
    caption: '工作室新挂的《海的记忆II》，灵感来源有了',
    likeCount: 167,
    commentCount: 28,
    liked: false,
  },
  {
    id: 'p6',
    username: '花花世界',
    avatar: imgBase + 'flower+avatar+botanical+illustration+girl&image_size=portrait_4_3',
    image: imgBase + 'botanical+art+print+hallway+wall+entrway+home&image_size=portrait_4_3',
    caption: '走廊尽头挂了一幅植物图谱，进门就有仪式感',
    likeCount: 201,
    commentCount: 34,
    liked: false,
  },
  {
    id: 'p7',
    username: '收藏家老王',
    avatar: imgBase + 'mature+man+avatar+sophisticated+elegant&image_size=portrait_4_3',
    image: imgBase + 'art+collection+display+living+room+luxury+interior&image_size=portrait_4_3',
    caption: '第三幅入手了，限量版画的收藏价值真的不错',
    likeCount: 94,
    commentCount: 19,
    liked: false,
  },
  {
    id: 'p8',
    username: '北欧风小窝',
    avatar: imgBase + 'nordic+style+avatar+minimal+clean&image_size=portrait_4_3',
    image: imgBase + 'nordic+interior+white+wall+art+print+minimalist+living&image_size=portrait_4_3',
    caption: '白框配白墙，简约到极致就是美',
    likeCount: 178,
    commentCount: 31,
    liked: false,
  },
])

const leftPosts = computed(() => {
  return userPosts.value.filter((_, i) => i % 2 === 0)
})

const rightPosts = computed(() => {
  return userPosts.value.filter((_, i) => i % 2 !== 0)
})

function onTabChange(idx: number) {
  activeTab.value = idx
  hasMore.value = true
}

function onArticleTap(article: { id: string }) {
  uni.navigateTo({ url: `/pages/community/article?id=${article.id}` })
}

function onExhibitionTap(exhibition: { id: string }) {
  uni.navigateTo({ url: `/pages/community/gallery3d?id=${exhibition.id}` })
}

function onEnterGallery(exhibition: { id: string; title: string }) {
  uni.navigateTo({ url: `/pages/community/gallery3d?id=${exhibition.id}&title=${exhibition.title}` })
}

function onTopicTap(topic: { id: string; name: string }) {
  uni.navigateTo({ url: `/pages/community/topic?id=${topic.id}&name=${topic.name}` })
}

function onShowoffTap(post: { id: string }) {
  uni.navigateTo({ url: `/pages/community/showoff?id=${post.id}` })
}

function onLikePost(post: { id: string; liked: boolean; likeCount: number }) {
  const target = userPosts.value.find((p) => p.id === post.id)
  if (target) {
    target.liked = !target.liked
    target.likeCount += target.liked ? 1 : -1
  }
}

function onCommentPost(post: { id: string }) {
  uni.navigateTo({ url: `/pages/community/showoff?id=${post.id}&action=comment` })
}

function onPublishShowoff() {
  uni.navigateTo({ url: '/pages/community/publish' })
}

function onRefresh() {
  isRefreshing.value = true
  setTimeout(() => {
    isRefreshing.value = false
  }, 1000)
}

function onLoadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  setTimeout(() => {
    loadingMore.value = false
    hasMore.value = false
  }, 800)
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.community-page {
  min-height: 100vh;
  background-color: $color-bg;
  display: flex;
  flex-direction: column;
}

.community-header {
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

.community-content {
  flex: 1;
  height: 0;
}

.tab-panel {
  padding: $spacing-base;
}

.news-categories {
  margin-bottom: $spacing-base;

  &__inner {
    display: inline-flex;
    gap: $spacing-sm;
    padding-right: $spacing-base;
  }
}

.news-cat-tag {
  padding: $spacing-xs $spacing-md;
  border-radius: $radius-full;
  background-color: $color-bg-secondary;
  transition: $transition-base;

  &--active {
    background-color: $morandi-beige;

    .news-cat-tag__text {
      color: $color-white;
    }
  }

  &__text {
    font-size: $font-sm;
    color: $color-text-secondary;
    white-space: nowrap;
    letter-spacing: 1rpx;
  }
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.article-card {
  background-color: $color-white;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
  transition: $transition-base;

  &:active {
    transform: scale(0.98);
    box-shadow: $shadow-base;
  }

  &__cover {
    width: 100%;
    height: 340rpx;
  }

  &__body {
    padding: $spacing-base $spacing-md $spacing-md;
  }

  &__title {
    font-family: 'Georgia', 'Noto Serif SC', serif;
    font-size: $font-md;
    color: $color-text-primary;
    font-weight: 500;
    letter-spacing: 1rpx;
    line-height: 1.5;
    @include ellipsis(2);
  }

  &__meta {
    display: flex;
    align-items: center;
    margin-top: $spacing-sm;
    gap: $spacing-xs;
  }

  &__tag {
    font-size: $font-xs;
    color: $color-accent;
    background-color: rgba($color-accent, 0.08);
    padding: 2rpx 12rpx;
    border-radius: $radius-sm;
    letter-spacing: 1rpx;
  }

  &__dot {
    font-size: $font-xs;
    color: $color-text-placeholder;
  }

  &__date,
  &__reads {
    font-size: $font-xs;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;
  }
}

.load-more {
  @include flex-center;
  padding: $spacing-lg 0 $spacing-xl;

  &__loading {
    @include flex-center;
    gap: $spacing-sm;
  }

  &__spinner {
    width: 32rpx;
    height: 32rpx;
    border: 3rpx solid $color-border;
    border-top-color: $morandi-beige;
    border-radius: $radius-full;
    animation: spin 0.8s linear infinite;
  }

  &__text {
    font-size: $font-sm;
    color: $color-text-tertiary;
  }

  &__end {
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

.gallery-intro {
  text-align: center;
  padding: $spacing-lg 0 $spacing-md;

  &__title {
    font-family: 'Georgia', 'Noto Serif SC', serif;
    font-size: $font-lg;
    color: $color-text-primary;
    font-weight: 600;
    letter-spacing: 3rpx;
    display: block;
  }

  &__desc {
    font-size: $font-sm;
    color: $color-text-tertiary;
    letter-spacing: 2rpx;
    margin-top: $spacing-xs;
    display: block;
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

  &:active {
    transform: scale(0.98);
    box-shadow: $shadow-base;
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
    font-size: $font-xl;
    color: #ffffff;
    font-weight: 600;
    letter-spacing: 4rpx;
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
    display: block;
  }

  &__cover-sub {
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.75);
    letter-spacing: 2rpx;
    margin-top: $spacing-xs;
    display: block;
  }

  &__footer {
    padding: $spacing-base $spacing-md;
    display: flex;
    align-items: center;
    justify-content: space-between;
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

  &__btn {
    padding: $spacing-sm $spacing-md;
    background-color: $color-accent;
    border-radius: $radius-base;
    transition: $transition-base;

    &:active {
      opacity: 0.85;
      transform: scale(0.97);
    }
  }

  &__btn-text {
    font-size: $font-sm;
    color: $color-white;
    letter-spacing: 2rpx;
  }
}

.hot-topics {
  margin-bottom: $spacing-lg;

  &__header {
    margin-bottom: $spacing-base;
  }

  &__list {
    display: inline-flex;
    gap: $spacing-base;
    padding-right: $spacing-base;
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

.hot-topic-card {
  position: relative;
  width: 360rpx;
  height: 240rpx;
  border-radius: $radius-lg;
  overflow: hidden;
  flex-shrink: 0;

  &:active {
    transform: scale(0.97);
  }

  &__bg {
    width: 100%;
    height: 100%;
  }

  &__mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.1) 60%, transparent 100%);
  }

  &__content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: $spacing-base;
  }

  &__name {
    font-family: 'Georgia', 'Noto Serif SC', serif;
    font-size: $font-md;
    color: #ffffff;
    font-weight: 600;
    letter-spacing: 2rpx;
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
    display: block;
  }

  &__count {
    font-size: $font-xs;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 1rpx;
    margin-top: $spacing-xs;
    display: block;
  }
}

.all-topics {
  &__header {
    margin-bottom: $spacing-base;
  }
}

.topic-grid {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.topic-card {
  display: flex;
  background-color: $color-white;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
  transition: $transition-base;

  &:active {
    transform: scale(0.98);
    box-shadow: $shadow-base;
  }

  &__cover {
    width: 200rpx;
    height: 200rpx;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    padding: $spacing-base;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: $spacing-xs;
  }

  &__name {
    font-family: 'Georgia', 'Noto Serif SC', serif;
    font-size: $font-md;
    color: $color-text-primary;
    font-weight: 600;
    letter-spacing: 2rpx;
  }

  &__desc {
    font-size: $font-sm;
    color: $color-text-secondary;
    letter-spacing: 1rpx;
    @include ellipsis(2);
    line-height: 1.5;
  }

  &__count {
    font-size: $font-xs;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;
  }
}

.showoff-list {
  padding: 0;
}

.waterfall {
  display: flex;
  gap: $spacing-sm;

  &__col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }
}

.showoff-card {
  background-color: $color-white;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
  transition: $transition-base;

  &:active {
    transform: scale(0.98);
    box-shadow: $shadow-base;
  }

  &__image {
    width: 100%;
  }

  &__body {
    padding: $spacing-sm $spacing-sm $spacing-base;
  }

  &__caption {
    font-size: $font-sm;
    color: $color-text-primary;
    letter-spacing: 1rpx;
    line-height: 1.5;
    @include ellipsis(3);
  }

  &__user-row {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    margin-top: $spacing-sm;
  }

  &__avatar {
    width: 40rpx;
    height: 40rpx;
    border-radius: $radius-full;
    flex-shrink: 0;
  }

  &__username {
    font-size: $font-xs;
    color: $color-text-secondary;
    letter-spacing: 1rpx;
    @include ellipsis;
    flex: 1;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    margin-top: $spacing-sm;
  }

  &__action {
    display: flex;
    align-items: center;
    gap: 4rpx;
  }

  &__action-icon {
    font-size: $font-sm;
    color: $color-text-tertiary;
  }

  &__action-count {
    font-size: $font-xs;
    color: $color-text-tertiary;
    letter-spacing: 1rpx;
  }
}

.fab-btn {
  position: fixed;
  right: $spacing-md;
  bottom: 180rpx;
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-md;
  background-color: $color-accent;
  border-radius: $radius-full;
  box-shadow: $shadow-lg;
  z-index: 50;
  transition: $transition-base;

  &:active {
    opacity: 0.85;
    transform: scale(0.95);
  }

  &__icon {
    font-size: $font-md;
    color: $color-white;
  }

  &__text {
    font-size: $font-sm;
    color: $color-white;
    letter-spacing: 2rpx;
  }
}

.bottom-spacer {
  height: 160rpx;
}
</style>
