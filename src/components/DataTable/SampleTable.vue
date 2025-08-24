<template>
  <div class="basic_content">
    <h2>範例</h2>
    <p>參數項</p>

    <ul class="params_list">
      <li>
        <span>大小</span>
        <div class="size_btn_group">
          <span
            v-for="value in sizeOptions"
            :key="value"
            :class="{ active: tableSize === value }"
            @click="changeSize(value)"
          >
            {{ value }}
          </span>
        </div>
      </li>
      <li v-for="value in params_options" :key="value.id">
        <label :for="value.id">{{ value.name }}</label>
        <input
          type="checkbox"
          :name="value.name"
          :id="value.id"
          :value="value"
          v-model="value.isUse"
        />
      </li>
      <li style="margin-left: auto">
        <button @click="clear">清空資料</button>
        <button @click="reload">重新載入</button>
      </li>
    </ul>

    <div class="basic_table">
      <NtTable
        :header="tableHeader"
        :data="largeData"
        :size="tableSize"
        :cell-border="isStatus('cellBorder')"
        :stripe="isStatus('stripe')"
        :hover="isStatus('hover')"
        :sticky-header="isStatus('stickyHeader')"
        :loading="isLoading"
      >
        <template #td_name="{ item, value, isEditing, disableEdit, handleEdit }">
          <input
            v-if="isEditing"
            v-model="item.name"
            @blur="disableEdit"
            @keyup.enter="disableEdit"
            class="edit-input"
          />
          <span v-else @dblclick="handleEdit" class="editable_cell">
            {{ value }}
          </span>
        </template>
        <template #td_email="{ item, value, isEditing, disableEdit, handleEdit }">
          <input
            v-if="isEditing"
            v-model="item.email"
            @blur="disableEdit"
            @keyup.enter="disableEdit"
            class="edit-input"
          />
          <span v-else @dblclick="handleEdit" class="editable_cell">
            {{ value }}
          </span>
        </template>
        <template #td_phone="{ item, value, isEditing, disableEdit, handleEdit }">
          <input
            v-if="isEditing"
            v-model="item.phone"
            @blur="disableEdit"
            @keyup.enter="disableEdit"
            class="edit-input"
          />
          <span v-else @dblclick="handleEdit" class="editable_cell">
            {{ value }}
          </span>
        </template>
      </NtTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, type Ref } from 'vue'
import NtTable from '@lib/components/Data/NtTable/NtTable.vue'

// 定義用戶數據類型
interface UserData {
  id: number
  name: string
  email: string
  phone: string
}

const tableSize: Ref<'medium' | 'small' | 'large'> = ref('medium')
const sizeOptions = ['small', 'medium', 'large']

const params_options = reactive([
  { id: 'cellBorder', isUse: false, name: '邊框' },
  { id: 'stripe', isUse: false, name: '條紋' },
  { id: 'hover', isUse: false, name: 'hover' },
  { id: 'stickyHeader', isUse: false, name: '表頭固定' },
])

const isLoading = ref(false)

const isStatus = (key: string) => {
  const item = params_options.find((item) => item.id === key)
  return item ? item.isUse : false
}

// 表格設定
const tableHeader = ref([
  {
    key: 'id',
    title: 'ID',
    width: '250px',
    fixed: 'left' as const,
    sortable: 0,
  },
  {
    key: 'name',
    title: '姓名',
    width: '250px',
    sortable: 0,
  },
  {
    key: 'email',
    title: '信箱',
    width: '300px',
    sortable: 0,
  },
  {
    key: 'phone',
    title: '電話',
    width: '300px',
    sortable: 0,
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
const largeData = ref<UserData[]>(generateUserData(20))

const changeSize = (size: string) => {
  tableSize.value = size as 'small' | 'medium' | 'large'
}

const clear = () => {
  largeData.value = generateUserData(0)
}

const reload = () => {
  isLoading.value = true
  largeData.value = generateUserData(20)
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}
</script>

<style lang="scss" scoped>
.basic_content {
  width: 100%;
  height: auto;
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: #334155;
  font-weight: 400;

  > h2 {
    color: #0f172a;
    font-weight: 500;
  }
}

.params_list {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  padding: 0 1rem;
  margin: 0;
  list-style: none;

  > li {
    width: auto;
    height: 36px;
    font-size: 15px;
    font-weight: 600;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;
    gap: 5px;

    > span {
      white-space: nowrap;
    }
  }

  button {
    border: none;
    background: #353535;
    color: #fff;
    border-radius: 5px;
    padding: 0.2rem 0.5rem;
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;

    &:hover {
      background: #000000;
    }
  }
}

.size_btn_group {
  color: #64748b;
  border: 1px solid #d6d6d6;
  border-radius: 8px;
  width: 180px;
  height: auto;
  padding: 0.2rem;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;

  > span {
    font-weight: 600;
    padding: 0px 8px;
    border-radius: 5px;
    cursor: pointer;

    &.active,
    &:hover {
      background: #000000;
      color: #fff;
    }
  }
}

.basic_table {
  height: 450px;
  width: 100%;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
}

.editable_cell {
  cursor: default;
}

.edit-input {
  border: 1px solid #e2e8f0;
  padding: 6px 8px;
  border-radius: 8px;
  outline: none;
  font-size: 15px;
}
</style>
