<template>
  <div class="app">
    <div class="header">
      <h1>樹狀列表</h1>
    </div>

    <div class="content">
      <!-- 操作按鈕 -->
      <div class="actions">
        <div class="action-group">
          <h4>🌳 樹操作</h4>
          <button @click="expandAll">展開全部</button>
          <button @click="collapseAll">收合全部</button>
          <button @click="resetData">重置數據</button>
        </div>

        <div class="action-group">
          <h4>➕ 新增節點</h4>
          <button @click="addRootFolder">新增根資料夾</button>
          <button @click="addRootFile">新增根檔案</button>
        </div>
      </div>

      <!-- 樹組件 -->
      <div class="tree-wrapper">
        <TreeWithLines
          ref="treeRef"
          v-model:data="flatTreeData"
          isEditTree
          @node-click="handleNodeClick"
          @drag-start="handleDragStart"
          @drop="handleDrop"
          @add-folder="handleAddFolder"
          @add-file="handleAddFile"
          @delete="handleDelete"
        >
          <!-- 自定義節點內容插槽範例 -->
          <template #tree_special="{ node }">
            <span style="color: #ff6b6b; font-weight: bold"> ⭐ {{ node.label }} (特殊節點) </span>
          </template>
        </TreeWithLines>
      </div>

      <!-- 說明和事件日誌 -->
      <div class="sidebar">
        <!-- 事件日誌 -->
        <div class="event-log">
          <h3>事件</h3>
          <div class="log-content">
            <div
              v-for="(log, index) in eventLogs"
              :key="index"
              class="log-item"
              :class="`log-${log.type}`"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-type">{{ log.type }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TreeWithLines from '@lib/components/NtTree/NtTree.vue'

import type { TreeNode as FlatTreeNode } from '@lib/typing'

const treeRef = ref()

// 扁平化樹狀數據
const flatTreeData = ref<FlatTreeNode[]>([
  // 第一層（根節點）
  {
    id: '1',
    label: '我的專案',
    parentId: null,
    level: 0,
    expanded: true,
    order: 1,
    type: 'folder',
  },
  {
    id: '2',
    label: '工作文件',
    parentId: null,
    level: 0,
    expanded: true,
    order: 2,
    type: 'folder',
  },
  {
    id: '3',
    label: '資源庫',
    parentId: null,
    level: 0,
    expanded: false,
    order: 3,
    type: 'folder',
  },

  // 第二層
  {
    id: '1-1',
    label: '前端專案',
    parentId: '1',
    level: 1,
    expanded: true,
    order: 1,
    type: 'folder',
  },
  {
    id: '1-2',
    label: '後端 API',
    parentId: '1',
    level: 1,
    expanded: false,
    order: 2,
    type: 'folder',
  },
  {
    id: '1-3',
    label: '專案文檔',
    parentId: '1',
    level: 1,
    expanded: true,
    order: 3,
    type: 'folder',
  },
  { id: '1-4', label: 'README.md', parentId: '1', level: 1, order: 4, type: 'file' },

  { id: '2-1', label: '季度報告.xlsx', parentId: '2', level: 1, order: 1, type: 'file' },
  {
    id: '2-2',
    label: '數據分析',
    parentId: '2',
    level: 1,
    expanded: false,
    order: 2,
    type: 'folder',
  },
  { id: '2-3', label: '會議記錄.docx', parentId: '2', level: 1, order: 3, type: 'file' },

  {
    id: '3-1',
    label: '設計素材',
    parentId: '3',
    level: 1,
    expanded: false,
    order: 1,
    type: 'folder',
  },
  { id: '3-2', label: '參考文檔', parentId: '3', level: 1, order: 2, type: 'folder' },

  // 第三層
  {
    id: '1-1-1',
    label: 'Vue 組件',
    parentId: '1-1',
    level: 2,
    expanded: false,
    order: 1,
    type: 'folder',
  },
  { id: '1-1-2', label: '樣式文件', parentId: '1-1', level: 2, order: 2, type: 'folder' },
  { id: '1-1-3', label: '配置文件', parentId: '1-1', level: 2, order: 3, type: 'file' },

  { id: '1-2-1', label: '路由定義', parentId: '1-2', level: 2, order: 1, type: 'file' },
  { id: '1-2-2', label: '數據模型', parentId: '1-2', level: 2, order: 2, type: 'file' },

  { id: '1-3-1', label: 'API 文檔.md', parentId: '1-3', level: 2, order: 1, type: 'file' },
  { id: '1-3-2', label: '需求規格.md', parentId: '1-3', level: 2, order: 2, type: 'file' },
  { id: '1-3-3', label: '測試計畫.md', parentId: '1-3', level: 2, order: 3, type: 'file' },

  // 第四層
  { id: '1-1-1-1', label: 'TreeNode.vue', parentId: '1-1-1', level: 3, order: 1, type: 'file' },
  {
    id: '1-1-1-2',
    label: 'DraggableTree.vue',
    parentId: '1-1-1',
    level: 3,
    order: 2,
    type: 'file',
  },
  { id: '1-1-1-3', label: 'Button.vue', parentId: '1-1-1', level: 3, order: 3, type: 'file' },

  // 特殊節點（用於展示自定義插槽）
  { id: 'special', label: '特殊功能節點', parentId: '1-1', level: 2, order: 4, type: 'file' },
])

// 事件日誌
const eventLogs = ref<Array<{ time: string; type: string; message: string }>>([])

// 添加日誌
const addLog = (type: string, message: string) => {
  const time = new Date().toLocaleTimeString()
  eventLogs.value.unshift({ time, type, message })

  // 保持最多 8 條日誌
  if (eventLogs.value.length > 8) {
    eventLogs.value = eventLogs.value.slice(0, 8)
  }
}

// 事件處理器
const handleNodeClick = (node: FlatTreeNode) => {
  addLog('click', `點擊了 ${node.label}`)
}

const handleDragStart = (data: any) => {
  addLog('drag', `開始拖曳 ${data.node.label}`)
}

const handleDrop = (sourceData: any, targetData: any) => {
  const position = targetData.dropPosition || 'after'
  const positionText =
    position === 'inside' ? '移入' : position === 'before' ? '移到前面' : '移到後面'
  addLog('drop', `${sourceData.node.label} ${positionText} ${targetData.node.label}`)
}

const handleAddFolder = (parentNode: FlatTreeNode) => {
  addLog('add', `在 ${parentNode.label} 中新增資料夾`)
}

const handleAddFile = (parentNode: FlatTreeNode) => {
  addLog('add', `在 ${parentNode.label} 中新增檔案`)
}

const handleDelete = (deletedNode: FlatTreeNode, children: FlatTreeNode[]) => {
  const childCount = children.length - 1
  addLog('delete', `刪除 ${deletedNode.label}${childCount > 0 ? ` 及 ${childCount} 個子項目` : ''}`)
}

// 操作方法
const expandAll = () => {
  treeRef.value?.expandAll()
  addLog('expand', '展開全部節點')
}

const collapseAll = () => {
  treeRef.value?.collapseAll()
  addLog('collapse', '收合全部節點')
}

const addRootFolder = () => {
  const newNode = {
    id: `root-folder-${Date.now()}`,
    label: `📁 新資料夾 ${new Date().toLocaleTimeString()}`,
    parentId: null,
    type: 'folder' as const,
    expanded: false,
    order: flatTreeData.value.filter((n) => n.parentId === null).length + 1,
  }

  treeRef.value?.addNode(newNode)
  addLog('add', '新增根資料夾')
}

const addRootFile = () => {
  const newNode = {
    id: `root-file-${Date.now()}`,
    label: `📄 新檔案 ${new Date().toLocaleTimeString()}.txt`,
    parentId: null,
    type: 'file' as const,
    order: flatTreeData.value.filter((n) => n.parentId === null).length + 1,
  }

  treeRef.value?.addNode(newNode)
  addLog('add', '新增根檔案')
}

const resetData = () => {
  flatTreeData.value = [
    {
      id: 'demo-1',
      label: '🎯 示範專案',
      parentId: null,
      level: 0,
      expanded: true,
      order: 1,
      type: 'folder',
    },
    {
      id: 'demo-1-1',
      label: '📋 源碼',
      parentId: 'demo-1',
      level: 1,
      expanded: true,
      order: 1,
      type: 'folder',
    },
    { id: 'demo-1-2', label: '📝 文檔', parentId: 'demo-1', level: 1, order: 2, type: 'folder' },
    {
      id: 'demo-1-1-1',
      label: '🎨 main.js',
      parentId: 'demo-1-1',
      level: 2,
      order: 1,
      type: 'file',
    },
    {
      id: 'demo-1-1-2',
      label: '⚙️ config.json',
      parentId: 'demo-1-1',
      level: 2,
      order: 2,
      type: 'file',
    },
  ]
  addLog('reset', '重置為示範數據')
}
</script>

<style lang="scss" scoped>
.app {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

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

  .actions {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
    padding: 20px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12px;
    border: 1px solid #dee2e6;

    .action-group {
      display: flex;
      flex-direction: column;
      gap: 8px;

      h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: #495057;
        border-bottom: 2px solid #007bff;
        padding-bottom: 4px;
        font-weight: 600;
      }

      button {
        padding: 10px 16px;
        border: 1px solid #ced4da;
        border-radius: 8px;
        background: white;
        color: #495057;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
        font-weight: 500;

        &:hover {
          background: #f8f9fa;
          border-color: #007bff;
          color: #007bff;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 123, 255, 0.1);
        }

        &:active {
          transform: translateY(0);
        }
      }

      label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #495057;
        cursor: pointer;

        input {
          margin: 0;
        }

        &:hover {
          color: #007bff;
        }
      }
    }
  }

  .tree-wrapper {
    max-height: 450px;
    background: white;
    border-radius: 12px;
    padding: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    overflow: auto;
    border: 1px solid #e5e7eb;

    // 隱藏連接線的樣式
    &.hide-lines :deep(.tree_lines) {
      display: none;
    }

    // 虛線主題
    &.theme-dashed :deep(.tree_lines) {
      .vertical_line,
      .horizontal_line {
        background: repeating-linear-gradient(
          to bottom,
          #d0d0d0,
          #d0d0d0 2px,
          transparent 2px,
          transparent 4px
        );
      }
    }

    // 粗線主題
    &.theme-thick :deep(.tree_lines) {
      .vertical_line {
        width: 2px;
        background-color: #999;
      }

      .horizontal_line {
        height: 2px;
        background-color: #999;
      }
    }
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .event-log {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;

    h3 {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin: 0;
      padding: 16px 20px;
      font-size: 16px;
    }

    .log-content {
      max-height: 300px;
      overflow-y: auto;
      background: #fafafa;
    }

    .log-item {
      padding: 12px 20px;
      border-bottom: 1px solid #f0f0f0;
      font-size: 13px;

      &:last-child {
        border-bottom: none;
      }

      .log-time {
        color: #6b7280;
        font-family: monospace;
        margin-right: 8px;
        font-size: 11px;
      }

      .log-type {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 12px;
        font-weight: 500;
        font-size: 11px;
        margin-right: 8px;
        text-transform: uppercase;
      }

      .log-message {
        color: #374151;
        font-weight: 500;
      }

      &.log-click .log-type {
        background: #dbeafe;
        color: #1e40af;
      }

      &.log-drag .log-type {
        background: #fef3c7;
        color: #d97706;
      }

      &.log-drop .log-type {
        background: #d1fae5;
        color: #059669;
      }

      &.log-add .log-type {
        background: #e0f2fe;
        color: #0891b2;
      }

      &.log-delete .log-type {
        background: #fee2e2;
        color: #dc2626;
      }

      &.log-expand .log-type,
      &.log-collapse .log-type {
        background: #f3e8ff;
        color: #7c3aed;
      }

      &.log-reset .log-type {
        background: #f1f5f9;
        color: #475569;
      }
    }
  }
}
</style>
