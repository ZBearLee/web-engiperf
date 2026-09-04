<script setup lang="ts">
import PageCard from '@/components/PageCard.vue'
import { useSyncQueryTab } from '@/composables/useSyncQueryTab'
import BasicPanel from './_components/BasicPanel.vue'
import GuardsPanel from './_components/GuardsPanel.vue'
import AdvancedPanel from './_components/AdvancedPanel.vue'

/**
 * 路由专题容器：顶部 el-tabs 切换三个子面板。
 * tab 激活态同步逻辑已抽成 useSyncQueryTab 组合式函数（刷新不丢、可分享定位、后退能回来）
 */
const activeTab = useSyncQueryTab('basic')

const tabs = [
  { name: 'basic', label: '基础与传参', component: BasicPanel },
  { name: 'guards', label: '导航守卫与异常', component: GuardsPanel },
  { name: 'advanced', label: '进阶知识（说明篇）', component: AdvancedPanel },
]
</script>

<template>
  <PageCard
    title="路由专题"
    description="history/hash 模式、传参解耦、导航守卫、RBAC、缓存与滚动行为 —— Vue Router 的完整知识图谱"
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane v-for="t in tabs" :key="t.name" :label="t.label" :name="t.name" lazy>
        <component :is="t.component" />
      </el-tab-pane>
    </el-tabs>
  </PageCard>
</template>
