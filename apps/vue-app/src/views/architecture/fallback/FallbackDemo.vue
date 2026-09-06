<script setup lang="ts">
import PageCard from '@/components/PageCard.vue'
import DemoBlock from '@/components/DemoBlock.vue'
</script>

<template>
  <PageCard
    title="兜底策略"
    description="容灾与降级：错误边界、三态兜底、降级数据（建设中）"
  >
    <DemoBlock title="建设中">
      <p class="placeholder">本专题正在编写，敬请期待。</p>
    </DemoBlock>
  </PageCard>
</template>

<style scoped lang="scss">
.placeholder {
  margin: 0;
  color: #9ca3af;
  font-size: 13px;
}
</style>
