import { useEffect, useState } from 'react'
import { Button, Card, Space, Tabs, Typography } from 'antd'
import { ApiError, getPending, onPendingChange, request } from '@/utils/request'
import {
  demoDedupe,
  demoError,
  demoInterceptor,
  demoPending,
  demoRetry,
  demoStandard,
  demoUnauthorized,
  getTodo,
} from '@/api/example'

const { Paragraph, Text } = Typography

const baseFeatures = [
  '超时控制：AbortController 统一超时（默认 10s），避免请求永久挂起',
  '重试兜底：指数退避（retryDelay × 2^(n-1)），网络抖动自动重连',
  '智能重试：仅对网络错误 / 超时 / 5xx / 429 重试，4xx 客户端错误不重试',
  '统一错误：ApiError 携带 status 与 url，上层可精确区分处理',
  '全局开关：request.defaults.retry = 2 即可让所有请求默认重试',
]

export default function RequestDemoPage() {
  const [todo, setTodo] = useState<{ id: number; title: string } | null>(null)
  const [retryLog, setRetryLog] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const [extLog, setExtLog] = useState<string[]>([])
  const [pending, setPending] = useState(0)

  // 订阅全局 pending 计数，用于“请求状态”演示
  useEffect(() => onPendingChange(setPending), [])

  const handleNormal = async () => {
    setBusy(true)
    try {
      const data = await getTodo(1)
      setTodo(data)
      setRetryLog([`正常请求成功：拿到 todo #${data.id}`])
    } catch (e) {
      const msg = e instanceof ApiError ? `请求失败 ${e.status ?? ''}`.trim() : (e as Error).message
      setRetryLog([`正常请求出错：${msg}（可能离线，可看“企业级扩展”里的重试演示）`])
    } finally {
      setBusy(false)
    }
  }

  const handleRetry = async () => {
    setBusy(true)
    setRetryLog(['开始请求（模拟前两次网络抖动）…'])
    try {
      const data = await demoRetry((attempt) =>
        setRetryLog((l) => [...l, `第 ${attempt} 次重试（指数退避）`]),
      )
      setRetryLog((l) => [...l, `第 ${data.tried} 次成功，重试兜底生效 ✅`])
    } finally {
      setBusy(false)
    }
  }

  const handleInterceptor = async () => {
    setBusy(true)
    setExtLog([])
    await demoInterceptor((info) =>
      setExtLog([
        '请求发出前，拦截器已注入：',
        `X-Trace-Id = ${info.traceId}`,
        `Authorization = ${info.authorization ?? '（未设置 token）'}`,
      ]),
    )
    setBusy(false)
  }

  const handleStandard = async () => {
    setBusy(true)
    setExtLog([])
    const data = await demoStandard()
    setExtLog([`后端返回 { code:0, data:{...} }，拆包后业务直接拿到 data：`, JSON.stringify(data)])
    setBusy(false)
  }

  const handlePending = async () => {
    setBusy(true)
    setExtLog(['发起请求（约 800ms）…', `请求中 pending = ${getPending()}`])
    await demoPending()
    setExtLog((l) => [...l, `完成，pending = ${getPending()}`])
    setBusy(false)
  }

  const handleDedupe = async () => {
    setBusy(true)
    setExtLog([])
    const { calls } = await demoDedupe()
    setExtLog([`并发两次相同请求，底层实际发出次数 calls = ${calls}（去重生效，防重复提交）`])
    setBusy(false)
  }

  const handleError = async () => {
    setBusy(true)
    setExtLog([])
    const prev = request.defaults.onError
    request.defaults.onError = (e) => setExtLog([`[全局提示] ${e.message}`])
    await demoError()
    request.defaults.onError = prev
    setBusy(false)
  }

  const handleUnauthorized = async () => {
    setBusy(true)
    setExtLog([])
    const prev = request.defaults.onUnauthorized
    request.defaults.onUnauthorized = () =>
      setExtLog((l) => [...l, '[响应拦截] 401 未授权 → 跳转登录页'])
    await demoUnauthorized()
    request.defaults.onUnauthorized = prev
    setBusy(false)
  }

  const baseTab = (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card title="接口请求封装（API 层 / 容灾）">
        <Paragraph style={{ marginTop: 0 }}>
          散落在各组件里的裸 <Text code>fetch</Text> 难以统一处理超时、鉴权、错误提示；而重试 /
          熔断这类兜底逻辑，最适合在唯一的请求出入口里实现一次、全局复用。
        </Paragraph>
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          {baseFeatures.map((f) => (
            <Paragraph key={f} style={{ margin: 0 }}>
              · {f}
            </Paragraph>
          ))}
        </Space>
        <Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>
          封装位置：<Text code>src/utils/request.ts</Text>（基于原生 fetch，零依赖；调用示例见{' '}
          <Text code>src/api/example.ts</Text>）
        </Paragraph>
      </Card>

      <Card title="测试按钮">
        <Paragraph style={{ marginTop: 0, marginBottom: 12 }}>
          “正常请求”走真实接口（需联网）；“重试兜底演示”用自定义 fetcher 模拟前两次失败，离线也能看到自动重连。
        </Paragraph>
        <Space wrap>
          <Button type="primary" loading={busy} onClick={handleNormal}>
            正常请求（需联网）
          </Button>
          <Button onClick={handleRetry}>重试兜底演示（离线可用）</Button>
        </Space>
        {todo && (
          <Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
            结果：<Text code>{JSON.stringify(todo)}</Text>
          </Paragraph>
        )}
        {retryLog.length > 0 && (
          <div style={{ marginTop: 12, background: '#fafafa', borderRadius: 8, padding: 12 }}>
            {retryLog.map((line, i) => (
              <div key={i} style={{ fontSize: 13, fontFamily: 'monospace' }}>
                {line}
              </div>
            ))}
          </div>
        )}
      </Card>
    </Space>
  )

  const extTab = (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card title="企业级扩展维度">
        <Paragraph style={{ marginTop: 0 }}>
          在基础能力之上，中大型应用通常还需要以下增强（均已在 <Text code>request.ts</Text> 内置，可配可调）：
        </Paragraph>
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9 }}>
          <li>请求 / 响应拦截器：注入 token、trace-id，统一处理 401 / 403</li>
          <li>请求取消与去重：路由切换取消（AbortController）、防重复提交（dedupe）</li>
          <li>请求状态管理：pending 计数器联动全局 Loading，无需每组件手写 loading</li>
          <li>响应标准化与类型安全：拆包 {'{ code, data, message }'}，泛型返回 data</li>
          <li>全局错误处理：统一 message 提示，业务代码不再手写 catch</li>
        </ul>
      </Card>

      <Card title="可交互演示">
        <Space wrap>
          <Button onClick={handleInterceptor}>请求拦截器</Button>
          <Button onClick={handleStandard}>响应标准化</Button>
          <Button onClick={handlePending}>请求状态（pending={pending}）</Button>
          <Button onClick={handleDedupe}>去重防重复提交</Button>
          <Button onClick={handleError}>全局错误提示</Button>
          <Button onClick={handleUnauthorized}>401 未授权</Button>
        </Space>
        {extLog.length > 0 && (
          <div style={{ marginTop: 12, background: '#fafafa', borderRadius: 8, padding: 12 }}>
            {extLog.map((line, i) => (
              <div key={i} style={{ fontSize: 13, fontFamily: 'monospace' }}>
                {line}
              </div>
            ))}
          </div>
        )}
      </Card>
    </Space>
  )

  return (
    <Tabs
      defaultActiveKey="base"
      items={[
        { key: 'base', label: '基础能力', children: baseTab },
        { key: 'ext', label: '企业级扩展', children: extTab },
      ]}
    />
  )
}
