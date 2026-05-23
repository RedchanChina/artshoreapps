<template>
  <view class="search-bar">
    <text class="search-bar__icon">⌕</text>
    <input
      class="search-bar__input"
      :value="value"
      :placeholder="placeholder"
      placeholder-class="search-bar__placeholder"
      confirm-type="search"
      @input="handleInput"
      @confirm="handleSearch"
    />
    <text
      v-if="value"
      class="search-bar__clear"
      @tap="handleClear"
    >×</text>
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
@import '@/styles/mixins.scss';

.search-bar {
  display: flex;
  align-items: center;
  padding: $space-md 0;
  border-bottom: 1rpx solid $color-rule;

  &__icon {
    @include sans-body;
    font-size: $font-lg;
    color: $color-ink-tertiary;
    margin-right: $space-sm;
    flex-shrink: 0;
  }

  &__input {
    flex: 1;
    height: 48rpx;
    @include sans-body;
    font-size: $font-base;
    color: $color-ink;
    background-color: transparent;
    border: none;
  }

  &__placeholder {
    color: $color-ink-tertiary;
    font-size: $font-base;
    letter-spacing: 0.02em;
  }

  &__clear {
    @include sans-body;
    font-size: $font-md;
    color: $color-ink-tertiary;
    margin-left: $space-sm;
    flex-shrink: 0;
  }
}
</style>
