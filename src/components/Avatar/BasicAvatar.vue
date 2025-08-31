<template>
  <div class="base_avatar_content">
    <h2>基礎頭像</h2>
    <p>頭像預設基礎用法展示。</p>

    <div class="base_avatar">
      <div class="avatar_row">
        <h3>circle</h3>
        <ul>
          <li><nt-avatar :name="'不想工作室'" :size="'small'"></nt-avatar></li>
          <li><nt-avatar :name="'不想工作室'" :size="'medium'"></nt-avatar></li>
          <li><nt-avatar :name="'不想工作室'" :size="'large'"></nt-avatar></li>
          <li><nt-avatar :name="'不想工作室'" :size="32"></nt-avatar></li>
        </ul>
      </div>
      <div class="avatar_row">
        <h3>square</h3>
        <ul>
          <li><nt-avatar :name="'不想工作室'" :size="'small'" :shape="'square'"></nt-avatar></li>
          <li><nt-avatar :name="'不想工作室'" :size="'medium'" :shape="'square'"></nt-avatar></li>
          <li><nt-avatar :name="'不想工作室'" :size="'large'" :shape="'square'"></nt-avatar></li>
          <li><nt-avatar :name="'不想工作室'" :size="32" :shape="'square'"></nt-avatar></li>
        </ul>
      </div>
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
  height: 240px;
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

.avatar_row {
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  border-right: 2px solid #e2e8f0;

  &:last-child {
    border-right: none;
  }

  > ul {
    width: 100%;
    height: auto;
    user-select: none;
    list-style: none;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    gap: 20px;

    > li {
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
