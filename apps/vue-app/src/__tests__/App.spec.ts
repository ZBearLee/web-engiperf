import { describe, it, expect } from 'vitest'
import type { RouteRecordRaw } from 'vue-router'

import { routes } from '../router/routes'
import { pushGuardLog, getGuardLogs } from '../router/guardLog'

describe('router', () => {
  it('root path redirects to /home', () => {
    const root = routes.find((r) => r.path === '/') as RouteRecordRaw
    expect(root.redirect).toBe('/home')
  })
})

describe('guardLog', () => {
  it('records guard execution in order', () => {
    getGuardLogs().length = 0
    pushGuardLog('beforeEach', '/', '/a')
    pushGuardLog('afterEach', '/a', '/b')
    const logs = getGuardLogs()
    expect(logs).toHaveLength(2)
    // 最新的排在最前
    expect(logs[0].hook).toBe('afterEach')
    expect(logs[1].hook).toBe('beforeEach')
  })

  it('keeps only the latest 20 entries', () => {
    getGuardLogs().length = 0
    for (let i = 0; i < 30; i++) {
      pushGuardLog(`hook-${i}`, '/', '/x')
    }
    expect(getGuardLogs()).toHaveLength(20)
    // 第 30 条（最新）在最前
    expect(getGuardLogs()[0].hook).toBe('hook-29')
  })
})
