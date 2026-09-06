<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import PageCard from '@/components/PageCard.vue'
import DemoBlock from '@/components/DemoBlock.vue'
import { ApiError, getPending, onPendingChange, request } from '../../../utils/request'
import {
  demoDedupe,
  demoError,
  demoInterceptor,
  demoPending,
  demoRetry,
  demoStandard,
  demoUnauthorized,
  getTodo,
} from '../../../api/example'

// 默认选中第一个 tab，避免初始空白需点击才显示
const activeTab = ref('base')

const baseFeatures = [
  '超时控制：AbortController 统一超时（默认 10s），避免请求永久挂起',
  '重试兜底：指数退避（retryDelay × 2^(n-1)），网络抖动自动重连',
  '智能重试：仅对网络错误 / 超时 / 5xx / 429 重试，4xx 客户端错误不重试',
  '统一错误：ApiError 携带 status 与 url，上层可精确区分处理',
  '全局开关：request.defaults.retry = 2 即可让所有请求默认重试',
]

const todo = ref<{ id: number; title: string } | null>(null)
const retryLog = ref<string[]>([])
const busy = ref(false)

const extLog = ref<string[]>([])
const pending = ref(0)

// 订阅全局 pending 计数，用于"请求状态"演示
const offPending = onPendingChange((n) => (pending.value = n))
onUnmounted(offPending)

const handleNormal = async () => {
  busy.value = true
  try {
    const data = await getTodo(1)
    todo.value = data
    retryLog.value = [`正常请求成功：拿到 todo #${data.id}`]
  } catch (e) {
    const msg = e instanceof ApiError ? `请求失败 ${e.status ?? ''}`.trim() : (e as Error).message
    retryLog.value = [`正常请求出错：${msg}（可能离线，可看“企业级扩展”里的重试演示）`]
  } finally {
    busy.value = false
  }
}

const handleRetry = async () => {
  busy.value = true
  retryLog.value = ['开始请求（模拟前两次网络抖动）…']
  try {
    const data = await demoRetry((attempt) => {
      retryLog.value = [...retryLog.value, `第 ${attempt} 次重试（指数退避）`]
    })
    retryLog.value = [...retryLog.value, `第 ${data.tried} 次成功，重试兜底生效 ✅`]
  } finally {
    busy.value = false
  }
}

const handleInterceptor = async () => {
  busy.value = true
  extLog.value = []
  await demoInterceptor((info) => {
    extLog.value = [
      '请求发出前，拦截器已注入：',
      `X-Trace-Id = ${info.traceId}`,
      `Authorization = ${info.authorization ?? '（未设置 token）'}`,
    ]
  })
  busy.value = false
}

const handleStandard = async () => {
  busy.value = true
  extLog.value = []
  const data = await demoStandard()
  extLog.value = [`后端返回 { code:0, data:{...} }，拆包后业务直接拿到 data：`, JSON.stringify(data)]
  busy.value = false
}

const handlePending = async () => {
  busy.value = true
  extLog.value = ['发起请求（约 800ms）…', `请求中 pending = ${getPending()}`]
  await demoPending()
  extLog.value = [...extLog.value, `完成，pending = ${getPending()}`]
  busy.value = false
}

const handleDedupe = async () => {
  busy.value = true
  extLog.value = []
  const { calls } = await demoDedupe()
  extLog.value = [`并发两次相同请求，底层实际发出次数 calls = ${calls}（去重生效，防重复提交）`]
  busy.value = false
}

const handleError = async () => {
  busy.value = true
  extLog.value = []
  const prev = request.defaults.onError
  request.defaults.onError = (e) => {
    extLog.value = [`[全局提示] ${e.message}`]
  }
  await demoError()
  request.defaults.onError = prev
  busy.value = false
}

const handleUnauthorized = async () => {
  busy.value = true
  extLog.value = []
  const prev = request.defaults.onUnauthorized
  request.defaults.onUnauthorized = () => {
    extLog.value = [...extLog.value, '[响应拦截] 401 未授权 → 跳转登录页']
  }
  await demoUnauthorized()
  request.defaults.onUnauthorized = prev
  busy.value = false
}
</script>

<template>
  <PageCard
    title="接口请求封装"
    description="统一的 fetch 封装：超时、重试（指数退避）、拦截器、响应标准化与全局错误处理"
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基础能力" name="base">
        <DemoBlock title="接口请求封装（API 层 / 容灾）">
          <p class="desc">
            散落在各组件里的裸 <code>fetch</code> 难以统一处理超时、鉴权、错误提示；而重试 / 熔断这类兜底逻辑，
            最适合在唯一的请求出入口里实现一次、全局复用。
          </p>
          <ul class="features">
            <li v-for="f in baseFeatures" :key="f">{{ f }}</li>
          </ul>
          <p class="meta">
            封装位置：<code>src/utils/request.ts</code>（基于原生 fetch，零依赖；调用示例见
            <code>src/api/example.ts</code>）
          </p>
        </DemoBlock>

        <DemoBlock title="测试按钮">
          <p class="desc">
            “正常请求”走真实接口（需联网）；“重试兜底演示”用自定义 fetcher 模拟前两次失败，离线也能看到自动重连。
          </p>
          <div class="actions">
            <el-button type="primary" :loading="busy" @click="handleNormal">正常请求（需联网）</el-button>
            <el-button @click="handleRetry">重试兜底演示（离线可用）</el-button>
          </div>
          <pre v-if="todo" class="result">{{ JSON.stringify(todo) }}</pre>
          <div v-if="retryLog.length" class="log">
            <div v-for="(line, i) in retryLog" :key="i">{{ line }}</div>
          </div>
        </DemoBlock>
      </el-tab-pane>

      <el-tab-pane label="企业级扩展" name="ext">
        <DemoBlock title="企业级扩展维度">
          <p class="desc">
            在基础能力之上，中大型应用通常还需要以下增强（均已在 <code>request.ts</code> 内置，可配可调）：
          </p>
          <ul class="features">
            <li>请求 / 响应拦截器：注入 token、trace-id，统一处理 401 / 403</li>
            <li>请求取消与去重：路由切换取消（AbortController）、防重复提交（dedupe）</li>
            <li>请求状态管理：pending 计数器联动全局 Loading，无需每组件手写 loading</li>
            <li>响应标准化与类型安全：拆包 { code, data, message }，泛型返回 data</li>
            <li>全局错误处理：统一 message 提示，业务代码不再手写 catch</li>
          </ul>
        </DemoBlock>

        <DemoBlock title="可交互演示">
          <div class="actions">
            <el-button @click="handleInterceptor">请求拦截器</el-button>
            <el-button @click="handleStandard">响应标准化</el-button>
            <el-button @click="handlePending">请求状态（pending={{ pending }}）</el-button>
            <el-button @click="handleDedupe">去重防重复提交</el-button>
            <el-button @click="handleError">全局错误提示</el-button>
            <el-button @click="handleUnauthorized">401 未授权</el-button>
          </div>
          <div v-if="extLog.length" class="log">
            <div v-for="(line, i) in extLog" :key="i">{{ line }}</div>
          </div>
        </DemoBlock>
      </el-tab-pane>
    </el-tabs>
  </PageCard>
</template>

<style scoped lang="scss">
.desc {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.7;
  margin: 0 0 12px;
}

.features {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: #374151;
  line-height: 1.9;
}

.meta {
  font-size: 13px;
  color: #6b7280;
  margin: 12px 0 0;
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.result {
  margin: 12px 0 0;
  font-size: 13px;
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
}

.log {
  margin-top: 12px;
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
  font-family: monospace;
  line-height: 1.8;
}
</style>
