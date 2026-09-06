// 接口调用示例：演示如何用封装发请求，以及如何借助各项增强做兜底。
import { get, request } from '../utils/request'

// 1) 正常业务请求：用公开接口演示（需联网；真实项目可改成本地 vite proxy 地址）
export const getTodo = (id: number) =>
  get<{ id: number; title: string; completed: boolean }>(`/todos/${id}`, {
    baseURL: 'https://jsonplaceholder.typicode.com',
  })

// 2) 重试兜底演示：用自定义 fetcher 模拟“前两次失败、第三次成功”
export async function demoRetry(onRetry?: (attempt: number) => void) {
  let n = 0
  const flakyFetcher: typeof fetch = async (_input, _init) => {
    n += 1
    if (n < 3) throw new TypeError('模拟网络抖动')
    return new Response(JSON.stringify({ ok: true, tried: n }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return request<{ ok: boolean; tried: number }>('/demo', {
    fetcher: flakyFetcher,
    retry: 3,
    retryDelay: 300,
    onRetry: (attempt) => onRetry?.(attempt),
  })
}

// 3) 请求拦截器：请求发出前由 defaults.onRequest 注入 trace-id / Authorization
export async function demoInterceptor(
  report: (info: { traceId: string; authorization: string | null }) => void,
) {
  const fetcher: typeof fetch = async (_input, init) => {
    const h = new Headers(init?.headers)
    report({ traceId: h.get('X-Trace-Id') ?? '', authorization: h.get('Authorization') })
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return request('/demo', { fetcher, retry: 0 })
}

// 4) 响应标准化：约定 { code, data, message }，开启 unwrap 后业务直接拿到 data
export async function demoStandard() {
  const fetcher: typeof fetch = async () =>
    new Response(
      JSON.stringify({ code: 0, data: { name: '张三', age: 20 }, message: 'ok' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  return request<{ name: string; age: number }>('/demo', { fetcher, retry: 0, unwrap: true })
}

// 5) 请求状态：pending 计数器在请求期间 +1，用于全局 Loading（页面用 getPending 订阅）
export async function demoPending() {
  const fetcher: typeof fetch = async () => {
    await new Promise((r) => setTimeout(r, 800))
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return request('/demo', { fetcher, retry: 0 })
}

// 6) 去重：相同 key 的并发请求只发一次（防重复提交）
export async function demoDedupe() {
  let calls = 0
  const fetcher: typeof fetch = async () => {
    calls += 1
    await new Promise((r) => setTimeout(r, 400))
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const p1 = request('/same', { fetcher, retry: 0, dedupe: true })
  const p2 = request('/same', { fetcher, retry: 0, dedupe: true })
  await Promise.all([p1, p2])
  return { calls }
}

// 7) 全局错误提示：网络失败时触发 defaults.onError（由页面注册为提示）
export async function demoError() {
  const fetcher: typeof fetch = async () => {
    throw new TypeError('模拟网络中断')
  }
  try {
    await request('/demo', { fetcher, retry: 0 })
  } catch {
    /* 交给全局 onError 处理 */
  }
}

// 8) 401 未授权：触发响应拦截的 defaults.onUnauthorized（由页面注册为跳转登录）
export async function demoUnauthorized() {
  const fetcher: typeof fetch = async () => new Response('', { status: 401 })
  try {
    await request('/demo', { fetcher, retry: 0 })
  } catch {
    /* 交给响应拦截处理 */
  }
}
