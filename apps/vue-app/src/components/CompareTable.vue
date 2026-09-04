<script setup lang="ts" generic="T">
/**
 * CompareTable：知识点对比表（专题页最常用的"横排对比"形态）
 * 传入 columns（列定义）+ rows（数据行），自动渲染紧凑小表
 *
 * 用法：
 * <CompareTable :columns="cols" :rows="rows" />
 * cols: [{ prop: 'way', label: '方式', width: 100, tag: true, code: true }]
 */
export interface CompareColumn {
  prop: string
  label: string
  width?: number
  minWidth?: number
  /** 单元格渲染为 el-tag */
  tag?: boolean
  /** 单元格渲染为 code 样式 */
  code?: boolean
}

defineProps<{
  columns: CompareColumn[]
  rows: T[]
  /** 首列 tag 的颜色 */
  tagType?: 'primary' | 'success' | 'warning' | 'info' | 'danger'
}>()
</script>

<template>
  <el-table :data="rows" size="small" class="compare-table">
    <el-table-column
      v-for="col in columns"
      :key="col.prop"
      :prop="col.prop"
      :label="col.label"
      :width="col.width"
      :min-width="col.minWidth"
    >
      <template #default="{ row }">
        <el-tag v-if="col.tag" size="small" effect="plain" :type="tagType ?? 'primary'">
          {{ row[col.prop] }}
        </el-tag>
        <code v-else-if="col.code">{{ row[col.prop] }}</code>
        <template v-else>{{ row[col.prop] }}</template>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped lang="scss">
.compare-table {
  margin-bottom: 12px;

  /* 行高收紧（Element 默认太松） */
  :deep(.el-table__cell) {
    padding: 8px 0;
  }
}
</style>
