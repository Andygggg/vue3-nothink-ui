<template>
  <div class="nt_table_box" :class="boxClass" :style="boxStyle" ref="tableWrapper">
    <section ref="scrollWrapRef" class="nt_table_scroll_wrapper" :style="scrollWrapperStyle">
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
      <div v-show="props.tableSetting.loading" class="loading_overlay">
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
import NtScrollbar from './NtScrollbar.vue'

import { DataSorter } from '@lib/utils'
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
const sortManager = ref<DataSorter<T>>(new DataSorter(props.data))

const tableWrapper = ref<HTMLElement | null>(null)
const scrollWrapRef = ref<HTMLElement | null>(null) // 滾動容器引用
const tableRef = ref<HTMLTableElement | null>(null) // 表格引用
const headerRef = ref<HTMLElement | null>(null) // 表頭引用

const tableMaxHeight = ref(0)

const tableResizeObserver = ref<ResizeObserver | null>(null) // 用於監聽尺寸變化

// 編輯狀態管理 - 使用 Set 和 Map
const editingCells = ref<Set<string>>(new Set())
const originalValues = ref<Map<string, any>>(new Map())

const scrollbarConfig = computed(() => {
  return {
    container: scrollWrapRef.value ? scrollWrapRef.value : '',
    top: headerRef.value ? headerRef.value.offsetHeight : 0,
    size: 4,
  }
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
  return style
})

// nt_table_box class
const boxClass = computed(() => ({
  'nt_table_box--fixed-height': props.tableSetting.maxHeight,
  'nt_table_box--sticky-header': props.stickyHeader,
  'nt_table_box--has-fixed': props.tableSetting.header.some((col) => col.fixed),
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
  return sortManager.value.sortedData as T[]
})

onMounted(async () => {
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
    if (props.tableSetting.maxHeight === 'auto') await updateHeight()
  }) // 初始載入時更新一次狀態，確保 DOM 尺寸已準備好
})

onUnmounted(() => {
  if (tableWrapper.value && tableWrapper.value.parentElement) {
    tableResizeObserver.value?.unobserve(tableWrapper.value.parentElement) // 監聽容器尺寸變化
  }
})

watch(
  () => props.data,
  (newData) => {
    sortManager.value.update(newData)
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
  sortManager.value.toggleSort(col.key, col.sortable)
}

const isCheckSort = (status: number | undefined) => {
  return typeof status === 'number' ? true : false
}

const handleRowClick = (row: T, index: number) => {
  emit('rowClick', row, index)
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

  --nt-fixed-bg: #ffffff;
  --nt-fixed-shadow: rgba(0, 0, 0, 0.1);

  --nt-sort-btn-color: #000000;

  --nt-empty-color: #909399;

  --nt-loading-overlay-bg: rgba(255, 255, 255, 0.9);
  --nt-loading-color: #409eff;

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
    scrollbar-width: none; // 隱藏原生滾動條 (Firefox)
    -ms-overflow-style: none; // 隱藏原生滾動條 (IE/Edge)
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
  z-index: 9999;

  .loading_spinner {
    font-size: 14px;
    color: var(--nt-loading-color);
  }
}
</style>
