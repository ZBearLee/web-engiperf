import { createElement } from 'react'
import type { MenuProps } from 'antd'
import type { ReactNode } from 'react'
import { AppstoreOutlined } from '@ant-design/icons'
import type { AppRoute, RouteMeta } from './types'
import { routes } from './modules'

type MenuItem = Required<MenuProps>['items'][number]

/** 菜单树节点：侧边栏与首页导航共用这一份结构 */
export type MenuNode = {
  /** 完整路径，同时作为 key 与跳转目标 */
  key: string
  title: string
  icon?: ReactNode
  desc?: string
  children: MenuNode[]
}

const getMeta = (route: AppRoute): RouteMeta | undefined => route.handle

/** 把相对路径拼成完整路径（index 路由等于父级路径） */
function joinPath(parentPath: string, route: AppRoute): string {
  if (route.index) return parentPath || '/'
  return `${parentPath}/${route.path ?? ''}`.replace(/\/+/g, '/')
}

/** 从路由配置递归构建菜单树，按 order 排序 */
function buildTree(list: AppRoute[], parentPath = ''): MenuNode[] {
  return list
    .filter((route) => {
      const meta = getMeta(route)
      return !route.index && meta?.title && !meta?.hideInMenu
    })
    .map((route) => {
      const meta = getMeta(route)
      const currentPath = joinPath(parentPath, route)
      return {
        order: meta?.order ?? 0,
        node: {
          key: currentPath,
          title: meta?.title ?? '',
          icon: meta?.icon ?? createElement(AppstoreOutlined),
          desc: meta?.desc,
          children: route.children ? buildTree(route.children, currentPath) : [],
        },
      }
    })
    .sort((a, b) => a.order - b.order)
    .map((item) => item.node)
}

/** 菜单树：根路由的 children 即一级菜单 */
export function buildMenuTree(): MenuNode[] {
  return buildTree(routes[0]?.children ?? [])
}

/** 菜单树 → antd Menu 的 items（侧边栏用） */
export function buildMenuItems(): MenuItem[] {
  const toItems = (nodes: MenuNode[]): MenuItem[] =>
    nodes.map((node) =>
      node.children.length > 0
        ? {
            key: node.key,
            icon: node.icon,
            label: node.title,
            children: toItems(node.children),
          }
        : { key: node.key, icon: node.icon, label: node.title },
    )

  return toItems(buildMenuTree())
}

/** 根据当前路径回溯面包屑链路（首页 → 前端工程化 → 组件封装） */
export function buildBreadcrumb(pathname: string): { title: string; path: string }[] {
  const crumbs: { title: string; path: string }[] = []

  const walk = (list: AppRoute[], parentPath: string): boolean => {
    for (const route of list) {
      const meta = getMeta(route)
      const currentPath = joinPath(parentPath, route)

      // 无标题的纯分组路由：不入面包屑，继续向下找
      if (!meta?.title) {
        if (route.children && walk(route.children, currentPath)) return true
        continue
      }

      crumbs.push({ title: meta.title, path: currentPath })
      if (currentPath === pathname) return true
      if (route.children && walk(route.children, currentPath)) return true
      crumbs.pop()
    }
    return false
  }

  walk(routes[0]?.children ?? [], '')
  return crumbs
}
