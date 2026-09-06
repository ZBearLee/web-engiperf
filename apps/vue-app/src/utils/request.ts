// 统一的接口请求封装：基于原生 fetch，内置超时、重试（指数退避）与一系列企业级增强。
//
// 设计目标：散落在各组件里的裸 fetch 难以统一处理超时、鉴权、错误提示；而重试 / 熔断 /
// 拦截这类兜底逻辑，最适合在唯一的请求出入口里实现一次、全局复用。
// 业务代码只需关心 data，无需重复处理 loading、code 判断与 catch 提示。

export interface RequestOptions extends RequestInit {
  /** 基础路径，拼在 url 前；不传则取 request.defaults.baseURL */
  baseURL?: string
  /** 拼到 URL 上的查询参数 */
  params?: Record<string, unknown>
  /** 超时时间（毫秒），默认 10000 */
  timeout?: number
  /** 最大重试次数，默认 0（不重试） */
  retry?: number
  /** 重试基础间隔（毫秒）；实际间隔 = retryDelay * 2^(已重试次数-1) */
  retryDelay?: number
  /** 自定义是否重试：返回 true 则重试。默认对网络错误/超时/5xx/429 重试 */
  shouldRetry?: (ctx: RetryContext) => boolean
  /** 可替换的底层请求函数，默认全局 fetch。便于单测与本地模拟失败 */
  fetcher?: typeof fetch
  /** 每次重试前的钩子，可用于埋点 / 日志，attempt 从 1 开始 */
  onRetry?: (attempt: number, error: unknown) => void
  /** 响应标准化：把 { code, data, message } 拆成 data，默认取 request.defaults.unwrap */
  unwrap?: boolean
  /** 相同请求去重：同 key 的并发请求复用同一个 promise（防重复提交） */
  dedupe?: boolean
}

export interface RetryContext {
  /** 即将进行的第几次重试（从 1 开始） */
  attempt: number
  /** 上次失败的原因 */
  error: unknown
  /** 若因 HTTP 状态码失败，带上响应对象 */
  response?: Response
}

/** 统一的请求错误类型，携带状态码 / 业务码与地址，便于上层区分处理 */
export class ApiError extends Error {
  status?: number
  code?: number
  url: string
  cause?: unknown
  constructor(
    message: string,
    opts: { status?: number; code?: number; url: string; cause?: unknown },
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = opts.status
    this.code = opts.code
    this.url = opts.url
    this.cause = opts.cause
  }
}

interface RequestDefaults {
  baseURL: string
  timeout: number
  retry: number
  retryDelay: number
  fetcher: typeof fetch
  /** 取 token，注入 Authorization；返回空则不注入 */
  getToken?: () => string | undefined
  /** 请求拦截：发请求前对 RequestInit 做最后加工（注入 header 等） */
  onRequest?: (url: string, init: RequestInit) => RequestInit
  /** 响应拦截：拿到 Response 后、解析前调用，可触发跳转等副作用 */
  onResponse?: (res: Response, url: string) => void | Promise<void>
  /** 401 未授权回调（如跳转登录） */
  onUnauthorized?: (url: string) => void
  /** 403 无权限回调 */
  onForbidden?: (url: string) => void
  /** 全局错误回调（如弹 message） */
  onError?: (err: ApiError) => void
  /** 响应是否标准化拆包，默认 false */
  unwrap?: boolean
}

interface RequestFn {
  <T = unknown>(url: string, options?: RequestOptions): Promise<T>
  defaults: RequestDefaults
}

function buildUrl(url: string, baseURL: string, params?: Record<string, unknown>): string {
  const base = baseURL.replace(/\/$/, '')
  const path = url.startsWith('/') ? url : `/${url}`
  let full = base ? `${base}${path}` : path
  if (params && Object.keys(params).length) {
    const qs = new URLSearchParams(
      Object.entries(params).reduce<[string, string][]>((acc, [k, v]) => {
        if (v != null) acc.push([k, String(v)])
        return acc
      }, []),
    ).toString()
    full += (full.includes('?') ? '&' : '?') + qs
  }
  return full
}

/** 默认重试策略：网络错误 / 超时 / 5xx / 429 重试；4xx 通常不重试 */
function defaultShouldRetry(ctx: RetryContext): boolean {
  if (ctx.error instanceof TypeError) return true // fetch 网络失败
  if (ctx.error instanceof DOMException && ctx.error.name === 'AbortError') return true
  if (ctx.response && ctx.response.status >= 500) return true
  if (ctx.response && ctx.response.status === 429) return true
  return false
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// —— 全局 pending 计数：用于联动 Loading，无需每个组件手动维护 —— //
let pendingCount = 0
const pendingListeners = new Set<(n: number) => void>()
function changePending(delta: number) {
  pendingCount += delta
  pendingListeners.forEach((l) => l(pendingCount))
}
/** 当前进行中的请求数 */
export function getPending(): number {
  return pendingCount
}
/** 订阅 pending 变化，返回取消订阅函数 */
export function onPendingChange(cb: (n: number) => void): () => void {
  pendingListeners.add(cb)
  return () => {
    pendingListeners.delete(cb)
  }
}

// —— 去重：相同 key 的并发请求只发一次 —— //
const inflight = new Map<string, Promise<unknown>>()

export const request = (async function requestImpl<T = unknown>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    baseURL,
    params,
    timeout = request.defaults.timeout,
    retry = request.defaults.retry,
    retryDelay = request.defaults.retryDelay,
    shouldRetry = defaultShouldRetry,
    fetcher = request.defaults.fetcher,
    onRetry,
    headers,
    unwrap = request.defaults.unwrap,
    dedupe,
    ...rest
  } = options

  const fullUrl = buildUrl(url, baseURL ?? request.defaults.baseURL, params)
  const key = `${(rest.method ?? 'GET').toUpperCase()} ${fullUrl}`
  if (dedupe && inflight.has(key)) return inflight.get(key) as Promise<T>

  const task = (async (): Promise<T> => {
    let attempt = 0
    changePending(1)
    try {
      while (true) {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), timeout)
        try {
          let init: RequestInit = {
            ...rest,
            headers: { 'Content-Type': 'application/json', ...headers },
            signal: controller.signal,
          }
          // 1) 请求拦截：注入 trace-id / token 等
          if (request.defaults.onRequest) init = request.defaults.onRequest(fullUrl, init)
          const res = await fetcher(fullUrl, init)
          // 2) 响应拦截：401 / 403 等统一副作用
          if (request.defaults.onResponse) await request.defaults.onResponse(res, fullUrl)
          if (!res.ok) {
            const err = new ApiError(`请求失败: ${res.status} ${res.statusText}`, {
              status: res.status,
              url: fullUrl,
            })
            if (attempt < retry && shouldRetry({ attempt: attempt + 1, error: err, response: res })) {
              attempt++
              onRetry?.(attempt, err)
              await sleep(retryDelay * 2 ** (attempt - 1))
              continue
            }
            throw err
          }
          const text = await res.text()
          const body = (text ? JSON.parse(text) : {}) as Record<string, unknown>
          // 3) 响应标准化：拆包 { code, data, message } → 业务直接拿到 data
          if (unwrap) {
            const code = body.code
            if (code !== 0 && code !== 200) {
              throw new ApiError((body.message as string) ?? '业务错误', {
                status: res.status,
                code: code as number,
                url: fullUrl,
              })
            }
            return body.data as T
          }
          return body as T
        } catch (err) {
          const isAbort = err instanceof DOMException && err.name === 'AbortError'
          const wrapped: ApiError = isAbort
            ? new ApiError(`请求超时（>${timeout}ms）`, { url: fullUrl, cause: err })
            : err instanceof ApiError
              ? err
              : new ApiError((err as Error)?.message ?? '请求异常', {
                  url: fullUrl,
                  cause: err,
                })
          if (attempt < retry && shouldRetry({ attempt: attempt + 1, error: wrapped })) {
            attempt++
            onRetry?.(attempt, wrapped)
            await sleep(retryDelay * 2 ** (attempt - 1))
            continue
          }
          // 4) 全局错误：交给统一提示层处理
          request.defaults.onError?.(wrapped)
          throw wrapped
        } finally {
          clearTimeout(timer)
        }
      }
    } finally {
      changePending(-1)
    }
  })()

  if (dedupe) {
    inflight.set(key, task)
    task.finally(() => inflight.delete(key))
  }
  return task
}) as RequestFn

request.defaults = {
  baseURL: '',
  timeout: 10000,
  retry: 0,
  retryDelay: 500,
  fetcher: fetch,
  // 默认请求拦截：注入 trace-id，若有 token 再注入 Authorization
  onRequest: (_url, init) => {
    const h = new Headers(init.headers)
    const token = request.defaults.getToken?.()
    if (token) h.set('Authorization', `Bearer ${token}`)
    const traceId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID().slice(0, 8)
        : Math.random().toString(36).slice(2, 10)
    h.set('X-Trace-Id', traceId)
    return { ...init, headers: h }
  },
  // 默认响应拦截：401 / 403 触发对应回调（如跳转登录 / 提示无权限）
  onResponse: (res, url) => {
    if (res.status === 401) request.defaults.onUnauthorized?.(url)
    if (res.status === 403) request.defaults.onForbidden?.(url)
  },
  unwrap: false,
}

// 便捷方法
export const get = <T = unknown>(url: string, options?: Omit<RequestOptions, 'method'>) =>
  request<T>(url, { ...options, method: 'GET' })

export const post = <T = unknown>(
  url: string,
  body?: unknown,
  options?: Omit<RequestOptions, 'method' | 'body'>,
) =>
  request<T>(url, {
    ...options,
    method: 'POST',
    body: body == null ? undefined : JSON.stringify(body),
  })

export const put = <T = unknown>(
  url: string,
  body?: unknown,
  options?: Omit<RequestOptions, 'method' | 'body'>,
) =>
  request<T>(url, {
    ...options,
    method: 'PUT',
    body: body == null ? undefined : JSON.stringify(body),
  })

export const del = <T = unknown>(url: string, options?: Omit<RequestOptions, 'method'>) =>
  request<T>(url, { ...options, method: 'DELETE' })

/** 工厂：预置 baseURL，得到一组绑定基地址的方法（类似 axios.create） */
export function createHttpClient(baseURL: string, defaults: RequestOptions = {}) {
  return {
    request: <T = unknown>(url: string, options?: RequestOptions) =>
      request<T>(url, { ...defaults, baseURL, ...options }),
    get: <T = unknown>(url: string, options?: Omit<RequestOptions, 'method'>) =>
      request<T>(url, { ...defaults, baseURL, ...options, method: 'GET' }),
    post: <T = unknown>(
      url: string,
      body?: unknown,
      options?: Omit<RequestOptions, 'method' | 'body'>,
    ) =>
      request<T>(url, {
        ...defaults,
        baseURL,
        ...options,
        method: 'POST',
        body: body == null ? undefined : JSON.stringify(body),
      }),
    put: <T = unknown>(
      url: string,
      body?: unknown,
      options?: Omit<RequestOptions, 'method' | 'body'>,
    ) =>
      request<T>(url, {
        ...defaults,
        baseURL,
        ...options,
        method: 'PUT',
        body: body == null ? undefined : JSON.stringify(body),
      }),
    del: <T = unknown>(url: string, options?: Omit<RequestOptions, 'method'>) =>
      request<T>(url, { ...defaults, baseURL, ...options, method: 'DELETE' }),
  }
}


