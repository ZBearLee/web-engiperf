<script setup lang="ts">
import DemoBlock from '@/components/DemoBlock.vue'
import HintText from '@/components/HintText.vue'
import CompareTable from '@/components/CompareTable.vue'
import type { CompareColumn } from '@/components/CompareTable.vue'

/**
 * 本仓库实践：直接列真实测试文件清单（与 packages 里的 *.spec.ts 一一对应）。
 */
const frontColumns: CompareColumn[] = [
  { prop: 'file', label: '文件', minWidth: 240 },
  { prop: 'what', label: '测什么', minWidth: 340 },
  { prop: 'count', label: '用例', minWidth: 70, tag: true },
]
const frontRows = [
  { file: 'src/__tests__/App.spec.ts', what: '路由表根路径重定向 /home；守卫时序日志入栈顺序、20 条上限', count: '3' },
  { file: 'src/__tests__/guards.spec.ts', what: 'beforeEnter：无 vip 重定向 / 有 vip 放行 / 写入日志', count: '3' },
  { file: 'src/__tests__/guardForm.spec.ts', what: 'onBeforeRouteLeave：未改动放行 / 点离开放行 / 点留下拦截 / 写日志', count: '4' },
]
const backColumns: CompareColumn[] = [
  { prop: 'file', label: '文件', minWidth: 260 },
  { prop: 'what', label: '测什么', minWidth: 360 },
]
const backRows = [
  { file: 'src/__tests__/app.controller.spec.ts', what: '根接口 getHello() 返回 "Hello World!"' },
  { file: 'src/__tests__/products.service.spec.ts', what: 'findAll 偏移分页（skip / totalPages）；findCursor 游标分页（nextCursor / 无下一页为 null）' },
]
</script>

<template>
  <div>
    <DemoBlock title="前端测试清单（共 10 条）">
      <HintText margin>跑 <code>pnpm test:unit</code> 自动收集 <code>src/__tests__/*.spec.ts</code>。</HintText>
      <CompareTable :columns="frontColumns" :rows="frontRows" />
    </DemoBlock>

    <DemoBlock title="后端测试清单（共 4 条）">
      <HintText margin>跑 <code>pnpm test</code> 自动收集 <code>src/__tests__/*.spec.ts</code>。</HintText>
      <CompareTable :columns="backColumns" :rows="backRows" />
    </DemoBlock>
  </div>
</template>
