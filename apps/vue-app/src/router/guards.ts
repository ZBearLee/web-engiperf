import type { Router } from 'vue-router'
import { pushGuardLog } from './guardLog'

/**
 * 全局守卫注册 + push 异常统一处理。
 * 拆成 setupGuards(router)：index.ts 只负责组装，守卫逻辑集中在此
 */
export function setupGuards(router: Router) {
  router.beforeEach((to, from) => {
    pushGuardLog('① beforeEach（全局前置）', from.path, to.path)
    document.title = `${String(to.meta.title ?? 'demo')} · web-engiperf`
  })

  router.afterEach((to, from) => {
    pushGuardLog('⑤ afterEach（全局后置）', from.path, to.path)
  })

  /**
   * 导航过程中的未捕获错误（如动态 import 失败：发布后发版旧 chunk 404、懒加载页面编译错误）。
   * 官方推荐统一在 onError 处理，最常见的实践：提示用户刷新页面
   */
  router.onError((err) => {
    console.error('[router] 导航错误：', err)
  })

  /**
   * 路由异常统一处理：
   * router.push 返回 Promise，目标路由被守卫拦截/跳转取消时会 reject。
   * 在实例上统一 catch（生产项目标准做法），业务代码无需每个调用点手动 .catch
   */
  const rawPush = router.push.bind(router)
  router.push = (...args: Parameters<typeof rawPush>) =>
    rawPush(...args).catch((err: unknown) => {
      // NavigationDuplicated：重复导航当前路由（vue-router 4 已不再抛出，但保留防御）
      // NavigationAborted：导航被 beforeEnter 等守卫 return false 取消
      // NavigationRedirected：守卫中 return 了新位置，被重定向
      console.warn('[router] 导航未完成：', (err as Error)?.message ?? err)
      return undefined as never
    })
}
