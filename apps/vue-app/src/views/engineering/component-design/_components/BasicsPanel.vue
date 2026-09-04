<script setup lang="ts">
import DemoBlock from '@/components/DemoBlock.vue'
import HintText from '@/components/HintText.vue'
import CodeBlock from '@/components/CodeBlock.vue'
import CompareTable from '@/components/CompareTable.vue'
import type { CompareColumn } from '@/components/CompareTable.vue'

// 代码示例外置在 src/snippets/component/，用 ?raw 原样导入为字符串：
// 规避「SFC 内嵌 script 闭合标签会提前终止 script 块」的解析冲突（oxlint/eslint/vue-tsc 都不吃这套）
import vmodelCode from '@/snippets/component/v-model.txt?raw'
import attrsCode from '@/snippets/component/attrs.txt?raw'
import slotCode from '@/snippets/component/scoped-slot.txt?raw'
import composableCode from '@/snippets/component/use-sync-query-tab.txt?raw'

/**
 * 第一层·核心基础：v-model 进阶 / $attrs / 插槽 / 组合式函数。
 * 组合式函数的活例子：本页和路由专题页都在用的 useSyncQueryTab 就是"逻辑与视图分离"的产物。
 */

const composableRules: CompareColumn[] = [
  { prop: 'rule', label: '约定', minWidth: 140, tag: true },
  { prop: 'why', label: '为什么', minWidth: 380 },
]
const composableRows = [
  { rule: 'use 开头', why: '社区惯例，工具函数与组合式函数一眼区分' },
  { rule: '只调一次的参数放首位', why: '支持静态分析（IDE 可识别 useXxx(arg) 中的常量依赖）' },
  { rule: '返回 ref/computed 而非裸值', why: '保持响应式链接，调用方解构后仍然活着' },
  {
    rule: '副作用要在 onUnmounted 清理',
    why: '定时器/事件监听不清理就是内存泄漏（后面 GC 专题细讲）',
  },
]
</script>

<template>
  <div>
    <DemoBlock title="① v-model 双向绑定进阶">
      <HintText margin>
        Vue3 的三个变化：默认 prop/event 从 <code>value/input</code> 改为
        <code>modelValue/update:modelValue</code>； <strong>支持同时绑定多个 v-model</strong>；3.4+
        提供 <code>defineModel</code> 语法糖彻底告别模板样板代码
      </HintText>
      <CodeBlock :code="vmodelCode" />
      <HintText>
        设计意义：一个表单组件不再需要 <code>value + @change</code> 拆成两个 prop/事件——
        <strong>每个双向绑定的字段就是一个 v-model</strong>，API 面干净且语义明确
      </HintText>
    </DemoBlock>

    <DemoBlock title="② 透传 Attributes 与 $attrs">
      <HintText margin>
        父组件传入但子组件<strong>未声明为 props</strong
        >的一切（class/style/id/原生事件/aria-*）都在 $attrs 里。 默认自动挂到根元素——这就是为什么给
        <code>&lt;el-button class="mt-4"&gt;</code> 加 class 能生效
      </HintText>
      <CodeBlock :code="attrsCode" />
      <HintText>
        封装基础组件的两难：根元素是 div 但真正该接属性的是里面的 input——<code
          >inheritAttrs: false</code
        >
        + <code>v-bind="$attrs"</code> 手动指定透传目标。Element Plus 的所有组件都是这么处理透传的
      </HintText>
    </DemoBlock>

    <DemoBlock title="③ 插槽的三种用法">
      <HintText margin>
        默认插槽（内容不定）、具名插槽（多个出口）、<strong>作用域插槽（数据反向流动）</strong>。
        作用域插槽是组件封装最精妙的设计：子组件掌握数据，父组件掌握渲染
      </HintText>
      <CodeBlock :code="slotCode" />
      <HintText>
        本项目的 CompareTable 的 tag/code 列配置是"配置化"方案；如果单元格渲染逻辑复杂到配置表达不了
        （比如一列里塞按钮组），就该升级成作用域插槽——<strong
          >配置化管简单场景，插槽管复杂场景，两者互补</strong
        >
      </HintText>
    </DemoBlock>

    <DemoBlock title="④ 组合式函数（Composables）—— Vue3 封装的灵魂">
      <HintText margin>
        逻辑复用从 Vue2 的 mixin（来源不明、命名冲突）进化为<strong>显式函数调用</strong>。 本项目的
        useSyncQueryTab 就是活例子：路由专题页先写的这段逻辑，本页一行接入复用
      </HintText>
      <CodeBlock :code="composableCode" />
      <CompareTable :columns="composableRules" :rows="composableRows" />
      <HintText>
        典型封装清单：<code>useTable</code>（分页/加载/请求合一）、<code>useModal</code>（开关/确认/loading）、
        <code>usePagination</code>——等做虚拟列表专题时，我们会真实封装一个
        <code>useInfiniteScroll</code>
      </HintText>
    </DemoBlock>
  </div>
</template>
