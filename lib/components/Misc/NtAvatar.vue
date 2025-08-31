<template>
  <div class="avatar" :class="[sizeClass, shapeClass]" :style="avatarStyle">
    <img
      v-if="src && !imageError"
      :src="src"
      :alt="name"
      @error="handleImageError"
      @load="handleImageLoad"
    />
    <span v-else class="text" :style="textStyle">
      {{ firstChar }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type AvatarSize = 'small' | 'medium' | 'large' | number
type AvatarShape = 'circle' | 'square'

interface Props {
  src?: string
  name: string
  size?: AvatarSize
  shape?: AvatarShape
  backgroundColor?: string
  textColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  size: 'medium',
  shape: 'circle',
  backgroundColor: '',
  textColor: '#ffffff',
})

const imageError = ref(false)

// 計算首字母
const firstChar = computed(() => {
  if (!props.name) return '?'
  return props.name.charAt(0).toUpperCase()
})

// 計算尺寸 class
const sizeClass = computed(() => {
  if (typeof props.size === 'number') return ''
  return `avatar--${props.size}`
})

// 計算形狀 class
const shapeClass = computed(() => {
  return `avatar--${props.shape}`
})

// 計算頭像 box class
const avatarStyle = computed(() => {
  const style: Record<string, string> = {}

  // 自定義尺寸
  if (typeof props.size === 'number') {
    style.width = `${props.size}px`
    style.height = `${props.size}px`
    style.fontSize = `${props.size * 0.4}px`
  }

  // 背景色（當沒有圖片時）
  if (!props.src || imageError.value) {
    style.backgroundColor = props.backgroundColor || generateBackgroundColor(props.name)
  }

  return style
})

// 計算文字 class
const textStyle = computed(() => {
  return {
    color: props.textColor,
  }
})

/**
 * 根據名稱生成背景色
 * @param name 名稱
 */
const generateBackgroundColor = (name: string): string => {
  const colors = [
    '#f56565',
    '#ed8936',
    '#ecc94b',
    '#48bb78',
    '#38b2ac',
    '#4299e1',
    '#667eea',
    '#9f7aea',
    '#ed64a6',
    '#a0aec0',
  ]

  //名稱轉換哈希值(hash)
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    //獲取第 i 個字符的 ASCII 碼，將 hash 左移 5 位（相當於乘以 32， 相當於 hash * 31
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

/**
 * 處理圖片加載錯誤
 */
const handleImageError = () => {
  imageError.value = true
}

/**
 * 處理圖片加載成功
 */
const handleImageLoad = () => {
  imageError.value = false
}
</script>

<style lang="scss" scoped>
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  user-select: none;
  vertical-align: middle;

  // 預設尺寸
  &--small {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }

  &--medium {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  &--large {
    width: 64px;
    height: 64px;
    font-size: 26px;
  }

  // 形狀
  &--circle {
    border-radius: 50%;
  }

  &--square {
    border-radius: 6px;
  }

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .text {
    font-weight: 500;
    line-height: 1;
    font-family: inherit;
  }
}
</style>
