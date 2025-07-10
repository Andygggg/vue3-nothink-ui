import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'table',
      component: () => import('../views/index.vue'),
    },
    {
      path: '/TreeList',
      name: 'TreeList',
      component: () => import('../views/Data/TreeList.vue'),
    },
  ],
})

export default router
