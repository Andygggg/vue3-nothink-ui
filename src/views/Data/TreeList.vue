<template>
  <div class="app">
    <div class="header">
      <h1>樹狀列表</h1>
    </div>

    <div class="content">
      <!-- 樹組件 -->
      <div class="tree-wrapper">
        <div class="tree_bar">
          <input type="text" id="test" v-model="searchKeyword" />
          <div class="btn_group">
            <button class="btn" title="新增父節點" @click="addParentNode">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 20 20"
              >
                <g fill="none">
                  <path
                    d="M9.386 4.29l-1.32-.99a1.5 1.5 0 0 0-.9-.3H4.5A2.5 2.5 0 0 0 2 5.5v1h5.07a.5.5 0 0 0 .363-.156L9.386 4.29zm1.179.21L8.158 7.033a1.5 1.5 0 0 1-1.087.467H2v7A2.5 2.5 0 0 0 4.5 17h5.1a5.5 5.5 0 0 1 8.4-6.743V7l-.005-.164A2.5 2.5 0 0 0 15.5 4.5h-4.935zM19 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0zm-4-2a.5.5 0 0 0-1 0V14h-1.5a.5.5 0 0 0 0 1H14v1.5a.5.5 0 0 0 1 0V15h1.5a.5.5 0 0 0 0-1H15v-1.5z"
                    fill="currentColor"
                  ></path>
                </g>
              </svg>
            </button>
            <button class="btn" title="新增子節點" @click="addChildrenNode">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 1024 1024"
              >
                <path
                  d="M480 580H372a8 8 0 0 0-8 8v48a8 8 0 0 0 8 8h108v108a8 8 0 0 0 8 8h48a8 8 0 0 0 8-8V644h108a8 8 0 0 0 8-8v-48a8 8 0 0 0-8-8H544V472a8 8 0 0 0-8-8h-48a8 8 0 0 0-8 8v108zm374.6-291.3c6 6 9.4 14.1 9.4 22.6V928c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32h424.7c8.5 0 16.7 3.4 22.7 9.4l215.2 215.3zM790.2 326L602 137.8V326h188.2z"
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
        </div>
        <nt-tree
          v-model:data="filterTreeData"
          v-model:checked-nodes="currentCheckedNodes"
          show-checkbox
          show-level-line
          stripe
          hover
          @node-click="handleNodeClick"
          @node-check="handleNodeCheck"
          @drag-start="handleDragStart"
          @drop="handleDrop"
          @update:data="handleStatus"
        >
          <!-- 自定義節點內容插槽範例 -->
          <template #tree_label="{ node }">
            <span style="font-weight: bold; cursor: default">{{ node.label }}</span>
          </template>
        </nt-tree>
      </div>

      <div class="tree-wrapper">
        <nt-tree
          v-model:data="flatTreeDataV2"
          v-model:checked-nodes="currentCheckedNodes"
          use-draggable
          use-edit
          show-checkbox
          open-toolbar
          stripe
          hover
          @node-click="handleNodeClick"
          @node-check="handleNodeCheck"
          @drag-start="handleDragStart"
          @drop="handleDrop"
          @update:data="handleStatus"
        >
        </nt-tree>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref, computed, onMounted } from 'vue'
import NtTree from '@lib/components/NtTree/NtTree.vue'

import type { TreeNode as FlatTreeNode } from '@lib/typing'

// 扁平化樹狀數據
const flatTreeData = ref<FlatTreeNode[]>([
  // 第一層（根節點）
  {
    id: '1',
    label: '我的專案',
    parentId: null,
    level: 0,
    expanded: false,
    order: 1,
    type: 'parent',
  },
  {
    id: '2',
    label: '工作文件',
    parentId: null,
    level: 0,
    expanded: false,
    order: 2,
    type: 'parent',
  },
  {
    id: '3',
    label: '資源庫',
    parentId: null,
    level: 0,
    expanded: false,
    order: 3,
    type: 'parent',
  },

  // 第二層
  {
    id: '1-1',
    label: '前端專案',
    parentId: '1',
    level: 1,
    expanded: false,
    order: 1,
    type: 'parent',
  },
  {
    id: '1-2',
    label: '後端 API',
    parentId: '1',
    level: 1,
    expanded: false,
    order: 2,
    type: 'parent',
  },
  {
    id: '1-3',
    label: '專案文檔',
    parentId: '1',
    level: 1,
    expanded: false,
    order: 3,
    type: 'parent',
  },
  { id: '1-4', label: 'README.md', parentId: '1', level: 1, order: 4, type: 'children' },

  { id: '2-1', label: '季度報告.xlsx', parentId: '2', level: 1, order: 1, type: 'children' },
  {
    id: '2-2',
    label: '數據分析',
    parentId: '2',
    level: 1,
    expanded: false,
    order: 2,
    type: 'parent',
  },
  { id: '2-3', label: '會議記錄.docx', parentId: '2', level: 1, order: 3, type: 'children' },

  {
    id: '3-1',
    label: '設計素材',
    parentId: '3',
    level: 1,
    expanded: false,
    order: 1,
    type: 'parent',
  },
  { id: '3-2', label: '參考文檔', parentId: '3', level: 1, order: 2, type: 'parent' },

  // 第三層
  {
    id: '1-1-1',
    label: 'Vue 組件',
    parentId: '1-1',
    level: 2,
    expanded: false,
    order: 1,
    type: 'parent',
  },
  { id: '1-1-2', label: '樣式文件', parentId: '1-1', level: 2, order: 2, type: 'parent' },
  { id: '1-1-3', label: '配置文件', parentId: '1-1', level: 2, order: 3, type: 'children' },

  { id: '1-2-1', label: '路由定義', parentId: '1-2', level: 2, order: 1, type: 'children' },
  { id: '1-2-2', label: '數據模型', parentId: '1-2', level: 2, order: 2, type: 'children' },

  { id: '1-3-1', label: 'API 文檔.md', parentId: '1-3', level: 2, order: 1, type: 'children' },
  { id: '1-3-2', label: '需求規格.md', parentId: '1-3', level: 2, order: 2, type: 'children' },
  { id: '1-3-3', label: '測試計畫.md', parentId: '1-3', level: 2, order: 3, type: 'children' },

  // 第四層
  { id: '1-1-1-1', label: 'TreeNode.vue', parentId: '1-1-1', level: 3, order: 1, type: 'children' },
  {
    id: '1-1-1-2',
    label: 'DraggableTree.vue',
    parentId: '1-1-1',
    level: 3,
    order: 2,
    type: 'children',
  },
  { id: '1-1-1-3', label: 'Button.vue', parentId: '1-1-1', level: 3, order: 3, type: 'children' },

  // 特殊節點（用於展示自定義插槽）
  { id: 'special', label: '特殊功能節點', parentId: '1-1', level: 2, order: 4, type: 'children' },
])

const flatTreeDataV2 = ref<FlatTreeNode[]>([
  // 第一層（根節點）
  {
    id: '1',
    label: '我的專案',
    parentId: null,
    level: 0,
    expanded: false,
    type: 'parent',
  },
  {
    id: '2',
    label: '工作文件',
    parentId: null,
    level: 0,
    expanded: false,
    type: 'parent',
  },
  {
    id: '3',
    label: '資源庫',
    parentId: null,
    level: 0,
    expanded: false,
    type: 'parent',
  },

  // 第二層
  {
    id: '1-1',
    label: '前端專案',
    parentId: '1',
    level: 1,
    expanded: false,
    type: 'parent',
  },
  {
    id: '1-2',
    label: '後端 API',
    parentId: '1',
    level: 1,
    expanded: false,
    type: 'parent',
  },
  {
    id: '1-3',
    label: '專案文檔',
    parentId: '1',
    level: 1,
    expanded: false,
    type: 'parent',
  },
  { id: '1-4', label: 'README.md', parentId: '1', level: 1, type: 'children' },

  { id: '2-1', label: '季度報告.xlsx', parentId: '2', level: 1, type: 'children' },
  {
    id: '2-2',
    label: '數據分析',
    parentId: '2',
    level: 1,
    expanded: false,
    type: 'parent',
  },
  { id: '2-3', label: '會議記錄.docx', parentId: '2', level: 1, type: 'children' },

  {
    id: '3-1',
    label: '設計素材',
    parentId: '3',
    level: 1,
    expanded: false,
    type: 'parent',
  },
  { id: '3-2', label: '參考文檔', parentId: '3', level: 1, type: 'parent' },
])
const currentCheckedNodes: Ref<string[]> = ref([]) //當前選中的節點

const searchKeyword = ref('')
const filterTreeData = computed({
  get() {
    if (!searchKeyword.value || searchKeyword.value.trim() === '') {
      return flatTreeData.value
    }

    const matchedNodeIds: Set<string> = new Set()
    const resultNodeIds = new Set()
    flatTreeData.value.forEach((node) => {
      if (node.label.toLowerCase().includes(searchKeyword.value)) {
        matchedNodeIds.add(node.id)
      }
    })

    const matchParentNodes = (nodeId: string) => {
      if (resultNodeIds.has(nodeId)) return

      resultNodeIds.add(nodeId)

      const currentNode = flatTreeData.value.find((node) => node.id === nodeId)
      if (currentNode && currentNode.parentId) {
        matchParentNodes(currentNode.parentId)
      }
    }

    matchedNodeIds.forEach((nodeId) => {
      matchParentNodes(nodeId)
    })
    return flatTreeData.value
      .filter((node) => resultNodeIds.has(node.id))
      .map((node) => {
        const hasChildrenInResult = flatTreeData.value.some(
          (child) => child.parentId === node.id && resultNodeIds.has(child.id),
        )

        return {
          ...node,
          expanded: hasChildrenInResult || node.expanded,
        }
      })
  },

  set(newVal) {
    flatTreeData.value = newVal
  },
})

onMounted(() => {
  const needsOrder = checkNodeOrder(flatTreeDataV2.value)
  if (needsOrder) generateOrderOptimized()
})

const checkNodeOrder = (data: FlatTreeNode[]) => {
  return data.some((node) => !('order' in node) || node.order === undefined)
}

// 優化的 order 生成
const generateOrderOptimized = () => {
  const processNodesByParent = (parentId: string | null): void => {
    const children = flatTreeDataV2.value.filter((node) => node.parentId === parentId)

    if (children.length === 0) return

    children.forEach((node, index) => {
      // 只為沒有 order 的節點生成
      if (!('order' in node) || node.order === undefined) {
        node.order = index + 1
      }

      // 遞歸處理子節點
      processNodesByParent(node.id)
    })
  }

  processNodesByParent(null)
}

// 事件處理器
const handleNodeClick = (node: FlatTreeNode) => {
  console.log('點擊', `點擊了 ${node.label}`, node)
}
const handleNodeCheck = (node: FlatTreeNode) => {
  console.log('勾選', `勾選了 ${node}`)
}

const handleDragStart = (data: any) => {
  console.log('開始拖曳', `開始拖曳 ${data.node.label}`)
}

const handleDrop = (sourceData: any, targetData: any) => {
  const position = targetData.dropPosition || 'after'
  const positionText =
    position === 'inside' ? '移入' : position === 'before' ? '移到前面' : '移到後面'
  console.log('移入', `${sourceData.node.label} ${positionText} ${targetData.node.label}`)
}

const handleStatus = (data: FlatTreeNode[]) => {
  console.log('修改', `資料 ${data.length}`, data)
}

const addParentNode = () => {
  const newNode = {
    id: `root-parent-${Date.now()}`,
    label: `新根節點(父)`,
    parentId: null,
    type: 'parent' as const,
    expanded: false,
    order: flatTreeData.value.filter((n) => n.parentId === null).length + 1,
    level: 0,
  }

  flatTreeData.value.push(newNode)
}

const addChildrenNode = () => {
  const newNode = {
    id: `root-children-${Date.now()}`,
    label: `新根節點`,
    parentId: null,
    type: 'children' as const,
    order: flatTreeData.value.filter((n) => n.parentId === null).length + 1,
    level: 0,
  }

  flatTreeData.value.push(newNode)
}

const collapseAll = () => {
  flatTreeData.value.forEach((node) => {
    node.expanded = false
  })
}
</script>

<style lang="scss" scoped>
.app {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 30px;

  h1 {
    color: #333;
    margin-bottom: 8px;
    font-size: 28px;
  }
}

.content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.tree-wrapper {
  max-width: 320px;
  max-height: 450px;
  background: white;
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: auto;
  overflow-x: auto;
  border: 1px solid #e5e7eb;
}

.tree_bar {
  width: 100%;
  height: 30px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;

  > input {
    width: auto;
    min-width: 120px;
    max-width: 300px;
    height: 100%;
    border: 1px solid #d9d9d9;
    border-radius: 0.375rem;
    outline: none;

    &:focus {
      border: 1px solid #a297e9;
    }
  }

  .btn_group {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;
    border: 1px solid #e9e9e9;
    border-radius: 0.375rem;

    > .btn {
      background: none;
      color: #7c70c5;
      border: none;
      border-left: 1px solid #e9e9e9;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        transform: scale(1.2);
      }

      svg {
        width: 22px;
        height: 22px;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }
    }
  }
}
</style>
