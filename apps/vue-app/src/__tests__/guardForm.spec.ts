import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { RouteLocationNormalized } from 'vue-router'
import { guardFormBeforeRouteLeave } from '../router/guardHooks'
import { getGuardLogs } from '../router/guardLog'

function makeRoute(path: string): RouteLocationNormalized {
  return { path } as RouteLocationNormalized
}

describe('onBeforeRouteLeave 组件内守卫', () => {
  beforeEach(() => {
    getGuardLogs().length = 0
  })

  it('表单未改动时直接放行，不弹确认框', async () => {
    // 显式类型参数：oxlint 的 vitest/require-mock-type-parameters 要求 mock 标注类型
    const confirm = vi.fn<() => Promise<unknown>>() // 假弹窗：记录有没有被调用
    const result = await guardFormBeforeRouteLeave(
      makeRoute('/other'),
      makeRoute('/architecture/routes/guards/form'),
      { isDirty: () => false, confirm },
    )
    expect(result).toBe(true)
    expect(confirm).not.toHaveBeenCalled()
  })

  it('表单有改动 + 点“离开”→ 放行', async () => {
    const confirm = vi.fn<() => Promise<unknown>>().mockResolvedValue(undefined) // 假弹窗：用户确认
    const result = await guardFormBeforeRouteLeave(
      makeRoute('/other'),
      makeRoute('/architecture/routes/guards/form'),
      { isDirty: () => true, confirm },
    )
    expect(result).toBe(true)
  })

  it('表单有改动 + 点“留下”→ 阻止离开', async () => {
    const confirm = vi.fn<() => Promise<unknown>>().mockRejectedValue(new Error('cancel')) // 假弹窗：用户取消
    const result = await guardFormBeforeRouteLeave(
      makeRoute('/other'),
      makeRoute('/architecture/routes/guards/form'),
      { isDirty: () => true, confirm },
    )
    expect(result).toBe(false)
  })

  it('触发时会向“时序日志”写入一条 beforeRouteLeave 记录', async () => {
    await guardFormBeforeRouteLeave(
      makeRoute('/other'),
      makeRoute('/architecture/routes/guards/form'),
      { isDirty: () => false, confirm: vi.fn<() => Promise<unknown>>() },
    )
    expect(getGuardLogs()[0]?.hook).toContain('beforeRouteLeave')
  })
})
