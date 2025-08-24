<template>
  <div class="data_table_box">
    <div class="read_block">
      <h1>Nt-Table</h1>
      <p>Nt-Table透過表格的形式呈現資料</p>
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
import type { Component } from 'vue'

import BasicTable from '@/components/DataTable/BasicTable.vue'
import CustomTableTemplate from '@/components/DataTable/CustomTableTemplate.vue'
import CustomTableSize from '@/components/DataTable/CustomTableSize.vue'
import CustomTableBorder from '@/components/DataTable/CustomTableBorder.vue'
import CustomTableStriped from '@/components/DataTable/CustomTableStriped.vue'
import CustomTableHover from '@/components/DataTable/CustomTableHover.vue'
import SortableTable from '@/components/DataTable/SortableTable.vue'
import VerticalScrollTable from '@/components/DataTable/VerticalScrollTable.vue'
import StickyHeaderTable from '@/components/DataTable/StickyHeaderTable.vue'
import HorizontalScrollTable from '@/components/DataTable/HorizontalScrollTable.vue'
import FixedCellTable from '@/components/DataTable/FixedCellTable.vue'
import EditTable from '@/components/DataTable/EditTable.vue'
import LoadingTable from '@/components/DataTable/LoadingTable.vue'
import EmptyTable from '@/components/DataTable/EmptyTable.vue'
import SampleTable from '@/components/DataTable/SampleTable.vue'

interface ComponentOption {
  id: string
  name: string
  component: Component
}

const component_option = shallowRef<ComponentOption[]>([
  {
    id: 'BasicTable',
    name: '基礎表格',
    component: BasicTable,
  },
  {
    id: 'CustomTableTemplate',
    name: '自訂內容',
    component: CustomTableTemplate,
  },
  {
    id: 'CustomTableSize',
    name: '自訂大小',
    component: CustomTableSize,
  },
  {
    id: 'CustomTableBorder',
    name: '邊框表格',
    component: CustomTableBorder,
  },
  {
    id: 'CustomTableStriped',
    name: '條紋表格',
    component: CustomTableStriped,
  },
  {
    id: 'CustomTableHover',
    name: 'Hover效果',
    component: CustomTableHover,
  },
  {
    id: 'SortableTable',
    name: '可排序表格',
    component: SortableTable,
  },
  {
    id: 'VerticalScrollTable',
    name: '垂直滾動',
    component: VerticalScrollTable,
  },
  {
    id: 'StickyHeaderTable',
    name: '固定表頭',
    component: StickyHeaderTable,
  },
  {
    id: 'HorizontalScrollTable',
    name: '水平滾動',
    component: HorizontalScrollTable,
  },
  {
    id: 'FixedCellTable',
    name: '固定列',
    component: FixedCellTable,
  },
  {
    id: 'EditTable',
    name: '單元格編輯',
    component: EditTable,
  },
  {
    id: 'LoadingTable',
    name: '資料加載動畫',
    component: LoadingTable,
  },
  {
    id: 'EmptyTable',
    name: '空資料',
    component: EmptyTable,
  },
  {
    id: 'SampleTable',
    name: '範例',
    component: SampleTable,
  },
])

const currentSection = ref<string>('')

const scrollToComponent = (componentId: string): void => {
  const element = document.getElementById(componentId)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest',
    })
    currentSection.value = componentId
  }
}
</script>

<style lang="scss" scoped>
.data_table_box {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  padding: 2rem 1rem;
  position: relative;
}

.read_block {
  width: calc(100% - 220px);
  height: auto;
  display: flex;
  flex-direction: column;

  > h1 {
    color: #0f172a;
    font-weight: 500;
  }

  > p {
    color: #334155;
    font-size: 17px;
    font-weight: 600;
  }
}

.bread_crumb_block {
  width: 200px;
  height: auto;
  position: sticky;
  top: 5rem;
  right: 0;

  > ul {
    width: 100%;
    height: 450px;
    overflow-y: auto;
    list-style: none;
    user-select: none;
    margin: 0;
    padding: 0;

    > li {
      width: 100%;
      height: 24px;
      font-size: 14px;
      font-weight: 500;
      color: #7b889d;
      line-height: 24px;
      margin-bottom: 5px;
      cursor: pointer;

      &:hover {
        color: #565f6d;
      }

      &.active {
        color: #565f6d;
      }
    }
  }
}
</style>
