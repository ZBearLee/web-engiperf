import type { RouteRecordRaw } from 'vue-router'

/**
 * 错误路由：404 独立页（无布局）。
 * 注意：catchAll 必须放在路由表最后（routes.ts 聚合时 error 永远排最后）
 */
export default [
  {
    path: '/404',
    name: 'not-found',
    component: () => import('@/views/error/NotFound.vue'),
    meta: { title: '404', hidden: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: { hidden: true },
  },
] satisfies RouteRecordRaw[]
