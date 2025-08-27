<template>
  <div class="nt_table_box" :class="boxClass" ref="tableWrapper">
    <section ref="scrollWrapRef" class="nt_table_scroll_wrapper" :style="tableMaxHeight">
      <table class="nt_table" :class="tableClass">
        <thead ref="headerRef">
          <NtTableHead
            :header="props.header"
            :isFixed="isFixedHorizontal"
            :isSorting="sortManager.isSorting"
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
    <NtScrollbar :config="scrollbarConfig"></NtScrollbar>
  </div>
</template>

<script setup lang="ts" generic="T = Record<string, any>">
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
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
  scrollX: false,
  scrollY: false,
  stickyHeader: false,
  maxHeight: 'auto',
  emptyText: 'No Data',
  loading: false,
})

const emit = defineEmits<{
  (e: 'rowClick', row: T, index: number): void
}>()

//排序管理器
const sortManager = ref<DataSorter<T>>(new DataSorter(props.data))

const tableWrapper = ref<HTMLElement | null>(null) // 包裝容器引用
const scrollWrapRef = ref<HTMLElement | null>(null) // 滾動容器引用
const headerRef = ref<HTMLElement | null>(null) // 表頭引用

const tableHeight = ref(0) // 當前表格高度
const theadHeight = ref(0) // 當前表頭高度

const tableResizeObserver = ref<ResizeObserver | null>(null) // 用於監聽表格尺寸變化
const theadResizeObserver = ref<ResizeObserver | null>(null) // 用於監聽表頭尺寸變化

//scrollbar配置
const scrollbarConfig = computed(() => {
  let top = 0
  if (props.stickyHeader) {
    top = theadHeight.value
  }

  return {
    container: scrollWrapRef.value ? scrollWrapRef.value : '',
    top,
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

  if (style.maxHeight) {
    style.maxHeight = '100%'
  }
  return style
})

// 判斷是否需要水平固定
const isFixedHorizontal = computed(() => {
  if (!scrollWrapRef.value) return false
  return scrollWrapRef.value.scrollWidth > scrollWrapRef.value.clientWidth
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
const formattedData = computed((): T[] => {
  return sortManager.value.sortedData as T[]
})

onMounted(async () => {
  if (tableWrapper.value && tableWrapper.value.parentElement) {
    if (props.maxHeight === 'auto') {
      tableResizeObserver.value = new ResizeObserver(() => {
        nextTick(async () => {
          await updateHeight()
        })
      })
      tableResizeObserver.value.observe(tableWrapper.value.parentElement) // 監聽容器尺寸變化
    }
  }

  await nextTick(async () => {
    if (props.maxHeight === 'auto') await updateHeight()
  })
})

onUnmounted(() => {
  if (tableWrapper.value && tableWrapper.value.parentElement) {
    tableResizeObserver.value?.unobserve(tableWrapper.value.parentElement) // 監聽容器尺寸變化
  }

  if (theadResizeObserver.value) {
    theadResizeObserver.value.disconnect()
  }
})

watch(
  () => props.data,
  (newData) => {
    sortManager.value.update(newData)
  },
  { deep: true },
)

watch(
  () => props.stickyHeader,
  (newVal) => {
    if (!newVal) return
    if (headerRef.value) {
      // 1.初始化高度
      theadHeight.value = headerRef.value.offsetHeight

      // 2.監聽尺寸變化
      theadResizeObserver.value = new ResizeObserver((entries) => {
        for (const entry of entries) {
          theadHeight.value = entry.contentRect.height
        }
      })

      theadResizeObserver.value.observe(headerRef.value)
    }
  },
  { immediate: true },
)

//========================================css樣式========================================

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
 * 資料排序處理
 * @param col 列配置
 */
const handleSort = (col: TableColumn) => {
  sortManager.value.toggleSort(col.key, col.sortable)
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
