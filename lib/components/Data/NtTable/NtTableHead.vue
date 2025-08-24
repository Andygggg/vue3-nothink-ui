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
.nt_table_box {
  // // 固定表頭的樣式
  &.nt_table_box--sticky-header {
    .nt_table thead th {
      position: sticky;
      top: 0;
      z-index: 10;
    }
  }
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
  }

  th {
    background: var(--nt-header-bg);
    color: var(--nt-header-color);
    font-weight: 500;
    box-shadow: inset 0 -1px 0 var(--nt-header-border);
    user-select: none;
    position: relative;

    .sort_btn {
      position: absolute;
      top: 50%;
      right: 0px;
      transform: translateY(-50%);
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

    &.sortable {
      cursor: pointer;
    }
  }

  td {
    border-bottom: 1px solid var(--nt-cell-border);
  }

  tbody tr {
    transition: background-color 0.25s ease;

    &:last-child td {
      border-bottom: none;
    }

    // &:hover {
    //   td.fixed-left,
    //   td.fixed-right {
    //     background: var(--nt-hover-bg) !important;
    //   }
    // }
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
      padding: 10.5px 14px;
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
    border: 1px solid var(--nt-cell-border);

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
</style>
