<template>
  <view class="gallery-page">
    <view class="gallery-header">
      <text class="gallery-title">Works</text>
      <view class="gallery-rule" />
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
          class="category-tabs__underline"
          v-if="activePrimary === tab.value"
        />
      </view>
    </scroll-view>

    <scroll-view
      class="sub-tabs"
      scroll-x
      :show-scrollbar="false"
      enhanced
      v-if="subCategories.length"
    >
      <view
        v-for="sub in subCategories"
        :key="sub.value"
        class="sub-tabs__item"
        :class="{ 'sub-tabs__item--active': activeSub === sub.value }"
        @tap="onSubTab(sub.value)"
      >
        <text class="sub-tabs__text">{{ sub.label }}</text>
      </view>
    </scroll-view>

    <view class="toolbar">
      <view class="toolbar__sort" @tap="cycleSort">
        <text class="toolbar__sort-text">{{ currentSortLabel }}</text>
      </view>
      <view class="toolbar__view">
        <text
          class="toolbar__view-icon"
          :class="{ 'toolbar__view-icon--active': viewMode === 'grid' }"
          @tap="viewMode = 'grid'"
        >▦</text>
        <text
          class="toolbar__view-icon"
          :class="{ 'toolbar__view-icon--active': viewMode === 'list' }"
          @tap="viewMode = 'list'"
        >≡</text>
      </view>
    </view>

    <scroll-view
      class="gallery-content"
      scroll-y
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onPullDownRefreshHandler"
      @scrolltolower="onReachBottomHandler"
      enhanced
      :bounces="false"
    >
      <view
        class="artwork-grid"
        :class="{ 'artwork-grid--list': viewMode === 'list' }"
        v-if="!loading || displayArtworks.length > 0"
      >
        <view
          v-for="item in displayArtworks"
          :key="item.id"
          class="artwork-item"
          :class="{ 'artwork-item--list': viewMode === 'list' }"
          @tap="onArtworkTap(item.id)"
        >
          <view class="artwork-item__image-wrap">
            <image
              class="artwork-item__image"
              :src="item.image"
              mode="aspectFill"
              lazy-load
            />
          </view>
          <view class="artwork-item__info">
            <text class="artwork-item__title">{{ item.title }}</text>
            <text class="artwork-item__artist">{{ item.artistName }}</text>
            <text class="artwork-item__price">¥{{ item.price }}</text>
          </view>
        </view>
      </view>

      <view
        class="skeleton-grid"
        v-if="loading && displayArtworks.length === 0"
      >
        <view
          v-for="i in 6"
          :key="'sk-' + i"
          class="skeleton-item"
        >
          <view class="skeleton-item__image skeleton" />
          <view class="skeleton-item__title skeleton" />
          <view class="skeleton-item__subtitle skeleton" />
          <view class="skeleton-item__price skeleton" />
        </view>
      </view>

      <view class="load-more" v-if="displayArtworks.length > 0">
        <text class="load-more__text" v-if="loadingMore">加载中...</text>
        <text class="load-more__end" v-else-if="!hasMore">— 已浏览全部作品 —</text>
      </view>

      <view class="empty-state" v-if="!loading && displayArtworks.length === 0">
        <text class="empty-state__text">暂无相关作品</text>
        <text class="empty-state__reset" @tap="resetAllFilters">清除筛选</text>
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
        <text class="filter-popup__title">筛选</text>
        <view class="filter-popup__close" @tap="closeFilterPopup">
          <text class="filter-popup__close-text">✕</text>
        </view>
      </view>
      <scroll-view class="filter-popup__body" scroll-y enhanced>
        <view class="filter-section">
          <text class="filter-section__label">尺寸</text>
          <view class="filter-section__options">
            <view
              v-for="opt in sizeOptions"
              :key="opt.value"
              class="filter-option"
              :class="{ 'filter-option--active': tempFilters.size === opt.value }"
              @tap="onFilterChip('size', opt.value)"
            >
              <text class="filter-option__text">{{ opt.label }}</text>
            </view>
          </view>
        </view>
        <view class="filter-section">
          <text class="filter-section__label">材质</text>
          <view class="filter-section__options">
            <view
              v-for="opt in materialOptions"
              :key="opt.value"
              class="filter-option"
              :class="{ 'filter-option--active': tempFilters.material === opt.value }"
              @tap="onFilterChip('material', opt.value)"
            >
              <text class="filter-option__text">{{ opt.label }}</text>
            </view>
          </view>
        </view>
        <view class="filter-section">
          <text class="filter-section__label">装裱</text>
          <view class="filter-section__options">
            <view
              v-for="opt in frameOptions"
              :key="opt.value"
              class="filter-option"
              :class="{ 'filter-option--active': tempFilters.frameStyle === opt.value }"
              @tap="onFilterChip('frameStyle', opt.value)"
            >
              <text class="filter-option__text">{{ opt.label }}</text>
            </view>
          </view>
        </view>
        <view class="filter-section">
          <text class="filter-section__label">价格</text>
          <view class="filter-section__options">
            <view
              v-for="opt in pricePresets"
              :key="opt.label"
              class="filter-option"
              :class="{
                'filter-option--active':
                  tempFilters.priceRange &&
                  tempFilters.priceRange[0] === opt.range[0] &&
                  tempFilters.priceRange[1] === opt.range[1],
              }"
              @tap="onPricePreset(opt.range)"
            >
              <text class="filter-option__text">{{ opt.label }}</text>
            </view>
          </view>
        </view>
        <view class="filter-section">
          <text class="filter-section__label">限量</text>
          <view class="filter-section__options">
            <view
              class="filter-option"
              :class="{ 'filter-option--active': tempFilters.limited === true }"
              @tap="onFilterChip('limited', true)"
            >
              <text class="filter-option__text">仅限量</text>
            </view>
            <view
              class="filter-option"
              :class="{ 'filter-option--active': tempFilters.limited === false }"
              @tap="onFilterChip('limited', false)"
            >
              <text class="filter-option__text">非限量</text>
            </view>
          </view>
        </view>
      </scroll-view>
      <view class="filter-popup__footer">
        <text class="filter-popup__reset" @tap="resetFilters">重置</text>
        <view class="filter-popup__apply" @tap="confirmFilters">
          <text class="filter-popup__apply-text">应用</text>
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
  { label: 'All', value: '' },
  { label: 'Photography', value: 'photography' },
  { label: 'Illustration', value: 'illustration' },
  { label: 'Merchandise', value: 'merchandise' },
  { label: 'Framing', value: 'framing' },
]

const subCategoryMap: Record<string, { label: string; value: string }[]> = {
  photography: [
    { label: 'Landscape', value: 'landscape' },
    { label: 'Portrait', value: 'portrait' },
    { label: 'Abstract', value: 'abstract' },
    { label: 'Vintage', value: 'vintage' },
  ],
  illustration: [
    { label: 'Trendy', value: 'trendy' },
    { label: 'Healing', value: 'healing' },
    { label: 'Hand-drawn', value: 'handdrawn' },
  ],
}

const sortCycle = [
  { label: 'Latest ↓', value: 'newest' },
  { label: 'Price ↓', value: 'price_desc' },
  { label: 'Price ↑', value: 'price_asc' },
  { label: 'Popular ↓', value: 'sales' },
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
  { label: '¥0–500', range: [0, 500] as [number, number] },
  { label: '¥500–2k', range: [500, 2000] as [number, number] },
  { label: '¥2k–5k', range: [2000, 5000] as [number, number] },
  { label: '¥5k+', range: [5000, 999999] as [number, number] },
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

const activePrimary = ref('')
const activeSub = ref('')
const sortIndex = ref(0)
const viewMode = ref<'grid' | 'list'>('grid')
const filterPopupVisible = ref(false)
const loading = ref(false)
const loadingMore = ref(false)
const isRefreshing = ref(false)
const hasMore = ref(true)

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

const currentSortLabel = computed(() => sortCycle[sortIndex.value].label)
const currentSortValue = computed(() => sortCycle[sortIndex.value].value)

const displayArtworks = computed(() => {
  let result = [...mockArtworks]

  if (activePrimary.value) {
    result = result.filter((item) => item.category === activePrimary.value)
  }

  if (activeSub.value) {
    result = result.filter((item) => (item as any).subCategory === activeSub.value)
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

  switch (currentSortValue.value) {
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

function cycleSort() {
  sortIndex.value = (sortIndex.value + 1) % sortCycle.length
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
  sortIndex.value = 0
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

function onPullDownRefreshHandler() {
  isRefreshing.value = true
  setTimeout(() => {
    isRefreshing.value = false
  }, 1000)
}

function onReachBottomHandler() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  setTimeout(() => {
    loadingMore.value = false
    hasMore.value = false
  }, 800)
}

onPullDownRefreshHook(() => {
  isRefreshing.value = true
  setTimeout(() => {
    isRefreshing.value = false
    uni.stopPullDownRefresh()
  }, 1000)
})

onReachBottomHook(() => {
  onReachBottomHandler()
})

onMounted(() => {
  artworkStore.fetchArtworks()
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.gallery-page {
  min-height: 100vh;
  background-color: $color-surface;
  display: flex;
  flex-direction: column;
}

.gallery-header {
  padding: $space-xl $space-lg $space-md;
  background-color: $color-surface;
  position: sticky;
  top: 0;
  z-index: 100;
}

.gallery-title {
  @include serif-heading;
  font-size: $font-xl;
  letter-spacing: 0.06em;
}

.gallery-rule {
  height: 1rpx;
  background-color: $color-rule;
  margin-top: $space-md;
}

.category-tabs {
  white-space: nowrap;
  padding: 0 $space-lg;
  height: 88rpx;
  background-color: $color-surface;

  &__item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 $space-md;
    height: 88rpx;
    position: relative;

    &--active {
      .category-tabs__text {
        color: $color-ink;
      }
    }
  }

  &__text {
    @include sans-body;
    font-size: $font-sm;
    color: $color-ink-tertiary;
    letter-spacing: 0.04em;
    transition: color $duration-fast $ease-out;
  }

  &__underline {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 32rpx;
    height: 2rpx;
    background-color: $color-ink;
  }
}

.sub-tabs {
  white-space: nowrap;
  padding: 0 $space-lg;
  height: 72rpx;
  border-bottom: 1rpx solid $color-rule;
  background-color: $color-surface;

  &__item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 $space-sm;
    height: 72rpx;
    margin-right: $space-xs;
    position: relative;

    &--active {
      .sub-tabs__text {
        color: $color-ink;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 24rpx;
        height: 2rpx;
        background-color: $color-ink;
      }
    }
  }

  &__text {
    @include sans-body;
    font-size: $font-xs;
    color: $color-ink-tertiary;
    letter-spacing: 0.03em;
    transition: color $duration-fast $ease-out;
  }
}

.toolbar {
  @include flex-between;
  padding: $space-sm $space-lg;
  background-color: $color-surface;
  border-bottom: 1rpx solid $color-rule;

  &__sort {
    &-text {
      @include sans-body;
      font-size: $font-xs;
      color: $color-ink-secondary;
      letter-spacing: 0.02em;
    }
  }

  &__view {
    display: flex;
    align-items: center;
    gap: $space-sm;
  }

  &__view-icon {
    font-size: $font-md;
    color: $color-ink-faint;
    transition: color $duration-fast $ease-out;
    line-height: 1;

    &--active {
      color: $color-ink;
    }
  }
}

.gallery-content {
  flex: 1;
  height: 0;
}

.artwork-grid {
  padding: $space-xs;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $space-xs;

  &--list {
    grid-template-columns: 1fr;
    gap: 0;

    .artwork-item {
      display: flex;
      flex-direction: row;
      padding: $space-md $space-lg;
      border-bottom: 1rpx solid $color-rule;

      &__image-wrap {
        width: 200rpx;
        height: 268rpx;
        padding-bottom: 0;
        flex-shrink: 0;
      }

      &__info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 0 0 $space-md;
      }

      &__title {
        -webkit-line-clamp: 2;
      }
    }
  }
}

.artwork-item {
  @include gallery-item;

  &__image-wrap {
    position: relative;
    width: 100%;
    padding-bottom: 133.33%;
    overflow: hidden;
  }

  &__image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &__info {
    padding: $space-sm $space-xs $space-md;
  }

  &__title {
    @include sans-body;
    font-size: $font-xs;
    color: $color-ink;
    font-weight: 500;
    @include ellipsis(2);
    line-height: 1.5;
    margin-bottom: $space-xxs;
  }

  &__artist {
    @include sans-body;
    font-size: $font-xxs;
    color: $color-ink-tertiary;
    margin-bottom: $space-xxs;
  }

  &__price {
    font-family: $font-sans;
    font-size: $font-sm;
    color: $color-ink;
    font-weight: 500;
    letter-spacing: 0.01em;
  }
}

.skeleton-grid {
  padding: $space-xs;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $space-xs;
}

.skeleton-item {
  &__image {
    width: 100%;
    padding-bottom: 133.33%;
    @include skeleton-loading;
  }

  &__title {
    height: 24rpx;
    width: 70%;
    margin: $space-sm $space-xs 0;
    @include skeleton-loading;
  }

  &__subtitle {
    height: 20rpx;
    width: 50%;
    margin: $space-xxs $space-xs 0;
    @include skeleton-loading;
  }

  &__price {
    height: 24rpx;
    width: 40%;
    margin: $space-xxs $space-xs $space-sm;
    @include skeleton-loading;
  }
}

.load-more {
  @include flex-center;
  padding: $space-xl 0 $space-3xl;

  &__text {
    @include sans-body;
    font-size: $font-xs;
    color: $color-ink-tertiary;
  }

  &__end {
    @include sans-body;
    font-size: $font-xs;
    color: $color-ink-faint;
    letter-spacing: 0.08em;
  }
}

.empty-state {
  @include flex-center;
  flex-direction: column;
  padding: $space-4xl 0;

  &__text {
    @include sans-body;
    font-size: $font-sm;
    color: $color-ink-tertiary;
    margin-bottom: $space-lg;
  }

  &__reset {
    @include sans-body;
    font-size: $font-xs;
    color: $color-ink-secondary;
    text-decoration: underline;
    text-underline-offset: 4rpx;
  }
}

.filter-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba($color-ink, 0.3);
  z-index: 200;
  opacity: 0;
  visibility: hidden;
  transition: opacity $duration-base $ease-out, visibility $duration-base $ease-out;

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
  background-color: $color-surface;
  transform: translateY(100%);
  transition: transform $duration-slow $ease-out-expo;
  max-height: 80vh;
  display: flex;
  flex-direction: column;

  &--visible {
    transform: translateY(0);
  }

  &__header {
    @include flex-between;
    padding: $space-md $space-lg;
    border-bottom: 1rpx solid $color-rule;
  }

  &__title {
    @include serif-heading;
    font-size: $font-md;
    letter-spacing: 0.04em;
  }

  &__close {
    width: 56rpx;
    height: 56rpx;
    @include flex-center;

    &-text {
      @include sans-body;
      font-size: $font-md;
      color: $color-ink-tertiary;
    }
  }

  &__body {
    flex: 1;
    padding: $space-lg;
    overflow-y: auto;
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: $space-md;
    padding: $space-md $space-lg;
    border-top: 1rpx solid $color-rule;
    @include safe-area-bottom;
  }

  &__reset {
    @include sans-body;
    font-size: $font-sm;
    color: $color-ink-secondary;
    letter-spacing: 0.02em;
    padding: $space-sm 0;
  }

  &__apply {
    flex: 1;
    height: 80rpx;
    @include flex-center;
    background-color: $color-ink;

    &-text {
      font-family: $font-sans;
      font-size: $font-sm;
      color: $color-surface;
      font-weight: 500;
      letter-spacing: 0.08em;
    }
  }
}

.filter-section {
  margin-bottom: $space-xl;

  &__label {
    @include sans-body;
    font-size: $font-xs;
    color: $color-ink-secondary;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: $space-sm;
    display: block;
  }

  &__options {
    display: flex;
    flex-wrap: wrap;
    gap: $space-sm;
  }
}

.filter-option {
  padding: $space-xs $space-md;
  border: 1rpx solid $color-rule;
  background-color: $color-surface;
  transition: all $duration-fast $ease-out;

  &--active {
    background-color: $color-ink;
    border-color: $color-ink;

    .filter-option__text {
      color: $color-surface;
    }
  }

  &__text {
    @include sans-body;
    font-size: $font-xs;
    color: $color-ink-secondary;
    letter-spacing: 0.02em;
  }
}

@media (min-width: $breakpoint-md) {
  .gallery-page {
    max-width: $max-width;
    margin-left: auto;
    margin-right: auto;
    padding-left: $space-xl;
    padding-right: $space-xl;
  }

  .category-tabs {
    &__item {
      padding: 0 $space-lg;
    }

    &__text {
      font-size: $font-base;
    }
  }

  .sub-tabs {
    &__item {
      padding: 0 $space-md;
      margin-right: $space-sm;
    }

    &__text {
      font-size: $font-sm;
    }
  }

  .toolbar {
    padding: $space-md $space-xl;

    &__sort-text {
      font-size: $font-sm;
    }

    &__view-icon {
      font-size: $font-lg;
    }
  }

  .artwork-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: $space-md;
    padding: $space-md;
  }

  .skeleton-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: $space-md;
    padding: $space-md;
  }

  .artwork-item {
    @include hover-lift;

    &__info {
      padding: $space-sm $space-sm $space-md;
    }

    &__title {
      font-size: $font-sm;
    }

    &__price {
      font-size: $font-base;
    }
  }

  .gallery-content {
    @include desktop-scrollbar;
  }

  .filter-popup {
    max-width: 480px;
    left: auto;
    right: $space-xl;
    border: 1rpx solid $color-rule;
  }

  .filter-popup__body {
    @include desktop-scrollbar;
  }
}

@media (min-width: $breakpoint-lg) {
  .gallery-page {
    padding-left: $space-2xl;
    padding-right: $space-2xl;
  }

  .category-tabs {
    &__item {
      padding: 0 $space-xl;
    }
  }

  .artwork-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .skeleton-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
