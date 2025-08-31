<template>
  <div class="base_avatar_content">
    <h2>自訂顏色</h2>
    <p>頭像預設基礎用法展示。</p>

    <div class="base_avatar">
      <nt-avatar
        :name="'不想工作室'"
        :size="'medium'"
        :background-color="'#000'"
        :text-color="'#fff'"
      ></nt-avatar>
    </div>
  </div>
</template>

<script setup lang="ts">
import NtAvatar from '@lib/components/Misc/NtAvatar.vue'
</script>

<style lang="scss" scoped>
.base_avatar_content {
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

.base_avatar {
  height: 150px;
  width: 100%;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
}
</style>
