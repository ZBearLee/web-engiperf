<script setup lang="ts">
/**
 * DemoBlock：demo 页通用卡片容器（全局视觉基准）
 * 用法：<DemoBlock title="① 标题">内容</DemoBlock>
 */
defineProps<{ title?: string }>()
</script>

<template>
  <section class="demo-block">
    <h2 v-if="title" class="demo-block__title">{{ title }}</h2>
    <slot />
  </section>
</template>

<style scoped lang="scss">
.demo-block {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;

  .demo-block__title {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 12px;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 8px;
    line-height: 1;

    /* 标题前的小色条 */
    &::before {
      content: '';
      width: 3px;
      height: 1em;
      border-radius: 2px;
      background: #409eff;
      flex-shrink: 0;
    }
  }
}
</style>
