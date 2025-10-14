<template>
  <tr v-for="(row, rowIndex) in props.data" :key="getStableKey(row, rowIndex)">
    <td
      v-for="(col, colIndex) in props.header"
      :key="col.key"
      :class="getCellClass(col)"
      :style="getCachedColumnStyle(col)"
    >
      <slot
        :name="`td_${col.key}`"
        :item="row"
        :value="(row as T)[col.key as keyof T]"
        :index="rowIndex"
        :isEditing="isEditing(rowIndex, colIndex)"
        :handleEdit="() => handleEdit(rowIndex, colIndex)"
        :disableEdit="() => disableEdit(rowIndex, colIndex)"
        :cancelEdit="() => cancelEdit(rowIndex, colIndex)"
        :handleRowClick="() => handleRowClick(row as T, rowIndex)"
      >
        {{ (row as T)[col.key as keyof T] ?? '' }}
      </slot>
    </td>
  </tr>
</template>

<script setup lang="ts" generic="T = Record<string, any>">
import { ref, computed } from 'vue'
import type { TableColumn, TableCellProps, TableCellSlots } from '@lib/typing'

const props = withDefaults(defineProps<TableCellProps<T>>(), {
  header: () => [] as TableColumn[],
  isFixed: false,
  columnStyles: () => ({}),
})

const emit = defineEmits<{
  (e: 'cellClick', row: T, index: number): void
}>()

defineSlots<TableCellSlots<T>>()

const editingCells = ref<Set<string>>(new Set()) // 編輯狀態管理
const originalValues = ref<Map<string, any>>(new Map()) // 存放資料原始狀態

/**
 * 緩存列樣式
 */
const cachedColumnStyles = computed(() => {
  const cache: Record<string, any> = {}
  props.header.forEach((col) => {
    cache[col.key] = getColumnStyle(col)
  })
  return cache
})

//========================================css樣式========================================

/**
 * 獲取緩存的列樣式
 * @param col 列配置
 */
const getCachedColumnStyle = (col: TableColumn) => {
  return cachedColumnStyles.value[col.key] || {}
}

const getCellClass = (col: TableColumn) => ({
  [`text-${col.align}`]: col.align,
  ellipsis: col.ellipsis,
  'fixed-left': col.fixed === 'left',
  'fixed-right': col.fixed === 'right',
})

const getColumnStyle = (col: TableColumn) => {
  if (props.columnStyles && props.columnStyles[col.key]) {
    const style = { ...props.columnStyles[col.key] }
    style.zIndex = 20
    return style
  }

  // 基本樣式（不包含固定列位置計算）
  const style: any = {}
  if (col.width) {
    style.width = typeof col.width === 'number' ? `${col.width}px` : col.width
    style.minWidth = style.width
  }
  if (col.minWidth)
    style.minWidth = typeof col.minWidth === 'number' ? `${col.minWidth}px` : col.minWidth
  if (col.align) style.textAlign = col.align

  return style
}
//========================================資料格式化========================================

/**
 * 生成row key
 * @param row 行資料
 * @param index 索引
 */
const getStableKey = (row: T, index: number): string => {
  // 如果資料有 id 或其他唯一標識，優先使用
  if (row && typeof row === 'object' && 'id' in row && (row as any).id) {
    return `tr_${(row as any).id}`
  }
  return `tr_${index}`
}

/**
 * 生成cell key
 * @param rowIndex 行資料
 * @param colIndex 列索引
 */
const getCellKey = (rowIndex: number, colIndex: number): string => {
  return `${rowIndex}-${colIndex}`
}
//========================================資料編輯========================================

/**
 * 檢查單元格是否正在編輯
 * @param rowIndex 行索引
 * @param colIndex 列索引
 */
const isEditing = (rowIndex: number, colIndex: number): boolean => {
  return editingCells.value.has(getCellKey(rowIndex, colIndex))
}

/**
 * 單元格編輯
 * @param rowIndex 行索引
 * @param colIndex 列索引
 */
const handleEdit = (rowIndex: number, colIndex: number) => {
  const cellKey = getCellKey(rowIndex, colIndex)
  const col = props.header[colIndex]
  const originalValue = (props.data[rowIndex] as T)[col.key as keyof T]
  originalValues.value.set(cellKey, originalValue)
  editingCells.value.add(cellKey)
}

/**
 * 禁用單元格編輯
 * @param rowIndex 行索引
 * @param colIndex 列索引
 */
const disableEdit = (rowIndex: number, colIndex: number) => {
  const cellKey = getCellKey(rowIndex, colIndex)
  editingCells.value.delete(cellKey)
  originalValues.value.delete(cellKey)
}

/**
 * 取消編輯，恢復原始值
 * @param rowIndex 行索引
 * @param colIndex 列索引
 */
const cancelEdit = (rowIndex: number, colIndex: number) => {
  const cellKey = getCellKey(rowIndex, colIndex)
  const col = props.header[colIndex]

  if (originalValues.value.has(cellKey)) {
    const originalValue = originalValues.value.get(cellKey)
    ;(props.data[rowIndex] as T as any)[col.key] = originalValue
  }

  disableEdit(rowIndex, colIndex)
}

const handleRowClick = (row: T, index: number) => {
  emit('cellClick', row, index)
}
</script>

<style lang="scss" scoped>
@forward '../../../styles/NtTable.scss';
</style>
