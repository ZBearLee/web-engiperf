import { lazy } from 'react'
import { ClusterOutlined } from '@ant-design/icons'
import type { AppRoute } from '../types'

// 路由级懒加载：页面按需加载，每个路由拆成独立 chunk（性能优化演示）
const RouteDemoPage = lazy(() => import('@/views/architecture/routes/RouteDemoPage'))

/**
 * 前端架构模块（侧边栏"前端架构"）
 * 约定：一个菜单 = views/architecture/ 下的一个目录单元，新增专题在此追加一项即可。
 */
export default [
  {
    path: 'architecture',
    handle: { title: '前端架构', icon: <ClusterOutlined />, order: 1 },
    children: [
      {
        path: 'routes',
        element: <RouteDemoPage />,
        handle: {
          title: '路由专题',
          desc: '演示路由按模块拆分、菜单与导航由配置自动生成',
          order: 1,
        },
      },
    ],
  },
] satisfies AppRoute[]
