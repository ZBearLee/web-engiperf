import type { RouteRecordRaw } from 'vue-router'
import BasicLayout from '@/layouts/BasicLayout.vue'

/**
 * 基础路由（公共）：首页。
 * 根路由 component 指向布局，子页面渲染在布局的内容区 —— 与 admin-plus 的 AdminContainer 模式一致。
 * 登录页等未来全屏页也放这里（顶级路由不带 BasicLayout 即可）。
 */
export default [
  {
    path: '/',
    component: BasicLayout,
    redirect: '/home',
    meta: { order: 0 },
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/home/HomeView.vue'),
        meta: { title: '首页', icon: '🏠', order: 0 },
      },
    ],
  },
] satisfies RouteRecordRaw[]
