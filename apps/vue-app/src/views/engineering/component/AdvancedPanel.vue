<script setup lang="ts">
import DemoBlock from '@/components/DemoBlock.vue'
import HintText from '@/components/HintText.vue'
import CodeBlock from '@/components/CodeBlock.vue'
import CompareTable from '@/components/CompareTable.vue'
import type { CompareColumn } from '@/components/CompareTable.vue'

// 代码示例外置（见 BasicsPanel 同款说明）
import recursiveCode from '@/snippets/component/recursive-tree.txt?raw'
import dynamicCode from '@/snippets/component/keep-alive.txt?raw'
import directiveCode from '@/snippets/component/v-permission.txt?raw'
import teleportCode from '@/snippets/component/teleport-modal.txt?raw'
import namespaceCode from '@/snippets/component/namespace-table.txt?raw'

/**
 * 第四层·高级特性与坑点：递归组件 / 动态组件与 KeepAlive / 自定义指令 / Teleport / 命名空间。
 * 都是"线上项目真实出过事故"的地方。
 */

const pitfalls: CompareColumn[] = [
  { prop: 'pit', label: '坑点', minWidth: 160 },
  { prop: 'why', label: '原因', minWidth: 300 },
  { prop: 'fix', label: '解法', minWidth: 260 },
]
const pitRows = [
  {
    pit: '递归组件不渲染',
    why: 'script setup 无 name，自引用找不到组件',
    fix: 'defineOptions 显式命名',
  },
  {
    pit: 'KeepAlive 不生效',
    why: 'include 匹配组件 name 而非路由 name，而组件没 name',
    fix: 'defineOptions + 路由 name 与组件 name 保持一致的约定',
  },
  {
    pit: '弹层被裁剪/遮挡',
    why: '父容器 overflow:hidden 或 z-index 层叠上下文',
    fix: 'Teleport to body',
  },
  {
    pit: 'v-permission 移除后闪现',
    why: '指令在 mounted 才执行，首帧先渲染了按钮',
    fix: 'v-if + 权限码（指令适合粗暴场景，v-if 更可控）',
  },
]
</script>

<template>
  <div>
    <DemoBlock title="① 递归组件">
      <HintText margin>
        树形菜单、无限级分类、评论楼的标配。子组件引用自身时模板里直接写自己的名字
      </HintText>
      <CodeBlock :code="recursiveCode" />
      <HintText>
        本项目的 SideMenu 目前是单级菜单；将来做 RBAC 动态路由时，菜单数据天然是树形的——那时会把
        SideMenu 升级成真正的递归组件
      </HintText>
    </DemoBlock>

    <DemoBlock title="② 动态组件与 KeepAlive">
      <HintText margin>
        <code>&lt;component :is&gt;</code> 切换组件，<strong
          >KeepAlive 让切走的组件"休眠"而不是销毁</strong
        >—— 表单数据、滚动位置全保留，这正是 TagsView 多标签的底层机制
      </HintText>
      <CodeBlock :code="dynamicCode" />
      <HintText>
        与 v-show 的区别：v-show 是"渲染了但 display:none"（DOM 一直占着内存）； KeepAlive
        是"卸载但缓存 vnode"（内存换性能，可精确控制缓存名单）
      </HintText>
    </DemoBlock>

    <DemoBlock title="③ 自定义指令">
      <HintText margin>
        指令封装的是<strong>"DOM 行为"而非"逻辑"</strong>——逻辑给 composable，DOM
        操作给指令，各归其位
      </HintText>
      <CodeBlock :code="directiveCode" />
    </DemoBlock>

    <DemoBlock title="④ Teleport">
      <HintText margin>
        逻辑留在组件树（事件、状态照常），DOM 搬到指定位置——解决弹层被父容器 overflow/z-index
        影响的问题
      </HintText>
      <CodeBlock :code="teleportCode" />
    </DemoBlock>

    <DemoBlock title="⑤ 命名空间组件">
      <HintText margin>
        <code>Table.Column</code> / <code>Form.Item</code> 这种 API
        形态：层级关系写在使用处，一目了然
      </HintText>
      <CodeBlock :code="namespaceCode" />
      <HintText>
        底层模式是"容器组件通过 provide/inject 收集子组件"——Form 收集所有 Form.Item
        的校验规则统一触发 validate，就是这个模式的经典应用
      </HintText>
    </DemoBlock>

    <DemoBlock title="⑥ 本层坑点速查表">
      <CompareTable :columns="pitfalls" :rows="pitRows" />
      <HintText>
        共同规律：<strong>高级特性出问题，基本都是"渲染位置/时机"和"name/引用"两类</strong>——
        理解组件树与 DOM 树是两棵树（Teleport/KeepAlive 都是在分离这两棵树），一大半坑就自然想通了
      </HintText>
    </DemoBlock>
  </div>
</template>
