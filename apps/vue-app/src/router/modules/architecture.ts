import type { RouteRecordRaw } from 'vue-router'
import BasicLayout from '@/layouts/BasicLayout.vue'
import { guardFormBeforeEnter } from '@/router/guardHooks'

/**
 * 前端架构模块路由（对应侧边栏"前端架构"菜单）
 * 结构与 views/architecture/ 目录一一对应：一个菜单 = 一个目录（如 routes/）；
 * 目录内主页面与同菜单子页面平铺，主页面的私有 tab 面板收进 _components/
 */
export default [
  {
    path: '/architecture',
    component: BasicLayout,
    redirect: '/architecture/routes',
    meta: { title: '前端架构', icon: '🏗️', order: 1 },
    children: [
      {
        // 无 component 的父路由：仅建立层级（面包屑），子页渲染到 BasicLayout 的 RouterView
        path: 'routes',
        meta: { title: '路由专题', icon: '', order: 1 },
        children: [
          {
            path: '', // 完整路径 /architecture/routes（空 path 子路由 = 默认子页）
            name: 'routes',
            component: () => import('@/views/architecture/routes/RouteDemo.vue'),
          },
          {
            path: 'user/:id',
            name: 'user-detail',
            component: () => import('@/views/architecture/routes/UserDetail.vue'),
            // props: true → 路由参数 id 直接作为组件 prop 注入（参数解耦，组件可脱离路由独立测试）
            props: true,
            meta: { title: '动态参数演示', hidden: true },
          },
          {
            path: 'guards/form',
            name: 'guard-form',
            component: () => import('@/views/architecture/routes/GuardForm.vue'),
            meta: { title: '组件内守卫实验', hidden: true },
            // 路由独享守卫 beforeEnter：只拦截本路由。演示：不带 ?vip=1 访问被重定向回守卫 tab
            beforeEnter: guardFormBeforeEnter,
          },
        ],
      },
      // 接口请求封装：API 层 / 容灾，独立菜单项
      {
        path: 'request',
        name: 'request-demo',
        component: () => import('@/views/architecture/request/RequestDemo.vue'),
        meta: { title: '接口请求封装', icon: '', order: 2 },
      },
      // 兜底策略：容灾与降级，独立菜单项
      {
        path: 'fallback',
        name: 'fallback-demo',
        component: () => import('@/views/architecture/fallback/FallbackDemo.vue'),
        meta: { title: '兜底策略', icon: '', order: 3 },
      },
    ],
  },
] satisfies RouteRecordRaw[]
