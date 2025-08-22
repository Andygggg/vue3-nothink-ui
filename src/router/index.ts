import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'homepage',
      component: () => import('../views/index.vue'),
      children: [
        {
          path: 'TreeList',
          name: 'TreeList',
          component: () => import('../views/Data/TreeList.vue'),
        },
        {
          path: 'DataTable',
          name: 'DataTable',
          component: () => import('../views/Data/DataTable.vue'),
        },
      ],
      redirect: { name: 'DataTable' },
    },
  ],
})

export default router
