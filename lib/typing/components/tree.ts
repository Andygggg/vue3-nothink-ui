export interface TreeNode {
  id: string
  label: string
  parentId: string | null
  level: number
  expanded?: boolean
  order?: number
  type?: 'parent' | 'children'
}

export interface TreeNodeData {
  node: TreeNode
  index: number
  hasChildren: boolean // 由父組件計算並傳入
  isParent: boolean // 新增：是否為資料夾
  useEditMode: boolean
  isDraggable: boolean
  hover: boolean
  stripe: boolean
  showCheckbox: boolean
  showLevelLine: boolean
  currentNodeId: string | null
  checkedNodes: string[]
}

export interface TreeData {
  data: TreeNode[]
  hover?: boolean
  stripe?: boolean
  showCheckbox?: boolean
  showLevelLine?: boolean
  checkedNodes?: string[]
  openToolbar?: boolean
  useDraggable?: boolean
  useEdit?: boolean
}

export interface DragStartData {
  node: TreeNode
  index: number
}

export interface DragOverData extends DragStartData {
  event: DragEvent
}

export interface DropData extends DragStartData {
  event: DragEvent
  dropPosition?: string
}

export interface DragEndData {
  node: TreeNode | null
  sourceIndex: number
  dropPosition?: string | null
}
