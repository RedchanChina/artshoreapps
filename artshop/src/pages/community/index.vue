<template>
  <view class="community-page">
    <view class="community-header">
      <view class="header-top">
        <text class="header-title">Community</text>
      </view>
      <view class="tab-bar">
        <view
          v-for="(tab, idx) in tabs"
          :key="idx"
          class="tab-item"
          :class="{ 'tab-item--active': activeTab === idx }"
          @tap="onTabChange(idx)"
        >
          <text class="tab-item-text">{{ tab }}</text>
          <view v-if="activeTab === idx" class="tab-item-indicator" />
        </view>
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
        <view class="article-list">
          <view
            v-for="article in filteredArticles"
            :key="article.id"
            class="article-item"
            @tap="onArticleTap(article)"
          >
            <image class="article-cover" :src="article.cover" mode="aspectFill" lazy-load />
            <text class="article-title">{{ article.title }}</text>
            <text class="article-date">{{ article.date }}</text>
          </view>
        </view>
        <view class="load-more" v-if="articles.length > 0">
          <text class="load-more-end" v-if="!hasMore">—</text>
        </view>
      </view>

      <view class="tab-panel" v-if="activeTab === 1">
        <view class="exhibition-list">
          <view
            v-for="exhibition in exhibitions"
            :key="exhibition.id"
            class="exhibition-item"
            @tap="onExhibitionTap(exhibition)"
          >
            <image class="exhibition-cover" :src="exhibition.cover" mode="aspectFill" lazy-load />
            <view class="exhibition-info">
              <text class="exhibition-title">{{ exhibition.title }}</text>
              <text class="exhibition-enter" @tap.stop="onEnterGallery(exhibition)">Enter →</text>
            </view>
          </view>
        </view>
      </view>

      <view class="tab-panel" v-if="activeTab === 2">
        <view class="topic-list">
          <view
            v-for="topic in allTopics"
            :key="topic.id"
            class="topic-item"
            @tap="onTopicTap(topic)"
          >
            <text class="topic-name">#{{ topic.name }}</text>
            <text class="topic-count">{{ topic.postCount }} posts</text>
          </view>
        </view>
      </view>

      <view class="tab-panel" v-if="activeTab === 3">
        <view class="waterfall">
          <view class="waterfall-col">
            <view
              v-for="post in leftPosts"
              :key="post.id"
              class="post-item"
              @tap="onShowoffTap(post)"
            >
              <image class="post-image" :src="post.image" mode="widthFix" lazy-load />
              <text class="post-caption">{{ post.caption }}</text>
              <view class="post-user">
                <text class="post-username">{{ post.username }}</text>
                <text class="post-likes">{{ post.liked ? '♥' : '♡' }} {{ post.likeCount }}</text>
              </view>
            </view>
          </view>
          <view class="waterfall-col">
            <view
              v-for="post in rightPosts"
              :key="post.id"
              class="post-item"
              @tap="onShowoffTap(post)"
            >
              <image class="post-image" :src="post.image" mode="widthFix" lazy-load />
              <text class="post-caption">{{ post.caption }}</text>
              <view class="post-user">
                <text class="post-username">{{ post.username }}</text>
                <text class="post-likes">{{ post.liked ? '♥' : '♡' }} {{ post.likeCount }}</text>
              </view>
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

const tabs = ['资讯', '展厅', '话题', '晒单']
const activeTab = ref(0)
const isRefreshing = ref(false)
const hasMore = ref(true)

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

const filteredArticles = computed(() => articles.value)

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

const leftPosts = computed(() => userPosts.value.filter((_, i) => i % 2 === 0))
const rightPosts = computed(() => userPosts.value.filter((_, i) => i % 2 !== 0))

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

function onRefresh() {
  isRefreshing.value = true
  setTimeout(() => {
    isRefreshing.value = false
  }, 1000)
}

function onLoadMore() {
  if (!hasMore.value) return
  hasMore.value = false
}
</script>

<style lang="scss" scoped>
@import '@/styles/mixins.scss';
.community-page {
  min-height: 100vh;
  background-color: $color-surface;
  display: flex;
  flex-direction: column;
}

.community-header {
  background-color: $color-surface;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-top {
  padding: $space-xl $space-lg $space-md;

  .header-title {
    @include serif-heading;
    font-size: $font-xl;
  }
}

.tab-bar {
  display: flex;
  padding: 0 $space-lg;
  border-bottom: 1rpx solid $color-rule;
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
  white-space: nowrap;
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

.community-content {
  flex: 1;
  height: 0;
}

.tab-panel {
  padding: $space-lg;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: $space-xl;
}

.article-item {
  &:active {
    opacity: 0.8;
  }
}

.article-cover {
  width: 100%;
  height: 360rpx;
  border-radius: $radius-xs;
}

.article-title {
  @include serif-heading;
  font-size: $font-md;
  display: block;
  margin-top: $space-md;
  line-height: 1.5;
  @include ellipsis(2);
}

.article-date {
  @include sans-body;
  font-size: $font-xs;
  display: block;
  margin-top: $space-xs;
}

.load-more {
  @include flex-center;
  padding: $space-xl 0;
}

.load-more-end {
  @include sans-body;
  font-size: $font-sm;
  color: $color-ink-tertiary;
}

.exhibition-list {
  display: flex;
  flex-direction: column;
  gap: $space-xl;
}

.exhibition-item {
  &:active {
    opacity: 0.8;
  }
}

.exhibition-cover {
  width: 100%;
  height: 400rpx;
  border-radius: $radius-xs;
}

.exhibition-info {
  @include flex-between;
  margin-top: $space-md;
}

.exhibition-title {
  @include serif-heading;
  font-size: $font-md;
}

.exhibition-enter {
  @include sans-body;
  font-size: $font-sm;
  color: $color-ink-secondary;
  letter-spacing: 0.04em;

  &:active {
    color: $color-ink;
  }
}

.topic-list {
  display: flex;
  flex-direction: column;
}

.topic-item {
  @include flex-between;
  padding: $space-lg 0;
  border-bottom: 1rpx solid $color-rule;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    opacity: 0.8;
  }
}

.topic-name {
  @include serif-heading;
  font-size: $font-base;
}

.topic-count {
  @include sans-body;
  font-size: $font-sm;
}

.waterfall {
  display: flex;
  gap: $space-sm;

  &-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $space-sm;
  }
}

.post-item {
  &:active {
    opacity: 0.8;
  }
}

.post-image {
  width: 100%;
  border-radius: $radius-xs;
}

.post-caption {
  @include sans-body;
  font-size: $font-sm;
  color: $color-ink;
  line-height: 1.5;
  display: block;
  margin-top: $space-sm;
  @include ellipsis(3);
}

.post-user {
  @include flex-between;
  margin-top: $space-xs;
}

.post-username {
  @include sans-body;
  font-size: $font-xs;
  @include ellipsis;
  flex: 1;
}

.post-likes {
  @include sans-body;
  font-size: $font-xs;
  color: $color-ink-tertiary;
  flex-shrink: 0;
  margin-left: $space-sm;
}

.bottom-spacer {
  height: 160rpx;
}

@media (min-width: $breakpoint-md) {
  .community-page {
    @include responsive-container;
  }

  .community-content {
    @include desktop-scrollbar;
  }

  .header-top {
    padding: $space-2xl $space-xl $space-lg;
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

  .article-list {
    @include desktop-grid(2, $space-xl);
  }

  .article-item {
    @include hover-lift;
    cursor: pointer;

    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $space-md;
    align-items: center;
  }

  .article-cover {
    height: 280rpx;
  }

  .article-title {
    margin-top: 0;
    font-size: $font-lg;
  }

  .exhibition-list {
    @include desktop-grid(3, $space-lg);
  }

  .exhibition-item {
    @include hover-lift;
    cursor: pointer;
  }

  .exhibition-cover {
    height: 320rpx;
  }

  .topic-list {
    @include desktop-grid(2, $space-lg);
  }

  .topic-item {
    padding: $space-xl;
    border-bottom: none;
    border: 1rpx solid $color-rule;
    border-radius: $radius-sm;
    cursor: pointer;

    &:hover {
      border-color: $color-ink-tertiary;
    }
  }

  .waterfall {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $space-md;

    &-col {
      display: flex;
      flex-direction: column;
      gap: $space-md;
    }
  }

  .post-item {
    @include hover-lift;
    cursor: pointer;
  }
}

@media (min-width: $breakpoint-lg) {
  .article-item {
    grid-template-columns: 2fr 3fr;
  }

  .article-cover {
    height: 320rpx;
  }

  .exhibition-cover {
    height: 360rpx;
  }

  .tab-panel {
    padding: $space-2xl;
  }
}
</style>
