<template>
  <div class="noThink_ui_box" ref="scrollContainer">
    <div class="navbar" :class="{ sticky: isSticky }" ref="navbar">
      <div class="navbar_layout">
        <span>NoThink-UI</span>
      </div>
    </div>
    <div class="noThink_ui_content">
      <div class="menu_block">
        <Sidebar></Sidebar>
      </div>
      <div class="view_block">
        <RouterView></RouterView>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'

const isSticky = ref(false)
const scrollContainer = ref<HTMLElement>()
const navbar = ref<HTMLElement>()

const handleScroll = () => {
  if (scrollContainer.value) {
    isSticky.value = scrollContainer.value.scrollTop > 60
  }
}

onMounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style lang="scss" scoped>
.noThink_ui_box {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
  background: rgb(248 250 252);
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
  margin: 0 auto;
  width: 100%;
  height: 60px;
  background: #f8fafc;
  color: #7b889d;
  transition:
    background-color 0.5s,
    border-color 0.5s;

  display: flex;
  align-items: center;

  &.sticky {
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    background-color: hsla(0, 0%, 100%, 0.7);
    border-bottom: 1px solid #e2e8f0;
  }
}

.navbar_layout {
  max-width: 1440px;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;

  >span {
    font-size: 22px;
    font-weight: 600;
  }
}

.noThink_ui_content {
  height: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: flex-start;
  justify-content: center;
  gap: 20px;
  position: relative;
}

.menu_block {
  position: sticky;
  top: 80px;
  max-width: 220px;
  width: 20%;
  height: fit-content;
  min-height: 400px;
  z-index: 10;
}

.view_block {
  max-width: 1220px;
  width: 80%;
  height: 100%;
  min-height: 800px;
}
</style>
