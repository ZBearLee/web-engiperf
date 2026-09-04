<script setup lang="ts">
import DemoBlock from '@/components/DemoBlock.vue'
import HintText from '@/components/HintText.vue'
import CodeBlock from '@/components/CodeBlock.vue'
import vitestConfigCode from '@/snippets/testing/vitest-config.txt?raw'

/**
 * 踩坑记录：本项目写测试时真实踩过的四个坑 + 解法。
 */
const pitfalls = [
  {
    title: '① Element Plus 的 .css 报错',
    desc: 'Vitest 默认把 node_modules 依赖 externalize 给 Node 原生加载，Element Plus 内部 import base.css 会被 Node 当成未知扩展名。解决：在 vitest.config.ts 加 server.deps.inline: [\'element-plus\']，让它走 Vite 转换。',
  },
  {
    title: '② 循环依赖',
    desc: '测试直接 import 路由模块 → 触发整条组件链 → 加载顺序错乱。解决：把纯逻辑抽到 guardHooks.ts（见「关键经验」）。',
  },
  {
    title: '③ router.resolve("/") 不跟随重定向',
    desc: '它只解析原路径，拿不到 redirect 目标。要验证重定向，直接读路由表配置值（root.redirect）即可。',
  },
  {
    title: '④ 脚手架默认用例会失效',
    desc: '原 App.spec.ts 断言 "You did it!"（Vue 默认欢迎页），页面改了之后就红。测试要跟着真实功能走。',
  },
]
</script>

<template>
  <div>
    <DemoBlock v-for="p in pitfalls" :key="p.title" :title="p.title">
      <HintText>{{ p.desc }}</HintText>
    </DemoBlock>

    <DemoBlock title="坑点① 的具体配置">
      <CodeBlock :code="vitestConfigCode" />
    </DemoBlock>
  </div>
</template>
