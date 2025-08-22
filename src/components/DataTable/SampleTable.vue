<template>
  <div class="noThink_table_box">
    <NtTable
      :header="tableHeader"
      :data="largeData"
      sticky-header
      hover
      stripe
      cellBorder
      scroll-x
      :loading="isLoading"
      @row-click="handleRowClick"
      class="table_style"
      ref="tableRef"
    >
      <!-- 自定義姓名欄位（可編輯） -->
      <template #td_name="{ item, value, isEditing, disableEdit, handleEdit }">
        <input
          v-if="isEditing"
          v-model="item.name"
          @blur="disableEdit"
          @keyup.enter="disableEdit"
          class="edit-input"
        />
        <span v-else @dblclick="handleEdit" class="editable-cell">
          {{ value }}
        </span>
      </template>

      <!-- 自定義 Email 欄位（帶驗證） -->
      <template #td_email="{ value }">
        <span :class="{ 'invalid-email': !isValidEmail(`${value}`) }">
          {{ value }}
        </span>
      </template>

      <!-- 自定義操作列 -->
      <template #td_actions="{ item, index }">
        <div class="action-buttons">
          <button @click="editRow(item)" class="btn btn-edit" :disabled="isLoading"> 編輯 </button>
          <button @click="deleteRow(index)" class="btn btn-delete" :disabled="isLoading">
            刪除
          </button>
        </div>
      </template>

      <!-- 自定義空狀態 -->
      <template #empty>
        <div class="custom-empty">
          <p>無資料</p>
          <button @click="loadData" class="btn btn-primary">重新載入</button>
        </div>
      </template>

      <!-- 自定義載入狀態 -->
      <template #loading>
        <div class="custom-loading">
          <div class="loading-spinner"></div>
          <p>正在載入中...</p>
        </div>
      </template>
    </NtTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NtTable from '@lib/components/Data/NtTable.vue'
import type { TableEditMethods } from '@lib/typing'
import { DataType } from '@lib/typing'

// 定義用戶數據類型
interface UserData {
  id: number
  name: string
  email: string
  phone: string
}

// 組件狀態
const isLoading = ref<boolean>(false)
const tableRef = ref<TableEditMethods | null>(null)

// 表格設定
const tableHeader = ref([
  {
    key: 'id',
    title: 'ID',
    width: '15%',
    sortable: DataType.NUMBER,
    align: 'center' as const,
    fixed: 'left' as const,
  },
  {
    key: 'name',
    title: '姓名',
    width: '25%',
    sortable: DataType.AUTO,
    fixed: 'left' as const,
  },
  {
    key: 'email',
    title: '信箱',
    width: '30%',
    ellipsis: true,
    sortable: DataType.AUTO,
  },
  {
    key: 'phone',
    title: '電話',
    width: '20%',
    align: 'center' as const,
  },
  {
    key: 'actions',
    title: '操作',
    width: '10%',
    align: 'center' as const,
  },
])

// 生成測試數據
const generateUserData = (count: number): UserData[] => {
  const data = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `用戶 ${i + 1}`,
    email: `user${i + 1}@example.com`,
    phone: `09${String(i).padStart(8, '0')}`,
  }))

  // Fisher–Yates 洗牌
  for (let i = data.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[data[i], data[j]] = [data[j], data[i]]
  }

  return data
}

// 數據
const largeData = ref<UserData[]>(generateUserData(50))

// 工具函數
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 事件處理函數
const handleRowClick = (row: UserData, index: number): void => {
  console.log('點擊行:', { user: row.name, index, data: row })
}

const editRow = async (row: UserData): Promise<void> => {
  try {
    isLoading.value = true
    console.log('編輯用戶:', row)

    // 模擬 API 請求
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 實際編輯邏輯
    alert(`編輯用戶: ${row.name}`)
  } catch (error) {
    console.error('編輯失敗:', error)
  } finally {
    isLoading.value = false
  }
}

const deleteRow = async (index: number): Promise<void> => {
  try {
    const userToDelete = largeData.value[index]
    if (!userToDelete) {
      console.warn('找不到要刪除的用戶')
      return
    }

    const confirmed = confirm(`確定要刪除用戶 "${userToDelete.name}" 嗎？`)
    if (!confirmed) return

    isLoading.value = true

    // 模擬 API 請求
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 從數據中移除
    largeData.value.splice(index, 1)

    console.log(`已刪除用戶: ${userToDelete.name}`)
  } catch (error) {
    console.error('刪除失敗:', error)
  } finally {
    isLoading.value = false
  }
}

const loadData = async (): Promise<void> => {
  try {
    isLoading.value = true

    // 模擬 API 載入
    await new Promise((resolve) => setTimeout(resolve, 1500))

    largeData.value = generateUserData(50)
  } catch (error) {
    console.error('載入數據失敗:', error)
  } finally {
    isLoading.value = false
  }
}

// 組件掛載時的處理
onMounted(() => {
  console.log('Table 組件已掛載')
})
</script>

<style lang="scss" scoped>
.noThink_table_box {
  height: 300px;
  width: 1024px;
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid rgb(194, 194, 194);
  background: #fff;
}

.table_style {
  height: 100%;
  // border-radius: 8px;
  // border: 2px solid rgb(194, 194, 194);
  // background: #fff;
}

// 編輯相關樣式
.edit-input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #409eff;
  border-radius: 4px;
  outline: none;

  &:focus {
    border-color: #66b1ff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }
}

.editable-cell {
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f7fa;
  }
}

// Email 驗證樣式
.invalid-email {
  color: #f56c6c;
  text-decoration: line-through;
}

// 操作按鈕樣式
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.btn-edit {
    background: #409eff;
    color: white;

    &:hover:not(:disabled) {
      background: #66b1ff;
    }
  }

  &.btn-delete {
    background: #f56c6c;
    color: white;

    &:hover:not(:disabled) {
      background: #f78989;
    }
  }

  &.btn-primary {
    background: #67c23a;
    color: white;
    padding: 8px 16px;

    &:hover {
      background: #85ce61;
    }
  }
}

// 自定義空狀態樣式
.custom-empty {
  text-align: center;
  padding: 40px 20px;
  color: #909399;

  p {
    margin-bottom: 16px;
    font-size: 16px;
  }
}

// 自定義載入樣式
.custom-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #409eff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  p {
    color: #409eff;
    margin: 0;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
