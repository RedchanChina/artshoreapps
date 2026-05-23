<template>
  <view class="spec-selector">
    <view class="spec-selector__group">
      <text class="spec-selector__label">SIZE</text>
      <view class="spec-selector__options">
        <view
          v-for="size in specs.sizes"
          :key="size"
          class="spec-selector__chip"
          :class="{ 'spec-selector__chip--active': selectedSize === size }"
          @tap="handleSizeSelect(size)"
        >
          <text class="spec-selector__chip-text">{{ size }}</text>
        </view>
      </view>
    </view>

    <view class="spec-selector__group">
      <text class="spec-selector__label">MATERIAL</text>
      <view class="spec-selector__options">
        <view
          v-for="material in specs.materials"
          :key="material"
          class="spec-selector__chip"
          :class="{ 'spec-selector__chip--active': selectedMaterial === material }"
          @tap="handleMaterialSelect(material)"
        >
          <text class="spec-selector__chip-text">{{ material }}</text>
        </view>
      </view>
    </view>

    <view class="spec-selector__group">
      <text class="spec-selector__label">FRAME</text>
      <view class="spec-selector__options">
        <view
          v-for="frame in specs.frameStyles"
          :key="frame"
          class="spec-selector__chip"
          :class="{ 'spec-selector__chip--active': selectedFrameStyle === frame }"
          @tap="handleFrameSelect(frame)"
        >
          <text class="spec-selector__chip-text">{{ frame }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
export interface SpecConfig {
  sizes: string[]
  materials: string[]
  frameStyles: string[]
}

defineProps<{
  specs: SpecConfig
  selectedSize: string
  selectedMaterial: string
  selectedFrameStyle: string
}>()

const emit = defineEmits<{
  'update:size': [value: string]
  'update:material': [value: string]
  'update:frameStyle': [value: string]
}>()

const handleSizeSelect = (size: string) => {
  emit('update:size', size)
}

const handleMaterialSelect = (material: string) => {
  emit('update:material', material)
}

const handleFrameSelect = (frame: string) => {
  emit('update:frameStyle', frame)
}
</script>

<style lang="scss" scoped>
@import '@/styles/mixins.scss';

.spec-selector {
  &__group {
    margin-bottom: $space-lg;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__label {
    display: block;
    @include sans-body;
    font-size: $font-xxs;
    color: $color-ink-secondary;
    margin-bottom: $space-sm;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  &__options {
    display: flex;
    flex-wrap: wrap;
    gap: $space-sm;
  }

  &__chip {
    padding: $space-xs $space-md;
    border: 1rpx solid $color-rule;
    background-color: transparent;
    transition: all $duration-base $ease-out;

    &--active {
      background-color: $color-ink;
      border-color: $color-ink;
    }
  }

  &__chip-text {
    @include sans-body;
    font-size: $font-xs;
    color: $color-ink;
    letter-spacing: 0.06em;
    text-transform: uppercase;

    .spec-selector__chip--active & {
      color: $color-surface;
    }
  }
}
</style>
