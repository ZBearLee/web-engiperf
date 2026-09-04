<script setup lang="ts">
/**
 * CodeBlock：深色代码块（含细滚动条、限高）
 */
defineProps<{ code: string; maxHeight?: string }>()
</script>

<template>
  <pre class="code thin-scrollbar" :style="maxHeight ? { maxHeight } : undefined">{{ code }}</pre>
</template>

<style scoped lang="scss">
.code {
  margin: 0 0 12px;
  padding: 12px 14px;
  background: #1f2937;
  color: #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.7;
  overflow: auto;
  max-height: 200px;
}
</style>
