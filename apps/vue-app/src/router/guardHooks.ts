import type { RouteLocationNormalized } from 'vue-router'
import { pushGuardLog } from '@/router/guardLog'

/**
 * 路由独享守卫：只拦截 guard-form 路由。
 * 不带 ?vip=1 访问会被重定向回守卫 tab（blocked=1 用于前端提示）。
 * 抽成独立函数，方便脱离组件链做单元测试。
 */
export function guardFormBeforeEnter(to: RouteLocationNormalized) {
  pushGuardLog('② beforeEnter（路由独享）', to.redirectedFrom?.path ?? to.path, to.path)
  if (to.query.vip !== '1') {
    return { path: '/architecture/routes', query: { tab: 'guards', blocked: '1' } }
  }
}

/**
 * 组件内守卫逻辑：离开 guard-form 前拦截。
 * 抽成独立函数 + 依赖注入（isDirty / confirm 都从外部传入），
 * 这样既能脱离 Vue 组件与 Element Plus 弹窗做单元测试，也方便复用。
 *
 * @param isDirty   判断表单是否未保存（组件里传 () => draft.value !== saved.value）
 * @param confirm   弹出确认框，resolve=确认离开 / reject=取消离开
 */
export async function guardFormBeforeRouteLeave(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  // confirm 用 unknown：调用方只关心 resolve（确认）/ reject（取消），不关心返回值，
  // 兼容 ElMessageBox.confirm() 这类返回 Promise<MessageBoxData> 的实现
  options: { isDirty: () => boolean; confirm: () => Promise<unknown> },
) {
  pushGuardLog('③ beforeRouteLeave（组件内）', from.path, to.path)
  if (!options.isDirty()) return true
  try {
    await options.confirm()
    return true // 确认离开
  } catch {
    return false // 取消 → 阻止导航
  }
}
