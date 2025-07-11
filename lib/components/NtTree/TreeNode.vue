<template>
  <div class="tree_node_row">
    <div
      class="parent_node"
      :class="{
        dragging: isDragging,
        dragover: isDragOver,
        folder: props.isFolder,
        file: !props.isFolder,
      }"
      :style="{
        paddingLeft: `${props.node.level * 20 + 16}px`,
      }"
      :draggable="props.isEditTree"
      @dragstart="onDragStart"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      @dragend="onDragEnd"
      @click="onNodeClick"
    >
      <div class="tree_line">
        <!-- 垂直線：顯示從父級到當前層級的連接 -->
        <div
          v-for="level in props.node.level"
          :key="`v-line-${level}`"
          class="vertical_line"
          :style="{ left: `${(level - 1) * 20 + 18}px` }"
        ></div>
      </div>

      <button class="toggle_btn" v-if="hasChildren" @click.stop="onToggle">
        <span class="toggle_icon" :class="{ expanded: !props.node.expanded }">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
            <path
              d="M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4l96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z"
              fill="currentColor"
            ></path>
          </svg>
        </span>
      </button>
      <span class="tree_label">
        <slot :name="'tree_' + node.id" :node="node">
          {{ node.label }}
        </slot>
      </span>

      <div class="node_actions" v-if="!isDragging && props.isEditTree">
        <button
          v-if="isFolder"
          class="action_btn add_folder"
          @click.stop="onAddFolder"
          title="新增資料夾"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 20 20"
          >
            <g fill="none">
              <path
                d="M4.5 3A2.5 2.5 0 0 0 2 5.5v9A2.5 2.5 0 0 0 4.5 17h5.1a5.465 5.465 0 0 1-.393-1H4.5A1.5 1.5 0 0 1 3 14.5v-7h4.071a1.5 1.5 0 0 0 1.087-.466L9.619 5.5H15.5A1.5 1.5 0 0 1 17 7v2.6c.358.183.693.404 1 .657V7a2.5 2.5 0 0 0-2.5-2.5H9.667l-1.6-1.2a1.5 1.5 0 0 0-.9-.3H4.5zM3 5.5A1.5 1.5 0 0 1 4.5 4h2.667a.5.5 0 0 1 .3.1l1.227.92l-1.26 1.325a.5.5 0 0 1-.363.155H3v-1zm16 9a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0zm-4-2a.5.5 0 0 0-1 0V14h-1.5a.5.5 0 0 0 0 1H14v1.5a.5.5 0 0 0 1 0V15h1.5a.5.5 0 0 0 0-1H15v-1.5z"
                fill="currentColor"
              ></path>
            </g>
          </svg>
        </button>
        <button
          v-if="isFolder"
          class="action_btn add_file"
          @click.stop="onAddFile"
          title="新增檔案"
        >
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
        <button class="action_btn delete" @click.stop="onDelete" title="刪除">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 24 24"
          >
            <g
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 7h16"></path>
              <path d="M10 11v6"></path>
              <path d="M14 11v6"></path>
              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12"></path>
              <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"></path>
            </g>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TreeNode, TreeNodeData } from '@lib/typing'

const props = defineProps<TreeNodeData>()

const emit = defineEmits<{
  (e: 'drag-start', data: { node: TreeNode; index: number }): void
  (e: 'drag-over', data: { event: DragEvent; node: TreeNode; index: number }): void
  (e: 'drop', data: { event: DragEvent; node: TreeNode; index: number }): void
  (e: 'drag-end'): void
  (e: 'toggle', nodeId: string): void
  (e: 'node-click', node: TreeNode): void
  (e: 'add-folder', parentNode: TreeNode): void
  (e: 'add-file', parentNode: TreeNode): void
  (e: 'delete', node: TreeNode): void
}>()

const isDragging = ref(false)
const isDragOver = ref(false)

const hasChildren = computed(() => props.hasChildren)

const onDragStart = (event: DragEvent): void => {
  if (!props.isEditTree) return
  isDragging.value = true
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
  emit('drag-start', {
    node: props.node,
    index: props.index,
  })
}

const onDragOver = (event: DragEvent): void => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  isDragOver.value = true
  emit('drag-over', {
    event,
    node: props.node,
    index: props.index,
  })
}

const onDragLeave = (): void => {
  isDragOver.value = false
}

const onDrop = (event: DragEvent): void => {
  event.preventDefault()
  isDragOver.value = false
  emit('drop', {
    event,
    node: props.node,
    index: props.index,
  })
}

const onDragEnd = (): void => {
  isDragging.value = false
  emit('drag-end')
}

const onToggle = (): void => {
  emit('toggle', props.node.id)
}

const onNodeClick = (): void => {
  emit('node-click', props.node)
}

const onAddFolder = (): void => {
  emit('add-folder', props.node)
}

const onAddFile = (): void => {
  emit('add-file', props.node)
}

const onDelete = (): void => {
  emit('delete', props.node)
}
</script>

<style lang="scss" scoped>
.tree_node_row {
  --nt-node-hover: #e8f4fd;
  --nt-draging-bg: #e3f2fd;
  --nt-dragover-border: 2px dashed #007bff;
  --nt-tree-line: #d0d0d0;
  --nt-toggle-btn: #a3a3a3;
  --nt-toggle-btn-hover: #666;
  --nt-tree-text: #333;

  width: 100%;
  height: auto;
  transition: height 0.3s ease;
}

.parent_node {
  padding: 12px 16px;
  min-height: 48px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  // border-bottom: 1px solid #f0f0f0;
  cursor: move;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background-color: var(--nt-node-hover);

    > .node_actions {
      opacity: 1;
    }
  }

  &.dragging {
    opacity: 0.5;
    background-color: var(--nt-draging-bg);
    transform: scale(0.98);
  }

  &.folder {
    &.dragover {
      border: var(--nt-dragover-border);
    }
  }

  // &.file {
  //   &.dragover {
  //     // border-bottom: 2px solid #007bff;
  //   }
  // }
}

.tree_line {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  pointer-events: none;
  z-index: 1;

  .vertical_line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: var(--nt-tree-line);
  }
}

.toggle_btn {
  background: none;
  border: none;
  padding: 4px;
  margin-right: 8px;
  cursor: pointer;
  color: var(--nt-toggle-btn);
  transition: all 0.2s ease;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; // 防止按鈕被壓縮

  &:hover {
    color: var(--nt-toggle-btn-hover);
  }

  .toggle_icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    transition: transform 0.2s ease;

    &.expanded {
      transform: rotate(-90deg);
    }

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  }
}

.tree_label {
  font-size: 14px;
  color: var(--nt-tree-text);
  user-select: none;
  flex: 1;
}

.node_actions {
  margin-left: auto;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  position: relative;
  z-index: 2;

  .action_btn {
    background: none;
    border: 1px solid transparent;
    border-radius: 4px;
    padding: 4px 6px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 28px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 20px;
      height: 20px;
      transition: all 0.2s ease;
    }

    &:hover {
      transform: scale(1.2);
    }

    &.add_folder {
      color: #f7ac0a;
    }

    &.add_file {
      color: #007bff;
    }

    &.delete {
      color: #dc3545;
    }
  }
}
</style>
