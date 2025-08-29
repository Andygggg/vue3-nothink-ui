<template>
  <div class="base_paginator_content">
    <h2>基礎分頁器</h2>
    <p>分頁器預設基礎用法展示。</p>

    <div class="base_paginator">
      <NtPaginator :current-page="1" :total-page="12"></NtPaginator>
    </div>
  </div>
</template>

<script setup lang="ts">
import NtPaginator from '@lib/components/Data/NtPaginator.vue'
</script>

<style lang="scss" scoped>
.base_paginator_content {
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

.base_paginator {
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
