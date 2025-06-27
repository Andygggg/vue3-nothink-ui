<template>
  <div class="noThink_ui_box">
    <NtTable
      :tableSetting="tableSetting"
      :data="largeData"
      sticky-header
      stripe
      hover
      scrollX
      border
      @row-click="handleRowClick"
    >
      <template #td_name="{ item, value, isEditing, disableEdit }">
        <input
          v-if="isEditing"
          v-model="item.name"
          @blur="disableEdit"
          @keyup.enter="disableEdit"
        />
        <span v-else>
          {{ value }}
        </span>
      </template>
      <!-- 自定義操作列 -->
      <template #td_actions="{ item, index }">
        <button @click="editRow(item)">編輯</button>
        <button @click="deleteRow(index)">刪除</button>
      </template>
    </NtTable>
    <div>234</div>
  </div>
</template>

<script setup lang="ts">
import NtTable from '@lib/components/NtTable/NtTable.vue'

const tableSetting = {
  header: [
    { key: 'id', title: 'ID', width: '20%', sortable: true },
    { key: 'name', title: '姓名', width: '20%' },
    { key: 'email', title: '信箱', width: '20%', ellipsis: true },
    { key: 'phone', title: '電話', width: '20%' },
    { key: 'actions', title: '操作', width: '20%' },
  ],
  size: 'medium' as const,
  maxHeight: '300px',
  emptyText: '暫無數據',
  loading: false,
}

// 生成大量數據來測試滾動
const largeData = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `用戶 ${i + 1}`,
  email: `user${i + 1}@example.com`,
  phone: `09${String(i).padStart(8, '0')}`,
}))

const handleRowClick = (row: any, index: any) => {
  console.log('點擊行:', row, index)
}

const editRow = (row: any) => {
  console.log('編輯:', row)
}

const deleteRow = (index: any) => {
  console.log('刪除:', index)
}
</script>

<style lang="scss" scoped>
.noThink_ui_box {
  height: 100%;
  width: 100%;
  padding: 0.5rem 0.5rem;
}
</style>
