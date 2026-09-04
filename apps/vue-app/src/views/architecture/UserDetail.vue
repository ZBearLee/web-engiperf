<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DemoBlock from '@/components/DemoBlock.vue'
import HintText from '@/components/HintText.vue'
import PageCard from '@/components/PageCard.vue'
import CompareTable from '@/components/CompareTable.vue'
import type { CompareColumn } from '@/components/CompareTable.vue'

/**
 * props 解耦演示：路由配置 props: true 后，
 * 路由参数 id 直接作为 prop 注入组件——组件内部不再需要 useRoute() 取参数
 */
const props = defineProps<{ id: string }>()

const route = useRoute()
const router = useRouter()

// props.id 是响应式的（路由参数变化时自动更新）——这是 props 解耦优于手动 watch 的地方
const propId = computed(() => props.id)

// 对比：传统方式 useRoute() + watch params（组件复用时手动响应变化）
const routeParamId = ref(String(route.params.id))
watch(
  () => route.params.id,
  (v) => {
    if (v !== undefined) routeParamId.value = String(v)
  },
)

// history.state：编程式导航时通过 state 选项传入，存在浏览器内存里
// 特性：刷新页面后 state 仍在（同一会话），但新开标签页/分享链接就没了
const stateData = computed(() => {
  const s = (window.history.state as Record<string, unknown> | null) ?? {}
  const { from, tip } = s as { from?: string; tip?: string }
  return from || tip ? { from, tip } : null
})

// el-tabs 与 URL query 同步：刷新不丢 tab、后退能回来（真实项目高频写法）
const activeTab = computed({
  get: () => String(route.query.tab ?? 'compare'),
  set: (v: string) => router.replace({ query: { ...route.query, tab: v } }),
})

const paramCols: CompareColumn[] = [
  { prop: 'way', label: '方式', width: 100, tag: true },
  { prop: 'url', label: 'URL 形态', width: 190, code: true },
  { prop: 'write', label: '怎么传', minWidth: 230, code: true },
  { prop: 'read', label: '怎么取', minWidth: 190, code: true },
  { prop: 'refresh', label: '刷新后', width: 190 },
  { prop: 'scene', label: '适用场景', minWidth: 230 },
]
const paramRows = [
  {
    way: 'Path 参数',
    url: '/user/42',
    write: "router.push('/user/42')",
    read: 'route.params.id / props.id',
    refresh: '刷新不丢（就在 URL 里）',
    scene: '资源的唯一标识：详情页 id、分类 slug',
  },
  {
    way: 'Query 参数',
    url: '/user/42?keyword=watch',
    write: "router.push({ path: '/x', query: { keyword } })",
    read: 'route.query.keyword',
    refresh: '刷新不丢（就在 URL 里）',
    scene: '非必须的筛选条件：搜索词、分页页码、排序方式',
  },
  {
    way: 'State 参数',
    url: '/user/42（URL 看不见）',
    write: "router.push({ path: '/x', state: { from } })",
    read: 'window.history.state',
    refresh: '刷新仍在，新开标签页/分享后丢失',
    scene: '不适合暴露在 URL 的数据：来源埋点、表单暂存、敏感信息',
  },
  {
    way: 'Props 解耦',
    url: '/user/42',
    write: '路由配置 props: true',
    read: 'defineProps 接收，组件内直接用 id',
    refresh: '刷新不丢（本质是 path 参数）',
    scene: '组件想脱离路由复用/单测时：不依赖 useRoute，传 prop 即可渲染',
  },
]
</script>

<template>
  <PageCard
    title="动态参数演示"
    description="path / query / state / props 四种传参方式的对比与实验"
  >
    <DemoBlock title="四种传参方式（注意地址栏 ?tab= 的联动）">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="对比总览" name="compare">
          <CompareTable :columns="paramCols" :rows="paramRows" />
        </el-tab-pane>

        <el-tab-pane label="props 解耦" name="props">
          <HintText margin>
            本页路由配置了 <code>props: true</code>，所以组件用
            <code>defineProps&lt;{{ '{' }} id: string {{ '}' }}&gt;</code>
            直接拿到参数——对比下方"传统方式"，代码少一半且天然响应式
          </HintText>
          <el-descriptions :column="1" border size="small" class="mt">
            <el-descriptions-item label="props.id（解耦方式，自动响应）">
              <el-tag size="small">{{ propId }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="route.params.id + watch（传统方式）">
              <el-tag size="small" type="warning">{{ routeParamId }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
          <HintText>
            解耦的价值：组件不再 import useRouter/useRoute，拿去别的项目或写单测时直接传 prop 即可——
            <strong>组件与路由解耦是可测试性的基础</strong>
          </HintText>
        </el-tab-pane>

        <el-tab-pane label="state 实验" name="state">
          <HintText margin>
            从"路由专题"页点
            <el-tag size="small" effect="plain">带 state → user/7</el-tag> 按钮过来，
            下表会有数据；直接刷新本页，数据还在（同一标签页会话）；但<strong
              >复制 URL 新开标签页，数据就没了</strong
            >—— state 存在浏览器内存，不随 URL 传播
          </HintText>
          <el-descriptions :column="1" border size="small" class="mt">
            <el-descriptions-item label="window.history.state">
              <template v-if="stateData">
                <el-tag v-for="(v, k) in stateData" :key="k" size="small" type="success" class="mr">
                  {{ k }}: {{ v }}
                </el-tag>
              </template>
              <el-tag v-else size="small" type="info">空（没有 state 数据传入）</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
      </el-tabs>
    </DemoBlock>

    <DemoBlock title="切换不同 id（体验组件复用）">
      <div class="row">
        <el-button
          v-for="i in [1, 2, 3, 42, 100]"
          :key="i"
          size="small"
          @click="$router.push(`/architecture/routes/user/${i}`)"
        >
          user/{{ i }}
        </el-button>
      </div>
      <HintText>
        user/1 → user/2：URL 变了但<strong>组件实例被复用，不重新走 setup</strong>。 传统写法必须
        watch(route.params) 手动刷新（上面黄 tag 一直是活的就是它的功劳）； props 解耦后这个 watch
        都可以省——<code>props.id</code> 自动响应。 忘了处理就是"列表点进去详情不刷新"的经典 bug
      </HintText>
    </DemoBlock>
  </PageCard>
</template>

<style scoped lang="scss">
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.mt {
  margin: 10px 0;
}

.mr {
  margin-right: 8px;
}
</style>
