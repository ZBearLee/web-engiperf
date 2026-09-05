import { lazy } from 'react'
import { ToolOutlined } from '@ant-design/icons'
import type { AppRoute } from '../types'

// 路由级懒加载：页面按需加载，每个路由拆成独立 chunk（性能优化演示）
const ComponentDesignPage = lazy(
  () => import('@/views/engineering/component-design/ComponentDesignPage'),
)

/**
 * 前端工程化模块（侧边栏"前端工程化"）
 * 约定：一个菜单 = views/engineering/ 下的一个目录单元，主页面平铺、私有面板收进 _components/。
 */
export default [
  {
    path: 'engineering',
    handle: { title: '前端工程化', icon: <ToolOutlined />, order: 2 },
    children: [
      {
        path: 'component-design',
        element: <ComponentDesignPage />,
        handle: {
          title: '组件封装',
          desc: '对标 vue-app 的同名页面，用 React 实现同一套内容做写法对比',
          order: 1,
        },
      },
    ],
  },
] satisfies AppRoute[]
