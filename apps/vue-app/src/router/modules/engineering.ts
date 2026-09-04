import type { RouteRecordRaw } from 'vue-router'
import BasicLayout from '@/layouts/BasicLayout.vue'

/**
 * 工程化模块路由（对应侧边栏"前端工程化"菜单）：
 * 组件封装、目录规范、构建优化等 —— 与"前端架构"互补：架构偏页面组织，工程化偏代码组织
 */
export default [
  {
    path: '/engineering',
    component: BasicLayout,
    redirect: '/engineering/components',
    meta: { icon: '', order: 2 },
    children: [
      {
        path: 'components',
        name: 'component-design',
        component: () => import('@/views/engineering/ComponentDesign.vue'),
        meta: { title: '组件封装', order: 1 },
      },
    ],
  },
] satisfies RouteRecordRaw[]
