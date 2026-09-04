import type { RouteRecordRaw } from 'vue-router'

import index from './modules/index'
import architecture from './modules/architecture'
import engineering from './modules/engineering'
import error from './modules/error'

/**
 * 路由表聚合（参考 admin-plus 规范）：
 * - 一个菜单模块一个文件（router/modules/*.ts），这里只做合并
 * - error（含 catchAll）必须排最后
 * - 新增分类 = modules 下建文件 + 这里 import 合并，菜单自动出现
 *
 * meta 约定（菜单/面包屑由路由表驱动）：
 * - title 菜单与面包屑标题｜ order 菜单排序｜ hidden 不进菜单｜ icon 一级菜单图标
 */
const routes: RouteRecordRaw[] = [...index, ...architecture, ...engineering, ...error]

export { routes }
