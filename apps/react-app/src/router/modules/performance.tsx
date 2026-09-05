import { lazy } from 'react'
import { ThunderboltOutlined } from '@ant-design/icons'
import type { AppRoute } from '../types'

// 路由级懒加载：页面按需加载，每个路由拆成独立 chunk
const PerformancePage = lazy(() => import('@/views/performance/PerformancePage'))
const FirstScreenPage = lazy(() => import('@/views/performance/FirstScreenPage'))
/**
 * 前端性能优化模块（侧边栏"前端性能优化"）
 * 约定：一个菜单 = views/performance/ 下的一个目录单元，新增专题在此追加一项即可。
 */
export default [
  {
    path: 'performance',
    handle: { title: '前端性能优化', icon: <ThunderboltOutlined />, order: 3 },
    children: [
      {
        path: 'overview',
        element: <PerformancePage />,
        handle: {
          title: '性能概览',
          desc: '演示新菜单项如何由路由配置自动生成',
          order: 1,
        },
      },
      {
        path: 'first-screen',
        element: <FirstScreenPage />,
        handle: {
          title: '首屏渲染',
          desc: '首屏渲染优化专题',
          order: 2,
        },
      },
    ],
  },
] satisfies AppRoute[]
