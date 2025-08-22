<template>
  <div class="tree_node_row">
    <div
      class="node_row"
      :class="treeNodeClass"
      :style="{
        paddingLeft: `${props.node.level * 20 + 5}px`,
        cursor: props.isDraggable ? 'move' : 'default',
      }"
      :draggable="props.isDraggable"
      @dragstart="onDragStart"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      @dragend="onDragEnd"
      @click="onNodeClick"
    >
      <!-- 層級線 -->
      <div class="tree_line" v-if="props.showLevelLine">
        <div
          v-for="level in props.node.level"
          :key="`v-line-${level}`"
          class="vertical_line"
          :style="{ left: `${(level - 1) * 20 + 18}px` }"
        ></div>
      </div>

      <!-- 展開icon -->
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

      <label class="tree_checkbox" :for="'checkbox' + props.node.id" v-if="props.showCheckbox">
        <input
          type="checkbox"
          :id="'checkbox' + props.node.id"
          :checked="isCheckedNode"
          @change="onNodeCheck"
        />
        <span class="checkbox_icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 512 512"
          >
            <path
              d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69L432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"
              fill="currentColor"
            ></path>
          </svg>
        </span>
      </label>

      <!-- 節點標題 -->
      <div class="tree_label" @dblclick="editNodeLabel(props.node.id)">
        <div class="edit_input" v-if="isEditNode">
          <input
            :id="'input' + props.node.id"
            type="text"
            ref="labelInput"
            v-model="editingLabel"
            @keyup.enter="saveLabel"
            @keyup.escape="cancelEdit"
            @blur="cancelEdit"
          />
          <button class="action_btn check" title="確認" @click="saveLabel">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 512 512"
            >
              <path
                d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69L432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"
                fill="currentColor"
              ></path>
            </svg>
          </button>
        </div>

        <slot name="tree_label" :node="node" v-else>
          <span style="cursor: default">{{ node.label }}</span>
        </slot>
      </div>

      <!-- 操作工具列 -->
      <div class="node_actions" v-if="props.useEditMode && !isEditNode">
        <slot name="addFolderButton" :onAddParent="onAddParent" v-if="isParent">
          <button class="action_btn add_folder" @click="onAddParent" title="新增資料夾">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <g fill="none">
                <path
                  d="M4.5 3A2.5 2.5 0 0 0 2 5.5v9A2.5 2.5 0 0 0 4.5 17h5.1a5.465 5.465 0 0 1-.393-1H4.5A1.5 1.5 0 0 1 3 14.5v-7h4.071a1.5 1.5 0 0 0 1.087-.466L9.619 5.5H15.5A1.5 1.5 0 0 1 17 7v2.6c.358.183.693.404 1 .657V7a2.5 2.5 0 0 0-2.5-2.5H9.667l-1.6-1.2a1.5 1.5 0 0 0-.9-.3H4.5zM3 5.5A1.5 1.5 0 0 1 4.5 4h2.667a.5.5 0 0 1 .3.1l1.227.92l-1.26 1.325a.5.5 0 0 1-.363.155H3v-1zm16 9a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0zm-4-2a.5.5 0 0 0-1 0V14h-1.5a.5.5 0 0 0 0 1H14v1.5a.5.5 0 0 0 1 0V15h1.5a.5.5 0 0 0 0-1H15v-1.5z"
                  fill="currentColor"
                ></path>
              </g>
            </svg>
          </button>
        </slot>
        <slot name="addFileButton" :onAddChildren="onAddChildren" v-if="isParent">
          <button class="action_btn add_file" @click.stop="onAddChildren" title="新增檔案">
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
        </slot>
        <slot name="onDeleteButton" :onDelete="onDelete"></slot>
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
import { ref, computed, nextTick, watch } from 'vue'
import type { TreeNode, TreeNodeData } from '@lib/typing'

const props = withDefaults(defineProps<TreeNodeData>(), {
  isDraggable: false,
})

const emit = defineEmits<{
  (e: 'drag-start', data: { node: TreeNode; index: number }): void
  (e: 'drag-over', data: { event: DragEvent; node: TreeNode; index: number }): void
  (e: 'drop', data: { event: DragEvent; node: TreeNode; index: number }): void
  (e: 'drag-end'): void
  (e: 'toggle', nodeId: string): void
  (e: 'node-click', node: TreeNode): void
  (e: 'add-parent', parentNode: TreeNode): void
  (e: 'add-children', parentNode: TreeNode): void
  (e: 'delete', node: TreeNode): void
  (e: 'node-update', data: { node: TreeNode; newLabel: string }): void
  (e: 'node-selected', label: string | null): void
  (e: 'node-checked', node: TreeNode): void
}>()

defineSlots<{
  tree_label: (props: { node: TreeNode }) => any
  addFolderButton: (props: { onAddParent: () => void }) => any
  addFileButton: (props: { onAddChildren: () => void }) => any
  onDeleteButton: (props: { onDelete: () => void }) => any
}>()

const isDragging = ref(false) //拖曳中
const isDragOver = ref(false) //拖曳覆蓋
const labelInput = ref<HTMLInputElement | null>(null) //標題input dom
const editingLabel = ref('') //標題

const hasChildren = computed(() => props.hasChildren) //是否顯示展開icon
//編輯狀態判斷
const isEditNode = computed(() => {
  return props.useEditMode && props.currentNodeId === props.node.id
})
const isCheckedNode = computed(() => {
  const hasNode = props.checkedNodes.find((nodeId) => nodeId === props.node.id)
  return hasNode ? true : false
})

//tree node class
const treeNodeClass = computed(() => ({
  'nt_tree_node--dragging': isDragging.value,
  'nt_tree_node--dragover': isDragOver.value,
  nt_tree_folder: props.isParent,
  'nt_tree_node--hover': props.hover,
  'nt_tree_node--stripe': props.stripe && !props.node.parentId && props.node.order !== 1,
}))

//判斷是否為新增節點直接開啟input
watch(
  () => isEditNode.value,
  async (newVal) => {
    if (newVal && props.currentNodeId === props.node.id) {
      editingLabel.value = props.node.label

      // 等待 DOM 更新
      await nextTick()
      if (labelInput.value) {
        labelInput.value.focus()
        labelInput.value.select()
      }
    }
  },
  { immediate: true },
)
//=================================拖曳=================================

/**
 * 開始拖曳
 * @param event 拖曳事件
 */
const onDragStart = (event: DragEvent): void => {
  //1.判斷是否為編輯狀態
  if (!props.isDraggable) return

  //2.進入拖曳模式
  isDragging.value = true
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }

  //3.回傳父組件
  emit('drag-start', {
    node: props.node,
    index: props.index,
  })
}

/**
 * 拖曳覆蓋其他節點
 * @param event 拖曳事件
 */
const onDragOver = (event: DragEvent): void => {
  //1.拖曳狀態
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  isDragOver.value = true

  //2.回傳父組件
  emit('drag-over', {
    event,
    node: props.node,
    index: props.index,
  })
}

/**
 * 離開放置區域
 */
const onDragLeave = (): void => {
  isDragOver.value = false
}

/**
 * 放置節點至新位置
 * @param event 拖曳事件
 */
const onDrop = (event: DragEvent): void => {
  //1.拖曳狀態
  event.preventDefault()
  isDragOver.value = false

  //2.回傳父組件
  emit('drop', {
    event,
    node: props.node,
    index: props.index,
  })
}

/**
 * 結束拖曳
 */
const onDragEnd = (): void => {
  isDragging.value = false
  emit('drag-end')
}

//=================================節點=================================

/**
 * 展開子節點
 */
const onToggle = (): void => {
  emit('toggle', props.node.id)
}

/**
 * 節點點擊觸發
 */
const onNodeClick = (): void => {
  emit('node-click', props.node)
}

/**
 * 新增父節點
 */
const onAddParent = (): void => {
  emit('add-parent', props.node)
}

/**
 * 新增子節點
 */
const onAddChildren = (): void => {
  emit('add-children', props.node)
}

/**
 * 刪除節點
 */
const onDelete = (): void => {
  emit('delete', props.node)
}

/**
 * 勾選節點
 */
const onNodeCheck = (): void => {
  emit('node-checked', props.node)
}

//=================================標題=================================

/**
 * 編輯標題
 */
const editNodeLabel = async (nodeId: string) => {
  if (!props.useEditMode) return
  // 1.進入編輯模式，保存原始值
  emit('node-selected', nodeId) // 發出選中事件
  editingLabel.value = props.node.label

  // 2.選中所有文字，方便編輯
  await nextTick()
  labelInput.value?.focus()
  labelInput.value?.select()
}

/**
 * 儲存標題
 */
const saveLabel = () => {
  emit('node-selected', null)
  emit('node-update', { node: props.node, newLabel: editingLabel.value })
}

/**
 * 取消編輯標題
 */
const cancelEdit = () => {
  emit('node-selected', null)
}
</script>

<style lang="scss" scoped>
.tree_node_row {
  --nt-node-hover: rgba(232, 244, 253, 0.6);
  --nt-dragging-bg: #e3f2fd;
  --nt-dragover-border: 2px dashed #007bff;
  --nt-tree-line: #d0d0d0;
  --nt-toggle-btn: #a3a3a3;
  --nt-toggle-btn-hover: #666;
  --nt-tree-text: #333;
  --nt-tree-stripe: 1px solid #d9d9d9;

  width: 100%;
  height: auto;
  transition: height 0.3s ease;
}

.node_row {
  padding: 12px 0px 12px 16px;
  min-height: 48px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  transition: all 0.2s ease;
  position: relative;

  &.nt_tree_node--stripe {
    border-top: var(--nt-tree-stripe);
  }

  &:hover {
    &.nt_tree_node--hover {
      background-color: var(--nt-node-hover);
    }

    > .node_actions {
      opacity: 1;
    }
  }

  &.nt_tree_node--dragging {
    opacity: 0.5;
    background-color: var(--nt-dragging-bg);
    transform: scale(0.98);
  }

  &.nt_tree_folder {
    &.nt_tree_node--dragover {
      border: var(--nt-dragover-border);
    }
  }
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

.tree_checkbox {
  background: none;
  border: none;
  cursor: pointer;
  color: #fff;
  margin-right: 5px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; // 防止按鈕被壓縮
  position: relative;
  transition: all 0.2s ease;

  // input 樣式
  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;

    // 選中狀態的樣式
    &:checked ~ .checkbox_icon {
      border: none;
      background-color: #4a9eff;

      svg {
        color: white;
      }
    }

    // hover 效果
    &:hover ~ .checkbox_icon {
      background-color: #ddd;
    }

    &:checked:hover ~ .checkbox_icon {
      background-color: #4a9eff;
    }
  }

  // checkbox 圖標容器
  .checkbox_icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 20px;
    width: 20px;
    border: 2px solid #cfcfcf;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;

    // SVG 圖標樣式
    svg {
      width: 12px;
      height: 12px;
      color: transparent;
      transition: color 0.3s;
    }
  }

  // 整個 label 的 hover 效果
  &:hover {
    .checkbox_icon {
      background-color: #ddd;
    }

    input:checked ~ .checkbox_icon {
      background-color: #4a9eff;
    }
  }

  // 禁用狀態（如果需要）
  &.disabled {
    cursor: not-allowed;
    opacity: 0.6;

    input {
      cursor: not-allowed;
    }

    .checkbox_icon {
      background-color: #f5f5f5;
    }
  }
}

.tree_label {
  font-size: 14px;
  color: var(--nt-tree-text);
  user-select: none;
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  > .edit_input {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;
    gap: 5px;

    > input {
      width: 80%;
      padding: 8px;
      color: var(--nt-tree-text);
      border: 1px solid #409eff;
      border-radius: 4px;
      outline: none;

      &:focus {
        border-color: #66b1ff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }
    }
  }
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
}

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

  &.check {
    color: #09a809;
  }

  &.add_folder {
    color: #665da1;
  }

  &.add_file {
    color: #665da1;
  }

  &.delete {
    color: #dc3545;
  }
}
</style>
