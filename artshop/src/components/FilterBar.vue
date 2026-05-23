<template>
  <view class="filter-bar">
    <scroll-view
      class="filter-bar__scroll"
      scroll-x
      :show-scrollbar="false"
      enhanced
    >
      <view class="filter-bar__categories">
        <view
          class="filter-bar__pill"
          :class="{ 'filter-bar__pill--active': activeCategory === '' }"
          @tap="handleCategoryChange('')"
        >
          <text class="filter-bar__pill-text">全部</text>
        </view>
        <view
          v-for="cat in categories"
          :key="cat"
          class="filter-bar__pill"
          :class="{ 'filter-bar__pill--active': activeCategory === cat }"
          @tap="handleCategoryChange(cat)"
        >
          <text class="filter-bar__pill-text">{{ cat }}</text>
        </view>
      </view>
    </scroll-view>

    <view
      v-if="showSort"
      class="filter-bar__sort"
      @tap="toggleSortMenu"
    >
      <text class="filter-bar__sort-text">{{ sortOptions[activeSortIndex] }}</text>
      <text class="filter-bar__sort-arrow">{{ showSortMenu ? '▲' : '▼' }}</text>

      <view
        v-if="showSortMenu"
        class="filter-bar__sort-menu"
        @tap.stop
      >
        <view
          v-for="(option, index) in sortOptions"
          :key="option"
          class="filter-bar__sort-option"
          :class="{ 'filter-bar__sort-option--active': activeSortIndex === index }"
          @tap="handleSortChange(index)"
        >
          <text class="filter-bar__sort-option-text">{{ option }}</text>
        </view>
      </view>
    </view>
  </view>

  <view
    v-if="showSortMenu"
    class="filter-bar__overlay"
    @tap="closeSortMenu"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  categories: string[]
  activeCategory: string
  showSort?: boolean
}>(), {
  showSort: true,
})

const emit = defineEmits<{
  'category-change': [category: string]
  'sort-change': [sortType: string]
}>()

const sortOptions = ['最新', '价格', '热门', '限量']
const sortValues = ['newest', 'price', 'popular', 'limited']
const activeSortIndex = ref(0)
const showSortMenu = ref(false)

const handleCategoryChange = (category: string) => {
  emit('category-change', category)
}

const toggleSortMenu = () => {
  showSortMenu.value = !showSortMenu.value
}

const closeSortMenu = () => {
  showSortMenu.value = false
}

const handleSortChange = (index: number) => {
  activeSortIndex.value = index
  showSortMenu.value = false
  emit('sort-change', sortValues[index])
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.filter-bar {
  display: flex;
  align-items: center;
  padding: $spacing-sm 0;
  position: relative;
  z-index: 10;

  &__scroll {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
  }

  &__categories {
    display: inline-flex;
    gap: $spacing-sm;
    padding-right: $spacing-sm;
  }

  &__pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-xs $spacing-md;
    background-color: $color-bg-secondary;
    border-radius: $radius-full;
    transition: $transition-base;
    flex-shrink: 0;

    &--active {
      background-color: $color-accent;
    }
  }

  &__pill-text {
    font-size: $font-sm;
    color: $color-text-secondary;
    letter-spacing: 1rpx;

    .filter-bar__pill--active & {
      color: $color-white;
    }
  }

  &__sort {
    position: relative;
    display: flex;
    align-items: center;
    padding: $spacing-xs $spacing-sm;
    flex-shrink: 0;
    gap: 4rpx;
  }

  &__sort-text {
    font-size: $font-sm;
    color: $color-text-secondary;
  }

  &__sort-arrow {
    font-size: $font-xs;
    color: $color-text-tertiary;
  }

  &__sort-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: $spacing-xs;
    background-color: $color-white;
    border-radius: $radius-base;
    box-shadow: $shadow-lg;
    overflow: hidden;
    z-index: 20;
    min-width: 180rpx;
  }

  &__sort-option {
    padding: $spacing-sm $spacing-md;
    transition: $transition-base;

    &--active {
      background-color: $color-bg-secondary;
    }
  }

  &__sort-option-text {
    font-size: $font-sm;
    color: $color-text-secondary;
    letter-spacing: 1rpx;

    .filter-bar__sort-option--active & {
      color: $color-accent;
      font-weight: 500;
    }
  }

  &__overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 5;
  }
}
</style>
