<script setup lang="ts">
/**
 * Hint：区块底部的灰色说明文字（每个 demo 都有的那句"什么时候用"）
 */
defineProps<{ margin?: boolean }>()
</script>

<template>
  <p class="hint" :class="{ 'hint--mb': margin }">
    <slot />
  </p>
</template>

<style scoped lang="scss">
.hint {
  font-size: 12.5px;
  color: #6b7280;
  line-height: 1.7;
  margin: 0;

  &--mb {
    margin-bottom: 10px;
  }

  /* 提示里的链接 */
  :deep(a) {
    color: #409eff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
