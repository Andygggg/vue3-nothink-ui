<template>
  <div class="size_paginator_content">
    <h2>設置每頁資料數量</h2>
    <p>可以透過page-size屬性為其添加資料數量選單。</p>

    <div class="size_paginator">
      <NtPaginator :current-page="1" :total-page="12" :page-size="pageSize"></NtPaginator>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NtPaginator from '@lib/components/Data/NtPaginator.vue'

const pageSize = ref([10, 20, 30])
</script>

<style lang="scss" scoped>
.size_paginator_content {
  width: 100%;
  height: auto;
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  > h2 {
    color: #0f172a;
    font-weight: 500;
  }

  > p {
    color: #334155;
    font-weight: 400;
  }
}

.size_paginator {
  height: 300px;
  width: 100%;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
}
</style>
