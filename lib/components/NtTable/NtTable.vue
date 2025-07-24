<template>
  <div class="nt_table_box" :class="boxClass" :style="boxStyle" ref="tableWrapper">
    <div
      ref="scrollWrapRef"
      class="nt_table_scroll_wrapper"
      :style="scrollWrapperStyle"
      @scroll="handleScroll"
    >
      <table class="nt_table" :class="tableClass" ref="tableRef">
        <thead ref="headerRef">
          <tr>
            <th
              v-for="(col, colIdx) in props.tableSetting.header"
              :key="col.key"
              :class="getHeaderClass(col)"
              :style="getColumnStyle(col, 'header')"
              @click="handleSort(col)"
            >
              <div class="th_header">
                <slot :name="`th_${col.key}`" :item="col" :value="col.title" :index="colIdx">
                  <span>{{ col.title }}</span>
                </slot>
                <span class="sort_btn" v-if="isCheckSort(col.sortable)">
                  <i>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                      viewBox="0 0 24 24"
                      v-show="sortManager.isSorting(col.key, 'asc')"
                    >
                      <g fill="none">
                        <path
                          d="M6.102 16.98c-1.074 0-1.648-1.264-.94-2.073l5.521-6.31a1.75 1.75 0 0 1 2.634 0l5.522 6.31c.707.809.133 2.073-.94 2.073H6.101z"
                          fill="currentColor"
                        ></path>
                      </g>
                    </svg>
                  </i>
                  <i>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                      viewBox="0 0 24 24"
                      v-show="sortManager.isSorting(col.key, 'desc')"
                    >
                      <g fill="none">
                        <path
                          d="M6.102 8c-1.074 0-1.648 1.265-.94 2.073l5.521 6.31a1.75 1.75 0 0 0 2.634 0l5.522-6.31c.707-.808.133-2.073-.94-2.073H6.101z"
                          fill="currentColor"
                        ></path>
                      </g>
                    </svg>
                  </i>
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in formattedData"
            :key="`tr_${rowIndex}`"
            @click="handleRowClick(row, rowIndex)"
          >
            <td
              v-for="(col, colIndex) in props.tableSetting.header"
              :key="col.key"
              :class="getCellClass(col)"
              :style="getColumnStyle(col, 'cell')"
              @dblclick="handleEdit(rowIndex, colIndex)"
            >
              <slot
                :name="`td_${col.key}`"
                :item="row"
                :value="row[col.key as keyof T]"
                :index="rowIndex"
                :isEditing="isEditing(rowIndex, colIndex)"
                :handleEdit="() => handleEdit(rowIndex, colIndex)"
                :disableEdit="() => disableEdit(rowIndex, colIndex)"
                :cancelEdit="() => cancelEdit(rowIndex, colIndex)"
              >
                {{ row[col.key as keyof T] ?? '' }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 空狀態 -->
      <div v-if="!props.data.length" class="empty_state">
        <slot name="empty">
          <div class="empty_content">
            <span>{{ props.tableSetting.emptyText }}</span>
          </div>
        </slot>
      </div>

      <!-- 載入狀態 -->
      <div v-if="props.tableSetting.loading" class="loading_overlay">
        <slot name="loading">
          <div class="loading_spinner">載入中...</div>
        </slot>
      </div>
    </div>

    <!-- 自定義水平滾動條 -->
    <div
      v-if="showHorizontalScrollbar"
      class="nt_scrollbar_bar is-horizontal"
      :style="horizontalScrollbarStyle"
      @mousedown="handleScrollbarMousedown('horizontal', $event)"
    >
      <div class="nt_scrollbar_thumb" :style="horizontalThumbStyle"></div>
    </div>

    <!-- 自定義垂直滾動條 -->
    <div
      v-if="showVerticalScrollbar"
      class="nt_scrollbar_bar is-vertical"
      :style="verticalScrollbarStyle"
      @mousedown="handleScrollbarMousedown('vertical', $event)"
    >
      <div class="nt_scrollbar_thumb" :style="verticalThumbStyle"></div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T = Record<string, any>">
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

import { SortManager } from '@lib/utils'
import type { TableProps, TableColumn } from '@lib/typing'

const props = withDefaults(defineProps<TableProps<T>>(), {
  tableSetting: () => ({
    header: [] as TableColumn[],
    size: 'medium',
    maxHeight: undefined,
    emptyText: 'No Data',
    loading: false,
  }),
  stripe: false,
  cellBorder: false,
  hover: false,
  scrollX: false,
  scrollY: false,
  stickyHeader: false,
})

const emit = defineEmits<{
  (e: 'rowClick', row: T, index: number): void
  (e: 'sortChange', key: string, order: 'asc' | 'desc' | null): void
}>()

//排序管理器
const sortManager = ref<SortManager<T>>(
  new SortManager(props.data, (key, order) => {
    emit('sortChange', key, order)
  }),
)

const tableWrapper = ref<HTMLElement | null>(null)
const scrollWrapRef = ref<HTMLElement | null>(null) // 滾動容器引用
const tableRef = ref<HTMLTableElement | null>(null) // 表格引用
const headerRef = ref<HTMLElement | null>(null) // 表頭引用

const SCROLLBAR_SIZE = 4 // 滾動條的寬度/高度 (px)
// 滾動狀態
const scrollLeft = ref(0)
const scrollTop = ref(0)
const scrollWidth = ref(0)
const scrollHeight = ref(0)
const clientWidth = ref(0)
const clientHeight = ref(0)
const headerHeight = ref(0) // 表頭高度
const tableMaxHeight = ref(0)

const tableResizeObserver = ref<ResizeObserver | null>(null) // 用於監聽尺寸變化
const scrollResizeObserver = ref<ResizeObserver | null>(null) // 用於監聽尺寸變化

// 編輯狀態管理 - 使用 Set 和 Map
const editingCells = ref<Set<string>>(new Set())
const originalValues = ref<Map<string, any>>(new Map())

// 拖拽相關狀態
let isDragging = false
let startClientX = 0
let startClientY = 0
let startScrollLeft = 0
let startScrollTop = 0

// 滾動條顯示判斷(x軸)
const showHorizontalScrollbar = computed(() => {
  return props.scrollX && scrollWidth.value > clientWidth.value
})

// 滾動條顯示判斷(y軸)
const showVerticalScrollbar = computed(() => {
  const effectiveScrollHeight = scrollHeight.value - headerHeight.value
  const effectiveClientHeight = clientHeight.value - headerHeight.value
  return (
    (props.scrollY || props.tableSetting.maxHeight) && effectiveScrollHeight > effectiveClientHeight
  )
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
    (showVerticalScrollbar.value ? SCROLLBAR_SIZE : 0)
  const maxScrollLeft = scrollWidth.value - clientWidth.value
  if (maxScrollLeft <= 0) return 0
  return (scrollLeft.value / maxScrollLeft) * maxThumbTranslate
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
    (showHorizontalScrollbar.value ? SCROLLBAR_SIZE : 0)
  const maxScrollTop = effectiveScrollHeight - effectiveClientHeight
  if (maxScrollTop <= 0) return 0
  return (scrollTop.value / maxScrollTop) * maxThumbTranslate
})

// 滾動條 style(x軸)
const horizontalScrollbarStyle = computed(() => {
  return {
    left: `0px`,
    right: showVerticalScrollbar.value ? `${SCROLLBAR_SIZE}px` : '0px',
    bottom: `0px`,
  }
})

// 滾動條 style(y軸)
const verticalScrollbarStyle = computed(() => {
  return {
    top: `${headerHeight.value}px`,
    right: `0px`,
    height: `calc(100% - ${headerHeight.value}px - ${showHorizontalScrollbar.value ? SCROLLBAR_SIZE : 0}px)`,
  }
})

// 滑塊狀態 style(x軸)
const horizontalThumbStyle = computed(() => {
  return {
    width: horizontalThumbWidth.value + 'px',
    transform: `translateX(${horizontalThumbLeft.value || 0}px)`,
    height: SCROLLBAR_SIZE + 'px',
    position: 'absolute' as const,
    left: 0,
    top: 0,
  }
})

// 滑塊狀態 style(y軸)
const verticalThumbStyle = computed(() => {
  return {
    height: verticalThumbHeight.value + 'px',
    transform: `translateY(${verticalThumbTop.value || 0}px)`,
    width: SCROLLBAR_SIZE + 'px',
    position: 'absolute' as const,
    left: 0,
    top: 0,
  }
})

// nt_table_box class
const boxClass = computed(() => ({
  'nt_table_box--fixed-height': props.tableSetting.maxHeight,
  'nt_table_box--sticky-header': props.stickyHeader,
  'nt_table_box--has-fixed': props.tableSetting.header.some((col) => col.fixed),
  'nt_table_box--has-horizontal-scrollbar': showHorizontalScrollbar.value,
  'nt_table_box--has-vertical-scrollbar': showVerticalScrollbar.value,
}))

// nt_table_box style
const boxStyle = computed(() => {
  const style: any = {}
  if (props.tableSetting.maxHeight) {
    style.maxHeight =
      typeof props.tableSetting.maxHeight === 'number'
        ? `${props.tableSetting.maxHeight}px`
        : props.tableSetting.maxHeight === 'auto'
          ? `${tableMaxHeight.value}px`
          : props.tableSetting.maxHeight
  }
  return style
})

// nt_table_scroll_wrapper style
const scrollWrapperStyle = computed(() => {
  const style: any = {}
  if (props.tableSetting.maxHeight) {
    style.maxHeight =
      typeof props.tableSetting.maxHeight === 'number'
        ? `${props.tableSetting.maxHeight}px`
        : props.tableSetting.maxHeight === 'auto'
          ? `${tableMaxHeight.value}px`
          : props.tableSetting.maxHeight
  }
  if (showHorizontalScrollbar.value) {
    style.marginBottom = `${SCROLLBAR_SIZE}px`
  }
  if (showVerticalScrollbar.value) {
    style.marginRight = `${SCROLLBAR_SIZE}px`
  }
  return style
})

// nt_table class
const tableClass = computed(() => ({
  'nt_table--stripe': props.stripe,
  'nt_table--border': props.cellBorder,
  'nt_table--hover': props.hover,
  [`nt_table--${props.tableSetting.size}`]: props.tableSetting.size,
  'nt_table--loading': props.tableSetting.loading,
}))

// 資料處理，包括排序
const formattedData = computed((): T[] => {
  return sortManager.value.sortData as T[]
})

onMounted(async () => {
  if (scrollWrapRef.value) {
    scrollWrapRef.value.addEventListener('scroll', handleScroll)

    scrollResizeObserver.value = new ResizeObserver(() => {
      nextTick(() => {
        updateScrollState()
      })
    })
    scrollResizeObserver.value.observe(scrollWrapRef.value) // 監聽容器尺寸變化
  }

  if (tableWrapper.value && tableWrapper.value.parentElement) {
    if (props.tableSetting.maxHeight === 'auto') {
      tableResizeObserver.value = new ResizeObserver(() => {
        nextTick(async () => {
          await updateHeight()
        })
      })
      tableResizeObserver.value.observe(tableWrapper.value.parentElement) // 監聽容器尺寸變化
    }
  }

  await nextTick(async () => {
    updateScrollState()
    if (props.tableSetting.maxHeight === 'auto') await updateHeight()
  }) // 初始載入時更新一次狀態，確保 DOM 尺寸已準備好
})

onUnmounted(() => {
  if (scrollWrapRef.value) {
    scrollWrapRef.value.removeEventListener('scroll', handleScroll)
    scrollResizeObserver.value?.unobserve(scrollWrapRef.value)
  }

  if (tableWrapper.value && tableWrapper.value.parentElement) {
    tableResizeObserver.value?.unobserve(tableWrapper.value.parentElement) // 監聽容器尺寸變化
  }

  document.removeEventListener('mousemove', handleScrollbarMousemove)
  document.removeEventListener('mouseup', handleScrollbarMouseup)
  document.documentElement.classList.remove('no-select')
})

watch(
  [() => props.data, () => props.scrollX, () => props.scrollY, () => props.tableSetting.maxHeight],
  () => {
    nextTick(() => {
      updateScrollState()
    })
  },
  { deep: true, immediate: true },
)

watch(
  () => props.data,
  (newData) => {
    sortManager.value.updateData(newData)
  },
  { deep: true },
)

/**
 * 自訂列 style
 * @param col 列配置
 * @param type 'header' | 'cell'
 * @returns 返回列的樣式
 */
const getColumnStyle = (col: TableColumn, type: 'header' | 'cell' = 'cell') => {
  const style: any = {}
  if (!props.tableSetting.header) return style
  if (!col || !col.key) return style
  if (!props.tableSetting.header.length) return style

  const colIndex = props.tableSetting.header.findIndex((c) => c.key === col.key)
  if (colIndex === -1) return style

  if (col.width) {
    style.width = typeof col.width === 'number' ? `${col.width}px` : col.width
    style.minWidth = style.width
  }
  if (col.minWidth)
    style.minWidth = typeof col.minWidth === 'number' ? `${col.minWidth}px` : col.minWidth
  if (col.align) style.textAlign = col.align

  if (col.fixed) {
    style.position = 'sticky'
    style.zIndex = type === 'header' ? 21 : 20
    style.background = `var(--nt-fixed-bg)`

    const position = getFixedPosition(col, colIndex)
    if (col.fixed === 'left') {
      style.left = `${position}px`
    } else if (col.fixed === 'right') {
      style.right = `${position}px`
    }
  }

  return style
}

/**
 * 計算固定列的位置
 * @param col 列配置
 * @param colIndex 列在 columns 中的索引
 * @returns 返回固定列的 x 軸位置
 */
const getFixedPosition = (col: TableColumn, colIndex: number) => {
  if (!col.fixed) return 0

  let position = 0
  const columns = props.tableSetting.header

  if (col.fixed === 'left') {
    for (let i = 0; i < colIndex; i++) {
      if (columns[i].fixed === 'left') {
        const width = columns[i].width
        if (width) {
          position += typeof width === 'number' ? width : parseInt(width) || 0
        } else {
          position += 120
        }
      }
    }
  } else if (col.fixed === 'right') {
    for (let i = colIndex + 1; i < columns.length; i++) {
      if (columns[i].fixed === 'right') {
        const width = columns[i].width
        if (width) {
          position += typeof width === 'number' ? width : parseInt(width) || 0
        } else {
          position += 120
        }
      }
    }
  }

  return position
}

/**
 * 自訂header class
 * @param col 列配置
 */
const getHeaderClass = (col: TableColumn) => ({
  sortable: isCheckSort(col.sortable),
  [`text-${col.align}`]: col.align,
  'fixed-left': col.fixed === 'left',
  'fixed-right': col.fixed === 'right',
})

/**
 * 自訂列 class
 * @param col 列配置
 */
const getCellClass = (col: TableColumn) => ({
  [`text-${col.align}`]: col.align,
  ellipsis: col.ellipsis,
  'fixed-left': col.fixed === 'left',
  'fixed-right': col.fixed === 'right',
})

/**
 * 資料排序處理
 * @param col 列配置
 */
const handleSort = (col: TableColumn) => {
  if (!isCheckSort(col.sortable)) return
  sortManager.value.toggleSort(col.key)
}

const isCheckSort = (status: number | undefined) => {
  return typeof status === 'number' ? true : false
}

const handleRowClick = (row: T, index: number) => {
  emit('rowClick', row, index)
}

/**
 * 更新當前滾動狀態
 * 包括滾動位置、內容尺寸等
 */
const updateScrollState = () => {
  if (!scrollWrapRef.value || !headerRef.value) return
  scrollLeft.value = scrollWrapRef.value.scrollLeft
  scrollTop.value = scrollWrapRef.value.scrollTop
  scrollWidth.value = scrollWrapRef.value.scrollWidth
  scrollHeight.value = scrollWrapRef.value.scrollHeight
  clientWidth.value = scrollWrapRef.value.clientWidth
  clientHeight.value = scrollWrapRef.value.clientHeight
  headerHeight.value = headerRef.value.offsetHeight // 獲取表頭高度
}

/**
 * 處理滾動事件
 */
const handleScroll = () => {
  updateScrollState()
}

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
    (showVerticalScrollbar.value ? SCROLLBAR_SIZE : 0) // 如果有垂直滾動條，角落處要為它預留空間

  // 垂直滑塊可移動的最大距離
  const maxVerticalThumbTranslate =
    clientHeight.value - // 滾動區域可見高度
    headerHeight.value - // 減去表頭的高度（因為垂直滾動條從表頭下方開始）
    verticalThumbHeight.value - // 減去滑塊自身的高度
    (showHorizontalScrollbar.value ? SCROLLBAR_SIZE : 0) // 如果有水平滾動條，角落處要為它預留空間

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

// 生成單元格唯一標識
const getCellKey = (rowIndex: number, colIndex: number): string => {
  return `${rowIndex}-${colIndex}`
}

// 檢查單元格是否正在編輯
const isEditing = (rowIndex: number, colIndex: number): boolean => {
  return editingCells.value.has(getCellKey(rowIndex, colIndex))
}

const handleEdit = (rowIndex: number, colIndex: number) => {
  const cellKey = getCellKey(rowIndex, colIndex)

  // 保存原始值，用於取消編輯
  const col = props.tableSetting.header[colIndex]
  const originalValue = formattedData.value[rowIndex][col.key as keyof T]
  originalValues.value.set(cellKey, originalValue)

  // 設置編輯狀態
  editingCells.value.add(cellKey)
}

// 禁用編輯模式
const disableEdit = (rowIndex: number, colIndex: number) => {
  const cellKey = getCellKey(rowIndex, colIndex)
  editingCells.value.delete(cellKey)
  originalValues.value.delete(cellKey)
}

// 取消編輯，恢復原始值
const cancelEdit = (rowIndex: number, colIndex: number) => {
  const cellKey = getCellKey(rowIndex, colIndex)
  const col = props.tableSetting.header[colIndex]

  // 恢復原始值
  if (originalValues.value.has(cellKey)) {
    const originalValue = originalValues.value.get(cellKey)
    ;(formattedData.value[rowIndex] as any)[col.key] = originalValue
  }

  disableEdit(rowIndex, colIndex)
}

// 檢查是否有任何單元格正在編輯
const hasEditingCells = (): boolean => {
  return editingCells.value.size > 0
}

// 獲取正在編輯的單元格列表
const getEditingCells = (): Array<{ rowIndex: number; colIndex: number }> => {
  return Array.from(editingCells.value).map((cellKey) => {
    const [rowIndex, colIndex] = cellKey.split('-').map(Number)
    return { rowIndex, colIndex }
  })
}

// 清除所有編輯狀態
const clearAllEditing = (): void => {
  editingCells.value.clear()
  originalValues.value.clear()
}

// 取消所有編輯並恢復原始值
const cancelAllEditing = (): void => {
  getEditingCells().forEach(({ rowIndex, colIndex }) => {
    cancelEdit(rowIndex, colIndex)
  })
}

// 確認所有編輯
const confirmAllEditing = (): void => {
  getEditingCells().forEach(({ rowIndex, colIndex }) => {
    disableEdit(rowIndex, colIndex)
  })
}

const updateHeight = async () => {
  await nextTick()

  if (!tableWrapper.value) return
  const parent = tableWrapper.value.parentElement

  if (!parent) return
  const style = getComputedStyle(parent)

  tableMaxHeight.value =
    parent.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
}

defineExpose({
  handleEdit,
  disableEdit,
  cancelEdit,
  isEditing,
  hasEditingCells,
  getEditingCells,
  clearAllEditing,
  cancelAllEditing,
  confirmAllEditing,
})
</script>

<style lang="scss" scoped>
.nt_table_box {
  position: relative;
  width: 100%;
  height: auto;
  // border-radius: 8px;
  // border: 2px solid rgb(194, 194, 194);
  overflow: hidden;

  // CSS 變數定義 - 使用者可以覆寫這些變數來自定義顏色
  --nt-header-bg: #ffffff;
  --nt-header-color: #000000;
  --nt-header-border: #ebeef5;

  --nt-cell-color: #000000;
  --nt-cell-bg: transparent;
  --nt-cell-border: #ebeef5;

  --nt-stripe-bg: #fafafa;
  --nt-hover-bg: #e8f4fd;

  --nt-fixed-bg: #2a2a2a;
  --nt-fixed-shadow: rgba(0, 0, 0, 0.1);

  --nt-sort-btn-color: #000000;

  --nt-empty-color: #909399;

  --nt-loading-overlay-bg: rgba(255, 255, 255, 0.9);
  --nt-loading-color: #409eff;

  // 自定義滾動條顏色變數
  --nt-scrollbar-track: rgba(0, 0, 0, 0.1); // 滾動條軌道
  --nt-scrollbar-thumb: rgba(0, 0, 0, 0.3); // 滾動條滑塊
  --nt-scrollbar-thumb-hover: rgba(0, 0, 0, 0.5); // 滑塊 hover 顏色
  --nt-scrollbar-size: 4px; // 滾動條寬度/高度

  // 滾動內容
  .nt_table_scroll_wrapper {
    width: 100%;
    height: 100%;
    overflow: auto;
    box-sizing: border-box;

    // 隱藏原生滾動條 (Webkit)
    &::-webkit-scrollbar {
      display: none;
      width: 0 !important;
      height: 0 !important;
      -webkit-appearance: none;
    }
    // 隱藏原生滾動條 (Firefox)
    scrollbar-width: none;
    // 隱藏原生滾動條 (IE/Edge)
    -ms-overflow-style: none;
  }

  // 滾動條
  .nt_scrollbar_bar {
    position: absolute;
    background: var(--nt-scrollbar-track);
    border-radius: var(--nt-scrollbar-size);
    z-index: 5;

    &.is-horizontal {
      height: var(--nt-scrollbar-size);
      left: 0;
      bottom: 0;
    }

    &.is-vertical {
      width: var(--nt-scrollbar-size);
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

  // 當有固定高度時，滾動包裹器需要有最大高度
  &.nt_table_box--fixed-height {
    .nt_table_scroll_wrapper {
      height: auto;
    }
  }

  // 固定表頭的樣式
  &.nt_table_box--sticky-header {
    .nt_table thead th {
      position: sticky;
      top: 0;
      z-index: 10;

      &.fixed-left,
      &.fixed-right {
        z-index: 22;
      }
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

.nt_table {
  width: 100%;
  min-width: fit-content;
  height: auto;
  border-collapse: collapse;
  background: transparent;
  border-radius: inherit;

  th,
  td {
    padding: 12px 8px;
    text-align: left;
    vertical-align: middle;
    white-space: nowrap;
    color: var(--nt-cell-color);
    background: var(--nt-cell-bg);
    transition: background-color 0.25s ease;

    &.ellipsis {
      max-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &.fixed-left,
    &.fixed-right {
      position: sticky;
      z-index: 20;
      background: var(--nt-fixed-bg);

      &.fixed-left {
        box-shadow: 2px 0 4px var(--nt-fixed-shadow);
      }

      &.fixed-right {
        box-shadow: -2px 0 4px var(--nt-fixed-shadow);
      }
    }
  }

  th {
    background: var(--nt-header-bg);
    color: var(--nt-header-color);
    font-weight: 500;
    box-shadow: inset 0 -2px 0 var(--nt-header-border);
    user-select: none;

    .th_header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .sort_btn {
        height: auto;
        width: 12px;
        display: flex;
        flex-direction: column;
        margin-left: 4px;
        color: var(--nt-sort-btn-color);
        cursor: pointer;

        > i {
          width: 100%;
          height: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.3s ease;
        }
      }
    }

    &.sortable {
      cursor: pointer;
    }

    &.fixed-left,
    &.fixed-right {
      background: var(--nt-fixed-bg);
      z-index: 22;
    }
  }

  td {
    border-bottom: 2px solid var(--nt-cell-border);
    > span {
      color: red;
    }
  }

  tbody tr {
    transition: background-color 0.25s ease;

    &:last-child td {
      border-bottom: none;
    }

    &:hover {
      td.fixed-left,
      td.fixed-right {
        background: var(--nt-hover-bg) !important;
      }
    }
  }

  &.nt_table--stripe tbody tr:nth-child(even) {
    background: var(--nt-stripe-bg);

    td.fixed-left,
    td.fixed-right {
      background: var(--nt-stripe-bg);
    }

    &:hover {
      background: var(--nt-hover-bg);

      td.fixed-left,
      td.fixed-right {
        background: var(--nt-hover-bg) !important;
      }
    }
  }

  // 尺寸變化
  &.nt_table--small {
    th,
    td {
      padding: 6px 8px;
      font-size: 14px;
    }
  }

  &.nt_table--medium {
    th,
    td {
      padding: 12px 16px;
      font-size: 15px;
    }
  }

  &.nt_table--large {
    th,
    td {
      padding: 18px 16px;
      font-size: 16px;
    }
  }

  // 邊框
  &.nt_table--border {
    th {
      border-right: 1px solid var(--nt-cell-border);
    }

    td {
      border-right: 1px solid var(--nt-cell-border);

      &:last-child {
        border-right: none;
      }
    }
  }

  // hover 效果
  &.nt_table--hover tbody tr:hover {
    background: var(--nt-hover-bg);
  }

  // 對齊
  .text-center {
    text-align: center;
  }

  .text-right {
    text-align: right;
  }
}

.empty_state {
  padding: 40px 0;
  text-align: center;
  color: var(--nt-empty-color);

  .empty_content {
    font-size: 14px;
  }
}

.loading_overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--nt-loading-overlay-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;

  .loading_spinner {
    font-size: 14px;
    color: var(--nt-loading-color);
  }
}
</style>
