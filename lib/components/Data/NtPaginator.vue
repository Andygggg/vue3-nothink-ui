<template>
  <div class="nt_paginator_box" ref="paginatorRef">
    <div class="pre_page_dropdown" ref="dropdownRef" v-if="props.pageSize.length">
      <div class="per_page_select" @click="openDropMenu">
        <span>{{ currentCount }}</span>
        <div class="dropdown_btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 24 24"
          >
            <path
              d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6l-6-6l1.41-1.41z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
      </div>
      <transition name="slide-down">
        <div class="pre_page_options" v-if="isDrop">
          <ul>
            <li v-for="value in props.pageSize" :key="value" @click="selectPage(value)">
              {{ value }}
            </li>
          </ul>
        </div>
      </transition>
    </div>

    <button @click="startPage" :class="{ disable: currentPage === 1 }">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 24 24"
      >
        <path d="M17.59 18L19 16.59L14.42 12L19 7.41L17.59 6l-6 6z" fill="currentColor"></path>
        <path d="M11 18l1.41-1.41L7.83 12l4.58-4.59L11 6l-6 6z" fill="currentColor"></path>
      </svg>
    </button>
    <button @click="prevPage" :class="{ disable: currentPage === 1 }">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 24 24"
      >
        <path
          d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6l6 6l1.41-1.41z"
          fill="currentColor"
        ></path>
      </svg>
    </button>
    <span class="page_group">
      <template v-if="isSmallSize">
        <div class="page_input">
          <input type="text" v-model="currentPage" />
          <span>/&nbsp;{{ props.totalPage }}</span>
        </div>
      </template>
      <template v-else>
        <button
          v-for="(page, idx) in visiblePages"
          :key="idx"
          :class="{
            active: currentPage === page,
            single: isSmallSize,
          }"
          @click="toPage(page)"
          :data-total="`\u00A0/\u00A0${props.totalPage}`"
        >
          {{ page }}
        </button>
      </template>
    </span>
    <button @click="nextPage" :class="{ disable: currentPage === props.totalPage }">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 24 24"
      >
        <path
          d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6l-6 6l-1.41-1.41z"
          fill="currentColor"
        ></path>
      </svg>
    </button>
    <button @click="lastPage" :class="{ disable: currentPage === props.totalPage }">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 24 24"
        transform="rotate(180)"
      >
        <path d="M17.59 18L19 16.59L14.42 12L19 7.41L17.59 6l-6 6z" fill="currentColor"></path>
        <path d="M11 18l1.41-1.41L7.83 12l4.58-4.59L11 6l-6 6z" fill="currentColor"></path>
      </svg>
    </button>

    <div class="go_page_input" v-if="props.showJumper">
      <input
        type="text"
        id="goPage"
        required
        pattern="[0-9]*"
        inputmode="numeric"
        ref="inputRef"
        @blur="checkValidation"
        @keyup.enter="handleInputToPage"
      />
      <label for="goPage">Go&nbsp;to</label>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 24 24"
        @click="handleInputToPage"
      >
        <path
          d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6l-6 6l-1.41-1.41z"
          fill="currentColor"
        ></path>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, onMounted, onUnmounted, nextTick } from 'vue'
import type { PaginatorProp } from '@lib/typing'

const props = withDefaults(defineProps<PaginatorProp>(), {
  currentPage: 1,
  totalPage: 1,
  pagerCount: 5,
  pageSize: () => [],
  showJumper: false,
  smallLayout: 0,
})

const currentPage = ref(props.currentPage)
const currentCount = ref(props.pageSize.length ? props.pageSize[0] : 0)
const isDrop = ref(false)
const isSmallSize = ref(false)

const dropdownRef = useTemplateRef('dropdownRef')
const paginatorRef = useTemplateRef('paginatorRef')
const inputRef = useTemplateRef('inputRef')
const paginatorResizeObserver = ref<ResizeObserver | null>(null)

const visiblePages = computed(() => {
  const pages = [] // 最終要顯示的頁碼陣列
  const showCount = isSmallSize.value ? 1 : props.pagerCount
  const current = currentPage.value
  const total = props.totalPage

  // === 情況1: 總頁數不足5頁 ===
  if (total <= showCount) {
    // 例如：總共3頁 -> [1, 2, 3]
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
    return pages
  }

  // === 情況2: 總頁數 >= 5頁，固定顯示5個數字 ===
  // 計算起始頁碼
  let start = current - Math.floor(showCount / 2) // 當前頁居中
  // 如果起始頁小於1，從第1頁開始
  if (start < 1) {
    start = 1
  }
  // 如果結束頁超過總頁數，往前調整
  if (start + showCount - 1 > total) {
    start = total - showCount + 1
  }
  // 生成5個連續的頁碼
  for (let i = 0; i < showCount; i++) {
    pages.push(start + i)
  }

  return pages
})

onMounted(() => {
  if (paginatorRef.value && props.smallLayout) {
    paginatorResizeObserver.value = new ResizeObserver(() => {
      nextTick(async () => {
        await updateResponsiveStyle()
      })
    })
    paginatorResizeObserver.value.observe(paginatorRef.value) // 監聽容器尺寸變化
  }

  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

//====================================切換頁數====================================
const nextPage = () => {
  if (currentPage.value < props.totalPage) {
    currentPage.value++
  }
}

const lastPage = () => {
  currentPage.value = props.totalPage
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  } else {
    currentPage.value = 1
  }
}

const startPage = () => {
  currentPage.value = 1
}

const toPage = (val: number) => {
  currentPage.value = val
}

const checkValidation = (event: Event) => {
  const input = event.target as HTMLInputElement
  // 如果不是純數字就清空
  if (!/^\d+$/.test(input.value)) {
    input.value = ''
  }
}

const handleInputToPage = () => {
  const value = inputRef.value?.value ?? ''
  if (/^\d+$/.test(value)) {
    currentPage.value = Number(value)
  }

  if (inputRef.value) {
    inputRef.value.value = ''
    inputRef.value.blur()
  }
}

//====================================數量選單====================================

const openDropMenu = () => {
  isDrop.value = !isDrop.value
}

const handleClickOutside = (event: Event) => {
  if (
    dropdownRef.value &&
    event.target instanceof Node &&
    !dropdownRef.value.contains(event.target)
  ) {
    isDrop.value = false
  }
}

const selectPage = (page: number) => {
  currentCount.value = page
  isDrop.value = false
}

const updateResponsiveStyle = async () => {
  if (!paginatorRef.value) return

  const paginatorSize = paginatorRef.value.getBoundingClientRect()
  const paginatorWidth = paginatorSize.width

  isSmallSize.value = paginatorWidth < props.smallLayout
}
</script>

<style lang="scss" scoped>
.nt_paginator_box {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  color: #334155;
  background: transparent;
  gap: 0.25rem;

  button {
    min-width: 35px;
    height: 35px;
    border: none;
    border-radius: 50%;
    color: #64748b;
    background: transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    user-select: none;
    overflow: hidden;
    cursor: pointer;
    margin: 0;
    padding: 0;
    transition:
      background 0.2s,
      color 0.2s,
      outline-color 0.2s,
      box-shadow 0.2s;

    > svg {
      width: 1.2rem;
      height: 1.2rem;
    }

    &:hover {
      background: #f1f5f9;
    }

    &.disable {
      opacity: 0.5;
      cursor: not-allowed;
      background: transparent !important;
    }
  }
}

.page_group {
  display: flex;
  align-items: center;
  gap: 0.25rem;

  > button {
    font-size: 15px;
    font-weight: 500;
    font-family:
      Inter var,
      -apple-system,
      BlinkMacSystemFont,
      Segoe UI,
      Roboto,
      Helvetica,
      Arial,
      sans-serif,
      Apple Color Emoji,
      Segoe UI Emoji,
      Segoe UI Symbol;
    font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';

    &.active {
      background: #000;
      color: #fff;
    }

    &.single {
      padding: 0 0.5rem;
      background: transparent !important;
      color: #64748b;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      cursor: default;

      &::after {
        content: attr(data-total);
      }
    }
  }

  .page_input {
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 0.25rem 0.5rem;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    > input {
      padding: 0.25rem 0.5rem;
      max-width: 28px;
      width: 100%;
      height: auto;
      border: none;
      outline: none;
      color: #334155;
      font-size: 14px;
      font-weight: 400;
      text-align: center;
    }
  }
}

.pre_page_dropdown {
  min-width: 70px;
  position: relative;
}

.per_page_select {
  max-height: 35px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  outline-color: transparent;
  box-shadow:
    0 0 #0000,
    0 0 #0000,
    0 1px 2px 0 rgba(18, 18, 23, 0.05);
  cursor: pointer;
  position: relative;
  user-select: none;

  &:hover {
    border-color: #aab1bb;
  }

  > span {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    flex: 1 1 auto;
    width: 1%;
    padding: 0.25rem 0.5rem;
    text-overflow: ellipsis;
    cursor: pointer;
    color: #334155;
    background: transparent;
    border: 0 none;
    outline: 0 none;
    font-size: 1rem;
  }

  > .dropdown_btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: transparent;
    color: #94a3b8;
    width: 2.5rem;
    border-start-end-radius: 6px;
    border-end-end-radius: 6px;

    > svg {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
}

.pre_page_options {
  max-height: 14rem;
  overflow-y: auto;
  position: absolute;
  top: 105%;
  left: 0;
  right: 0;
  transition: all 0.3s ease;
  z-index: 1000;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #cbd5e1;
  border-radius: 6px;

  &::-webkit-scrollbar {
    height: 4px;
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 6px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  &::-webkit-scrollbar-track-piece {
    border-radius: 6px;
  }

  > ul {
    margin: 0;
    padding: 0.25rem;
    user-select: none;
    list-style: none;

    > li {
      width: 100%;
      height: 31px;
      color: #64748b;
      font-size: 15px;
      font-weight: 500;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      cursor: pointer;

      &:hover {
        background: #f1f5f9;
      }

      &:first-child {
        background: #000;
        color: #fff;
      }
    }
  }
}

.go_page_input {
  position: relative;
  min-width: 65px;
  max-width: 72px;

  > input {
    min-height: 35px;
    width: 100%;
    padding: 0.25rem 1.5rem 0.25rem 0.5rem;
    outline: none;
    background: transparent;
    color: #334155;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 15px;
    font-weight: 400;
    text-align: center;

    &:focus,
    &:valid {
      ~ label {
        top: 0;
        font-size: 10px;
        padding: 0 5px;
        transform: translateX(0.1rem) translateY(-7.5px);
        background: #ffffff;
        color: #545455;
        letter-spacing: 0em;
      }
    }
  }

  > label {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    padding: 0.25rem 0.5rem;
    pointer-events: none;
    font-size: 12px;
    font-weight: 500;
    transition: 0.2s cubic-bezier(0.05, 0.81, 0, 0.93);
    color: #334155;
    letter-spacing: 0.1em;
  }

  > svg {
    position: absolute;
    top: 50%;
    right: 0;
    color: #94a3b8;
    transform: translateY(-50%);
    width: 1.5rem;
    height: 1.5rem;
    cursor: pointer;
    &:hover {
      color: #8f9091;
    }
  }
}

/* 下拉動畫 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.15s ease;
  transform-origin: top;
}

.slide-down-enter-from {
  opacity: 0;
  transform: scaleY(0) translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: scaleY(0) translateY(-10px);
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  transform: scaleY(0) translateY(0);
}
</style>
