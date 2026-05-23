<template>
  <view class="search-bar">
    <view class="search-bar__container">
      <text class="search-bar__icon">🔍</text>
      <input
        class="search-bar__input"
        :value="value"
        :placeholder="placeholder"
        placeholder-class="search-bar__placeholder"
        confirm-type="search"
        @input="handleInput"
        @confirm="handleSearch"
      />
      <view
        v-if="value"
        class="search-bar__clear"
        @tap="handleClear"
      >
        <text class="search-bar__clear-icon">✕</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  placeholder?: string
  value?: string
}>(), {
  placeholder: '搜索作品/艺术家',
  value: '',
})

const emit = defineEmits<{
  input: [value: string]
  search: [value: string]
  clear: []
}>()

const handleInput = (e: any) => {
  emit('input', e.detail.value as string)
}

const handleSearch = () => {
  if (props.value.trim()) {
    emit('search', props.value)
  }
}

const handleClear = () => {
  emit('input', '')
  emit('clear')
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.search-bar {
  padding: $spacing-sm $spacing-base;

  &__container {
    display: flex;
    align-items: center;
    height: 72rpx;
    background-color: $color-bg-secondary;
    border-radius: $radius-full;
    padding: 0 $spacing-base;
    gap: $spacing-sm;
    transition: $transition-base;
  }

  &__icon {
    font-size: $font-base;
    flex-shrink: 0;
  }

  &__input {
    flex: 1;
    height: 100%;
    font-size: $font-base;
    color: $color-text-primary;
    background-color: transparent;
  }

  &__placeholder {
    color: $color-text-placeholder;
    font-size: $font-base;
    letter-spacing: 1rpx;
  }

  &__clear {
    width: 40rpx;
    height: 40rpx;
    @include flex-center;
    flex-shrink: 0;
    border-radius: $radius-full;
    background-color: $color-border;
    transition: $transition-base;
  }

  &__clear-icon {
    font-size: $font-xs;
    color: $color-text-tertiary;
  }
}
</style>
