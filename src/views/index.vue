<template>
  <div class="noThink_ui_box">
    <div class="navbar">不想</div>
    <div class="noThink_ui_content">
      <div class="menu_block"></div>
      <div class="view_block">
        <RouterView></RouterView>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style lang="scss" scoped>
.noThink_ui_box {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: rgb(248 250 252);
  padding: 0rem 2rem;
}

.navbar {
  width: 100%;
  height: 60px;
  border-bottom: 1px solid #d9d9d9;
  color: #7b889d;
}

.noThink_ui_content {
  height: calc(100% - 70px);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 20px;
  overflow-y: auto;
}

.menu_block {
  max-width: 220px;
  width: 20%;
  height: 100%;
}

.view_block {
  max-width: 1200px;
  width: 60%;
  height: 100%;
}
</style>
