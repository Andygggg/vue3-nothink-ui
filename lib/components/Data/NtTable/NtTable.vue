<template>
  <div class="nt_table_box" :class="boxClass" ref="tableWrapper">
    <section ref="scrollWrapRef" class="nt_table_scroll_wrapper" :style="tableMaxHeight">
      <table class="nt_table" :class="tableClass">
        <thead ref="headerRef">
          <NtTableHead
            :header="props.header"
            :isFixed="isFixedHorizontal"
            :isSorting="isSorting"
            :columnStyles="columnStyles"
            @headSort="handleSort"
          >
            <template v-for="col in props.header" :key="col.key" #[`th_${col.key}`]="headSlot">
              <slot
                :name="`th_${col.key}`"
                :item="headSlot.item"
                :value="headSlot.value"
                :index="headSlot.index"
              />
            </template>
          </NtTableHead>
        </thead>
        <tbody>
          <NtTableCell
            :data="formattedData"
            :header="props.header"
            :isFixed="isFixedHorizontal"
            :columnStyles="columnStyles"
            @cellClick="handleRowClick"
          >
            <template v-for="col in props.header" :key="col.key" #[`td_${col.key}`]="cellSlot">
              <slot
                :name="`td_${col.key}`"
                :item="cellSlot.item"
                :value="cellSlot.value"
                :index="cellSlot.index"
                :isEditing="cellSlot.isEditing"
                :handleEdit="cellSlot.handleEdit"
                :disableEdit="cellSlot.disableEdit"
                :cancelEdit="cellSlot.cancelEdit"
                :handleRowClick="cellSlot.handleRowClick"
              />
            </template>
          </NtTableCell>
        </tbody>
      </table>

      <!-- 空狀態 -->
      <div v-if="!props.data.length" class="empty_state">
        <slot name="empty">
          <div class="empty_content">
            <span>{{ props.emptyText }}</span>
          </div>
        </slot>
      </div>

      <!-- 載入狀態 -->
      <div v-show="props.loading" class="loading_overlay">
        <slot name="loading">
          <div class="loading_spinner">載入中...</div>
        </slot>
      </div>
    </section>

    <NtScrollbar :config="scrollbarConfig" class="nt_table_scrollbar_bar"></NtScrollbar>
  </div>
</template>

<script setup lang="ts" generic="T = Record<string, any>">
import { computed, ref, onMounted, onUnmounted, nextTick, watch, useTemplateRef } from 'vue'
import NtScrollbar from '../NtScrollbar.vue'
import NtTableHead from './NtTableHead.vue'
import NtTableCell from './NtTableCell.vue'

import { DataSorter } from '@lib/utils'
import type { TableProps, TableColumn } from '@lib/typing'

const props = withDefaults(defineProps<TableProps<T>>(), {
  header: () => [] as TableColumn[],
  size: 'medium',
  stripe: false,
  cellBorder: false,
  hover: false,
  stickyHeader: false,
  maxHeight: 'auto',
  emptyText: 'No Data',
  loading: false,
})

const emit = defineEmits<{
  (e: 'rowClick', row: T, index: number): void
}>()

const sortManager = new DataSorter<T>(props.data) //排序管理器
const sortedData = ref<T[]>([...props.data]) // 排序後的資料

const tableWrapper = useTemplateRef('tableWrapper') // 包裝容器引用
const scrollWrapRef = useTemplateRef('scrollWrapRef') // 滾動容器引用
const headerRef = useTemplateRef('headerRef') // 表頭引用

const tableHeight = ref(0) // 當前表格高度
const theadHeight = ref(0) // 當前表頭高度
const isFixedHorizontal = ref(false) // 是否需要水平固定
const resizeTimer = ref<number | null>(null) // 防抖計時器

const tableResizeObserver = ref<ResizeObserver | null>(null) // 用於監聽表格尺寸變化
const theadResizeObserver = ref<ResizeObserver | null>(null) // 用於監聽表頭尺寸變化
const scrollResizeObserver = ref<ResizeObserver | null>(null) // 用於監聽滾動容器尺寸變化

//scrollbar配置
const scrollbarConfig = computed(() => {
  return {
    container: scrollWrapRef.value ? scrollWrapRef.value : '',
    top: props.stickyHeader ? theadHeight.value : 0,
    size: 4,
  }
})

//計算表格最大高度
const tableMaxHeight = computed(() => {
  const style: any = {}

  if (props.maxHeight) {
    style.maxHeight =
      typeof props.maxHeight === 'number'
        ? `${props.maxHeight}px`
        : props.maxHeight === 'auto'
          ? `${tableHeight.value}px`
          : props.maxHeight
  }

  if (!style.maxHeight) style.maxHeight = '100%'

  return style
})

/**
 * 預計算所有列的樣式（包含正確的固定列位置）
 */
const columnStyles = computed(() => {
  const styles: Record<string, any> = {}

  props.header.forEach((col, colIndex) => {
    const style: any = {}

    // 基本寬度設定
    if (col.width) {
      style.width = typeof col.width === 'number' ? `${col.width}px` : col.width
      style.minWidth = style.width
    }
    if (col.minWidth) {
      style.minWidth = typeof col.minWidth === 'number' ? `${col.minWidth}px` : col.minWidth
    }
    if (col.align) {
      style.textAlign = col.align
    }

    // 固定列設定
    if (isFixedHorizontal.value && col.fixed) {
      style.position = 'sticky'
      style.zIndex = 21 // header 的 zIndex，cell 會自動調整為 20

      // 計算正確的固定位置（累加前面所有同方向固定列的寬度）
      const position = calculateFixedPosition(col, colIndex)
      if (col.fixed === 'left') {
        style.left = position
      } else if (col.fixed === 'right') {
        style.right = position
      }
    }

    styles[col.key] = style
  })

  return styles
})

// nt_table_box class
const boxClass = computed(() => ({
  'nt_table_box--fixed-height': props.maxHeight,
  'nt_table_box--sticky-header': props.stickyHeader,
  'nt_table_box--has-fixed': props.header.some((col) => col.fixed),
}))

// nt_table class
const tableClass = computed(() => ({
  'nt_table--stripe': props.stripe,
  'nt_table--border': props.cellBorder,
  'nt_table--hover': props.hover,
  [`nt_table--${props.size}`]: props.size,
  'nt_table--loading': props.loading,
}))

// 資料處理，包括排序
const formattedData = computed(() => {
  return sortedData.value as T[]
})

onMounted(async () => {
  if (tableWrapper.value && tableWrapper.value.parentElement) {
    if (props.maxHeight === 'auto') {
      tableResizeObserver.value = new ResizeObserver(() => {
        // 使用防抖機制，避免頻繁觸發
        if (resizeTimer.value) clearTimeout(resizeTimer.value)
        resizeTimer.value = window.setTimeout(() => {
          nextTick(async () => await updateHeight())
        }, 150)
      })
      tableResizeObserver.value.observe(tableWrapper.value.parentElement) // 監聽容器尺寸變化
    }
  }

  await nextTick(async () => {
    if (props.maxHeight === 'auto') await updateHeight()

    // 初始化檢查水平固定
    checkFixedHorizontal()

    // 監聽滾動容器尺寸變化
    if (scrollWrapRef.value) {
      scrollResizeObserver.value = new ResizeObserver(() => {
        requestAnimationFrame(() => checkFixedHorizontal())
      })
      scrollResizeObserver.value.observe(scrollWrapRef.value)
    }
  })
})

onUnmounted(() => {
  // 清理計時器
  if (resizeTimer.value) clearTimeout(resizeTimer.value)

  if (tableWrapper.value && tableWrapper.value.parentElement) {
    tableResizeObserver.value?.unobserve(tableWrapper.value.parentElement)
  }

  if (theadResizeObserver.value) theadResizeObserver.value.disconnect()
  if (scrollResizeObserver.value) scrollResizeObserver.value.disconnect()
})

watch(
  () => props.data,
  (newData) => {
    // 更新排序管理器的數據
    sortManager.update(newData)
    // 更新響應式的排序結果
    sortedData.value = sortManager.sortedData as T[]
  },
)

watch(
  () => props.stickyHeader,
  async (newVal) => {
    // 清理舊的 observer
    if (theadResizeObserver.value) {
      theadResizeObserver.value.disconnect()
      theadResizeObserver.value = null
    }

    if (!newVal) {
      theadHeight.value = 0
      return
    }

    await nextTick()
    if (headerRef.value) {
      // 1.初始化高度
      theadHeight.value = headerRef.value.offsetHeight
      // 2.監聽尺寸變化
      theadResizeObserver.value = new ResizeObserver((entries) => {
        requestAnimationFrame(() => {
          theadHeight.value = entries[0].contentRect.height
        })
      })

      theadResizeObserver.value.observe(headerRef.value)
    }
  },
  { immediate: true },
)

//========================================css樣式========================================

/**
 * 檢查並更新是否需要水平固定
 */
const checkFixedHorizontal = () => {
  if (!scrollWrapRef.value) {
    isFixedHorizontal.value = false
    return
  }
  isFixedHorizontal.value = scrollWrapRef.value.scrollWidth > scrollWrapRef.value.clientWidth
}

/**
 * 計算固定列的正確位置（累加前面的列寬）
 * @param col 當前列配置
 * @param colIndex 當前列索引
 */
const calculateFixedPosition = (col: TableColumn, colIndex: number): string => {
  if (!col.fixed) return '0px'

  let totalWidth = 0

  if (col.fixed === 'left') {
    // 累加左側所有固定列的寬度
    for (let i = 0; i < colIndex; i++) {
      const prevCol = props.header[i]
      if (prevCol.fixed === 'left') {
        totalWidth += getColumnWidth(prevCol)
      }
    }
  } else if (col.fixed === 'right') {
    // 累加右側所有固定列的寬度
    for (let i = props.header.length - 1; i > colIndex; i--) {
      const nextCol = props.header[i]
      if (nextCol.fixed === 'right') {
        totalWidth += getColumnWidth(nextCol)
      }
    }
  }

  return `${totalWidth}px`
}

/**
 * 獲取列的寬度（優先使用 width，其次 minWidth，預設 100）
 * @param col 列配置
 */
const getColumnWidth = (col: TableColumn): number => {
  if (col.width) {
    return typeof col.width === 'number' ? col.width : parseInt(col.width) || 100
  }
  if (col.minWidth) {
    return typeof col.minWidth === 'number' ? col.minWidth : parseInt(col.minWidth) || 100
  }
  return 100 // 預設寬度
}

/**
 * 更新表格高度
 */
const updateHeight = async () => {
  await nextTick()

  if (!tableWrapper.value) return
  tableHeight.value = tableWrapper.value.clientHeight
}

//========================================資料動作========================================

/**
 * 檢查是否正在排序
 * @param key 排序鍵
 * @param order 排序方向
 */
const isSorting = (key: string, order: 'asc' | 'desc') => {
  return sortManager.isSorting(key, order)
}

/**
 * 資料排序處理
 * @param col 列配置
 */
const handleSort = (col: TableColumn) => {
  // 執行排序邏輯
  sortManager.toggleSort(col.key, col.sortable)
  // 更新響應式的排序結果
  sortedData.value = sortManager.sortedData as T[]
}

/**
 * 處理資料行點擊
 * @param row 資料
 * @param index 索引值
 */
const handleRowClick = (row: T, index: number) => {
  emit('rowClick', row, index)
}
</script>

<style lang="scss" scoped>
@forward '../../../styles/NtTable.scss';

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
  z-index: 9999;

  .loading_spinner {
    font-size: 14px;
    color: var(--nt-loading-color);
  }
}
</style>
