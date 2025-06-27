export interface TableColumn {
  key: string // 唯一鍵
  title: string // 標題
  width?: string | number // 寬度
  minWidth?: string | number // 最小寬度
  align?: 'left' | 'center' | 'right' // 對齊方式
  sortable?: boolean // 是否可排序
  fixed?: 'left' | 'right' // 是否固定在左側或右側
  ellipsis?: boolean // 是否省略文字
}

export interface TableSetting {
  header: TableColumn[] // 標題
  size?: 'small' | 'medium' | 'large' // 尺寸
  maxHeight?: string | number // 最大高度
  emptyText?: string // 空狀態文字
  loading?: boolean // 載入狀態
}

export interface TableProps {
  tableSetting: TableSetting // 表格設定
  data: any[] // 資料
  stripe?: boolean // 條紋
  border?: boolean // 邊框
  hover?: boolean // hover效果
  scrollX?: boolean // 水平滾動
  scrollY?: boolean // 垂直滾動
  stickyHeader?: boolean // 表頭固定
}

export interface TableEditMethods {
  handleEdit: (rowIndex: number, colIndex: number) => void
  disableEdit: (rowIndex: number, colIndex: number) => void
  cancelEdit: (rowIndex: number, colIndex: number) => void
  isEditing: (rowIndex: number, colIndex: number) => boolean
  hasEditingCells: () => boolean
  getEditingCells: () => Array<{ rowIndex: number; colIndex: number }>
  clearAllEditing: () => void
  cancelAllEditing: () => void
  confirmAllEditing: () => void
}
