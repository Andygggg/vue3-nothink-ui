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
        <i>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 24 24"
            v-show="props.isSorting(col.key, 'asc')"
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
            v-show="props.isSorting(col.key, 'desc')"
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
import type { TableColumn, TableHeadProps, TableHeadSlots } from '@lib/typing'

const props = withDefaults(defineProps<TableHeadProps>(), {
  header: () => [] as TableColumn[],
  isFixed: false,
  columnStyles: () => ({}),
})

const emit = defineEmits<{
  (e: 'headSort', col: TableColumn): void
}>()

defineSlots<TableHeadSlots>()

//========================================css樣式========================================
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
 * @returns 返回列的樣式
 */
const getColumnStyle = (col: TableColumn) => {
  // 如果有預計算的樣式，直接使用
  if (props.columnStyles && props.columnStyles[col.key]) {
    return props.columnStyles[col.key]
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

//========================================資料動作========================================
/**
 * 檢查是否啟用排序
 * @param status 排序類別
 */
const isCheckSort = (status: number | undefined) => {
  return typeof status === 'number' ? true : false
}

const handleSort = (col: TableColumn) => {
  if (!isCheckSort(col.sortable)) return
  emit('headSort', col)
}
</script>

<style lang="scss" scoped>
@forward '../../../styles/NtTable.scss';
</style>
