<script setup lang="ts">
import PageCard from '@/components/PageCard.vue'
import { useSyncQueryTab } from '@/composables/useSyncQueryTab'
import ConceptPanel from './_components/ConceptPanel.vue'
import PracticePanel from './_components/PracticePanel.vue'
import ExperiencePanel from './_components/ExperiencePanel.vue'
import PitfallPanel from './_components/PitfallPanel.vue'

/**
 * 自动化测试专题：本仓库真实测试实践的讲解页（对应 myDocs/03）。
 * 与「组件封装」并列，作为「前端工程化」模块的第二个子模块。
 * tab 同步 ?tab=（复用 useSyncQueryTab）。
 */
const activeTab = useSyncQueryTab('concept')

const tabs = [
  { name: 'concept', label: '概念与三要素', component: ConceptPanel },
  { name: 'practice', label: '本仓库实践', component: PracticePanel },
  { name: 'experience', label: '关键经验', component: ExperiencePanel },
  { name: 'pitfall', label: '踩坑记录', component: PitfallPanel },
]
</script>

<template>
  <PageCard
    title="自动化测试"
    description="用 Vitest 给本项目前后端写单测：三要素 / Mock / 测试清单 / 抽逻辑才好测 / 踩坑"
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane v-for="t in tabs" :key="t.name" :label="t.label" :name="t.name" lazy>
        <component :is="t.component" />
      </el-tab-pane>
    </el-tabs>
  </PageCard>
</template>
