<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getGuardLogs } from '@/router/guardLog'
import DemoBlock from '@/components/DemoBlock.vue'
import HintText from '@/components/HintText.vue'
import CompareTable from '@/components/CompareTable.vue'
import type { CompareColumn } from '@/components/CompareTable.vue'

const route = useRoute()
const router = useRouter()

// 守卫时序日志（guards.ts 里的 pushGuardLog 写入）
const logs = ref(getGuardLogs())
let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  // 简单轮询刷新（教学演示；真实项目不需要）
  timer = setInterval(() => {
    logs.value = [...getGuardLogs()]
  }, 500)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const blocked = computed(() => route.query.blocked === '1')

const guardCols: CompareColumn[] = [
  { prop: 'kind', label: '类型', width: 100, tag: true },
  { prop: 'api', label: 'API', minWidth: 250, code: true },
  { prop: 'scope', label: '作用范围', width: 130 },
  { prop: 'scene', label: '典型场景', minWidth: 300 },
]
const guardRows = [
  {
    kind: '全局守卫',
    api: 'router.beforeEach / afterEach / beforeResolve',
    scope: '所有路由',
    scene: 'beforeEach：登录校验、权限拦截；afterEach：埋点上报、改标题',
  },
  {
    kind: '路由独享',
    api: '路由配置里的 beforeEnter',
    scope: '仅这一条路由',
    scene: '特定页面的准入校验：协议页必须勾选、内页必须带邀请码',
  },
  {
    kind: '组件内',
    api: 'onBeforeRouteUpdate / onBeforeRouteLeave',
    scope: '仅这个组件',
    scene: '表单未保存拦截离开、参数变化时重新拉数据',
  },
]

// 完整执行顺序（vue-router 官方文档的导航解析流程精简版）
const flowSteps = [
  '导航被触发',
  '① beforeEach（全局前置）',
  '② beforeEnter（路由独享）',
  '③ beforeRouteUpdate（组件内，复用时） / beforeRouteEnter',
  '④ beforeResolve（全局解析）——最后确认机会',
  '导航被确认，DOM 更新',
  '⑤ afterEach（全局后置）——埋点在这里',
]

const errCols: CompareColumn[] = [
  { prop: 'err', label: '异常类型', width: 200, code: true },
  { prop: 'why', label: '什么时候发生', minWidth: 250 },
  { prop: 'how', label: '怎么处理', minWidth: 220 },
]
const errRows = [
  { err: 'NavigationAborted', why: '守卫 return false / 抛错', how: '统一 catch，按需 toast 提示' },
  {
    err: 'NavigationRedirected',
    why: '守卫 return 了新位置（下面的拦截就是）',
    how: '属正常业务逻辑，静默即可',
  },
  {
    err: 'NavigationDuplicated',
    why: '重复导航到当前路由',
    how: 'vue-router 4 已不抛出，无需处理',
  },
]
</script>

<template>
  <div>
    <!-- 拦截提示：被 beforeEnter 重定向回来时出现 -->
    <el-alert
      v-if="blocked"
      title="你被 beforeEnter 路由独享守卫拦截了：不带 ?vip=1 访问 guards/form 会被重定向回本页（看下方日志还原现场）"
      type="warning"
      :closable="true"
      style="margin-bottom: 16px"
    />

    <DemoBlock title="① 三类守卫：作用域与用途">
      <CompareTable :columns="guardCols" :rows="guardRows" />
    </DemoBlock>

    <DemoBlock title="② 一次导航的守卫执行顺序">
      <el-timeline>
        <el-timeline-item
          v-for="(s, i) in flowSteps"
          :key="i"
          :type="i === 0 || i === 5 ? 'info' : 'primary'"
        >
          <span :class="{ dim: i === 0 || i === 5 }">{{ s }}</span>
        </el-timeline-item>
      </el-timeline>
      <HintText>
        记忆法：<strong>全局前置 → 独享 → 组件内 → 全局解析 →（确认）→ 全局后置</strong>。
        beforeResolve 用得少但很关键：所有守卫都通过、导航即将确认前触发，适合做最终校验
      </HintText>
    </DemoBlock>

    <DemoBlock title="③ 时序日志：切换页面看守卫实时执行（最近 20 条）">
      <el-table :data="logs" size="small" class="log-table">
        <el-table-column prop="order" label="#" width="60" />
        <el-table-column prop="hook" label="守卫" width="230">
          <template #default="{ row }">
            <el-tag
              size="small"
              effect="plain"
              :type="
                row.hook.startsWith('①') ? 'primary' : row.hook.startsWith('⑤') ? 'success' : 'info'
              "
            >
              {{ row.hook }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="from" label="from" min-width="180">
          <template #default="{ row }"
            ><code>{{ row.from }}</code></template
          >
        </el-table-column>
        <el-table-column prop="to" label="to" min-width="180">
          <template #default="{ row }"
            ><code>{{ row.to }}</code></template
          >
        </el-table-column>
        <el-table-column prop="time" label="时间" width="110" />
      </el-table>
      <HintText>
        本项目在 beforeEach / beforeResolve / afterEach（全局）、beforeEnter（路由独享）、
        onBeforeRouteLeave（组件内）里都埋了日志。你每切一次页面，这里就多条记录——
        试着点下面按钮进入 form 页再切走，能看到完整的
        <strong>① → ② → ③ → ④ → ⑤</strong> 时序
      </HintText>
    </DemoBlock>

    <DemoBlock title="④ 体验：beforeEnter 拦截 + 组件内守卫">
      <div class="nav-row">
        <el-button
          size="small"
          type="danger"
          @click="router.push('/architecture/routes/guards/form')"
        >
          无 vip 访问 form（被拦截）
        </el-button>
        <el-button
          size="small"
          type="primary"
          @click="router.push('/architecture/routes/guards/form?vip=1')"
        >
          带 vip=1 访问 form（放行）
        </el-button>
      </div>
      <HintText>
        第一个按钮会看到：日志里 beforeEach →
        <strong>beforeEnter 返回了新位置 → 导航被重定向</strong>，页面跳回本页并出现黄色提示条。
        第二个按钮进入 form 页后，在输入框打字不保存直接切走，体验组件内 onBeforeRouteLeave 的拦截。
        另外注意：被拦截时控制台有一条 <code>[router] 导航未完成</code> 警告——这就是下方 push
        异常统一处理在干活
      </HintText>
    </DemoBlock>

    <DemoBlock title="⑤ router.push 的 Promise 与异常">
      <CompareTable :columns="errCols" :rows="errRows" />
      <HintText>
        本项目在 router/guards.ts 里<strong>重写了 router.push 做统一 catch</strong
        >（生产标准做法）， 业务代码再也不用每个调用点写 .catch
      </HintText>
    </DemoBlock>
  </div>
</template>

<style scoped lang="scss">
.nav-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}

.log-table {
  margin-bottom: 12px;

  :deep(.el-table__cell) {
    padding: 8px 0;
  }
}

.dim {
  color: #9ca3af;
}
</style>
