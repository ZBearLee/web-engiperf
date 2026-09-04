import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { setupGuards } from './guards'

/**
 * 路由模块入口：只负责组装（创建实例 + 挂守卫）。
 * 各职责拆分：
 * - routes.ts    路由表（菜单/面包屑的唯一数据源）
 * - guards.ts    全局守卫与 push 异常处理
 * - guardLog.ts  守卫时序日志（教学用纯状态模块）
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

setupGuards(router)

// 侧边栏菜单由路由表驱动（保持从 '@/router' 可引入）
export { routes }

export default router
