<script setup lang="ts">
import DemoBlock from '@/components/DemoBlock.vue'
import HintText from '@/components/HintText.vue'
import CodeBlock from '@/components/CodeBlock.vue'
import CompareTable from '@/components/CompareTable.vue'
import type { CompareColumn } from '@/components/CompareTable.vue'

// 代码示例外置（见 BasicsPanel 同款说明）
import asyncCode from '@/snippets/component/async-component.txt?raw'
import memoCode from '@/snippets/component/v-memo.txt?raw'
import updateCode from '@/snippets/component/update-mechanism.txt?raw'

/**
 * 第三层·性能优化：异步组件 / v-memo 与 v-once / 更新机制 / 组件级懒加载。
 * 这些知识点与性能专题（虚拟列表、长列表）深度联动。
 */

const granularityCols: CompareColumn[] = [
  { prop: 'level', label: '懒加载粒度', width: 130, tag: true },
  { prop: 'how', label: '手段', minWidth: 210, code: true },
  { prop: 'scene', label: '适用场景', minWidth: 300 },
]
const granularityRows = [
  {
    level: '路由级',
    how: '() => import()',
    scene: '整页按需加载（本项目所有 views，Network 面板可见 chunk）',
  },
  {
    level: '组件级',
    how: 'defineAsyncComponent',
    scene: '页面内重型组件：富文本、图表、地图 SDK——首屏用不到就不加载',
  },
  {
    level: '依赖级',
    how: '动态 import() 库',
    scene: "import('echarts') 用到时才下载整个库（配合路由预取策略平衡）",
  },
]
</script>

<template>
  <div>
    <DemoBlock title="① 异步组件与 Suspense">
      <HintText margin>
        路由懒加载是"页面级"分割，<strong>defineAsyncComponent 是"组件级"</strong>—— 首屏 HTML
        里根本没有这个组件的代码，第一次渲染时才开始下载
      </HintText>
      <CodeBlock :code="asyncCode" />
      <HintText>
        Suspense 与异步组件常被混谈：<strong
          >Suspense 编排的是"异步依赖就绪"（包括 async setup 的组件）</strong
        >， loadingComponent 处理的是"chunk 下载中"。生产中 Suspense
        仍是实验特性，异步组件已完全稳定——按需选用
      </HintText>
    </DemoBlock>

    <DemoBlock title="② v-memo 与 v-once：控制渲染粒度">
      <HintText margin>
        Vue 的细粒度响应式已经很快，这两个指令是给<strong>极端场景</strong>准备的大杀器：跳过 diff
        本身
      </HintText>
      <CodeBlock :code="memoCode" />
      <HintText>
        前置认知：先用 Profiler 确认瓶颈真在"列表项 diff"，再上 v-memo——
        依赖数组写错（漏字段）会导致<strong>该更新的不更新</strong>，比慢更危险。v-once
        只用于真的永远不变的内容（版权信息、静态文案）
      </HintText>
    </DemoBlock>

    <DemoBlock title="③ 组件更新机制与 nextTick">
      <HintText margin>
        一句话版本：<strong>状态变了 → 重新执行 render → diff 新旧 vnode → patch DOM</strong>，
        且更新是异步批量的（同一 tick 内多次改状态只渲染一次）
      </HintText>
      <CodeBlock :code="updateCode" />
      <HintText>
        本项目将持续用这些原理：后面虚拟列表专题会实测"10 万行数据不卡"的完整方案 （时间分片 +
        v-memo + 只渲染可视区）；内存专题会讲 watcher 的清理与泄漏
      </HintText>
    </DemoBlock>

    <DemoBlock title="④ 三种代码分割粒度">
      <CompareTable :columns="granularityCols" :rows="granularityRows" />
      <HintText>
        分割不是越细越好：每个 chunk 都有 HTTP/解析成本，浏览器并发也有限。
        经验值：路由级必做、页面内 500ms 交互后才用的组件做、小工具组件不值得
      </HintText>
    </DemoBlock>
  </div>
</template>
