<script setup lang="ts">
import DemoBlock from '@/components/DemoBlock.vue'
import HintText from '@/components/HintText.vue'
import CodeBlock from '@/components/CodeBlock.vue'
import CompareTable from '@/components/CompareTable.vue'
import type { CompareColumn } from '@/components/CompareTable.vue'

// 代码示例外置（见 BasicsPanel 同款说明）
import controlledCode from '@/snippets/component/controlled-input.txt?raw'
import hocCode from '@/snippets/component/hoc-vs-composable.txt?raw'

/**
 * 第二层·进阶设计：通信方式选型 / 组件库规范 / 受控与非受控 / HOC 的替代。
 * 本项目的组件分层表也归入"组件库设计规范"一节。
 */

const commCols: CompareColumn[] = [
  { prop: 'way', label: '方式', width: 150, tag: true },
  { prop: 'scope', label: '作用范围', width: 120 },
  { prop: 'scene', label: '最合适的场景', minWidth: 230 },
  { prop: 'note', label: '注意', minWidth: 210 },
]
const commRows = [
  {
    way: 'props / emit',
    scope: '父子',
    scene: '绝大多数组件通信（数据下行、事件上行）',
    note: '单向数据流，别在子组件里改 prop',
  },
  {
    way: 'v-model',
    scope: '父子',
    scene: '表单类组件的双向绑定（本质是 props+emit 语法糖）',
    note: '多个字段用 v-model:xxx',
  },
  {
    way: 'ref / $parent',
    scope: '父子',
    scene: '父组件直接调用子组件暴露的方法（聚焦、重置）',
    note: '必须 defineExpose，否则拿不到',
  },
  {
    way: 'provide / inject',
    scope: '跨多级',
    scene: '深层后代注入上下文（主题、表单实例收集）',
    note: '响应式数据传 ref 本体而非 .value',
  },
  {
    way: 'mitt（事件总线）',
    scope: '任意',
    scene: '兄弟/无关联组件的一对多通知',
    note: '全局单例，记得 off 否则泄漏',
  },
  {
    way: 'Pinia',
    scope: '全局',
    scene: '跨页面共享状态（登录态、标签页缓存）',
    note: '组件私有状态别进 store',
  },
  { way: '$attrs', scope: '父子', scene: '基础组件透传原生属性', note: '配合 inheritAttrs: false' },
  {
    way: 'slot',
    scope: '父子',
    scene: '父组件控制子组件内部结构的渲染',
    note: '作用域插槽可反向传数据',
  },
]

const layerCols: CompareColumn[] = [
  { prop: 'layer', label: '层级', width: 110, tag: true },
  { prop: 'comp', label: '本项目的组件', minWidth: 200, code: true },
  { prop: 'duty', label: '职责', minWidth: 300 },
]
const layerRows = [
  { layer: '应用层', comp: 'BasicLayout / SideMenu', duty: '应用骨架：布局 + 导航，全局唯一' },
  { layer: '页面层', comp: 'PageCard', duty: '包裹一个页面：标题/描述/操作区 + 卡片容器' },
  { layer: '区块层', comp: 'DemoBlock / HintText / CodeBlock', duty: '页面内的结构单元' },
  { layer: '数据展示层', comp: 'CompareTable', duty: '配置驱动的通用渲染' },
  { layer: '逻辑层', comp: 'useSyncQueryTab 等 composables', duty: '无视图的可复用逻辑' },
]
</script>

<template>
  <div>
    <DemoBlock title="① 组件通信 8 种方式的选型">
      <HintText margin>
        不是背 API，是<strong>按场景选型</strong>——选错方式是大型项目代码腐化的头号原因（比如用
        EventBus 传业务数据）
      </HintText>
      <CompareTable :columns="commCols" :rows="commRows" />
      <HintText>
        决策顺序建议：先问"谁是数据的唯一所有者"——父子直传能解决就 props/emit；
        跨多级且是"上下文"性质用 provide/inject；跨页面共享才上 Pinia；无关联组件的轻量通知才考虑
        mitt
      </HintText>
    </DemoBlock>

    <DemoBlock title="② 组件库设计规范（从组件目录到组件库）">
      <HintText margin>
        本项目的组件分层已经具备组件库雏形——components/ 下的通用组件抽出去就是一个业务组件库的种子
      </HintText>
      <CompareTable :columns="layerCols" :rows="layerRows" />
      <HintText>
        正式组件库再进一步：<strong>monorepo</strong>（pnpm
        workspace，一个组件一个包，正好本项目根目录就是）；
        <strong>构建</strong> vite-plugin-dts 生成 .d.ts；<strong>文档</strong> vitepress + 组件
        demo； <strong>发布</strong> changesets 管版本。Element Plus
        的仓库结构就是完整范本（packages/components、theme、icons 独立发包）
      </HintText>
    </DemoBlock>

    <DemoBlock title="③ 受控 vs 非受控">
      <HintText margin>
        受控（状态在父组件，子组件纯展示）与非受控（状态自己管，通过 ref 暴露方法）不是二选一——
        优秀的基础组件<strong>两者都支持</strong>：传了 v-model 就受控，没传就自管理
      </HintText>
      <CodeBlock :code="controlledCode" />
      <HintText>
        本项目真实案例：el-tabs 的 v-model 是受控（Routes 用它同步 URL）； el-input 不绑 v-model
        也能打字是非受控。判断标准：<strong>这个状态的变更需要通知外界吗</strong>
      </HintText>
    </DemoBlock>

    <DemoBlock title="④ HOC 的消亡：组合式函数替代高阶组件">
      <HintText margin>
        Vue2 用 HOC 做逻辑复用（withLoading(withAuth(Component))），层层嵌套 + this 类型丢失。 Vue3
        的 composables 用普通函数调用替代组件包装
      </HintText>
      <CodeBlock :code="hocCode" />
      <HintText>
        本质：<strong>组件包装解决的是"视图复用"，函数调用解决的是"逻辑复用"</strong>—— Vue3
        把两者拆开后，逻辑复用回归了 JS 本来的样子（调用函数拿返回值），TypeScript 推断全程无损耗
      </HintText>
    </DemoBlock>

    <DemoBlock title="⑤ 什么时候不要封装">
      <HintText margin> 过度封装是更隐蔽的坑，三条经验法则： </HintText>
      <ul class="list">
        <li>
          <strong>只用一次的不抽</strong>：等出现第二次真实复用再抽（YAGNI），避免为想象中的需求设计
          API
        </li>
        <li>
          <strong>props 超过 7 个考虑拆分</strong>：API 面过宽说明职责不清，通常该拆成两个组件或用
          slot 交出控制权
        </li>
        <li>
          <strong>不要为了少写代码把组件做成"万能组件"</strong>：一个组件靠十几个布尔 props
          切换形态，比两个简单组件更难维护
        </li>
      </ul>
      <HintText>
        判断标准不是"能复用就抽"，而是<strong>变更收敛</strong>：如果一类东西将来会一起变（比如全站卡片样式调整），就值得抽成组件让它只有一处定义
      </HintText>
    </DemoBlock>
  </div>
</template>

<style scoped lang="scss">
.list {
  margin: 0 0 8px;
  padding-left: 18px;
  font-size: 13px;
  line-height: 2;
  color: #374151;

  li {
    margin-bottom: 4px;
  }
}
</style>
