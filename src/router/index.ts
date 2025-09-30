import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'homepage',
      component: () => import('../views/index.vue'),
      meta: {
        name: 'Data',
      },
      children: [
        {
          path: 'DataTable',
          name: 'DataTable',
          component: () => import('../views/Data/DataTable.vue'),
          meta: {
            name: 'DataTable',
          },
        },
        {
          path: 'Paginator',
          name: 'Paginator',
          component: () => import('../views/Data/Paginator.vue'),
          meta: {
            name: 'Paginator',
          },
        },
        {
          path: 'TreeList',
          name: 'TreeList',
          component: () => import('../views/Data/TreeList.vue'),
          meta: {
            name: 'Tree',
          },
        },
      ],
      redirect: { name: 'DataTable' },
    },
  ],
})

export default router
