import type { Slot } from 'vue'

export interface TableColumn {
  key: string // 唯一鍵
  title: string // 標題
  width?: string | number // 寬度
  minWidth?: string | number // 最小寬度
  align?: 'left' | 'center' | 'right' // 對齊方式
  sortable?: number // 是否可排序
  fixed?: 'left' | 'right' // 是否固定在左側或右側
  ellipsis?: boolean // 是否省略文字
}

export interface TableProps<T = any> {
  header: TableColumn[] // 標題
  size?: 'small' | 'medium' | 'large' // 尺寸
  data: T[] // 資料 - 使用泛型 T
  stripe?: boolean // 條紋
  cellBorder?: boolean // 邊框
  hover?: boolean // hover效果
  stickyHeader?: boolean // 表頭固定
  maxHeight?: string | number // 最大高度
  emptyText?: string // 空狀態文字
  loading?: boolean // 載入狀態
}

export interface TableHeadProps {
  header: TableColumn[]
  isFixed: boolean
  isSorting: (key: string, order: 'asc' | 'desc') => boolean
  columnStyles?: Record<string, any> // 預計算的列樣式
}

export type TableHeadSlots = {
  [K in `th_${string}`]: Slot<{
    item: TableColumn
    value: string
    index: number
  }>
}

export interface TableCellProps<T = any> {
  header: TableColumn[]
  data: T[]
  isFixed: boolean
  columnStyles?: Record<string, any>
}

export type TableCellSlots<T = any> = {
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
