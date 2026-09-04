<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DemoBlock from '@/components/DemoBlock.vue'
import HintText from '@/components/HintText.vue'
import CompareTable from '@/components/CompareTable.vue'
import type { CompareColumn } from '@/components/CompareTable.vue'

const router = useRouter()
const route = useRoute()

const userId = ref('42')
const queryKeyword = ref('watch')

const goUser = () => router.push(`/architecture/routes/user/${userId.value}`)
const replaceUser = () => router.replace(`/architecture/routes/user/${userId.value}`)
const goWithQuery = () =>
  router.push({ path: '/architecture/routes/user/7', query: { keyword: queryKeyword.value } })
const goWithState = () =>
  router.push({
    path: '/architecture/routes/user/7',
    state: { from: '路由专题页', tip: 'state 数据只存在内存里，刷新即丢' },
  })
const goBack = () => router.back()

const modeCols: CompareColumn[] = [
  { prop: 'mode', label: '模式', width: 90, tag: true },
  { prop: 'url', label: 'URL 形态', width: 210, code: true },
  { prop: 'base', label: '底层原理', minWidth: 180 },
  { prop: 'pro', label: '优点', minWidth: 140 },
  { prop: 'con', label: '代价', minWidth: 180 },
]
const modeRows = [
  {
    mode: 'history',
    url: '/architecture/routes',
    base: 'History API（pushState / popstate）',
    pro: 'URL 干净、SEO 友好',
    con: '部署需配置 SPA 回退，否则刷新 404',
  },
  {
    mode: 'hash',
    url: '/#/architecture/routes',
    base: 'hashchange 事件（# 后面的部分）',
    pro: '无需服务器配置，怎么刷新都行',
    con: 'URL 带 #，不美观',
  },
]

const navCols: CompareColumn[] = [
  { prop: 'way', label: '方式', width: 80, tag: true },
  { prop: 'code', label: '怎么写', width: 250, code: true },
  { prop: 'essence', label: '本质是什么', minWidth: 170 },
  { prop: 'scene', label: '什么时候用', minWidth: 280 },
]
const navRows = [
  {
    way: '声明式',
    code: '<RouterLink to="/x">详情</RouterLink>',
    essence: '渲染成原生 <a href="/x"> 标签',
    scene: '写死在模板里的跳转：菜单、文字链接（可右键新开标签、SEO 可收录）',
  },
  {
    way: '编程式',
    code: "router.push('/x') / replace / back",
    essence: 'JS 调用 History API 跳转',
    scene: '逻辑代码里的跳转：登录成功后进首页、表单提交后 replace 防止后退重复提交、守卫里重定向',
  },
]

const apiCols: CompareColumn[] = [
  { prop: 'scene', label: '场景', width: 150 },
  { prop: 'options', label: 'Options API（Vue2 时代）', minWidth: 230, code: true },
  { prop: 'comp', label: 'Composition API（本项目用法）', minWidth: 300, code: true },
]
const apiRows = [
  {
    scene: '跳转（编程式导航）',
    options: 'this.$router.push("/x")',
    comp: 'const router = useRouter()  router.push("/x")',
  },
  {
    scene: '取当前路由信息',
    options: 'this.$route.params.id  this.$route.query.k',
    comp: 'const route = useRoute()  route.params.id  route.query.k',
  },
  {
    scene: '监听路由变化',
    options: 'watch: { "$route.params.id"() {} }',
    comp: 'watch(() => route.params.id, () => {})',
  },
]
</script>

<template>
  <div>
    <DemoBlock title="① History 模式 vs Hash 模式">
      <CompareTable :columns="modeCols" :rows="modeRows" />
      <HintText>
        本项目用 history 模式；切换 hash 只需把 <code>createWebHistory</code> 改成
        <code>createWebHashHistory</code>，其余代码不变
      </HintText>
    </DemoBlock>

    <DemoBlock title="② 声明式导航 vs 编程式导航">
      <CompareTable :columns="navCols" :rows="navRows" />
      <div class="try-title">体验区：点按钮看地址栏变化</div>
      <div class="nav-row">
        <RouterLink to="/architecture/routes/user/1">
          <el-button size="small">声明式 → user/1</el-button>
        </RouterLink>
        <el-button size="small" type="primary" @click="goUser">push → user/{{ userId }}</el-button>
        <el-button size="small" type="warning" @click="replaceUser"
          >replace → user/{{ userId }}</el-button
        >
        <el-button size="small" @click="goWithQuery">带 query → user/7</el-button>
        <el-button size="small" @click="goWithState">带 state → user/7</el-button>
        <el-button size="small" @click="goBack">back() 后退</el-button>
        <el-input v-model="userId" size="small" style="width: 100px" placeholder="userId" />
        <el-input v-model="queryKeyword" size="small" style="width: 100px" placeholder="query值" />
      </div>
      <HintText>
        push 压入历史栈（能后退回来）；replace 替换当前记录（后退时跳过本页）；back =
        history.go(-1)。 体验 replace：点"replace"后按 back，不会回到当前页
      </HintText>
    </DemoBlock>

    <DemoBlock title="③ 组合式 API：useRouter / useRoute">
      <HintText margin>
        Vue3 的 setup 里没有 this，必须用组合式函数获取路由。<strong
          >router 是"路由器"（执行跳转的工具）， route 是"当前路由"（响应式的地址信息）</strong
        >——别混用
      </HintText>
      <CompareTable :columns="apiCols" :rows="apiRows" />
      <HintText>
        注意 <code>route</code> 是响应式的：模板里直接用会随地址栏实时更新。
        但<strong>解构会断开响应性</strong>（const { id } = route.params 里的 id 是快照），
        要保持响应需 toRef / computed 或直接 watch(() =&gt; route.params.id)
      </HintText>
    </DemoBlock>

    <DemoBlock title="④ 动态参数与参数传递">
      <HintText>
        path / query / state / props 四种传参方式的完整对比与体验在
        <RouterLink to="/architecture/routes/user/1">动态参数演示页</RouterLink>， 含 state
        刷新丢失实验和 props 解耦
      </HintText>
    </DemoBlock>

    <DemoBlock title="⑤ 路由懒加载">
      <HintText>
        所有页面用 <code>() =&gt; import()</code> 动态导入，编译成独立 chunk，访问时才下载。 打开
        DevTools → Network → 切换左侧菜单，可观察按需加载的 js 文件（性能优化第一课）
      </HintText>
    </DemoBlock>

    <DemoBlock title="⑥ 当前 route 对象（实时联动）">
      <pre class="code thin-scrollbar">{{
        { path: route.path, name: route.name, params: route.params, query: route.query }
      }}</pre>
    </DemoBlock>
  </div>
</template>

<style scoped lang="scss">
.try-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
}

.nav-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}

.code {
  margin: 0;
  padding: 12px 14px;
  background: #1f2937;
  color: #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  overflow: auto;
  max-height: 180px;
}
</style>
