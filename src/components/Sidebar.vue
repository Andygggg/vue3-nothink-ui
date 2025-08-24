<template>
  <div class="sidebar">
    <div class="sidebar_item" v-for="(router, idx) in router_menu" :key="idx">
      <div class="item_header" @click="toggleCollapse(idx)">
        <span>{{ router.meta?.name }}</span>
        <div class="collapse_icon" :class="{ collapsed: collapsedItems[idx] }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
      <div class="sidebar_options_wrapper" :class="{ collapsed: collapsedItems[idx] }">
        <ul class="sidebar_options">
          <li v-for="(children, i) in router.children" :key="i" :class="{ active: currentRoute === children.name }" @click="pushTo(children.name)">
            {{ children.meta?.name }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { RouteRecordNameGeneric } from 'vue-router'

const router = useRouter()
const route = useRoute()

const router_menu = computed(() => {
  const routes = router.options.routes
  return routes
})

const currentRoute = computed(() => {
  return route.name
})

// 記錄每個項目的展開/收起狀態
const collapsedItems = reactive<Record<number, boolean>>({})

// 初始化所有項目為展開狀態
router_menu.value.forEach((_, idx) => {
  collapsedItems[idx] = false
})

const toggleCollapse = (idx: number) => {
  collapsedItems[idx] = !collapsedItems[idx]
}

const pushTo = (name: RouteRecordNameGeneric) => {
  router.push({name})
}
</script>

<style lang="scss" scoped>
.sidebar {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sidebar_item {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 0 1rem;
}

.item_header {
  width: 100%;
  height: 36px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  user-select: none;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #565f6d;
  }

  > span {
    color: #7b889d;
    font-size: 20px;
    font-weight: 500;
    transition: color 0.2s ease;
  }

  &:hover > span {
    color: #565f6d;
  }
}

.collapse_icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7b889d;
  transition: transform 0.3s ease, color 0.2s ease;

  &.collapsed {
    transform: rotate(-90deg);
  }

  &:hover {
    color: #565f6d;
  }
}

.sidebar_options_wrapper {
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  max-height: 1000px; /* 設定一個足夠大的值 */
  opacity: 1;

  &.collapsed {
    max-height: 0;
    opacity: 0;
  }
}

.sidebar_options {
  width: 100%;
  height: auto;
  list-style: none;
  padding: 0;
  margin: 0;

  > li {
    width: 100%;
    height: 28px;
    line-height: 28px;
    padding-left: 1rem;
    color: #7b889d;
    font-size: 15px;
    font-weight: 500;
    border-inline-start: 1px solid #ccd2da;
    cursor: pointer;
    transition: color 0.2s ease, background-color 0.2s ease;

    &:hover {
      color: #565f6d;
      background-color: rgba(123, 136, 157, 0.05);
    }

    &.active {
      color: #565f6d;
      border-inline-start-color: #565f6d;
    }
  }
}
</style>
