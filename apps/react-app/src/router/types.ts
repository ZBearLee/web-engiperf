import type { ReactNode } from 'react'

/**
 * 路由元信息：菜单、面包屑、首页导航卡片都由它驱动。
 * 与 vue-app 的 route.meta 对应（Vue Router 用 meta，React Router 用 handle）。
 */
export type RouteMeta = {
  /** 菜单 / 面包屑 / 导航卡片的标题 */
  title?: string
  /** 图标（Ant Design 图标组件） */
  icon?: ReactNode
  /** 导航卡片上的一句话说明 */
  desc?: string
  /** 同级排序 */
  order?: number
  /** true 则不出现在菜单与首页导航中（如 404、详情页） */
  hideInMenu?: boolean
}

/**
 * 路由配置类型。
 * 不直接复用 React Router 的 RouteObject —— 它是联合类型，Omit 后会丢字段；
 * 这里自定义一份宽松类型，渲染时在 App.tsx 断言回 RouteObject[]。
 */
export type AppRoute = {
  path?: string
  index?: boolean
  element?: ReactNode
  handle?: RouteMeta
  children?: AppRoute[]
}
