<template>
  <div class="tree_box">
    <div class="tree_list">
      <!-- tree list操作bar -->
      <div class="tree_tool_bar">
        <button class="btn" title="新增父節點" @click="addRootParent">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <g fill="none">
              <path
                d="M4.5 3A2.5 2.5 0 0 0 2 5.5v9A2.5 2.5 0 0 0 4.5 17h5.1a5.465 5.465 0 0 1-.393-1H4.5A1.5 1.5 0 0 1 3 14.5v-7h4.071a1.5 1.5 0 0 0 1.087-.466L9.619 5.5H15.5A1.5 1.5 0 0 1 17 7v2.6c.358.183.693.404 1 .657V7a2.5 2.5 0 0 0-2.5-2.5H9.667l-1.6-1.2a1.5 1.5 0 0 0-.9-.3H4.5zM3 5.5A1.5 1.5 0 0 1 4.5 4h2.667a.5.5 0 0 1 .3.1l1.227.92l-1.26 1.325a.5.5 0 0 1-.363.155H3v-1zm16 9a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0zm-4-2a.5.5 0 0 0-1 0V14h-1.5a.5.5 0 0 0 0 1H14v1.5a.5.5 0 0 0 1 0V15h1.5a.5.5 0 0 0 0-1H15v-1.5z"
                fill="currentColor"
              ></path>
            </g>
          </svg>
        </button>
        <button class="btn" title="新增子節點" @click="addRootChildren">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 1024 1024"
          >
            <path
              d="M854.6 288.6L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2 326H602V137.8L790.2 326zm1.8 562H232V136h302v216a42 42 0 0 0 42 42h216v494zM544 472c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v108H372c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h108v108c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V644h108c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H544V472z"
              fill="currentColor"
            ></path>
          </svg>
        </button>
        <button class="btn" title="收合" @click="collapseAll">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 20 20"
          >
            <g fill="none">
              <path
                d="M16 5.268A2 2 0 0 1 17 7v6a4 4 0 0 1-4 4H7a2 2 0 0 1-1.732-1H13a3 3 0 0 0 3-3V5.268zM15 5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5zm-3 4a.5.5 0 0 1-.5.5h-5a.5.5 0 1 1 0-1h5a.5.5 0 0 1 .5.5z"
                fill="currentColor"
              ></path>
            </g>
          </svg>
        </button>
      </div>

      <!-- 樹狀節點 -->
      <template v-for="(node, index) in visibleNodes" :key="node.id">
        <TreeNode
          :node="node"
          :index="index"
          :has-children="hasChildren(node.id)"
          :is-parent="isParentNode(node)"
          :is-edit-tree="props.isEditTree"
          :hover="props.hover"
          :stripe="props.stripe"
          @drag-start="handleDragStart"
          @drag-over="handleDragOver"
          @drop="handleDrop"
          @drag-end="handleDragEnd"
          @toggle="toggleNode"
          @node-click="handleNodeClick"
          @add-parent="handleAddParent"
          @add-childen="handleAddChildren"
          @delete="handleDelete"
          @node-update="handleNodeUpdate"
        >
          <template v-for="(slotContent, slotName) in slots" #[slotName]="slotData">
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
  hover: false,
  stripe: false,
})

const emit = defineEmits<{
  (e: 'update:data', data: FlatTreeNode[]): void
  (e: 'node-click', node: FlatTreeNode): void
  (e: 'drag-start', data: DragStartData): void
  (e: 'drag-end', data: DragEndData): void
  (e: 'drop', sourceData: DragEndData, targetData: DropData & { dropPosition: string }): void
}>()

const slots = useSlots()

const treeData = ref<FlatTreeNode[]>([...props.data]) //樹狀列表資料
// 拖曳狀態
const dragData: Ref<{
  node: FlatTreeNode | null
  sourceIndex: number
  dropPosition?: string | null
}> = ref({
  node: null, //節點
  sourceIndex: -1, //當前index
  dropPosition: null, //放置位置
})

// 拖曳分隔線
const dragIndicator = reactive({
  show: false, //是否顯示
  style: {
    //長度 & 位置
    top: '0px',
    left: '0px',
    width: '0px',
  },
})

// 樹狀列表（根據展開狀態計算可見節點）
const visibleNodes = computed(() => {
  // 1.tree list紀錄展開狀態
  const expandedMap = new Map<string, boolean>()

  //1-1 加入各節點展開狀態
  treeData.value.forEach((node) => {
    expandedMap.set(node.id, node.expanded || false)
  })

  // 1-2 檢查節點是否可見
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

  // 2. tree list節點順序排列
  const newTreeData: FlatTreeNode[] = []

  // 遞迴添加節點及其子節點
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

  // 3.從根節點開始構建
  handleNodeStatus(null, 0)

  return newTreeData
})

//=================================檢查=================================

/**
 * 檢查節點是否有子節點
 * @param nodeId 節點id
 */
const hasChildren = (nodeId: string): boolean => {
  return treeData.value.some((node) => node.parentId === nodeId)
}

/**
 * 檢查是否為父節點（可以包含子節點）
 * @param node
 */
const isParentNode = (node: FlatTreeNode): boolean => {
  return node.type === 'parent' || node.allowChildren === true || hasChildren(node.id)
}

/**
 * 獲取子節點
 * @param parentId 父節點層級
 */
const getChildNodes = (parentId: string | null): FlatTreeNode[] => {
  //排序節點順序
  return treeData.value
    .filter((node) => node.parentId === parentId)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
}

/**
 * 檢查是否為子節點
 * @param ancestorId 拖曳物件id
 * @param nodeId 目標物件id
 */
const isDescendant = (ancestorId: string, nodeId: string): boolean => {
  const children = getChildNodes(ancestorId)
  for (const child of children) {
    if (child.id === nodeId) return true
    if (isDescendant(child.id, nodeId)) return true
  }
  return false
}

/**
 * 更新子節點層級
 * @param parentId 父節點id
 * @param baseLevel 層級
 */
const updateChildrenLevel = (parentId: string, baseLevel: number): void => {
  const children = getChildNodes(parentId)
  children.forEach((child) => {
    child.level = baseLevel + 1
    updateChildrenLevel(child.id, child.level)
  })
}

//=================================拖曳=================================

/**
 * 處理拖曳開始
 * @param data 子組件回傳資料
 */
const handleDragStart = (data: DragStartData): void => {
  //1.判斷是否為編輯狀態
  if (!props.isEditTree) return
  //2.進入拖曳模式
  dragData.value = {
    node: data.node,
    sourceIndex: data.index,
  }
  //3.回傳父組件
  emit('drag-start', data)
}

/**
 * 處理拖曳懸停
 * @param data 子組件回傳資料
 */
const handleDragOver = (data: DragOverData): void => {
  const { event, node } = data

  // 1.計算物件高度 & 移動偏移值
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const y = event.clientY - rect.top
  const height = rect.height

  // 2.判斷拖曳位置：上半部分(前面)，下半部分(後面或內部)
  const dropPosition = y < height / 3 ? 'before' : y > (height * 2) / 3 ? 'after' : 'inside'

  // 3.如果是 inside 且目標不是資料夾，改為 after
  const finalPosition = dropPosition === 'inside' && !isParentNode(node) ? 'after' : dropPosition

  // 4.顯示拖曳分隔線，並動態計算當前位置 & 長度
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

  // 5.紀錄拖曳位置
  dragData.value.dropPosition = finalPosition
}

/**
 * 處理放置
 * @param data 子組件回傳資料
 */
const handleDrop = (data: DropData): void => {
  // 1.隱藏拖曳分隔線
  dragIndicator.show = false

  // 2.獲取當前放置的物件資料
  if (!dragData.value.node) return
  const sourceNode = dragData.value.node //移動中的物件
  const targetNode = data.node //目標物件
  const dropPosition = dragData.value.dropPosition || 'after'

  // 3.避免拖曳到自己或子節點
  if (sourceNode.id === targetNode.id || isDescendant(sourceNode.id, targetNode.id)) {
    return
  }

  // 4.根據拖曳位置狀態判斷，做對應的放置方式
  if (dropPosition === 'inside') {
    // a-1.拖曳到資料夾內部，將物件的父層:id改為父節點id;層級+1;設為該父節點下的第一個子節點
    if (!isParentNode(targetNode)) return
    sourceNode.parentId = targetNode.id
    sourceNode.level = targetNode.level + 1
    sourceNode.order = 1

    // a-2.更新其他子節點的順序，原本的子節點順序+1往下排
    const siblings = getChildNodes(targetNode.id)
    siblings.forEach((child) => {
      if (child.id !== sourceNode.id) {
        child.order = (child.order || 0) + 1
      }
    })

    // a-3.自動展開目標資料夾
    targetNode.expanded = true
  } else if (dropPosition === 'before') {
    // b-1.拖曳到節點前面，賦予將要取代的物件位置(targetNode)
    sourceNode.parentId = targetNode.parentId
    sourceNode.level = targetNode.level
    sourceNode.order = targetNode.order

    // b-2.更新後續節點的順序
    const siblings = getChildNodes(targetNode.parentId)
    siblings.forEach((child) => {
      if (child.id !== sourceNode.id && (child.order || 0) >= (targetNode.order || 0)) {
        child.order = (child.order || 0) + 1
      }
    })
  } else {
    // c-1.拖曳到節點後面 (after)，賦予將要取代的物件位置(targetNode)及順序+1
    sourceNode.parentId = targetNode.parentId
    sourceNode.level = targetNode.level
    sourceNode.order = (targetNode.order || 0) + 1

    // c-2.更新後續節點的順序
    const siblings = getChildNodes(targetNode.parentId)
    siblings.forEach((child) => {
      if (child.id !== sourceNode.id && (child.order || 0) > (targetNode.order || 0)) {
        child.order = (child.order || 0) + 1
      }
    })
  }

  // 5.更新所有子節點的層級
  updateChildrenLevel(sourceNode.id, sourceNode.level)

  // 6.向父組件發出事件
  emit('drop', dragData.value, { ...data, dropPosition })
  emit('update:data', treeData.value)

  // 7.清空當前拖曳物件
  dragData.value = {
    node: null,
    sourceIndex: -1,
    dropPosition: null,
  }
}

/**
 * 處理拖曳結束
 */
const handleDragEnd = (): void => {
  dragIndicator.show = false
  emit('drag-end', dragData.value)
}

//=================================節點=================================

/**
 * 切換節點展開狀態
 * @param nodeId 節點id
 */
const toggleNode = (nodeId: string): void => {
  const node = treeData.value.find((n) => n.id === nodeId)
  if (node) {
    node.expanded = !node.expanded
  }
}

/**
 * 處理節點點擊
 * @param node 子組件回傳資料
 */
const handleNodeClick = (node: FlatTreeNode): void => {
  emit('node-click', node)
}

/**
 * 獲取下一個順序號
 * @param parentId 父節點id
 */
const getNextOrder = (parentId: string | null): number => {
  const siblings = parentId
    ? getChildNodes(parentId)
    : treeData.value.filter((n) => n.parentId === null)

  return Math.max(0, ...siblings.map((s) => s.order || 0)) + 1
}

/**
 * 新增父節點
 * @param parentNode 父節點
 */
const handleAddParent = (parentNode: FlatTreeNode): void => {
  const newNode = {
    id: `${parentNode.id}-parent-${Date.now()}`,
    label: '新節點(父)',
    type: 'parent' as const,
    expanded: false,
  }

  addNode(newNode, parentNode.id)

  // 自動展開父資料夾
  parentNode.expanded = true
}

/**
 * 新增子節點
 * @param parentNode 父節點
 */
const handleAddChildren = (parentNode: FlatTreeNode): void => {
  const newNode = {
    id: `${parentNode.id}-children-${Date.now()}`,
    label: '新節點',
    type: 'children' as const,
  }

  addNode(newNode, parentNode.id)

  // 自動展開父資料夾
  parentNode.expanded = true
}

const addRootParent = () => {
  const newNode = {
    id: `root-parent-${Date.now()}`,
    label: `新根節點(父)`,
    parentId: null,
    type: 'parent' as const,
    expanded: false,
    order: treeData.value.filter((n) => n.parentId === null).length + 1,
  }

  addNode(newNode)
}

const addRootChildren = () => {
  const newNode = {
    id: `root-children-${Date.now()}`,
    label: `新根節點`,
    parentId: null,
    type: 'children' as const,
    order: treeData.value.filter((n) => n.parentId === null).length + 1,
  }
  addNode(newNode)
}

const addNode = (
  newNode: Omit<FlatTreeNode, 'level' | 'parentId'>,
  parentId: string | null = null,
) => {
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

/**
 * 處理刪除節點
 * @param nodeToDelete 要刪除的節點
 */
const handleDelete = (nodeToDelete: FlatTreeNode): void => {
  // 1.收集要刪除的節點（包含所有子節點）
  const nodesToDelete: FlatTreeNode[] = []

  // 1-1.獲取要刪除的節點及其底下的所有子節點
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
  // 1-2.執行收集要刪除的節點
  collectNodesToDelete(nodeToDelete.id)

  // 2.將收集起來要刪除的節點移除
  const idsToDelete = new Set(nodesToDelete.map((n) => n.id))
  treeData.value = treeData.value.filter((node) => !idsToDelete.has(node.id))

  // 3.重新整理同級節點的順序
  if (nodeToDelete.parentId) {
    //父節點順序
    const siblings = getChildNodes(nodeToDelete.parentId)
    siblings.forEach((sibling, index) => {
      sibling.order = index + 1
    })
  } else {
    // 子節點順序
    const rootNodes = treeData.value.filter((n) => n.parentId === null)
    rootNodes.forEach((root, index) => {
      root.order = index + 1
    })
  }

  //4.回傳父組件
  emit('update:data', treeData.value)
}

/**
 * 更新節點名稱
 * @param data 節點資料、新名稱
 */
const handleNodeUpdate = (data: { node: FlatTreeNode; newLabel: string }) => {
  const currentData = treeData.value.find((item) => item.id === data.node.id)
  if (currentData) currentData.label = data.newLabel
}

const collapseAll = () => {
  treeData.value.forEach((node) => {
    node.expanded = false
  })
}
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
}

.tree_list {
  position: relative;
  min-height: 100px;
  background: var(--nt-tree-bg);
}

.tree_tool_bar {
  padding: 6px 12px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-end;

  > .btn {
    background: none;
    color: #707070;
    border: 1px solid transparent;
    border-radius: 4px;
    padding: 4px 6px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      transform: scale(1.2);
    }

    svg {
      width: 24px;
      height: 24px;
      transition: all 0.2s ease;
    }
  }
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
</style>
