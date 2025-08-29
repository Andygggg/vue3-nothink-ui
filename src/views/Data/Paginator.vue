<template>
  <div class="doc_box">
    <div class="read_block">
      <h1>Nt-Paginator</h1>
      <p>Nt-Paginator透過分頁的方式控制資料顯示數量</p>
      <component
        v-for="option in component_option"
        :key="option.id"
        :id="option.id"
        :is="option.component"
      />
    </div>
    <div class="bread_crumb_block">
      <ul>
        <li
          v-for="option in component_option"
          :key="option.id"
          :class="{ active: currentSection === option.id }"
          @click="scrollToComponent(option.id)"
        >
          {{ option.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import type { ComponentOption } from '@/typing'

import BasePaginator from '@/components/Paginator/BasePaginator.vue'
import MaxCountPaginator from '@/components/Paginator/MaxCountPaginator.vue'
import PageSizePaginator from '@/components/Paginator/PageSizePaginator.vue'
import JumperPaginator from '@/components/Paginator/JumperPaginator.vue'
import ResponsivePaginator from '@/components/Paginator/ResponsivePaginator.vue'

const component_option = shallowRef<ComponentOption[]>([
  {
    id: 'BasePaginator',
    name: '基礎分頁器',
    component: BasePaginator,
  },
  {
    id: 'MaxCountPaginator',
    name: '頁數顯示數量',
    component: MaxCountPaginator,
  },
  {
    id: 'PageSizePaginator',
    name: '設置每頁資料數量',
    component: PageSizePaginator,
  },
  {
    id: 'JumperPaginator',
    name: '頁數跳轉',
    component: JumperPaginator,
  },
  {
    id: 'ResponsivePaginator',
    name: '響應式排版',
    component: ResponsivePaginator,
  },
])
const currentSection = ref<string>('')

const scrollToComponent = (componentId: string): void => {
  const element = document.getElementById(componentId)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    })
    currentSection.value = componentId
  }
}
</script>

<style lang="scss" scoped>
@forward '../../styles/doc_layout.scss';
</style>
