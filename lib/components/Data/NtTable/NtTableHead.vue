<template>
  <tr>
    <th
      v-for="(col, colIdx) in props.header"
      :key="col.key"
      :class="getHeaderClass(col)"
      :style="getColumnStyle(col)"
      @click="handleSort(col)"
    >
      <slot :name="`th_${col.key}`" :item="col" :value="col.title" :index="colIdx">
        <span>{{ col.title }}</span>
      </slot>
      <span class="sort_btn" v-if="isCheckSort(col.sortable)">
        <i v-show="props.isSorting(col.key, 'asc')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 24 24"
          >
            <g fill="none">
              <path
                d="M6.102 16.98c-1.074 0-1.648-1.264-.94-2.073l5.521-6.31a1.75 1.75 0 0 1 2.634 0l5.522 6.31c.707.809.133 2.073-.94 2.073H6.101z"
                fill="currentColor"
              ></path>
            </g>
          </svg>
        </i>
        <i v-show="props.isSorting(col.key, 'desc')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 24 24"
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
    </th>
  </tr>
</template>

<script setup lang="ts">
import type { Slot } from 'vue'
import type { TableColumn } from '@lib/typing'

export interface TableHeadProps {
  header: TableColumn[]
  isFixed: boolean
  isSorting: (key: string, order: 'asc' | 'desc') => boolean
}

type TableHeadSlots = {
  [K in `th_${string}`]: Slot<{
    item: TableColumn
    value: string
    index: number
  }>
}

const props = withDefaults(defineProps<TableHeadProps>(), {
  header: () => [] as TableColumn[],
  isFixed: false,
})

const emit = defineEmits<{
  (e: 'headSort', col: TableColumn): void
}>()

defineSlots<TableHeadSlots>()

/**
 * 檢查是否啟用排序
 * @param status 排序類別
 */
const isCheckSort = (status: number | undefined) => {
  return typeof status === 'number' ? true : false
}

/**
 * 自訂header class
 * @param col 列配置
 */
const getHeaderClass = (col: TableColumn) => ({
  sortable: isCheckSort(col.sortable),
  [`text-${col.align}`]: col.align,
  'fixed-left': props.isFixed && col.fixed === 'left',
  'fixed-right': props.isFixed && col.fixed === 'right',
})

/**
 * 自訂列 style
 * @param col 列配置
 * @param type 'header' | 'cell'
 * @returns 返回列的樣式
 */
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
    style.zIndex = 21
    style.background = `var(--nt-fixed-bg)`

    const position = getFixedPosition(col, colIndex)
    if (col.fixed === 'left') {
      style.left = position
    } else if (col.fixed === 'right') {
      style.right = position
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

const handleSort = (col: TableColumn) => {
  if (!isCheckSort(col.sortable)) return
  emit('headSort', col)
}
</script>

<style lang="scss" scoped>
@forward '../../../styles/NtTable.scss';
</style>
