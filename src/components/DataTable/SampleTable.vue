<template>
  <div class="basic_content">
    <h2>範例</h2>
    <p>模擬實際使用情形</p>

    <ul class="params_list">
      <li>
        <span>大小</span>
        <div class="size_btn_group">
          <span
            v-for="value in sizeOptions"
            :key="value"
            :class="{ active: tableSize === value }"
            @click="changeSize(value)"
          >
            {{ value }}
          </span>
        </div>
      </li>
      <li v-for="value in params_options" :key="value.id">
        <label :for="value.id">{{ value.name }}</label>
        <input
          type="checkbox"
          :name="value.name"
          :id="value.id"
          :value="value"
          v-model="value.isUse"
        />
      </li>
      <li style="margin-left: auto">
        <button @click="clear">清空資料</button>
        <button @click="reload">重新載入</button>
      </li>
    </ul>

    <div class="sample_table">
      <NtTable
        :header="tableHeader"
        :data="largeData"
        :size="tableSize"
        :cell-border="isStatus('cellBorder')"
        :stripe="isStatus('stripe')"
        :hover="isStatus('hover')"
        :sticky-header="isStatus('stickyHeader')"
        :loading="isLoading"
      >
        <template #td_name="{ item, value, isEditing, disableEdit, handleEdit }">
          <input
            v-if="isEditing"
            v-model="item.name"
            @blur="disableEdit"
            @keyup.enter="disableEdit"
            class="edit-input"
          />
          <span v-else @dblclick="handleEdit" class="editable_cell">
            {{ value }}
          </span>
        </template>
        <template #td_email="{ item, value, isEditing, disableEdit, handleEdit }">
          <input
            v-if="isEditing"
            v-model="item.email"
            @blur="disableEdit"
            @keyup.enter="disableEdit"
            class="edit-input"
          />
          <span v-else @dblclick="handleEdit" class="editable_cell">
            {{ value }}
          </span>
        </template>
        <template #td_phone="{ item, value, isEditing, disableEdit, handleEdit }">
          <input
            v-if="isEditing"
            v-model="item.phone"
            @blur="disableEdit"
            @keyup.enter="disableEdit"
            class="edit-input"
          />
          <span v-else @dblclick="handleEdit" class="editable_cell">
            {{ value }}
          </span>
        </template>
      </NtTable>
    </div>

    <div class="code_view_block" @click="toggleOpen">
      <template v-if="isOpen">
        <pre><code>&lt;<span class="html-tag">template</span>&gt;
 &lt;<span class="html-tag">div</span> <span class="html-attr-name">class</span><span class="punctuation">=</span><span class="html-attr-value">"sample_table"</span>&gt;
   &lt;<span class="html-tag">NtTable</span>
     <span class="vue-directive">:header</span><span class="punctuation">=</span><span class="html-attr-value">"tableHeader"</span>
     <span class="vue-directive">:data</span><span class="punctuation">=</span><span class="html-attr-value">"largeData"</span>
     <span class="vue-directive">:size</span><span class="punctuation">=</span><span class="html-attr-value">"tableSize"</span>
     <span class="vue-directive">:cell-border</span><span class="punctuation">=</span><span class="html-attr-value">"isStatus('cellBorder')"</span>
     <span class="vue-directive">:stripe</span><span class="punctuation">=</span><span class="html-attr-value">"isStatus('stripe')"</span>
     <span class="vue-directive">:hover</span><span class="punctuation">=</span><span class="html-attr-value">"isStatus('hover')"</span>
     <span class="vue-directive">:sticky-header</span><span class="punctuation">=</span><span class="html-attr-value">"isStatus('stickyHeader')"</span>
     <span class="vue-directive">:loading</span><span class="punctuation">=</span><span class="html-attr-value">"isLoading"</span>
   &gt;
     &lt;<span class="html-tag">template</span> <span class="vue-directive">#td_name</span><span class="punctuation">=</span><span class="html-attr-value">"&#123; item, value, isEditing, disableEdit, handleEdit &#125;"</span>&gt;
       &lt;<span class="html-tag">input</span>
         <span class="vue-directive">v-if</span><span class="punctuation">=</span><span class="html-attr-value">"isEditing"</span>
         <span class="vue-directive">v-model</span><span class="punctuation">=</span><span class="html-attr-value">"item.name"</span>
         <span class="vue-directive">@blur</span><span class="punctuation">=</span><span class="html-attr-value">"disableEdit"</span>
         <span class="vue-directive">@keyup.enter</span><span class="punctuation">=</span><span class="html-attr-value">"disableEdit"</span>
         <span class="html-attr-name">class</span><span class="punctuation">=</span><span class="html-attr-value">"edit-input"</span>
       /&gt;
       &lt;<span class="html-tag">span</span> <span class="vue-directive">v-else</span> <span class="vue-directive">@dblclick</span><span class="punctuation">=</span><span class="html-attr-value">"handleEdit"</span> <span class="html-attr-name">class</span><span class="punctuation">=</span><span class="html-attr-value">"editable_cell"</span>&gt;
         <span class="punctuation">&#123;&#123;</span> <span class="text-default">value</span> <span class="punctuation">&#125;&#125;</span>
       &lt;/<span class="html-tag">span</span>&gt;
     &lt;/<span class="html-tag">template</span>&gt;
     &lt;<span class="html-tag">template</span> <span class="vue-directive">#td_email</span><span class="punctuation">=</span><span class="html-attr-value">"&#123; item, value, isEditing, disableEdit, handleEdit &#125;"</span>&gt;
       &lt;<span class="html-tag">input</span>
         <span class="vue-directive">v-if</span><span class="punctuation">=</span><span class="html-attr-value">"isEditing"</span>
         <span class="vue-directive">v-model</span><span class="punctuation">=</span><span class="html-attr-value">"item.email"</span>
         <span class="vue-directive">@blur</span><span class="punctuation">=</span><span class="html-attr-value">"disableEdit"</span>
         <span class="vue-directive">@keyup.enter</span><span class="punctuation">=</span><span class="html-attr-value">"disableEdit"</span>
         <span class="html-attr-name">class</span><span class="punctuation">=</span><span class="html-attr-value">"edit-input"</span>
       /&gt;
       &lt;<span class="html-tag">span</span> <span class="vue-directive">v-else</span> <span class="vue-directive">@dblclick</span><span class="punctuation">=</span><span class="html-attr-value">"handleEdit"</span> <span class="html-attr-name">class</span><span class="punctuation">=</span><span class="html-attr-value">"editable_cell"</span>&gt;
         <span class="punctuation">&#123;&#123;</span> <span class="text-default">value</span> <span class="punctuation">&#125;&#125;</span>
       &lt;/<span class="html-tag">span</span>&gt;
     &lt;/<span class="html-tag">template</span>&gt;
     &lt;<span class="html-tag">template</span> <span class="vue-directive">#td_phone</span><span class="punctuation">=</span><span class="html-attr-value">"&#123; item, value, isEditing, disableEdit, handleEdit &#125;"</span>&gt;
       &lt;<span class="html-tag">input</span>
         <span class="vue-directive">v-if</span><span class="punctuation">=</span><span class="html-attr-value">"isEditing"</span>
         <span class="vue-directive">v-model</span><span class="punctuation">=</span><span class="html-attr-value">"item.phone"</span>
         <span class="vue-directive">@blur</span><span class="punctuation">=</span><span class="html-attr-value">"disableEdit"</span>
         <span class="vue-directive">@keyup.enter</span><span class="punctuation">=</span><span class="html-attr-value">"disableEdit"</span>
         <span class="html-attr-name">class</span><span class="punctuation">=</span><span class="html-attr-value">"edit-input"</span>
       /&gt;
       &lt;<span class="html-tag">span</span> <span class="vue-directive">v-else</span> <span class="vue-directive">@dblclick</span><span class="punctuation">=</span><span class="html-attr-value">"handleEdit"</span> <span class="html-attr-name">class</span><span class="punctuation">=</span><span class="html-attr-value">"editable_cell"</span>&gt;
         <span class="punctuation">&#123;&#123;</span> <span class="text-default">value</span> <span class="punctuation">&#125;&#125;</span>
       &lt;/<span class="html-tag">span</span>&gt;
     &lt;/<span class="html-tag">template</span>&gt;
   &lt;/<span class="html-tag">NtTable</span>&gt;
 &lt;/<span class="html-tag">div</span>&gt;
&lt;/<span class="html-tag">template</span>&gt;

&lt;<span class="html-tag">script</span> <span class="html-attr-name">setup</span> <span class="html-attr-name">lang</span><span class="punctuation">=</span><span class="html-attr-value">"ts"</span>&gt;
<span class="js-keyword">import</span> <span class="punctuation">&#123;</span> <span class="js-function">reactive</span><span class="punctuation">,</span> <span class="js-function">ref</span><span class="punctuation">,</span> <span class="js-keyword">type</span> <span class="ts-type">Ref</span> <span class="punctuation">&#125;</span> <span class="js-keyword">from</span> <span class="js-string">'vue'</span>
<span class="js-keyword">import</span> <span class="text-default">NtTable</span> <span class="js-keyword">from</span> <span class="js-string">'@lib/components/Data/NtTable/NtTable.vue'</span>

<span class="js-keyword">const</span> <span class="text-default">tableSize</span><span class="punctuation">:</span> <span class="ts-type">Ref</span><span class="punctuation">&lt;</span><span class="js-string">'medium'</span> <span class="punctuation">|</span> <span class="js-string">'small'</span> <span class="punctuation">|</span> <span class="js-string">'large'</span><span class="punctuation">&gt;</span> <span class="punctuation">=</span> <span class="js-function">ref</span><span class="punctuation">(</span><span class="js-string">'medium'</span><span class="punctuation">)</span>
<span class="js-keyword">const</span> <span class="text-default">sizeOptions</span> <span class="punctuation">=</span> <span class="punctuation">[</span><span class="js-string">'small'</span><span class="punctuation">,</span> <span class="js-string">'medium'</span><span class="punctuation">,</span> <span class="js-string">'large'</span><span class="punctuation">]</span>

<span class="js-keyword">const</span> <span class="text-default">params_options</span> <span class="punctuation">=</span> <span class="js-function">reactive</span><span class="punctuation">([</span>
 <span class="punctuation">&#123;</span> <span class="text-default">id</span><span class="punctuation">:</span> <span class="js-string">'cellBorder'</span><span class="punctuation">,</span> <span class="text-default">isUse</span><span class="punctuation">:</span> <span class="js-keyword">false</span><span class="punctuation">,</span> <span class="text-default">name</span><span class="punctuation">:</span> <span class="js-string">'邊框'</span> <span class="punctuation">&#125;,</span>
 <span class="punctuation">&#123;</span> <span class="text-default">id</span><span class="punctuation">:</span> <span class="js-string">'stripe'</span><span class="punctuation">,</span> <span class="text-default">isUse</span><span class="punctuation">:</span> <span class="js-keyword">false</span><span class="punctuation">,</span> <span class="text-default">name</span><span class="punctuation">:</span> <span class="js-string">'條紋'</span> <span class="punctuation">&#125;,</span>
 <span class="punctuation">&#123;</span> <span class="text-default">id</span><span class="punctuation">:</span> <span class="js-string">'hover'</span><span class="punctuation">,</span> <span class="text-default">isUse</span><span class="punctuation">:</span> <span class="js-keyword">false</span><span class="punctuation">,</span> <span class="text-default">name</span><span class="punctuation">:</span> <span class="js-string">'hover'</span> <span class="punctuation">&#125;,</span>
 <span class="punctuation">&#123;</span> <span class="text-default">id</span><span class="punctuation">:</span> <span class="js-string">'stickyHeader'</span><span class="punctuation">,</span> <span class="text-default">isUse</span><span class="punctuation">:</span> <span class="js-keyword">false</span><span class="punctuation">,</span> <span class="text-default">name</span><span class="punctuation">:</span> <span class="js-string">'表頭固定'</span> <span class="punctuation">&#125;,</span>
<span class="punctuation">])</span>

<span class="js-keyword">const</span> <span class="text-default">isLoading</span> <span class="punctuation">=</span> <span class="js-function">ref</span><span class="punctuation">(</span><span class="js-keyword">false</span><span class="punctuation">)</span>

<span class="js-keyword">const</span> <span class="text-default">isStatus</span> <span class="punctuation">=</span> <span class="punctuation">(</span><span class="text-default">key</span><span class="punctuation">:</span> <span class="ts-type">string</span><span class="punctuation">)</span> <span class="punctuation">=&gt;</span> <span class="punctuation">&#123;</span>
 <span class="js-keyword">const</span> <span class="text-default">item</span> <span class="punctuation">=</span> <span class="text-default">params_options</span><span class="punctuation">.</span><span class="js-function">find</span><span class="punctuation">((</span><span class="text-default">item</span><span class="punctuation">)</span> <span class="punctuation">=&gt;</span> <span class="text-default">item</span><span class="punctuation">.</span><span class="text-default">id</span> <span class="punctuation">===</span> <span class="text-default">key</span><span class="punctuation">)</span>
 <span class="js-keyword">return</span> <span class="text-default">item</span> <span class="punctuation">?</span> <span class="text-default">item</span><span class="punctuation">.</span><span class="text-default">isUse</span> <span class="punctuation">:</span> <span class="js-keyword">false</span>
<span class="punctuation">&#125;</span>

<span class="js-comment">// 表格設定</span>
<span class="js-keyword">const</span> <span class="text-default">tableHeader</span> <span class="punctuation">=</span> <span class="js-function">ref</span><span class="punctuation">([</span>
 <span class="punctuation">&#123;</span>
   <span class="text-default">key</span><span class="punctuation">:</span> <span class="js-string">'id'</span><span class="punctuation">,</span>
   <span class="text-default">title</span><span class="punctuation">:</span> <span class="js-string">'ID'</span><span class="punctuation">,</span>
   <span class="text-default">width</span><span class="punctuation">:</span> <span class="js-string">'250px'</span><span class="punctuation">,</span>
   <span class="text-default">fixed</span><span class="punctuation">:</span> <span class="js-string">'left'</span> <span class="js-keyword">as</span> <span class="js-keyword">const</span><span class="punctuation">,</span>
   <span class="text-default">sortable</span><span class="punctuation">:</span> <span class="js-number">0</span><span class="punctuation">,</span>
 <span class="punctuation">&#125;,</span>
 <span class="punctuation">&#123;</span>
   <span class="text-default">key</span><span class="punctuation">:</span> <span class="js-string">'name'</span><span class="punctuation">,</span>
   <span class="text-default">title</span><span class="punctuation">:</span> <span class="js-string">'姓名'</span><span class="punctuation">,</span>
   <span class="text-default">width</span><span class="punctuation">:</span> <span class="js-string">'250px'</span><span class="punctuation">,</span>
   <span class="text-default">sortable</span><span class="punctuation">:</span> <span class="js-number">0</span><span class="punctuation">,</span>
 <span class="punctuation">&#125;,</span>
 <span class="punctuation">&#123;</span>
   <span class="text-default">key</span><span class="punctuation">:</span> <span class="js-string">'email'</span><span class="punctuation">,</span>
   <span class="text-default">title</span><span class="punctuation">:</span> <span class="js-string">'信箱'</span><span class="punctuation">,</span>
   <span class="text-default">width</span><span class="punctuation">:</span> <span class="js-string">'300px'</span><span class="punctuation">,</span>
   <span class="text-default">sortable</span><span class="punctuation">:</span> <span class="js-number">0</span><span class="punctuation">,</span>
 <span class="punctuation">&#125;,</span>
 <span class="punctuation">&#123;</span>
   <span class="text-default">key</span><span class="punctuation">:</span> <span class="js-string">'phone'</span><span class="punctuation">,</span>
   <span class="text-default">title</span><span class="punctuation">:</span> <span class="js-string">'電話'</span><span class="punctuation">,</span>
   <span class="text-default">width</span><span class="punctuation">:</span> <span class="js-string">'300px'</span><span class="punctuation">,</span>
   <span class="text-default">sortable</span><span class="punctuation">:</span> <span class="js-number">0</span><span class="punctuation">,</span>
 <span class="punctuation">&#125;,</span>
<span class="punctuation">])</span>

<span class="js-keyword">const</span> <span class="text-default">largeData</span> <span class="punctuation">=</span> <span class="js-function">ref</span><span class="punctuation">&lt;</span><span class="ts-type">UserData</span><span class="punctuation">[]&gt;(</span><span class="js-function">generateUserData</span><span class="punctuation">(</span><span class="js-number">20</span><span class="punctuation">))</span>

<span class="js-keyword">const</span> <span class="text-default">changeSize</span> <span class="punctuation">=</span> <span class="punctuation">(</span><span class="text-default">size</span><span class="punctuation">:</span> <span class="ts-type">string</span><span class="punctuation">)</span> <span class="punctuation">=&gt;</span> <span class="punctuation">&#123;</span>
 <span class="text-default">tableSize</span><span class="punctuation">.</span><span class="text-default">value</span> <span class="punctuation">=</span> <span class="text-default">size</span> <span class="js-keyword">as</span> <span class="js-string">'small'</span> <span class="punctuation">|</span> <span class="js-string">'medium'</span> <span class="punctuation">|</span> <span class="js-string">'large'</span>
<span class="punctuation">&#125;</span>

<span class="js-keyword">const</span> <span class="text-default">clear</span> <span class="punctuation">=</span> <span class="punctuation">()</span> <span class="punctuation">=&gt;</span> <span class="punctuation">&#123;</span>
 <span class="text-default">largeData</span><span class="punctuation">.</span><span class="text-default">value</span> <span class="punctuation">=</span> <span class="js-function">generateUserData</span><span class="punctuation">(</span><span class="js-number">0</span><span class="punctuation">)</span>
<span class="punctuation">&#125;</span>

<span class="js-keyword">const</span> <span class="text-default">reload</span> <span class="punctuation">=</span> <span class="punctuation">()</span> <span class="punctuation">=&gt;</span> <span class="punctuation">&#123;</span>
 <span class="text-default">isLoading</span><span class="punctuation">.</span><span class="text-default">value</span> <span class="punctuation">=</span> <span class="js-keyword">true</span>
 <span class="text-default">largeData</span><span class="punctuation">.</span><span class="text-default">value</span> <span class="punctuation">=</span> <span class="js-function">generateUserData</span><span class="punctuation">(</span><span class="js-number">20</span><span class="punctuation">)</span>
 <span class="js-function">setTimeout</span><span class="punctuation">(()</span> <span class="punctuation">=&gt;</span> <span class="punctuation">&#123;</span>
   <span class="text-default">isLoading</span><span class="punctuation">.</span><span class="text-default">value</span> <span class="punctuation">=</span> <span class="js-keyword">false</span>
 <span class="punctuation">&#125;,</span> <span class="js-number">1000</span><span class="punctuation">)</span>
<span class="punctuation">&#125;</span>
&lt;/<span class="html-tag">script</span>&gt;</code></pre>
      </template>
      <template v-else>
        <pre><code>&lt;<span class="html-tag">template</span>&gt;
 &lt;<span class="html-tag">div</span> <span class="html-attr-name">class</span><span class="punctuation">=</span><span class="html-attr-value">"sample_table"</span>&gt;
   &lt;<span class="html-tag">NtTable</span>
     <span class="vue-directive">:header</span><span class="punctuation">=</span><span class="html-attr-value">"tableHeader"</span>
     <span class="vue-directive">:data</span><span class="punctuation">=</span><span class="html-attr-value">"largeData"</span>
     <span class="vue-directive">:size</span><span class="punctuation">=</span><span class="html-attr-value">"tableSize"</span>
     <span class="vue-directive">:cell-border</span><span class="punctuation">=</span><span class="html-attr-value">"isStatus('cellBorder')"</span>
     <span class="vue-directive">:stripe</span><span class="punctuation">=</span><span class="html-attr-value">"isStatus('stripe')"</span>
     <span class="vue-directive">:hover</span><span class="punctuation">=</span><span class="html-attr-value">"isStatus('hover')"</span>
     <span class="vue-directive">:sticky-header</span><span class="punctuation">=</span><span class="html-attr-value">"isStatus('stickyHeader')"</span>
     <span class="vue-directive">:loading</span><span class="punctuation">=</span><span class="html-attr-value">"isLoading"</span>
   &gt;
     &lt;<span class="html-tag">template</span> <span class="vue-directive">#td_name</span><span class="punctuation">=</span><span class="html-attr-value">"&#123; item, value, isEditing, disableEdit, handleEdit &#125;"</span>&gt;
       &lt;<span class="html-tag">input</span>
         <span class="vue-directive">v-if</span><span class="punctuation">=</span><span class="html-attr-value">"isEditing"</span>
         <span class="vue-directive">v-model</span><span class="punctuation">=</span><span class="html-attr-value">"item.name"</span>
         <span class="vue-directive">@blur</span><span class="punctuation">=</span><span class="html-attr-value">"disableEdit"</span>
         <span class="vue-directive">@keyup.enter</span><span class="punctuation">=</span><span class="html-attr-value">"disableEdit"</span>
         <span class="html-attr-name">class</span><span class="punctuation">=</span><span class="html-attr-value">"edit-input"</span>
       /&gt;
       &lt;<span class="html-tag">span</span> <span class="vue-directive">v-else</span> <span class="vue-directive">@dblclick</span><span class="punctuation">=</span><span class="html-attr-value">"handleEdit"</span> <span class="html-attr-name">class</span><span class="punctuation">=</span><span class="html-attr-value">"editable_cell"</span>&gt;
         <span class="punctuation">&#123;&#123;</span> <span class="text-default">value</span> <span class="punctuation">&#125;&#125;</span>
       &lt;/<span class="html-tag">span</span>&gt;
     &lt;/<span class="html-tag">template</span>&gt;
     &lt;<span class="html-tag">template</span> <span class="vue-directive">#td_email</span><span class="punctuation">=</span><span class="html-attr-value">"&#123; item, value, isEditing, disableEdit, handleEdit &#125;"</span>&gt;
       &lt;<span class="html-tag">input</span>
         <span class="vue-directive">v-if</span><span class="punctuation">=</span><span class="html-attr-value">"isEditing"</span>
         <span class="vue-directive">v-model</span><span class="punctuation">=</span><span class="html-attr-value">"item.email"</span>
         <span class="vue-directive">@blur</span><span class="punctuation">=</span><span class="html-attr-value">"disableEdit"</span>
         <span class="vue-directive">@keyup.enter</span><span class="punctuation">=</span><span class="html-attr-value">"disableEdit"</span>
         <span class="html-attr-name">class</span><span class="punctuation">=</span><span class="html-attr-value">"edit-input"</span>
       /&gt;
       &lt;<span class="html-tag">span</span> <span class="vue-directive">v-else</span> <span class="vue-directive">@dblclick</span><span class="punctuation">=</span><span class="html-attr-value">"handleEdit"</span> <span class="html-attr-name">class</span><span class="punctuation">=</span><span class="html-attr-value">"editable_cell"</span>&gt;
         <span class="punctuation">&#123;&#123;</span> <span class="text-default">value</span> <span class="punctuation">&#125;&#125;</span>
       &lt;/<span class="html-tag">span</span>&gt;
     &lt;/<span class="html-tag">template</span>&gt;
     &lt;<span class="html-tag">template</span> <span class="vue-directive">#td_phone</span><span class="punctuation">=</span><span class="html-attr-value">"&#123; item, value, isEditing, disableEdit, handleEdit &#125;"</span>&gt;
       &lt;<span class="html-tag">input</span>
         <span class="vue-directive">v-if</span><span class="punctuation">=</span><span class="html-attr-value">"isEditing"</span>
         <span class="vue-directive">v-model</span><span class="punctuation">=</span><span class="html-attr-value">"item.phone"</span>
         <span class="vue-directive">@blur</span><span class="punctuation">=</span><span class="html-attr-value">"disableEdit"</span>
         <span class="vue-directive">@keyup.enter</span><span class="punctuation">=</span><span class="html-attr-value">"disableEdit"</span>
         <span class="html-attr-name">class</span><span class="punctuation">=</span><span class="html-attr-value">"edit-input"</span>
       /&gt;
       &lt;<span class="html-tag">span</span> <span class="vue-directive">v-else</span> <span class="vue-directive">@dblclick</span><span class="punctuation">=</span><span class="html-attr-value">"handleEdit"</span> <span class="html-attr-name">class</span><span class="punctuation">=</span><span class="html-attr-value">"editable_cell"</span>&gt;
         <span class="punctuation">&#123;&#123;</span> <span class="text-default">value</span> <span class="punctuation">&#125;&#125;</span>
       &lt;/<span class="html-tag">span</span>&gt;
     &lt;/<span class="html-tag">template</span>&gt;
   &lt;/<span class="html-tag">NtTable</span>&gt;
 &lt;/<span class="html-tag">div</span>&gt;
&lt;/<span class="html-tag">template</span>&gt;
        </code></pre>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, type Ref } from 'vue'
import NtTable from '@lib/components/Data/NtTable/NtTable.vue'

// 定義用戶數據類型
interface UserData {
  id: number
  name: string
  email: string
  phone: string
}

const tableSize: Ref<'medium' | 'small' | 'large'> = ref('medium')
const sizeOptions = ['small', 'medium', 'large']

const params_options = reactive([
  { id: 'cellBorder', isUse: false, name: '邊框' },
  { id: 'stripe', isUse: false, name: '條紋' },
  { id: 'hover', isUse: false, name: 'hover' },
  { id: 'stickyHeader', isUse: false, name: '表頭固定' },
])

const isLoading = ref(false)

const isStatus = (key: string) => {
  const item = params_options.find((item) => item.id === key)
  return item ? item.isUse : false
}

// 表格設定
const tableHeader = ref([
  {
    key: 'id',
    title: 'ID',
    width: '250px',
    fixed: 'left' as const,
    sortable: 0,
  },
  {
    key: 'name',
    title: '姓名',
    width: '250px',
    sortable: 0,
  },
  {
    key: 'email',
    title: '信箱',
    width: '300px',
    sortable: 0,
  },
  {
    key: 'phone',
    title: '電話',
    width: '300px',
    sortable: 0,
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
const largeData = ref<UserData[]>(generateUserData(20))

const changeSize = (size: string) => {
  tableSize.value = size as 'small' | 'medium' | 'large'
}

const clear = () => {
  largeData.value = generateUserData(0)
}

const reload = () => {
  isLoading.value = true
  largeData.value = generateUserData(20)
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}
</script>

<style lang="scss" scoped>
.basic_content {
  width: 100%;
  height: auto;
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: #334155;
  font-weight: 400;

  > h2 {
    color: #0f172a;
    font-weight: 500;
  }
}

.params_list {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  padding: 0 1rem;
  margin: 0;
  list-style: none;

  > li {
    width: auto;
    height: 36px;
    font-size: 15px;
    font-weight: 600;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;
    gap: 5px;

    > span {
      white-space: nowrap;
    }
  }

  button {
    border: none;
    background: #353535;
    color: #fff;
    border-radius: 5px;
    padding: 0.2rem 0.5rem;
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;

    &:hover {
      background: #000000;
    }
  }
}

.size_btn_group {
  color: #64748b;
  border: 1px solid #d6d6d6;
  border-radius: 8px;
  width: 180px;
  height: auto;
  padding: 0.2rem;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;

  > span {
    font-weight: 600;
    padding: 0px 8px;
    border-radius: 5px;
    cursor: pointer;

    &.active,
    &:hover {
      background: #000000;
      color: #fff;
    }
  }
}

.sample_table {
  height: 450px;
  width: 100%;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
}

.editable_cell {
  cursor: default;
}

.edit-input {
  border: 1px solid #e2e8f0;
  padding: 6px 8px;
  border-radius: 8px;
  outline: none;
  font-size: 15px;
}
</style>
