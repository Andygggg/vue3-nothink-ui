<template>
  <div class="custom_template_content">
    <h2>自訂內容</h2>
    <p
      >可根據實際顯示需求，透過具名插槽 (slot)自訂表頭 (th_xxx) 和單元格 (td_xxx)去渲染顯示內容。</p
    >

    <div class="custom_template_table">
      <NtTable :header="tableHeader" :data="largeData">
        <template #th_name="{ value }">
          <span>
            {{ value + '(自我介紹)' }}
          </span>
        </template>
        <template #td_name="{ value }">
          <span>
            {{ '大家好，我是' + value }}
          </span>
        </template>
      </NtTable>
    </div>

    <div class="code_view_block" @click="toggleOpen">
      <template v-if="isOpen">
        <pre><code>&lt;<span class="html-tag">template</span>&gt;
 &lt;<span class="html-tag">div</span> <span class="html-attr-name">class</span><span class="punctuation">=</span><span class="html-attr-value">"custom_template_table"</span>&gt;
   &lt;<span class="html-tag">NtTable</span> <span class="vue-directive">:header</span><span class="punctuation">=</span><span class="html-attr-value">"tableHeader"</span> <span class="vue-directive">:data</span><span class="punctuation">=</span><span class="html-attr-value">"largeData"</span>&gt;
     &lt;<span class="html-tag">template</span> <span class="vue-directive">#th_name</span><span class="punctuation">=</span><span class="html-attr-value">"&#123; value &#125;"</span>&gt;
       &lt;<span class="html-tag">span</span>&gt;
         <span class="punctuation">&#123;&#123;</span> <span class="text-default">value</span> <span class="punctuation">+</span> <span class="js-string">'(自我介紹)'</span> <span class="punctuation">&#125;&#125;</span>
       &lt;/<span class="html-tag">span</span>&gt;
     &lt;/<span class="html-tag">template</span>&gt;
     &lt;<span class="html-tag">template</span> <span class="vue-directive">#td_name</span><span class="punctuation">=</span><span class="html-attr-value">"&#123; value &#125;"</span>&gt;
       &lt;<span class="html-tag">span</span>&gt;
         <span class="punctuation">&#123;&#123;</span> <span class="js-string">'大家好，我是'</span> <span class="punctuation">+</span> <span class="text-default">value</span> <span class="punctuation">&#125;&#125;</span>
       &lt;/<span class="html-tag">span</span>&gt;
     &lt;/<span class="html-tag">template</span>&gt;
   &lt;/<span class="html-tag">NtTable</span>&gt;
 &lt;/<span class="html-tag">div</span>&gt;
&lt;/<span class="html-tag">template</span>&gt;

&lt;<span class="html-tag">script</span> <span class="html-attr-name">setup</span> <span class="html-attr-name">lang</span><span class="punctuation">=</span><span class="html-attr-value">"ts"</span>&gt;
<span class="js-keyword">import</span> <span class="punctuation">&#123;</span> <span class="js-function">ref</span> <span class="punctuation">&#125;</span> <span class="js-keyword">from</span> <span class="js-string">'vue'</span>
<span class="js-keyword">import</span> <span class="text-default">NtTable</span> <span class="js-keyword">from</span> <span class="js-string">'@lib/components/Data/NtTable.vue'</span>

<span class="js-keyword">const</span> <span class="text-default">tableHeader</span> <span class="punctuation">=</span> <span class="js-function">ref</span><span class="punctuation">([</span>
 <span class="punctuation">&#123;</span>
   <span class="text-default">key</span><span class="punctuation">:</span> <span class="js-string">'id'</span><span class="punctuation">,</span>
   <span class="text-default">title</span><span class="punctuation">:</span> <span class="js-string">'ID'</span><span class="punctuation">,</span>
   <span class="text-default">width</span><span class="punctuation">:</span> <span class="js-string">'15%'</span><span class="punctuation">,</span>
 <span class="punctuation">&#125;,</span>
 <span class="punctuation">&#123;</span>
   <span class="text-default">key</span><span class="punctuation">:</span> <span class="js-string">'name'</span><span class="punctuation">,</span>
   <span class="text-default">title</span><span class="punctuation">:</span> <span class="js-string">'姓名'</span><span class="punctuation">,</span>
   <span class="text-default">width</span><span class="punctuation">:</span> <span class="js-string">'25%'</span><span class="punctuation">,</span>
 <span class="punctuation">&#125;,</span>
 <span class="punctuation">&#123;</span>
   <span class="text-default">key</span><span class="punctuation">:</span> <span class="js-string">'email'</span><span class="punctuation">,</span>
   <span class="text-default">title</span><span class="punctuation">:</span> <span class="js-string">'信箱'</span><span class="punctuation">,</span>
   <span class="text-default">width</span><span class="punctuation">:</span> <span class="js-string">'30%'</span><span class="punctuation">,</span>
 <span class="punctuation">&#125;,</span>
 <span class="punctuation">&#123;</span>
   <span class="text-default">key</span><span class="punctuation">:</span> <span class="js-string">'phone'</span><span class="punctuation">,</span>
   <span class="text-default">title</span><span class="punctuation">:</span> <span class="js-string">'電話'</span><span class="punctuation">,</span>
   <span class="text-default">width</span><span class="punctuation">:</span> <span class="js-string">'20%'</span><span class="punctuation">,</span>
 <span class="punctuation">&#125;,</span>
<span class="punctuation">])</span>

<span class="js-keyword">const</span> <span class="text-default">largeData</span> <span class="punctuation">=</span> <span class="js-function">ref</span><span class="punctuation">&lt;</span><span class="ts-type">UserData</span><span class="punctuation">[]&gt;(</span><span class="js-function">generateUserData</span><span class="punctuation">(</span><span class="js-number">5</span><span class="punctuation">))</span>
&lt;/<span class="html-tag">script</span>&gt;</code></pre>
      </template>
      <template v-else>
        <pre><code>
&lt;<span class="html-tag">NtTable</span> <span class="vue-directive">:header</span><span class="punctuation">=</span><span class="html-attr-value">"tableHeader"</span> <span class="vue-directive">:data</span><span class="punctuation">=</span><span class="html-attr-value">"largeData"</span>&gt;
 &lt;<span class="html-tag">template</span> <span class="vue-directive">#th_name</span><span class="punctuation">=</span><span class="html-attr-value">"&#123; value &#125;"</span>&gt;
   &lt;<span class="html-tag">span</span>&gt;
     <span class="punctuation">&#123;&#123;</span> <span class="text-default">value</span> <span class="punctuation">+</span> <span class="js-string">'(自我介紹)'</span> <span class="punctuation">&#125;&#125;</span>
   &lt;/<span class="html-tag">span</span>&gt;
 &lt;/<span class="html-tag">template</span>&gt;
 &lt;<span class="html-tag">template</span> <span class="vue-directive">#td_name</span><span class="punctuation">=</span><span class="html-attr-value">"&#123; value &#125;"</span>&gt;
   &lt;<span class="html-tag">span</span>&gt;
     <span class="punctuation">&#123;&#123;</span> <span class="js-string">'大家好，我是'</span> <span class="punctuation">+</span> <span class="text-default">value</span> <span class="punctuation">&#125;&#125;</span>
   &lt;/<span class="html-tag">span</span>&gt;
 &lt;/<span class="html-tag">template</span>&gt;
&lt;/<span class="html-tag">NtTable</span>&gt;

</code></pre>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NtTable from '@lib/components/Data/NtTable/NtTable.vue'

// 定義用戶數據類型
interface UserData {
  id: number
  name: string
  email: string
  phone: string
}

// 表格設定
const tableHeader = ref([
  {
    key: 'id',
    title: 'ID',
    width: '15%',
  },
  {
    key: 'name',
    title: '姓名',
    width: '25%',
  },
  {
    key: 'email',
    title: '信箱',
    width: '30%',
  },
  {
    key: 'phone',
    title: '電話',
    width: '20%',
  },
])
const isOpen = ref(false)

// 生成測試數據
const generateUserData = (count: number): UserData[] => {
  const data = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `用戶 ${i + 1}`,
    email: `user${i + 1}@example.com`,
    phone: `09${String(i).padStart(8, '0')}`,
  }))

  // Fisher–Yates 洗牌
  for (let i = data.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[data[i], data[j]] = [data[j], data[i]]
  }

  return data
}

// 數據
const largeData = ref<UserData[]>(generateUserData(5))
const toggleOpen = () => {
  isOpen.value = !isOpen.value
}
</script>

<style lang="scss" scoped>
.custom_template_content {
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

.custom_template_table {
  height: 300px;
  width: 100%;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
}
</style>
