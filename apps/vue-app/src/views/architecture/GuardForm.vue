<script setup lang="ts">
import { ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import DemoBlock from '@/components/DemoBlock.vue'
import HintText from '@/components/HintText.vue'
import PageCard from '@/components/PageCard.vue'
import { pushGuardLog } from '@/router/guardLog'

/** 模拟未保存表单 */
const draft = ref('')
const saved = ref('')

const dirty = () => draft.value !== saved.value

/**
 * 组件内守卫：离开当前页前拦截
 * 真实场景：表单有未保存修改、支付流程中途离开、编辑器内容未提交
 */
onBeforeRouteLeave(async (to, from) => {
  pushGuardLog('③ beforeRouteLeave（组件内）', from.path, to.path)
  if (!dirty()) return true
  try {
    await ElMessageBox.confirm('表单有未保存的修改，确定离开吗？', '未保存提示', {
      confirmButtonText: '离开',
      cancelButtonText: '留下',
      type: 'warning',
    })
    return true // 确认离开
  } catch {
    return false // 取消 → 阻止导航
  }
})

const save = () => {
  saved.value = draft.value
}
</script>

<template>
  <PageCard title="组件内守卫实验" description="在表单里输入内容后直接切走，体验 onBeforeRouteLeave 的拦截">
    <DemoBlock title="组件内守卫：表单未保存拦截">
      <HintText margin>
        在输入框里打几个字（不点保存），然后点左侧菜单去别的页面——会弹确认框。 这就是
        <code>onBeforeRouteLeave</code>，作用域仅限本组件
      </HintText>
      <el-input v-model="draft" type="textarea" :rows="3" placeholder="模拟表单内容，随便输入点什么然后直接切走试试"
        style="max-width: 480px" />
      <div class="row">
        <el-button size="small" type="primary" @click="save">保存</el-button>
        <el-tag v-if="dirty()" size="small" type="danger">有未保存修改</el-tag>
        <el-tag v-else size="small" type="success">已同步</el-tag>
      </div>
      <HintText>
        同族 API：<code>onBeforeRouteUpdate</code> 在"同路由参数变化"时触发（如 user/1 → user/2），
        常用于重新拉取详情数据；它和 watch(route.params) 能干同样的事，但语义更明确且能取消导航
      </HintText>
    </DemoBlock>
  </PageCard>
</template>

<style scoped lang="scss">
.row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}
</style>
