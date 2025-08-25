<!-- NtTableCell.vue -->
<template>
  <tr v-for="(row, rowIndex) in props.data" :key="`tr_${rowIndex}`">
    <td
      v-for="(col, colIndex) in props.header"
      :key="col.key"
      :class="getCellClass(col)"
      :style="getColumnStyle(col)"
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
import { ref } from 'vue'
import type { Slot } from 'vue'
import type { TableColumn } from '@lib/typing'

export interface TableCellProps<T = any> {
  header: TableColumn[]
  data: T[]
  isFixed: boolean
}

// 顯式聲明插槽類型以支援泛型
type TableCellSlots<T = any> = {
  [K in `td_${string}`]: Slot<{
    item: T
    value: T[keyof T]
    index: number
    isEditing: boolean
    handleEdit: () => void
    disableEdit: () => void
    cancelEdit: () => void
    handleRowClick: () => void
  }>
}

const props = withDefaults(defineProps<TableCellProps<T>>(), {
  header: () => [] as TableColumn[],
  isFixed: false,
})

const emit = defineEmits<{
  (e: 'cellClick', row: T, index: number): void
}>()

// 聲明插槽類型
defineSlots<TableCellSlots<T>>()

// 編輯狀態管理和其他方法保持不變...
const editingCells = ref<Set<string>>(new Set())
const originalValues = ref<Map<string, any>>(new Map())

const getCellClass = (col: TableColumn) => ({
  [`text-${col.align}`]: col.align,
  ellipsis: col.ellipsis,
  'fixed-left': col.fixed === 'left',
  'fixed-right': col.fixed === 'right',
})

const getColumnStyle = (col: TableColumn) => {
  const style: any = {}
  if (!col || !col.key) return style

  const colIndex = props.header.findIndex((c) => c.key === col.key)
  if (colIndex === -1) return style

  if (col.width) {
    style.width = typeof col.width === 'number' ? `${col.width}px` : col.width
    style.minWidth = style.width
  }
  if (col.minWidth)
    style.minWidth = typeof col.minWidth === 'number' ? `${col.minWidth}px` : col.minWidth
  if (col.align) style.textAlign = col.align

  if (props.isFixed && col.fixed) {
    style.position = 'sticky'
    style.zIndex = 20

    const position = getFixedPosition(col, colIndex)
    if (col.fixed === 'left') {
      style.left = position
    } else if (col.fixed === 'right') {
      style.right = position
    }
  }

  return style
}

const getFixedPosition = (col: TableColumn, colIndex: number) => {
  if (!col.fixed || colIndex === 0) return '0'

  let position = '0'
  if (col.minWidth) {
    position = typeof col.minWidth === 'number' ? `${col.minWidth}px` : col.minWidth
    return position
  }
  if (col.width) {
    position = typeof col.width === 'number' ? `${col.width}px` : col.width
    return position
  }

  return `${position}px`
}
//========================================資料編輯========================================

const getCellKey = (rowIndex: number, colIndex: number): string => {
  return `${rowIndex}-${colIndex}`
}

/**
 * 檢查單元格是否正在編輯
 * @param rowIndex 行索引
 * @param colIndex 列索引
 */
const isEditing = (rowIndex: number, colIndex: number): boolean => {
  return editingCells.value.has(getCellKey(rowIndex, colIndex))
}

/**檢查是否有任何單元格正在編輯 */
const hasEditingCells = (): boolean => {
  return editingCells.value.size > 0
}

/**獲取正在編輯的單元格列表 */
const getEditingCells = (): Array<{ rowIndex: number; colIndex: number }> => {
  return Array.from(editingCells.value).map((cellKey) => {
    const [rowIndex, colIndex] = cellKey.split('-').map(Number)
    return { rowIndex, colIndex }
  })
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

/**清除所有編輯狀態 */
const clearAllEditing = (): void => {
  editingCells.value.clear()
  originalValues.value.clear()
}

const handleRowClick = (row: T, index: number) => {
  emit('cellClick', row, index)
}

defineExpose({
  handleEdit,
  disableEdit,
  cancelEdit,
  isEditing,
  hasEditingCells,
  getEditingCells,
  clearAllEditing,
})
</script>

<style lang="scss" scoped>
@forward '../../../styles/NtTable.scss';
</style>
