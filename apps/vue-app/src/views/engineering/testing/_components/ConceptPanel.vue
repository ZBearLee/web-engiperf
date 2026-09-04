<script setup lang="ts">
import DemoBlock from '@/components/DemoBlock.vue'
import HintText from '@/components/HintText.vue'
import CodeBlock from '@/components/CodeBlock.vue'
import CompareTable from '@/components/CompareTable.vue'
import type { CompareColumn } from '@/components/CompareTable.vue'
import mockCode from '@/snippets/testing/mock.txt?raw'

/**
 * 概念与三要素：白话讲清"测试是什么" + 三个核心 API + 常用断言 + Mock 替身。
 */
const apiColumns: CompareColumn[] = [
  { prop: 'api', label: '概念', minWidth: 160, tag: true },
  { prop: 'like', label: '像什么', minWidth: 200 },
  { prop: 'example', label: '示例', minWidth: 320 },
]
const conceptRows = [
  { api: 'describe', like: '给一组测试起个"文件夹名"', example: "describe('beforeEnter 守卫', () => {})" },
  { api: 'it', like: '一条具体检查项（"应该能…"）', example: "it('无 vip 重定向', () => {})" },
  { api: 'expect', like: '"我猜结果是这个，对不对？"', example: 'expect(r).toEqual({ path: "/x" })' },
]
const assertRows = [
  { api: 'toBe', like: '严格相等（值 / 引用）', example: 'expect(a).toBe(b)' },
  { api: 'toEqual', like: '结构相等（对象内容一样即可）', example: 'expect(a).toEqual(b)' },
  { api: 'toHaveLength', like: '数组长度', example: 'expect(arr).toHaveLength(20)' },
  { api: 'toHaveBeenCalledWith', like: '函数被怎么调用过', example: 'expect(fn).toHaveBeenCalledWith(...)' },
]
</script>

<template>
  <div>
    <DemoBlock title="测试是什么（白话）">
      <HintText margin>
        你写一个<strong>"预期"</strong>，让电脑自动检查功能有没有按预期工作，不用手动点页面、肉眼看对不对。
        改完代码跑一遍测试 → 秒级知道哪里被改坏了。
      </HintText>
    </DemoBlock>

    <DemoBlock title="三个最核心的概念">
      <CompareTable :columns="apiColumns" :rows="conceptRows" />
    </DemoBlock>

    <DemoBlock title="常用断言">
      <CompareTable :columns="apiColumns" :rows="assertRows" />
    </DemoBlock>

    <DemoBlock title="Mock（替身）—— 测试的关键技巧">
      <HintText margin>
        被测函数依赖数据库 / 网络 / UI 弹窗时，给它一个<strong>"假的东西"</strong>代替真实依赖，只验证函数自己的逻辑。
        <code>vi.fn()</code> 是 Vitest 的"假函数"，能记录"被没被调用、被怎么调用"，还能指定返回值 / 抛错。
      </HintText>
      <CodeBlock :code="mockCode" />
    </DemoBlock>
  </div>
</template>
