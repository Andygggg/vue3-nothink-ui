<template>
  <div class="doc_box">
    <div class="read_block">
      <h1>Nt-Avatar</h1>
      <p>Nt-Avatar</p>
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

import BasicAvatar from '@/components/Avatar/BasicAvatar.vue'
import CustomStyleAvatar from '@/components/Avatar/CustomStyleAvatar.vue'
import ImageAvatar from '@/components/Avatar/ImageAvatar.vue'

const component_option = shallowRef<ComponentOption[]>([
  {
    id: 'BasicAvatar',
    name: '基礎頭像',
    component: BasicAvatar,
  },
  {
    id: 'CustomStyleAvatar',
    name: '自訂顏色',
    component: CustomStyleAvatar,
  },
  {
    id: 'ImageAvatar',
    name: '圖片顯示',
    component: ImageAvatar,
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
