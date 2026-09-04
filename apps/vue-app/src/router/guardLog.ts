/**
 * 守卫执行时序日志（教学用）：
 * 独立成模块而非挂在 router 实例上——它是纯状态（日志数组 + 读写函数），
 * 与路由创建逻辑无关，守卫页和守卫本身都要引用它
 */
export interface GuardLog {
  order: number
  hook: string // beforeEach / beforeEnter / beforeRouteUpdate / afterEach
  from: string
  to: string
  time: string
}

const MAX_LOGS = 20
let guardOrder = 0
const guardLogs: GuardLog[] = []

export const pushGuardLog = (hook: string, from: string, to: string) => {
  guardLogs.unshift({ order: ++guardOrder, hook, from, to, time: new Date().toLocaleTimeString() })
  if (guardLogs.length > MAX_LOGS) guardLogs.pop()
}

export const getGuardLogs = () => guardLogs
