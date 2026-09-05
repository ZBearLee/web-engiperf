import { lazy } from 'react'
import { HomeOutlined } from '@ant-design/icons'
import { Navigate } from 'react-router-dom'
import type { AppRoute } from '../types'
import BasicLayout from '@/layouts/BasicLayout'
import architecture from './architecture'
import engineering from './engineering'
import performance from './performance'

// 路由级懒加载：首页同样按需加载，避免首屏打包所有页面代码
const HomePage = lazy(() => import('@/views/home/HomePage'))

/**
 * 路由总入口：各菜单模块在 modules/ 下各自维护，这里统一组装。
 * 思路与 vue-app 的 router/modules/index.ts 一致：
 * - 根路由挂 BasicLayout，并把 / 重定向到 /home
 * - 首页是独立路径 /home，同时是菜单里可见可点的一项
 *
 * 采用「布局路由」：根路由挂 BasicLayout，各模块作为 children，
 * 这样切换菜单时布局不会重新挂载（React Router 推荐做法）。
 */
export const routes: AppRoute[] = [
  {
    path: '/',
    element: <BasicLayout />,
    children: [
      // 对应 vue-app 的 redirect: '/home'
      { index: true, element: <Navigate to="/home" replace /> },
      {
        path: 'home',
        element: <HomePage />,
        handle: {
          title: '首页',
          icon: <HomeOutlined />,
          desc: '项目说明与菜单总览',
          order: 0,
        },
      },
      ...architecture,
      ...engineering,
      ...performance,
    ],
  },
]
