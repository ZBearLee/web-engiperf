<script setup lang="ts">
import PageCard from '@/components/PageCard.vue'
import { useSyncQueryTab } from '@/composables/useSyncQueryTab'
import BasicsPanel from './_components/BasicsPanel.vue'
import DesignPanel from './_components/DesignPanel.vue'
import PerfPanel from './_components/PerfPanel.vue'
import AdvancedPanel from './_components/AdvancedPanel.vue'

/**
 * 组件封装专题：四层知识体系（核心基础 → 进阶设计 → 性能优化 → 高级特性与坑点）。
 * 以本项目真实组件为素材，代码即教材。tab 同步 ?tab=（useSyncQueryTab 复用）。
 */
const activeTab = useSyncQueryTab('basics')

const tabs = [
  { name: 'basics', label: '核心基础', component: BasicsPanel },
  { name: 'design', label: '进阶设计', component: DesignPanel },
  { name: 'perf', label: '性能优化', component: PerfPanel },
  { name: 'advanced', label: '高级特性与坑点', component: AdvancedPanel },
]
</script>

<template>
  <PageCard
    title="组件封装"
    description="四层知识体系：v-model / $attrs / 插槽 / 组合式函数 → 通信选型 / 组件库规范 → 异步组件 / 渲染粒度 → 递归 / KeepAlive / 指令 / Teleport"
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane v-for="t in tabs" :key="t.name" :label="t.label" :name="t.name" lazy>
        <component :is="t.component" />
      </el-tab-pane>
    </el-tabs>
  </PageCard>
</template>
