import type { RouteRecordRaw } from 'vue-router'
import BasicLayout from '@/layouts/BasicLayout.vue'

/**
 * 前端架构模块路由（对应侧边栏"前端架构"菜单）
 * 结构与 views/architecture/ 目录一一对应
 */
export default [
  {
    path: '/architecture',
    component: BasicLayout,
    redirect: '/architecture/routes',
    meta: { title: '前端架构', icon: '', order: 1 },
    children: [
      {
        // 无 component 的父路由：仅建立层级（面包屑），子页渲染到 BasicLayout 的 RouterView
        path: 'routes',
        meta: { title: '路由专题', order: 1 },
        children: [
          {
            path: '', // 完整路径 /architecture/routes（空 path 子路由 = 默认子页）
            name: 'route-topic',
            component: () => import('@/views/architecture/RouteTopic.vue'),
          },
          {
            path: 'user/:id',
            name: 'user-detail',
            component: () => import('@/views/architecture/UserDetail.vue'),
            // props: true → 路由参数 id 直接作为组件 prop 注入（参数解耦，组件可脱离路由独立测试）
            props: true,
            meta: { title: '动态参数演示', hidden: true },
          },
          {
            path: 'guards/form',
            name: 'guard-form',
            component: () => import('@/views/architecture/GuardForm.vue'),
            meta: { title: '组件内守卫实验', hidden: true },
            // 路由独享守卫 beforeEnter：只拦截本路由。演示：不带 ?vip=1 访问被重定向回守卫 tab
            beforeEnter: (to) => {
              if (to.query.vip !== '1') {
                return { path: '/architecture/routes', query: { tab: 'guards', blocked: '1' } }
              }
            },
          },
        ],
      },
      // 后续专题在这里追加：path: 'xxx' + views/architecture/XxxTopic.vue
    ],
  },
] satisfies RouteRecordRaw[]
