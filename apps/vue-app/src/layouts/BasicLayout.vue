<script setup lang="ts">
import SideMenu from './components/SideMenu.vue'
import BreadcrumbNav from './components/BreadcrumbNav.vue'

/**
 * 基础布局：侧边栏 + 顶栏（面包屑）+ 内容区。
 * 以路由组件身份进入路由树（每个菜单模块的根路由 component 指向这里），
 * 不再写死在 App.vue —— 布局与路由解耦后，可以有无布局的路由（如 404）。
 */
</script>

<template>
  <div class="layout">
    <SideMenu />
    <div class="main">
      <header class="header">
        <BreadcrumbNav />
      </header>
      <main class="content hide-scrollbar">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.layout {
  display: flex;
  height: 100vh;

  .main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  /* 高度与侧边栏品牌区一致（50px），两条横线严格对齐 */
  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 50px;
    padding: 0 20px;
    background: #fff;
    border-bottom: 1px solid #ebeef2;
    flex-shrink: 0;
  }

  .content {
    flex: 1;
    overflow-y: auto;
    /* 唯一滚动入口 */
    padding: 16px 20px;
    background: #f0f2f5;
  }
}
</style>
