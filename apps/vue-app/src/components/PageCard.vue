<script setup lang="ts">
/**
 * PageCard：页面包裹容器（整页一张白卡片）。
 * 适用：专题页 / 表单页等内容结构化页面；首页（卡片流布局）不适用。
 *
 * 与 DemoBlock 的分工：
 * - PageCard 包整页（一页一张），DemoBlock 包页内区块（一屏多张）
 */
defineProps<{
  /** 页面标题（显示在卡片头部；不传则纯内容） */
  title?: string
  /** 头部右侧操作区（配合 slot） */
  description?: string
}>()
</script>

<template>
  <div class="page-card">
    <div v-if="title || $slots.extra" class="page-card__header">
      <div class="page-card__header-main">
        <h1 v-if="title" class="page-card__title">{{ title }}</h1>
        <p v-if="description" class="page-card__desc">{{ description }}</p>
      </div>
      <div v-if="$slots.extra" class="page-card__extra">
        <slot name="extra" />
      </div>
    </div>
    <div class="page-card__body">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  min-height: calc(100vh - 50px - 32px - 4px); /* 视口 - 顶栏 - 内容区 padding */
  box-sizing: border-box;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid #f0f2f5;
  }

  &__title {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    color: #1f2937;
    line-height: 1.4;
  }

  &__desc {
    margin: 4px 0 0;
    font-size: 12.5px;
    color: #9ca3af;
    line-height: 1.6;
  }

  &__extra {
    flex-shrink: 0;
  }
}
</style>
