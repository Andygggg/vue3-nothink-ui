<template>
  <div class="tree_box">
    <div class="tree_list">
      <template v-for="(node, index) in visibleNodes" :key="node.id">
        <TreeNode
          :node="node"
          :index="index"
          :has-children="hasChildren(node.id)"
          :is-folder="isFolder(node)"
          :is-edit-tree="props.isEditTree"
          @drag-start="handleDragStart"
          @drag-over="handleDragOver"
          @drop="handleDrop"
          @drag-end="handleDragEnd"
          @toggle="toggleNode"
          @node-click="handleNodeClick"
          @add-folder="handleAddFolder"
          @add-file="handleAddFile"
          @delete="handleDelete"
        >
          <template #[slotName]="slotData" v-for="(slotContent, slotName) in slots">
            <slot :name="slotName" v-bind="slotData"></slot>
          </template>
        </TreeNode>
      </template>
    </div>

    <!-- 拖曳指示器 -->
    <div v-if="dragIndicator.show" class="drag_indicator" :style="dragIndicator.style"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, useSlots, type Ref } from 'vue'

import TreeNode from './TreeNode.vue'
import type {
  TreeNode as FlatTreeNode,
  TreeData,
  DragStartData,
  DragOverData,
  DropData,
  DragEndData,
} from '@lib/typing'

const props = withDefaults(defineProps<TreeData>(), {
  isEditTree: false,
})

// 使用函式重載語法定義 emit 類型
const emit = defineEmits<{
  (e: 'update:data', data: FlatTreeNode[]): void
  (e: 'node-click', node: FlatTreeNode): void
  (e: 'drag-start', data: DragStartData): void
  (e: 'drag-end', data: DragEndData): void
  (e: 'drop', sourceData: DragEndData, targetData: DropData & { dropPosition: string }): void
  (e: 'add-folder', parentNode: FlatTreeNode, newNode: FlatTreeNode): void
  (e: 'add-file', parentNode: FlatTreeNode, newNode: FlatTreeNode): void
  (e: 'delete', deletedNode: FlatTreeNode, children: FlatTreeNode[]): void
}>()

const slots = useSlots()

const treeData = ref<FlatTreeNode[]>([...props.data])

// 拖曳狀態
const dragData: Ref<{
  node: FlatTreeNode | null
  sourceIndex: number
  dropPosition?: string | null
}> = ref({
  node: null,
  sourceIndex: -1,
  dropPosition: null,
})

// 拖曳指示器
const dragIndicator = reactive({
  show: false,
  style: {
    top: '0px',
    left: '0px',
    width: '0px',
  },
})

// 計算可見節點（根據展開狀態過濾）
const visibleNodes = computed(() => {
  // tree list展開狀態
  const expandedMap = new Map<string, boolean>()

  // 加入各節點展開狀態
  treeData.value.forEach((node) => {
    expandedMap.set(node.id, node.expanded || false)
  })

  // 檢查節點是否可見
  const isCheckNode = (node: FlatTreeNode): boolean => {
    if (node.level === 0) return true // 最外層節點

    // 檢查所有父節點是否都展開
    let currentParentId = node.parentId
    while (currentParentId) {
      const parentNode = treeData.value.find((n) => n.id === currentParentId)
      if (!parentNode || !expandedMap.get(parentNode.id)) {
        return false
      }
      currentParentId = parentNode.parentId
    }
    return true
  }

  // tree list(順序排列)
  const newTreeData: FlatTreeNode[] = []

  // 遞歸添加節點及其子節點
  const handleNodeStatus = (parentId: string | null, level: number) => {
    // 獲取當前層級的所有節點並排序
    const formattedData = treeData.value
      .filter((node) => node.parentId === parentId && node.level === level)
      .sort((a, b) => (a.order || 0) - (b.order || 0))

    formattedData.forEach((node) => {
      // 添加當前節點（如果可見）
      if (isCheckNode(node)) {
        newTreeData.push(node)

        // 如果節點展開，遞歸添加子節點
        if (expandedMap.get(node.id)) {
          handleNodeStatus(node.id, level + 1)
        }
      }
    })
  }

  // 從根節點開始構建
  handleNodeStatus(null, 0)

  return newTreeData
})

// 檢查節點是否有子節點
const hasChildren = (nodeId: string): boolean => {
  return treeData.value.some((node) => node.parentId === nodeId)
}

// 檢查節點是否為資料夾（可以包含子項目）
const isFolder = (node: FlatTreeNode): boolean => {
  return node.type === 'folder' || node.allowChildren === true || hasChildren(node.id)
}

// 檢查是否可以拖曳到目標節點
const canDropInto = (node: FlatTreeNode): boolean => {
  return isFolder(node)
}

// 獲取子節點
const getChildNodes = (parentId: string | null): FlatTreeNode[] => {
  return treeData.value
    .filter((node) => node.parentId === parentId)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
}

// 切換節點展開狀態
const toggleNode = (nodeId: string): void => {
  const node = treeData.value.find((n) => n.id === nodeId)
  if (node) {
    node.expanded = !node.expanded
    emit('update:data', treeData.value)
  }
}

// 處理拖曳開始
const handleDragStart = (data: DragStartData): void => {
  if (!props.isEditTree) return
  dragData.value = {
    node: data.node,
    sourceIndex: data.index,
  }
  emit('drag-start', data)
}

// 處理拖曳懸停
const handleDragOver = (data: DragOverData): void => {
  const event = data.event
  const node = data.node
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const y = event.clientY - rect.top
  const height = rect.height

  // 判斷拖曳位置：上半部分 = 前面，下半部分 = 後面或內部
  const dropPosition = y < height / 3 ? 'before' : y > (height * 2) / 3 ? 'after' : 'inside'

  // 如果是 inside 且目標不是資料夾，改為 after
  const finalPosition = dropPosition === 'inside' && !canDropInto(node) ? 'after' : dropPosition

  // 顯示拖曳指示器
  dragIndicator.show = true

  if (finalPosition === 'inside') {
    // 拖曳到資料夾內部
    dragIndicator.style.top = `${rect.top + window.scrollY + 4}px`
    dragIndicator.style.left = `${rect.left + (node.level + 1) * 20 + 10}px`
    dragIndicator.style.width = `${rect.width - (node.level + 1) * 20 - 20}px`
  } else if (finalPosition === 'before') {
    // 拖曳到節點前面
    dragIndicator.style.top = `${rect.top + window.scrollY}px`
    dragIndicator.style.left = `${rect.left + node.level * 20 + 10}px`
    dragIndicator.style.width = `${rect.width - node.level * 20 - 20}px`
  } else {
    // 拖曳到節點後面
    dragIndicator.style.top = `${rect.top + window.scrollY + height}px`
    dragIndicator.style.left = `${rect.left + node.level * 20 + 10}px`
    dragIndicator.style.width = `${rect.width - node.level * 20 - 20}px`
  }

  // 儲存拖曳位置信息
  dragData.value.dropPosition = finalPosition
}

// 處理放置
const handleDrop = (data: DropData): void => {
  dragIndicator.show = false

  if (!dragData.value.node) return

  const sourceNode = dragData.value.node
  const targetNode = data.node
  const dropPosition = dragData.value.dropPosition || 'after'

  // 避免拖曳到自己或子節點
  if (sourceNode.id === targetNode.id || isDescendant(sourceNode.id, targetNode.id)) {
    return
  }

  // 根據拖曳位置處理
  if (dropPosition === 'inside') {
    // 拖曳到資料夾內部
    if (!canDropInto(targetNode)) return

    sourceNode.parentId = targetNode.id
    sourceNode.level = targetNode.level + 1

    // 設為該資料夾下的第一個項目
    const siblings = getChildNodes(targetNode.id)
    sourceNode.order = 1

    // 更新其他子節點的順序
    siblings.forEach((child) => {
      if (child.id !== sourceNode.id) {
        child.order = (child.order || 0) + 1
      }
    })

    // 自動展開目標資料夾
    targetNode.expanded = true
  } else if (dropPosition === 'before') {
    // 拖曳到節點前面
    sourceNode.parentId = targetNode.parentId
    sourceNode.level = targetNode.level
    sourceNode.order = targetNode.order

    // 更新後續節點的順序
    getChildNodes(targetNode.parentId).forEach((child) => {
      if (child.id !== sourceNode.id && (child.order || 0) >= (targetNode.order || 0)) {
        child.order = (child.order || 0) + 1
      }
    })
  } else {
    // 拖曳到節點後面 (after)
    sourceNode.parentId = targetNode.parentId
    sourceNode.level = targetNode.level
    sourceNode.order = (targetNode.order || 0) + 1

    // 更新後續節點的順序
    getChildNodes(targetNode.parentId).forEach((child) => {
      if (child.id !== sourceNode.id && (child.order || 0) > (targetNode.order || 0)) {
        child.order = (child.order || 0) + 1
      }
    })
  }

  // 更新所有子節點的層級
  updateChildrenLevel(sourceNode.id, sourceNode.level)

  // 發出事件
  emit('drop', dragData.value, { ...data, dropPosition })
  emit('update:data', treeData.value)

  // 清空拖曳數據
  dragData.value = {
    node: null,
    sourceIndex: -1,
    dropPosition: null,
  }
}

// 檢查是否為子代節點
const isDescendant = (ancestorId: string, nodeId: string): boolean => {
  const children = getChildNodes(ancestorId)
  for (const child of children) {
    if (child.id === nodeId) return true
    if (isDescendant(child.id, nodeId)) return true
  }
  return false
}

// 更新子節點層級
const updateChildrenLevel = (parentId: string, baseLevel: number): void => {
  const children = getChildNodes(parentId)
  children.forEach((child) => {
    child.level = baseLevel + 1
    updateChildrenLevel(child.id, child.level)
  })
}

// 處理拖曳結束
const handleDragEnd = (): void => {
  dragIndicator.show = false
  emit('drag-end', dragData.value)
}

// 處理節點點擊
const handleNodeClick = (node: FlatTreeNode): void => {
  emit('node-click', node)
}

// 處理添加資料夾
const handleAddFolder = (parentNode: FlatTreeNode): void => {
  const newId = `${parentNode.id}-folder-${Date.now()}`
  const newNode: FlatTreeNode = {
    id: newId,
    label: '新資料夾',
    parentId: parentNode.id,
    level: parentNode.level + 1,
    type: 'folder',
    expanded: false,
    order: getNextOrder(parentNode.id),
  }

  treeData.value.push(newNode)

  // 自動展開父資料夾
  parentNode.expanded = true

  emit('add-folder', parentNode, newNode)
  emit('update:data', treeData.value)
}

// 獲取下一個順序號
const getNextOrder = (parentId: string | null): number => {
  const siblings = parentId
    ? getChildNodes(parentId)
    : treeData.value.filter((n) => n.parentId === null)

  return Math.max(0, ...siblings.map((s) => s.order || 0)) + 1
}

// 處理添加檔案
const handleAddFile = (parentNode: FlatTreeNode): void => {
  const newId = `${parentNode.id}-file-${Date.now()}`
  const newNode: FlatTreeNode = {
    id: newId,
    label: '新檔案.txt',
    parentId: parentNode.id,
    level: parentNode.level + 1,
    type: 'file',
    order: getNextOrder(parentNode.id),
  }

  treeData.value.push(newNode)

  // 自動展開父資料夾
  parentNode.expanded = true

  emit('add-file', parentNode, newNode)
  emit('update:data', treeData.value)
}

// 處理刪除節點
const handleDelete = (nodeToDelete: FlatTreeNode): void => {
  // 收集要刪除的節點（包括所有子節點）
  const nodesToDelete: FlatTreeNode[] = []

  const collectNodesToDelete = (nodeId: string) => {
    const node = treeData.value.find((n) => n.id === nodeId)
    if (node) {
      nodesToDelete.push(node)

      // 遞歸收集子節點
      const children = getChildNodes(nodeId)
      children.forEach((child) => {
        collectNodesToDelete(child.id)
      })
    }
  }

  collectNodesToDelete(nodeToDelete.id)

  // 從數據中移除這些節點
  const idsToDelete = new Set(nodesToDelete.map((n) => n.id))
  treeData.value = treeData.value.filter((node) => !idsToDelete.has(node.id))

  // 重新整理同級節點的順序
  if (nodeToDelete.parentId) {
    const siblings = getChildNodes(nodeToDelete.parentId)
    siblings.forEach((sibling, index) => {
      sibling.order = index + 1
    })
  } else {
    // 重新整理根節點順序
    const rootNodes = treeData.value.filter((n) => n.parentId === null)
    rootNodes.forEach((root, index) => {
      root.order = index + 1
    })
  }

  emit('delete', nodeToDelete, nodesToDelete)
  emit('update:data', treeData.value)
}

// 公開方法
const expandAll = () => {
  treeData.value.forEach((node) => {
    if (hasChildren(node.id)) {
      node.expanded = true
    }
  })
  emit('update:data', treeData.value)
}

const collapseAll = () => {
  treeData.value.forEach((node) => {
    node.expanded = false
  })
  emit('update:data', treeData.value)
}

const addNode = (newNode: Omit<FlatTreeNode, 'level'>, parentId: string | null = null) => {
  const level = parentId ? (treeData.value.find((n) => n.id === parentId)?.level || 0) + 1 : 0

  const finalNode: FlatTreeNode = {
    ...newNode,
    parentId,
    level,
    order: newNode.order || getNextOrder(parentId),
  }

  treeData.value.push(finalNode)
  emit('update:data', treeData.value)

  return finalNode
}

// 刪除節點的公開方法
const removeNode = (nodeId: string): boolean => {
  const nodeToDelete = treeData.value.find((n) => n.id === nodeId)
  if (nodeToDelete) {
    handleDelete(nodeToDelete)
    return true
  }
  return false
}

defineExpose({
  expandAll,
  collapseAll,
  addNode,
  removeNode,
  getChildNodes,
  isFolder,
  hasChildren,
})
</script>

<style lang="scss" scoped>
.tree_box {
  --nt-tree-bg: transparent;
  --nt-drag-line: linear-gradient(90deg, #007bff, #0056b3);
  --nt-drag-line-shadow: 0 0 8px rgba(0, 123, 255, 0.4);
  --nt-drag-dot: #007bff;

  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--nt-tree-bg);
  // border: 1px solid #e0e0e0;
  // border-radius: 8px;
  overflow: hidden;

  .tree_list {
    position: relative;
    min-height: 100px;
    background: var(--nt-tree-bg);
  }

  .drag_indicator {
    position: absolute;
    height: 3px;
    background: var(--nt-drag-line);
    border-radius: 2px;
    z-index: 1000;
    pointer-events: none;
    box-shadow: var(--nt-drag-line-shadow);

    &::before {
      content: '';
      position: absolute;
      left: -6px;
      top: -3px;
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: var(--nt-drag-dot);
    }
  }
}
</style>
