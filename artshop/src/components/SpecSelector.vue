<template>
  <view class="spec-selector">
    <view class="spec-selector__group">
      <text class="spec-selector__label">尺寸</text>
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
      <text class="spec-selector__label">材质</text>
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
      <text class="spec-selector__label">装裱</text>
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

const props = defineProps<{
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
@import '@/styles/variables.scss';

.spec-selector {
  &__group {
    margin-bottom: $spacing-md;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__label {
    display: block;
    font-size: $font-sm;
    color: $color-text-secondary;
    margin-bottom: $spacing-sm;
    letter-spacing: 2rpx;
  }

  &__options {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
  }

  &__chip {
    padding: $spacing-xs $spacing-base;
    background-color: $color-bg-secondary;
    border: 2rpx solid transparent;
    border-radius: $radius-base;
    transition: $transition-base;

    &--active {
      background-color: rgba(139, 115, 85, 0.08);
      border-color: $color-accent;
    }
  }

  &__chip-text {
    font-size: $font-sm;
    color: $color-text-secondary;
    letter-spacing: 1rpx;

    .spec-selector__chip--active & {
      color: $color-accent;
      font-weight: 500;
    }
  }
}
</style>
