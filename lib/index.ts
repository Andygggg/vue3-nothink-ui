// lib/index.ts - 主入口文件
import type { App } from 'vue'

// 導入所有組件
import * as components from './components'
// import * as utils from './utils'

// 導入樣式 (如果有全局樣式)
import './styles/index.scss'

// 導出類型和組件
export * from './typing'
// export * from './utils'
export * from './components'

// 組件列表 (用於批量註冊)
const componentList = Object.values(components)

// install 函數 - Vue 插件安裝函數
export const install = (app: App) => {
  // 註冊所有組件
  componentList.forEach((component) => {
    if (component.name) {
      app.component(component.name, component)
    }
  })

  // 可以在這裡添加全局配置
  app.config.globalProperties.$myLibConfig = {
    // 全局配置選項
  }

  // 提供全局方法或工具
  // app.provide('myLibUtils', utils)
}

// 導出完整的庫對象（命名導出）
export const VueNoThinkUI = {
  install,
  ...components,
  // ...utils,
}