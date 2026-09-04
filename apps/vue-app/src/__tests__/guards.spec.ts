import { describe, it, expect, beforeEach } from 'vitest'
import type { RouteLocationNormalized } from 'vue-router'
import { guardFormBeforeEnter } from '../router/guardHooks'
import { getGuardLogs } from '../router/guardLog'

// 造一个最小化的 to 对象（只取 beforeEnter 用到的字段），避免拉起整个路由表/组件
function makeTo(query: Record<string, string>): RouteLocationNormalized {
  return { path: '/architecture/routes/guards/form', query } as RouteLocationNormalized
}

describe('beforeEnter 路由独享守卫', () => {
  // 每个用例前清空全局时序日志，互不干扰
  beforeEach(() => {
    getGuardLogs().length = 0
  })

  it('不带 vip=1 访问 guard-form 时，重定向回守卫 tab', () => {
    const result = guardFormBeforeEnter(makeTo({}))
    expect(result).toEqual({
      path: '/architecture/routes',
      query: { tab: 'guards', blocked: '1' },
    })
  })

  it('带 vip=1 访问 guard-form 时，放行（不返回重定向）', () => {
    const result = guardFormBeforeEnter(makeTo({ vip: '1' }))
    expect(result).toBeUndefined()
  })

  it('拦截时会向“时序日志”写入一条 beforeEnter 记录', () => {
    guardFormBeforeEnter(makeTo({}))
    expect(getGuardLogs()[0]?.hook).toContain('beforeEnter')
  })
})
