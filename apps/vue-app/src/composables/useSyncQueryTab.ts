import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * useSyncQueryTab：页内 el-tabs 激活态与 route.query 同步的组合式函数。
 *
 * 为什么抽成 composable（组件封装第一层知识点）：
 * - 这段逻辑在 Routes / ComponentDesign 等多个专题页重复出现 —— 逻辑与视图分离后，任何页面一行接入
 * - 组件里只留 UI（el-tabs），"tab 状态放哪、怎么恢复"变成可复用、可单测的纯逻辑单元
 *
 * 用法：const activeTab = useSyncQueryTab('basic')  →  <el-tabs v-model="activeTab">
 * 默认值 defaultTab：URL 无 ?tab= 时使用的 tab；其余 query 参数原样保留
 */
export function useSyncQueryTab(defaultTab: string) {
  const route = useRoute()
  const router = useRouter()

  const activeTab = computed<string>({
    get: () => {
      const t = route.query.tab
      return typeof t === 'string' && t ? t : defaultTab
    },
    // set 由 el-tabs 的 v-model 触发：用 replace 不产生历史记录（切 tab 不算"导航"）
    set: (v: string) => router.replace({ query: { ...route.query, tab: v } }),
  })

  return activeTab
}
