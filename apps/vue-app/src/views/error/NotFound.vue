<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="nf">
    <el-result
      icon="warning"
      title="404"
      :sub-title="`路径 ${route.path} 不存在（兜底路由 :pathMatch(.*)* 捕获）`"
    >
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.nf {
  padding-top: 60px;
}
</style>
