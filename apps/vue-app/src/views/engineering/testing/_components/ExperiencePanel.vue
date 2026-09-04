<script setup lang="ts">
import DemoBlock from '@/components/DemoBlock.vue'
import HintText from '@/components/HintText.vue'
import CodeBlock from '@/components/CodeBlock.vue'
import guardHooksCode from '@/snippets/testing/guard-hooks.txt?raw'

/**
 * 关键经验：把守卫逻辑从 .vue / 路由表抽成纯函数，才能脱离 UI 组件链独立测试。
 */
</script>

<template>
  <div>
    <DemoBlock title="把逻辑抽出来才好测">
      <HintText margin>
        <code>beforeEnter</code> / <code>onBeforeRouteLeave</code> 原本内联在路由表 / <code>.vue</code> 里，
        测试一 import 就拉起整条 UI 链（Element Plus → 加载 <code>.css</code> → 报
        <code>Unknown file extension ".css"</code>），甚至循环依赖崩溃。
      </HintText>
      <HintText>
        <strong>解法</strong>：把守卫逻辑抽到独立文件 <code>src/router/guardHooks.ts</code>，
        需要外部依赖（表单是否改动、确认弹窗）的地方用<strong>参数注入</strong>：
      </HintText>
      <CodeBlock :code="guardHooksCode" />
      <HintText>
        <strong>好处</strong>：守卫逻辑可独立测试、可复用、组件也变干净。这是"可测试性驱动重构"的典型例子——
        能测的代码往往结构也更好。
      </HintText>
    </DemoBlock>
  </div>
</template>
