<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

/**
 * 面包屑：由路由 matched 链自动生成父子层级（父级可点击回跳）
 */
const route = useRoute()

const crumbs = computed(() =>
  route.matched
    .filter((r) => r.meta?.title)
    .map((r) => ({ title: String(r.meta.title), path: r.path })),
)
</script>

<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item v-for="(c, i) in crumbs" :key="c.path">
      <RouterLink v-if="i < crumbs.length - 1" :to="c.path" class="crumb-link">
        {{ c.title }}
      </RouterLink>
      <span v-else class="crumb-current">{{ c.title }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<style scoped lang="scss">
.crumb-link {
  font-size: 13px;
  color: #606266;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #409eff;
  }
}

.crumb-current {
  font-size: 13px;
  color: #1f2937;
  font-weight: 600;
}
</style>
