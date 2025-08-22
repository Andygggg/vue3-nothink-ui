<template>
  <!-- 水平滾動條 -->
  <div
    v-if="showHorizontalScrollbar"
    class="nt_scrollbar_bar is-horizontal"
    :style="horizontalScrollbarStyle"
    @mousedown="handleScrollbarMousedown('horizontal', $event)"
  >
    <div class="nt_scrollbar_thumb" :style="horizontalThumbStyle"></div>
  </div>

  <!-- 垂直滾動條 -->
  <div
    v-if="showVerticalScrollbar"
    class="nt_scrollbar_bar is-vertical"
    :style="verticalScrollbarStyle"
    @mousedown="handleScrollbarMousedown('vertical', $event)"
  >
    <div class="nt_scrollbar_thumb" :style="verticalThumbStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

export interface ScrollbarSetting {
  container: string | HTMLElement // 目標元素（CSS選擇器或DOM元素）
  top?: number
  size: number // 滾動條大小（寬度/高度）
}

const props = withDefaults(
  defineProps<{
    config: ScrollbarSetting
  }>(),
  {
    config: () => ({
      container: '',
      top: 0,
      size: 6,
    }),
  },
)

const scrollWrapRef = ref<HTMLElement | null>(null) // 滾動容器引用
const scrollResizeObserver = ref<ResizeObserver | null>(null) // 用於監聽尺寸變化
// 滾動狀態
const scrollLeft = ref(0)
const scrollTop = ref(0)
const scrollWidth = ref(0)
const scrollHeight = ref(0)
const clientWidth = ref(0)
const clientHeight = ref(0)
const headerHeight = ref(0) // 表頭高度

// 拖拽相關狀態
let isDragging = false
let startClientX = 0
let startClientY = 0
let startScrollLeft = 0
let startScrollTop = 0

// 滾動條顯示判斷(x軸)
const showHorizontalScrollbar = computed(() => {
  return scrollWidth.value > clientWidth.value
})

// 滾動條顯示判斷(y軸)
const showVerticalScrollbar = computed(() => {
  const effectiveScrollHeight = scrollHeight.value - headerHeight.value
  const effectiveClientHeight = clientHeight.value - headerHeight.value

  return effectiveScrollHeight > effectiveClientHeight
})

// 滾動條 style(x軸)
const horizontalScrollbarStyle = computed(() => {
  return {
    left: `0px`,
    right: showVerticalScrollbar.value ? `${props.config.size}px` : '0px',
    bottom: `0px`,
  }
})

// 滾動條 style(y軸)
const verticalScrollbarStyle = computed(() => {
  return {
    top: `${headerHeight.value}px`,
    right: `0px`,
    height: `calc(100% - ${headerHeight.value}px - ${showHorizontalScrollbar.value ? props.config.size : 0}px)`,
  }
})

// 滑塊尺寸計算(x軸)
const horizontalThumbWidth = computed(() => {
  if (!showHorizontalScrollbar.value) return 0
  return (clientWidth.value / scrollWidth.value) * clientWidth.value
})

//滑塊位置的計算(x軸)
const horizontalThumbLeft = computed(() => {
  if (!showHorizontalScrollbar.value) return 0
  const maxThumbTranslate =
    clientWidth.value -
    horizontalThumbWidth.value -
    (showVerticalScrollbar.value ? props.config.size : 0)

  const maxScrollLeft = scrollWidth.value - clientWidth.value
  if (maxScrollLeft <= 0) return 0
  return (scrollLeft.value / maxScrollLeft) * maxThumbTranslate
})

// 滑塊狀態 style(x軸)
const horizontalThumbStyle = computed(() => {
  return {
    width: horizontalThumbWidth.value + 'px',
    transform: `translateX(${horizontalThumbLeft.value || 0}px)`,
    height: props.config.size + 'px',
    position: 'absolute' as const,
    left: 0,
    top: 0,
  }
})

// 滑塊尺寸計算(y軸)
const verticalThumbHeight = computed(() => {
  if (!showVerticalScrollbar.value) return 0
  const effectiveClientHeight = clientHeight.value - headerHeight.value
  const effectiveScrollHeight = scrollHeight.value - headerHeight.value
  if (effectiveScrollHeight <= 0) return 0
  return (effectiveClientHeight / effectiveScrollHeight) * effectiveClientHeight
})

// 滑塊位置的計算(y軸)
const verticalThumbTop = computed(() => {
  if (!showVerticalScrollbar.value) return 0
  const effectiveClientHeight = clientHeight.value - headerHeight.value
  const effectiveScrollHeight = scrollHeight.value - headerHeight.value
  const maxThumbTranslate =
    effectiveClientHeight -
    verticalThumbHeight.value -
    (showHorizontalScrollbar.value ? props.config.size : 0)
  const maxScrollTop = effectiveScrollHeight - effectiveClientHeight
  if (maxScrollTop <= 0) return 0
  return (scrollTop.value / maxScrollTop) * maxThumbTranslate
})

// 滑塊狀態 style(y軸)
const verticalThumbStyle = computed(() => {
  return {
    height: verticalThumbHeight.value + 'px',
    transform: `translateY(${verticalThumbTop.value || 0}px)`,
    width: props.config.size + 'px',
    position: 'absolute' as const,
    left: 0,
    top: 0,
  }
})

onMounted(async () => {
  await nextTick(() => {
    initScrollbar()
  }) // 初始載入時更新一次狀態，確保 DOM 尺寸已準備好

  if (scrollWrapRef.value) {
    scrollWrapRef.value.addEventListener('scroll', handleScroll)

    scrollResizeObserver.value = new ResizeObserver(() => {
      nextTick(() => {
        initScrollbar()
      })
    })
    scrollResizeObserver.value.observe(scrollWrapRef.value) // 監聽容器尺寸變化
  }
})

onUnmounted(() => {
  if (scrollWrapRef.value) {
    scrollWrapRef.value.removeEventListener('scroll', handleScroll)
    scrollResizeObserver.value?.unobserve(scrollWrapRef.value)
  }

  document.removeEventListener('mousemove', handleScrollbarMousemove)
  document.removeEventListener('mouseup', handleScrollbarMouseup)
  document.documentElement.classList.remove('no-select')
})

const initScrollbar = () => {
  scrollWrapRef.value =
    typeof props.config.container === 'string'
      ? document.getElementById(props.config.container)
      : props.config.container
  if (!scrollWrapRef.value) return

  scrollLeft.value = scrollWrapRef.value.scrollLeft
  scrollTop.value = scrollWrapRef.value.scrollTop
  scrollWidth.value = scrollWrapRef.value.scrollWidth
  scrollHeight.value = scrollWrapRef.value.scrollHeight
  clientWidth.value = scrollWrapRef.value.clientWidth
  clientHeight.value = scrollWrapRef.value.clientHeight
  headerHeight.value = props.config.top ?? 0
}

/**
 * 處理滾動事件
 */
const handleScroll = () => initScrollbar()

/**
 * 處理滾動條的鼠標按下事件
 * @param direction vertical | horizontal 滾動條方向
 * @param e 滑鼠事件
 */
const handleScrollbarMousedown = (direction: 'horizontal' | 'vertical', e: MouseEvent) => {
  e.stopPropagation()
  e.preventDefault()

  isDragging = true
  if (direction === 'horizontal') {
    startClientX = e.clientX
    startScrollLeft = scrollWrapRef.value?.scrollLeft || 0
    document.documentElement.classList.add('no-select')
  } else {
    startClientY = e.clientY
    startScrollTop = scrollWrapRef.value?.scrollTop || 0
    document.documentElement.classList.add('no-select')
  }
  document.addEventListener('mousemove', handleScrollbarMousemove)
  document.addEventListener('mouseup', handleScrollbarMouseup)
}

/**
 * 處理滾動條的鼠標移動事件
 * 根據鼠標位置計算新的滾動位置
 * @param e 滑鼠事件
 */
const handleScrollbarMousemove = (e: MouseEvent) => {
  // 1. 前置條件檢查
  if (!isDragging || !scrollWrapRef.value) return

  // 2. 計算滑塊可移動的最大距離
  // 水平滑塊可移動的最大距離
  const maxHorizontalThumbTranslate =
    clientWidth.value - // 滾動區域可見寬度
    horizontalThumbWidth.value - // 減去滑塊自身的寬度
    (showVerticalScrollbar.value ? props.config.size : 0) // 如果有垂直滾動條，角落處要為它預留空間

  // 垂直滑塊可移動的最大距離
  const maxVerticalThumbTranslate =
    clientHeight.value - // 滾動區域可見高度
    headerHeight.value - // 減去表頭的高度（因為垂直滾動條從表頭下方開始）
    verticalThumbHeight.value - // 減去滑塊自身的高度
    (showHorizontalScrollbar.value ? props.config.size : 0) // 如果有水平滾動條，角落處要為它預留空間

  // 3. 計算內容可滾動的最大距離
  // 水平內容可滾動的最大距離
  const maxScrollLeft = scrollWidth.value - clientWidth.value

  // 垂直內容可滾動的最大距離
  const maxScrollTop = scrollHeight.value - clientHeight.value - headerHeight.value

  // 4. 判斷是水平拖拽還是垂直拖拽，並執行對應計算
  if (startClientX !== 0 && showHorizontalScrollbar.value && maxScrollLeft > 0) {
    // 執行水平滾動計算
    const deltaX = e.clientX - startClientX // 鼠標從點擊點開始水平移動的距離
    const scrollRatio = maxScrollLeft / maxHorizontalThumbTranslate // 滾動距離與滑塊移動距離的比例
    scrollWrapRef.value.scrollLeft = startScrollLeft + deltaX * scrollRatio // 更新滾動包裹器的水平滾動位置
  } else if (startClientY !== 0 && showVerticalScrollbar.value && maxScrollTop > 0) {
    // 執行垂直滾動計算
    const deltaY = e.clientY - startClientY // 鼠標從點擊點開始垂直移動的距離
    const scrollRatio = maxScrollTop / maxVerticalThumbTranslate // 滾動距離與滑塊移動距離的比例
    scrollWrapRef.value.scrollTop = startScrollTop + deltaY * scrollRatio // 更新滾動包裹器的垂直滾動位置
  }
}

/**
 * 結束滾動事件
 */
const handleScrollbarMouseup = () => {
  isDragging = false
  startClientX = 0
  startClientY = 0
  document.removeEventListener('mousemove', handleScrollbarMousemove)
  document.removeEventListener('mouseup', handleScrollbarMouseup)
  document.documentElement.classList.remove('no-select')
}
</script>

<style lang="scss" scoped>
.nt_scrollbar_bar {
  // 自定義滾動條顏色變數
  --nt-scrollbar-track: rgba(0, 0, 0, 0.1); // 滾動條軌道
  --nt-scrollbar-thumb: rgba(0, 0, 0, 0.3); // 滾動條滑塊
  --nt-scrollbar-thumb-hover: rgba(0, 0, 0, 0.5); // 滑塊 hover 顏色
  --nt-scrollbar-size: 4px; // 滾動條寬度/高度

  position: absolute;
  background: var(--nt-scrollbar-track);
  border-radius: var(--nt-scrollbar-size);
  z-index: 20;

  &.is-horizontal {
    height: var(--nt-scrollbar-size);
    width: 100%;
    left: 0;
    bottom: 0;
  }

  &.is-vertical {
    width: var(--nt-scrollbar-size);
    height: 100%;
    right: 0;
  }

  // 滾動條 滑塊
  .nt_scrollbar_thumb {
    background: var(--nt-scrollbar-thumb);
    border-radius: var(--nt-scrollbar-size);
    cursor: pointer;
    position: absolute;
    transition: background 0.2s ease;
    left: 0;
    top: 0;

    &:hover {
      background: var(--nt-scrollbar-thumb-hover);
    }
  }
}

// 禁用樣式 (拖拽滾動條時)
.no-select {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>
