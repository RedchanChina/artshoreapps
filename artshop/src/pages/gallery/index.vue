<template>
  <view class="gallery-page">
    <view class="gallery-header safe-area-top">
      <view class="search-bar">
        <view class="search-bar__inner" @tap="focusSearch">
          <view class="search-bar__icon">
            <text class="iconfont">&#xe60a;</text>
          </view>
          <input
            class="search-bar__input"
            v-model="searchKeyword"
            placeholder="搜索作品、艺术家..."
            placeholder-class="search-bar__placeholder"
            confirm-type="search"
            @confirm="onSearch"
            @input="onSearchInput"
          />
          <view
            class="search-bar__clear"
            v-if="searchKeyword"
            @tap.stop="clearSearch"
          >
            <text class="iconfont">&#xe60c;</text>
          </view>
        </view>
      </view>

      <scroll-view
        class="category-tabs"
        scroll-x
        :scroll-into-view="primaryTabId"
        :show-scrollbar="false"
        enhanced
      >
        <view
          v-for="tab in primaryCategories"
          :key="tab.value"
          :id="'tab-' + tab.value"
          class="category-tabs__item"
          :class="{ 'category-tabs__item--active': activePrimary === tab.value }"
          @tap="onPrimaryTab(tab.value)"
        >
          <text class="category-tabs__text">{{ tab.label }}</text>
          <view
            class="category-tabs__indicator"
            v-if="activePrimary === tab.value"
          />
        </view>
      </scroll-view>

      <scroll-view
        class="sub-category-tabs"
        scroll-x
        :show-scrollbar="false"
        enhanced
        v-if="subCategories.length"
      >
        <view
          v-for="sub in subCategories"
          :key="sub.value"
          class="sub-category-tabs__item"
          :class="{
            'sub-category-tabs__item--active': activeSub === sub.value,
          }"
          @tap="onSubTab(sub.value)"
        >
          <text class="sub-category-tabs__text">{{ sub.label }}</text>
        </view>
      </scroll-view>
    </view>

    <view class="filter-sort-bar">
      <view class="filter-sort-bar__left">
        <view class="filter-btn" @tap="openFilterPopup">
          <text class="filter-btn__icon">⌖</text>
          <text class="filter-btn__text">筛选</text>
          <view class="filter-btn__badge" v-if="activeFilterCount > 0">
            {{ activeFilterCount }}
          </view>
        </view>
      </view>
      <view class="filter-sort-bar__center">
        <scroll-view scroll-x :show-scrollbar="false" enhanced>
          <view class="sort-options">
            <view
              v-for="opt in sortOptions"
              :key="opt.value"
              class="sort-option"
              :class="{ 'sort-option--active': activeSort === opt.value }"
              @tap="onSortChange(opt.value)"
            >
              <text class="sort-option__text">{{ opt.label }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
      <view class="filter-sort-bar__right">
        <view class="view-toggle">
          <view
            class="view-toggle__item"
            :class="{ 'view-toggle__item--active': viewMode === 'grid-2' }"
            @tap="setViewMode('grid-2')"
          >
            <view class="view-icon view-icon--grid-2">
              <view /><view /><view /><view />
            </view>
          </view>
          <view
            class="view-toggle__item"
            :class="{ 'view-toggle__item--active': viewMode === 'grid-3' }"
            @tap="setViewMode('grid-3')"
          >
            <view class="view-icon view-icon--grid-3">
              <view /><view /><view /><view /><view /><view />
            </view>
          </view>
          <view
            class="view-toggle__item"
            :class="{ 'view-toggle__item--active': viewMode === 'list' }"
            @tap="setViewMode('list')"
          >
            <view class="view-icon view-icon--list">
              <view /><view /><view />
            </view>
          </view>
        </view>
      </view>
    </view>

    <scroll-view
      class="gallery-content"
      scroll-y
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onPullDownRefresh"
      @scrolltolower="onReachBottom"
      enhanced
      :bounces="false"
    >
      <view
        class="artwork-grid"
        :class="{
          'artwork-grid--2': viewMode === 'grid-2',
          'artwork-grid--3': viewMode === 'grid-3',
          'artwork-grid--list': viewMode === 'list',
        }"
      >
        <view
          v-for="(item, index) in displayArtworks"
          :key="item.id"
          class="artwork-card"
          :class="{
            'artwork-card--list': viewMode === 'list',
            'fade-in-up': !loading,
          }"
          :style="{ animationDelay: (index % 6) * 0.06 + 's' }"
          @tap="onArtworkTap(item.id)"
        >
          <view class="artwork-card__image-wrap">
            <image
              class="artwork-card__image"
              :src="item.image"
              mode="aspectFill"
              lazy-load
            />
            <view class="artwork-card__limited" v-if="item.isLimited">
              <text class="artwork-card__limited-text"
                >限量 {{ item.limitedNumber }}</text
              >
            </view>
            <view
              class="artwork-card__fav"
              @tap.stop="onToggleFav(item.id)"
            >
              <text class="artwork-card__fav-icon">{{
                favorites.has(item.id) ? '♥' : '♡'
              }}</text>
            </view>
          </view>
          <view class="artwork-card__info">
            <text class="artwork-card__title">{{ item.title }}</text>
            <text class="artwork-card__artist">{{ item.artistName }}</text>
            <view class="artwork-card__price-row">
              <text class="artwork-card__price">¥{{ item.price }}</text>
              <text
                class="artwork-card__original-price"
                v-if="item.originalPrice"
                >¥{{ item.originalPrice }}</text
              >
            </view>
          </view>
        </view>
      </view>

      <view class="skeleton-grid" v-if="loading && displayArtworks.length === 0">
        <view
          v-for="i in skeletonCount"
          :key="'sk-' + i"
          class="skeleton-card"
          :class="{
            'skeleton-card--list': viewMode === 'list',
          }"
        >
          <view class="skeleton-card__image skeleton" />
          <view class="skeleton-card__info">
            <view class="skeleton-card__title skeleton" />
            <view class="skeleton-card__subtitle skeleton" />
            <view class="skeleton-card__price skeleton" />
          </view>
        </view>
      </view>

      <view class="load-more" v-if="displayArtworks.length > 0">
        <view class="load-more__loading" v-if="loadingMore">
          <view class="load-more__spinner" />
          <text class="load-more__text">加载中...</text>
        </view>
        <text class="load-more__end" v-else-if="!hasMore">— 已浏览全部作品 —</text>
      </view>

      <view class="empty-state" v-if="!loading && displayArtworks.length === 0">
        <text class="empty-state__icon">🖼</text>
        <text class="empty-state__text">暂无相关作品</text>
        <view class="empty-state__btn" @tap="resetAllFilters">
          <text class="empty-state__btn-text">清除筛选</text>
        </view>
      </view>
    </scroll-view>

    <view
      class="filter-mask"
      :class="{ 'filter-mask--visible': filterPopupVisible }"
      @tap="closeFilterPopup"
    />
    <view
      class="filter-popup"
      :class="{ 'filter-popup--visible': filterPopupVisible }"
    >
      <view class="filter-popup__header">
        <text class="filter-popup__title">筛选条件</text>
        <view class="filter-popup__close" @tap="closeFilterPopup">
          <text>✕</text>
        </view>
      </view>
      <scroll-view class="filter-popup__body" scroll-y enhanced>
        <view class="filter-section">
          <text class="filter-section__title">尺寸</text>
          <view class="filter-chips">
            <view
              v-for="opt in sizeOptions"
              :key="opt.value"
              class="filter-chip"
              :class="{ 'filter-chip--active': tempFilters.size === opt.value }"
              @tap="onFilterChip('size', opt.value)"
            >
              <text class="filter-chip__text">{{ opt.label }}</text>
            </view>
          </view>
        </view>
        <view class="filter-section">
          <text class="filter-section__title">材质</text>
          <view class="filter-chips">
            <view
              v-for="opt in materialOptions"
              :key="opt.value"
              class="filter-chip"
              :class="{
                'filter-chip--active': tempFilters.material === opt.value,
              }"
              @tap="onFilterChip('material', opt.value)"
            >
              <text class="filter-chip__text">{{ opt.label }}</text>
            </view>
          </view>
        </view>
        <view class="filter-section">
          <text class="filter-section__title">装裱风格</text>
          <view class="filter-chips">
            <view
              v-for="opt in frameOptions"
              :key="opt.value"
              class="filter-chip"
              :class="{
                'filter-chip--active': tempFilters.frameStyle === opt.value,
              }"
              @tap="onFilterChip('frameStyle', opt.value)"
            >
              <text class="filter-chip__text">{{ opt.label }}</text>
            </view>
          </view>
        </view>
        <view class="filter-section">
          <text class="filter-section__title">价格区间</text>
          <view class="filter-chips">
            <view
              v-for="opt in pricePresets"
              :key="opt.label"
              class="filter-chip"
              :class="{
                'filter-chip--active':
                  tempFilters.priceRange &&
                  tempFilters.priceRange[0] === opt.range[0] &&
                  tempFilters.priceRange[1] === opt.range[1],
              }"
              @tap="onPricePreset(opt.range)"
            >
              <text class="filter-chip__text">{{ opt.label }}</text>
            </view>
          </view>
        </view>
        <view class="filter-section">
          <text class="filter-section__title">限量</text>
          <view class="filter-chips">
            <view
              class="filter-chip"
              :class="{ 'filter-chip--active': tempFilters.limited === true }"
              @tap="onFilterChip('limited', true)"
            >
              <text class="filter-chip__text">仅限量</text>
            </view>
            <view
              class="filter-chip"
              :class="{ 'filter-chip--active': tempFilters.limited === false }"
              @tap="onFilterChip('limited', false)"
            >
              <text class="filter-chip__text">非限量</text>
            </view>
          </view>
        </view>
      </scroll-view>
      <view class="filter-popup__footer safe-area-bottom">
        <view class="filter-popup__reset" @tap="resetFilters">
          <text class="filter-popup__reset-text">重置</text>
        </view>
        <view class="filter-popup__confirm" @tap="confirmFilters">
          <text class="filter-popup__confirm-text">确认</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { onPullDownRefresh as onPullDownRefreshHook, onReachBottom as onReachBottomHook } from '@dcloudio/uni-app'
import { useArtworkStore } from '@/stores/artwork'
import type { Artwork } from '@/types/artwork'

const artworkStore = useArtworkStore()

const primaryCategories = [
  { label: '全部', value: '' },
  { label: '摄影', value: 'photography' },
  { label: '插画', value: 'illustration' },
  { label: '艺术周边', value: 'merchandise' },
  { label: '装裱材料', value: 'framing' },
]

const subCategoryMap: Record<string, { label: string; value: string }[]> = {
  photography: [
    { label: '风光', value: 'landscape' },
    { label: '人像', value: 'portrait' },
    { label: '抽象', value: 'abstract' },
    { label: '复古', value: 'vintage' },
  ],
  illustration: [
    { label: '潮流', value: 'trendy' },
    { label: '治愈', value: 'healing' },
    { label: '手绘', value: 'handdrawn' },
  ],
}

const sortOptions = [
  { label: '最新上架', value: 'newest' },
  { label: '价格高→低', value: 'price_desc' },
  { label: '价格低→高', value: 'price_asc' },
  { label: '热门', value: 'sales' },
  { label: '限量优先', value: 'limited' },
]

const sizeOptions = [
  { label: 'S', value: 'S' },
  { label: 'M', value: 'M' },
  { label: 'L', value: 'L' },
  { label: 'XL', value: 'XL' },
]

const materialOptions = [
  { label: '艺术微喷', value: 'giclee' },
  { label: '亚克力三明治', value: 'acrylic' },
]

const frameOptions = [
  { label: '黑框', value: 'black' },
  { label: '白框', value: 'white' },
  { label: '铁灰框', value: 'iron-grey' },
  { label: '无框', value: 'frameless' },
]

const pricePresets = [
  { label: '¥0-500', range: [0, 500] as [number, number] },
  { label: '¥500-2000', range: [500, 2000] as [number, number] },
  { label: '¥2000-5000', range: [2000, 5000] as [number, number] },
  { label: '¥5000+', range: [5000, 999999] as [number, number] },
]

const imgBase = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt='

const mockArtworks: (Artwork & { isLimited?: boolean; limitedNumber?: number; subCategory?: string })[] = [
  {
    id: '1', title: '晨雾中的远山', image: imgBase + 'morning+mist+mountains+landscape+photography&image_size=portrait_4_3', images: [],
    artistName: '林清远', artistId: 'a1', category: 'photography', subCategory: 'landscape',
    price: 1280, originalPrice: 1680, description: '清晨薄雾笼罩的远山',
    specifications: [{ size: 'M', material: 'giclee', frameStyle: 'white', price: 1280, stock: 10 }],
    sales: 56, stock: 10, rating: 4.8, tags: ['风光', '山水', '晨雾'], createdAt: '2026-05-20',
    isLimited: true, limitedNumber: 50,
  },
  {
    id: '2', title: '城市黄昏', image: imgBase + 'city+dusk+golden+hour+urban+photography&image_size=portrait_4_3', images: [],
    artistName: '陈墨白', artistId: 'a2', category: 'photography', subCategory: 'landscape',
    price: 860, description: '城市天际线的金色黄昏',
    specifications: [{ size: 'S', material: 'giclee', frameStyle: 'black', price: 860, stock: 30 }],
    sales: 120, stock: 30, rating: 4.6, tags: ['城市', '黄昏', '天际线'], createdAt: '2026-05-18',
  },
  {
    id: '3', title: '回眸', image: imgBase + 'portrait+photography+woman+looking+back+artistic&image_size=portrait_4_3', images: [],
    artistName: '苏婉清', artistId: 'a3', category: 'photography', subCategory: 'portrait',
    price: 2400, description: '光影交错中的人像',
    specifications: [{ size: 'L', material: 'acrylic', frameStyle: 'white', price: 2400, stock: 5 }],
    sales: 28, stock: 5, rating: 4.9, tags: ['人像', '光影', '黑白'], createdAt: '2026-05-15',
    isLimited: true, limitedNumber: 20,
  },
  {
    id: '4', title: '抽象之舞', image: imgBase + 'abstract+dance+motion+blur+art+photography&image_size=portrait_4_3', images: [],
    artistName: '赵无极', artistId: 'a4', category: 'photography', subCategory: 'abstract',
    price: 3600, description: '动态模糊中的抽象美感',
    specifications: [{ size: 'XL', material: 'acrylic', frameStyle: 'iron-grey', price: 3600, stock: 3 }],
    sales: 15, stock: 3, rating: 4.7, tags: ['抽象', '动态', '艺术'], createdAt: '2026-05-12',
    isLimited: true, limitedNumber: 10,
  },
  {
    id: '5', title: '旧时光', image: imgBase + 'vintage+retro+film+photography+nostalgic&image_size=portrait_4_3', images: [],
    artistName: '林清远', artistId: 'a1', category: 'photography', subCategory: 'vintage',
    price: 980, description: '胶片质感的旧时光记忆',
    specifications: [{ size: 'M', material: 'giclee', frameStyle: 'black', price: 980, stock: 20 }],
    sales: 88, stock: 20, rating: 4.5, tags: ['复古', '胶片', '怀旧'], createdAt: '2026-05-10',
  },
  {
    id: '6', title: '赛博朋克夜', image: imgBase + 'cyberpunk+neon+city+night+illustration+digital+art&image_size=portrait_4_3', images: [],
    artistName: '张小幻', artistId: 'a5', category: 'illustration', subCategory: 'trendy',
    price: 680, description: '霓虹灯下的赛博朋克世界',
    specifications: [{ size: 'S', material: 'giclee', frameStyle: 'frameless', price: 680, stock: 50 }],
    sales: 200, stock: 50, rating: 4.8, tags: ['赛博朋克', '霓虹', '潮流'], createdAt: '2026-05-19',
  },
  {
    id: '7', title: '猫咪花园', image: imgBase + 'cute+cat+garden+flowers+healing+illustration&image_size=portrait_4_3', images: [],
    artistName: '李暖暖', artistId: 'a6', category: 'illustration', subCategory: 'healing',
    price: 420, originalPrice: 560, description: '花园里慵懒的猫咪',
    specifications: [{ size: 'S', material: 'giclee', frameStyle: 'white', price: 420, stock: 100 }],
    sales: 350, stock: 100, rating: 4.9, tags: ['猫咪', '治愈', '花园'], createdAt: '2026-05-17',
  },
  {
    id: '8', title: '水彩梦境', image: imgBase + 'watercolor+dreamy+landscape+hand+painted+illustration&image_size=portrait_4_3', images: [],
    artistName: '王水色', artistId: 'a7', category: 'illustration', subCategory: 'handdrawn',
    price: 1560, description: '水彩渲染的梦幻风景',
    specifications: [{ size: 'M', material: 'giclee', frameStyle: 'white', price: 1560, stock: 15 }],
    sales: 45, stock: 15, rating: 4.7, tags: ['水彩', '手绘', '梦幻'], createdAt: '2026-05-14',
    isLimited: true, limitedNumber: 30,
  },
  {
    id: '9', title: '潮流字母', image: imgBase + 'trendy+typography+pop+art+illustration+colorful&image_size=portrait_4_3', images: [],
    artistName: '张小幻', artistId: 'a5', category: 'illustration', subCategory: 'trendy',
    price: 560, description: '波普风格的字母艺术',
    specifications: [{ size: 'S', material: 'giclee', frameStyle: 'black', price: 560, stock: 80 }],
    sales: 160, stock: 80, rating: 4.4, tags: ['波普', '字母', '潮流'], createdAt: '2026-05-08',
  },
  {
    id: '10', title: '治愈森林', image: imgBase + 'healing+forest+green+nature+peaceful+illustration&image_size=portrait_4_3', images: [],
    artistName: '李暖暖', artistId: 'a6', category: 'illustration', subCategory: 'healing',
    price: 780, description: '宁静治愈的森林小径',
    specifications: [{ size: 'M', material: 'giclee', frameStyle: 'iron-grey', price: 780, stock: 40 }],
    sales: 92, stock: 40, rating: 4.8, tags: ['森林', '治愈', '自然'], createdAt: '2026-05-06',
  },
  {
    id: '11', title: '艺术帆布袋', image: imgBase + 'art+canvas+tote+bag+minimalist+design&image_size=portrait_4_3', images: [],
    artistName: '工作室A', artistId: 'a8', category: 'merchandise',
    price: 128, description: '简约艺术图案帆布袋',
    specifications: [{ size: 'S', material: 'giclee', frameStyle: 'frameless', price: 128, stock: 200 }],
    sales: 500, stock: 200, rating: 4.3, tags: ['帆布袋', '周边', '简约'], createdAt: '2026-05-16',
  },
  {
    id: '12', title: '艺术明信片套装', image: imgBase + 'art+postcard+set+collection+stationery&image_size=portrait_4_3', images: [],
    artistName: '工作室A', artistId: 'a8', category: 'merchandise',
    price: 68, description: '精选艺术作品明信片10张装',
    specifications: [{ size: 'S', material: 'giclee', frameStyle: 'frameless', price: 68, stock: 300 }],
    sales: 800, stock: 300, rating: 4.6, tags: ['明信片', '周边', '套装'], createdAt: '2026-05-13',
  },
  {
    id: '13', title: '极简黑框', image: imgBase + 'minimalist+black+picture+frame+elegant&image_size=portrait_4_3', images: [],
    artistName: '装裱工坊', artistId: 'a9', category: 'framing',
    price: 298, description: '极简风格黑色实木画框',
    specifications: [{ size: 'M', material: 'giclee', frameStyle: 'black', price: 298, stock: 60 }],
    sales: 180, stock: 60, rating: 4.5, tags: ['画框', '黑色', '极简'], createdAt: '2026-05-11',
  },
  {
    id: '14', title: '北欧白框', image: imgBase + 'nordic+white+wooden+frame+clean+design&image_size=portrait_4_3', images: [],
    artistName: '装裱工坊', artistId: 'a9', category: 'framing',
    price: 328, description: '北欧风格白色实木画框',
    specifications: [{ size: 'M', material: 'giclee', frameStyle: 'white', price: 328, stock: 45 }],
    sales: 140, stock: 45, rating: 4.7, tags: ['画框', '白色', '北欧'], createdAt: '2026-05-09',
  },
  {
    id: '15', title: '手绘植物图谱', image: imgBase + 'botanical+illustration+hand+painted+plants+vintage&image_size=portrait_4_3', images: [],
    artistName: '王水色', artistId: 'a7', category: 'illustration', subCategory: 'handdrawn',
    price: 2200, description: '精细手绘植物科学图谱',
    specifications: [{ size: 'L', material: 'giclee', frameStyle: 'iron-grey', price: 2200, stock: 8 }],
    sales: 22, stock: 8, rating: 4.9, tags: ['植物', '手绘', '图谱'], createdAt: '2026-05-04',
    isLimited: true, limitedNumber: 15,
  },
  {
    id: '16', title: '星空下的旅人', image: imgBase + 'starry+night+traveler+silhouette+photography&image_size=portrait_4_3', images: [],
    artistName: '陈墨白', artistId: 'a2', category: 'photography', subCategory: 'landscape',
    price: 1880, description: '星空下独行旅人的剪影',
    specifications: [{ size: 'L', material: 'acrylic', frameStyle: 'black', price: 1880, stock: 12 }],
    sales: 67, stock: 12, rating: 4.8, tags: ['星空', '旅人', '夜景'], createdAt: '2026-05-02',
    isLimited: true, limitedNumber: 25,
  },
]

const searchKeyword = ref('')
const activePrimary = ref('')
const activeSub = ref('')
const activeSort = ref('newest')
const viewMode = ref<'grid-2' | 'grid-3' | 'list'>('grid-2')
const filterPopupVisible = ref(false)
const loading = ref(false)
const loadingMore = ref(false)
const isRefreshing = ref(false)
const hasMore = ref(true)
const favorites = ref<Set<string>>(new Set())

const tempFilters = reactive({
  size: '' as string,
  material: '' as string,
  frameStyle: '' as string,
  priceRange: null as [number, number] | null,
  limited: null as boolean | null,
})

const appliedFilters = reactive({
  size: '' as string,
  material: '' as string,
  frameStyle: '' as string,
  priceRange: null as [number, number] | null,
  limited: null as boolean | null,
})

const primaryTabId = computed(() => 'tab-' + activePrimary.value)

const subCategories = computed(() => {
  if (!activePrimary.value) return []
  return subCategoryMap[activePrimary.value] || []
})

const skeletonCount = computed(() => {
  if (viewMode.value === 'list') return 4
  if (viewMode.value === 'grid-3') return 9
  return 6
})

const activeFilterCount = computed(() => {
  let count = 0
  if (appliedFilters.size) count++
  if (appliedFilters.material) count++
  if (appliedFilters.frameStyle) count++
  if (appliedFilters.priceRange) count++
  if (appliedFilters.limited !== null) count++
  return count
})

const displayArtworks = computed(() => {
  let result = [...mockArtworks]

  if (activePrimary.value) {
    result = result.filter((item) => item.category === activePrimary.value)
  }

  if (activeSub.value) {
    result = result.filter((item) => (item as any).subCategory === activeSub.value)
  }

  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter(
      (item) =>
        item.title.toLowerCase().includes(kw) ||
        item.artistName.toLowerCase().includes(kw) ||
        item.tags.some((tag) => tag.toLowerCase().includes(kw)),
    )
  }

  if (appliedFilters.size) {
    result = result.filter((item) =>
      item.specifications.some((spec) => spec.size === appliedFilters.size),
    )
  }

  if (appliedFilters.material) {
    result = result.filter((item) =>
      item.specifications.some((spec) => spec.material === appliedFilters.material),
    )
  }

  if (appliedFilters.frameStyle) {
    result = result.filter((item) =>
      item.specifications.some((spec) => spec.frameStyle === appliedFilters.frameStyle),
    )
  }

  if (appliedFilters.priceRange) {
    const [min, max] = appliedFilters.priceRange
    result = result.filter((item) => item.price >= min && item.price <= max)
  }

  if (appliedFilters.limited === true) {
    result = result.filter((item) => (item as any).isLimited)
  } else if (appliedFilters.limited === false) {
    result = result.filter((item) => !(item as any).isLimited)
  }

  switch (activeSort.value) {
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    case 'price_desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'price_asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'sales':
      result.sort((a, b) => b.sales - a.sales)
      break
    case 'limited':
      result.sort((a, b) => {
        const aL = (a as any).isLimited ? 0 : 1
        const bL = (b as any).isLimited ? 0 : 1
        return aL - bL
      })
      break
  }

  return result
})

function onPrimaryTab(value: string) {
  activePrimary.value = value
  activeSub.value = ''
}

function onSubTab(value: string) {
  activeSub.value = activeSub.value === value ? '' : value
}

function onSearch() {
  artworkStore.setFilter({ keyword: searchKeyword.value })
}

function onSearchInput() {
  if (!searchKeyword.value) {
    artworkStore.setFilter({ keyword: '' })
  }
}

function clearSearch() {
  searchKeyword.value = ''
  artworkStore.setFilter({ keyword: '' })
}

function focusSearch() {}

function onSortChange(value: string) {
  activeSort.value = value
}

function setViewMode(mode: 'grid-2' | 'grid-3' | 'list') {
  viewMode.value = mode
}

function openFilterPopup() {
  tempFilters.size = appliedFilters.size
  tempFilters.material = appliedFilters.material
  tempFilters.frameStyle = appliedFilters.frameStyle
  tempFilters.priceRange = appliedFilters.priceRange
  tempFilters.limited = appliedFilters.limited
  filterPopupVisible.value = true
}

function closeFilterPopup() {
  filterPopupVisible.value = false
}

function onFilterChip(field: string, value: any) {
  if (field === 'size') {
    tempFilters.size = tempFilters.size === value ? '' : value
  } else if (field === 'material') {
    tempFilters.material = tempFilters.material === value ? '' : value
  } else if (field === 'frameStyle') {
    tempFilters.frameStyle = tempFilters.frameStyle === value ? '' : value
  } else if (field === 'limited') {
    tempFilters.limited = tempFilters.limited === value ? null : value
  }
}

function onPricePreset(range: [number, number]) {
  if (
    tempFilters.priceRange &&
    tempFilters.priceRange[0] === range[0] &&
    tempFilters.priceRange[1] === range[1]
  ) {
    tempFilters.priceRange = null
  } else {
    tempFilters.priceRange = range
  }
}

function resetFilters() {
  tempFilters.size = ''
  tempFilters.material = ''
  tempFilters.frameStyle = ''
  tempFilters.priceRange = null
  tempFilters.limited = null
}

function confirmFilters() {
  appliedFilters.size = tempFilters.size
  appliedFilters.material = tempFilters.material
  appliedFilters.frameStyle = tempFilters.frameStyle
  appliedFilters.priceRange = tempFilters.priceRange
  appliedFilters.limited = tempFilters.limited
  filterPopupVisible.value = false
}

function resetAllFilters() {
  activePrimary.value = ''
  activeSub.value = ''
  searchKeyword.value = ''
  activeSort.value = 'newest'
  resetFilters()
  appliedFilters.size = ''
  appliedFilters.material = ''
  appliedFilters.frameStyle = ''
  appliedFilters.priceRange = null
  appliedFilters.limited = null
}

function onArtworkTap(id: string) {
  uni.navigateTo({ url: `/pages/artwork/detail?id=${id}` })
}

function onToggleFav(id: string) {
  if (favorites.value.has(id)) {
    favorites.value.delete(id)
  } else {
    favorites.value.add(id)
  }
}

function onPullDownRefresh() {
  isRefreshing.value = true
  setTimeout(() => {
    isRefreshing.value = false
  }, 1000)
}

function onReachBottom() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  setTimeout(() => {
    loadingMore.value = false
    hasMore.value = false
  }, 800)
}

onMounted(() => {
  artworkStore.fetchArtworks()
})
</script>

<style lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.gallery-page {
  min-height: 100vh;
  background-color: $color-bg;
  display: flex;
  flex-direction: column;
}

.gallery-header {
  background-color: $color-white;
  padding-bottom: $spacing-sm;
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-bar {
  padding: $spacing-sm $spacing-base;

  &__inner {
    @include flex-center;
    background-color: $color-bg-secondary;
    border-radius: $radius-full;
    padding: $spacing-sm $spacing-base;
    height: 72rpx;
  }

  &__icon {
    margin-right: $spacing-sm;
    color: $color-text-tertiary;
    font-size: $font-md;
  }

  &__input {
    flex: 1;
    font-size: $font-base;
    color: $color-text-primary;
    height: 48rpx;
    line-height: 48rpx;
  }

  &__placeholder {
    color: $color-text-placeholder;
    font-size: $font-base;
  }

  &__clear {
    margin-left: $spacing-sm;
    color: $color-text-tertiary;
    font-size: $font-sm;
    padding: 4rpx 8rpx;
  }
}

.category-tabs {
  white-space: nowrap;
  padding: 0 $spacing-base;
  height: 80rpx;

  &__item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 $spacing-md;
    height: 80rpx;
    position: relative;

    &--active {
      .category-tabs__text {
        color: $color-accent;
        font-weight: 600;
      }
    }
  }

  &__text {
    font-size: $font-base;
    color: $color-text-secondary;
    transition: $transition-base;
  }

  &__indicator {
    position: absolute;
    bottom: 4rpx;
    width: 40rpx;
    height: 6rpx;
    background-color: $color-accent;
    border-radius: $radius-full;
  }
}

.sub-category-tabs {
  white-space: nowrap;
  padding: 0 $spacing-base;
  height: 72rpx;
  border-top: 1rpx solid $color-bg-secondary;

  &__item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 $spacing-md;
    height: 72rpx;
    margin-right: $spacing-xs;

    &--active {
      .sub-category-tabs__text {
        color: $color-white;
        background-color: $morandi-beige;
        border-color: $morandi-beige;
      }
    }
  }

  &__text {
    font-size: $font-sm;
    color: $color-text-secondary;
    padding: $spacing-xs $spacing-base;
    border-radius: $radius-full;
    border: 1rpx solid $color-border;
    transition: $transition-base;
  }
}

.filter-sort-bar {
  @include flex-between;
  padding: $spacing-sm $spacing-base;
  background-color: $color-white;
  border-bottom: 1rpx solid $color-bg-secondary;
  position: sticky;
  top: 0;
  z-index: 99;

  &__left {
    flex-shrink: 0;
  }

  &__center {
    flex: 1;
    overflow: hidden;
    margin: 0 $spacing-sm;
  }

  &__right {
    flex-shrink: 0;
  }
}

.filter-btn {
  @include flex-center;
  padding: $spacing-xs $spacing-sm;
  border: 1rpx solid $color-border;
  border-radius: $radius-base;
  position: relative;

  &__icon {
    font-size: $font-sm;
    margin-right: 4rpx;
    color: $color-text-secondary;
  }

  &__text {
    font-size: $font-sm;
    color: $color-text-secondary;
  }

  &__badge {
    position: absolute;
    top: -8rpx;
    right: -8rpx;
    min-width: 28rpx;
    height: 28rpx;
    @include flex-center;
    background-color: $morandi-rose;
    color: $color-white;
    font-size: 18rpx;
    border-radius: $radius-full;
    padding: 0 6rpx;
  }
}

.sort-options {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.sort-option {
  padding: $spacing-xs $spacing-sm;
  margin-right: $spacing-xs;

  &--active {
    .sort-option__text {
      color: $color-accent;
      font-weight: 600;
    }
  }

  &__text {
    font-size: $font-sm;
    color: $color-text-tertiary;
    transition: $transition-base;
    white-space: nowrap;
  }
}

.view-toggle {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 4rpx;
  background-color: $color-bg-secondary;
  border-radius: $radius-sm;

  &__item {
    @include flex-center;
    width: 52rpx;
    height: 52rpx;
    border-radius: $radius-sm;
    transition: $transition-base;

    &--active {
      background-color: $color-white;
      box-shadow: $shadow-sm;
    }
  }
}

.view-icon {
  display: grid;
  gap: 3rpx;

  &--grid-2 {
    grid-template-columns: repeat(2, 10rpx);

    view {
      width: 10rpx;
      height: 10rpx;
      background-color: $color-text-tertiary;
      border-radius: 2rpx;
    }
  }

  &--grid-3 {
    grid-template-columns: repeat(3, 8rpx);

    view {
      width: 8rpx;
      height: 8rpx;
      background-color: $color-text-tertiary;
      border-radius: 2rpx;
    }
  }

  &--list {
    grid-template-columns: 1fr;
    gap: 4rpx;

    view {
      width: 20rpx;
      height: 4rpx;
      background-color: $color-text-tertiary;
      border-radius: 2rpx;
    }
  }
}

.gallery-content {
  flex: 1;
  height: 0;
}

.artwork-grid {
  padding: $spacing-base;
  display: grid;
  gap: $spacing-base;

  &--2 {
    grid-template-columns: repeat(2, 1fr);
  }

  &--3 {
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-sm;

    .artwork-card__title {
      font-size: $font-xs;
    }

    .artwork-card__artist {
      font-size: 18rpx;
    }

    .artwork-card__price {
      font-size: $font-sm;
    }

    .artwork-card__info {
      padding: $spacing-xs $spacing-sm $spacing-sm;
    }
  }

  &--list {
    grid-template-columns: 1fr;
    gap: $spacing-sm;
  }
}

.artwork-card {
  @include gallery-card;

  &--list {
    display: flex;
    flex-direction: row;

    .artwork-card__image-wrap {
      width: 240rpx;
      height: 240rpx;
      flex-shrink: 0;
    }

    .artwork-card__info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: $spacing-base;
    }

    .artwork-card__title {
      -webkit-line-clamp: 2;
    }
  }

  &__image-wrap {
    position: relative;
    width: 100%;
    padding-bottom: 133%;
    overflow: hidden;
  }

  &__image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &__limited {
    position: absolute;
    top: $spacing-sm;
    left: $spacing-sm;
    background-color: rgba($morandi-rose, 0.9);
    padding: 4rpx $spacing-sm;
    border-radius: $radius-sm;

    &-text {
      font-size: 18rpx;
      color: $color-white;
      letter-spacing: 1rpx;
    }
  }

  &__fav {
    position: absolute;
    top: $spacing-sm;
    right: $spacing-sm;
    width: 52rpx;
    height: 52rpx;
    @include flex-center;
    background-color: rgba($color-white, 0.85);
    border-radius: $radius-full;

    &-icon {
      font-size: $font-md;
      color: $morandi-rose;
    }
  }

  &__info {
    padding: $spacing-sm $spacing-sm $spacing-base;
  }

  &__title {
    font-size: $font-sm;
    color: $color-text-primary;
    font-weight: 500;
    @include ellipsis(2);
    line-height: 1.4;
    margin-bottom: 4rpx;
  }

  &__artist {
    font-size: $font-xs;
    color: $color-text-tertiary;
    margin-bottom: $spacing-xs;
  }

  &__price-row {
    display: flex;
    align-items: baseline;
    gap: $spacing-xs;
  }

  &__price {
    font-size: $font-base;
    color: $color-accent;
    font-weight: 600;
  }

  &__original-price {
    font-size: $font-xs;
    color: $color-text-placeholder;
    text-decoration: line-through;
  }
}

.skeleton-grid {
  padding: $spacing-base;
  display: grid;
  gap: $spacing-base;
  grid-template-columns: repeat(2, 1fr);

  &--list {
    grid-template-columns: 1fr;
  }
}

.skeleton-card {
  &__image {
    width: 100%;
    padding-bottom: 133%;
    @include skeleton-loading;
  }

  &__info {
    padding: $spacing-sm;
  }

  &__title {
    height: 28rpx;
    width: 70%;
    margin-bottom: $spacing-xs;
    @include skeleton-loading;
  }

  &__subtitle {
    height: 22rpx;
    width: 50%;
    margin-bottom: $spacing-xs;
    @include skeleton-loading;
  }

  &__price {
    height: 28rpx;
    width: 40%;
    @include skeleton-loading;
  }

  &--list {
    display: flex;
    flex-direction: row;

    .skeleton-card__image {
      width: 240rpx;
      height: 240rpx;
      padding-bottom: 0;
      flex-shrink: 0;
    }

    .skeleton-card__info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: $spacing-base;
    }
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

.empty-state {
  @include flex-center;
  flex-direction: column;
  padding: 160rpx 0;

  &__icon {
    font-size: 80rpx;
    margin-bottom: $spacing-base;
  }

  &__text {
    font-size: $font-base;
    color: $color-text-tertiary;
    margin-bottom: $spacing-lg;
  }

  &__btn {
    padding: $spacing-sm $spacing-lg;
    border: 1rpx solid $color-accent;
    border-radius: $radius-full;

    &-text {
      font-size: $font-sm;
      color: $color-accent;
    }
  }
}

.filter-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 200;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;

  &--visible {
    opacity: 1;
    visibility: visible;
  }
}

.filter-popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 201;
  background-color: $color-white;
  border-radius: $radius-xl $radius-xl 0 0;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
  max-height: 80vh;
  display: flex;
  flex-direction: column;

  &--visible {
    transform: translateY(0);
  }

  &__header {
    @include flex-between;
    padding: $spacing-base $spacing-md;
    border-bottom: 1rpx solid $color-bg-secondary;
  }

  &__title {
    font-size: $font-md;
    font-weight: 600;
    color: $color-text-primary;
    letter-spacing: 2rpx;
  }

  &__close {
    width: 52rpx;
    height: 52rpx;
    @include flex-center;
    color: $color-text-tertiary;
    font-size: $font-md;
  }

  &__body {
    flex: 1;
    padding: $spacing-base $spacing-md;
    overflow-y: auto;
  }

  &__footer {
    display: flex;
    gap: $spacing-base;
    padding: $spacing-base $spacing-md;
    border-top: 1rpx solid $color-bg-secondary;
  }

  &__reset {
    flex: 1;
    height: 80rpx;
    @include flex-center;
    border: 1rpx solid $color-border;
    border-radius: $radius-base;

    &-text {
      font-size: $font-base;
      color: $color-text-secondary;
    }
  }

  &__confirm {
    flex: 2;
    height: 80rpx;
    @include flex-center;
    background-color: $color-accent;
    border-radius: $radius-base;

    &-text {
      font-size: $font-base;
      color: $color-white;
      letter-spacing: 2rpx;
    }
  }
}

.filter-section {
  margin-bottom: $spacing-lg;

  &__title {
    font-size: $font-base;
    color: $color-text-primary;
    font-weight: 500;
    margin-bottom: $spacing-sm;
    letter-spacing: 1rpx;
  }
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.filter-chip {
  padding: $spacing-xs $spacing-md;
  border: 1rpx solid $color-border;
  border-radius: $radius-full;
  background-color: $color-bg;
  transition: $transition-base;

  &--active {
    background-color: $morandi-beige;
    border-color: $morandi-beige;

    .filter-chip__text {
      color: $color-white;
    }
  }

  &__text {
    font-size: $font-sm;
    color: $color-text-secondary;
  }
}
</style>
