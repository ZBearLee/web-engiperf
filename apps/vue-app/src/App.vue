<script setup lang="ts">
/**
 * 应用根组件：只负责渲染路由出口。
 * 布局（侧边栏/顶栏）在 layouts/BasicLayout.vue，由路由树的根路由引用 —— App 保持零业务。
 */
</script>

<template>
  <RouterView />
</template>
