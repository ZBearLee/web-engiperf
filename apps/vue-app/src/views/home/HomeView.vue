<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 分类入口卡片
const sections = [
  {
    name: '前端架构',
    desc: '路由设计、状态管理、组件设计模式、API 层封装与容灾',
    icon: '🏗️',
    to: '/architecture/routes',
    tags: ['路由', '状态管理', 'API 层'],
  },
  {
    name: '前端工程化',
    desc: '组件封装、目录规范、构建优化、代码质量与 CI/CD',
    icon: '🧱',
    to: '/engineering/components',
    tags: ['组件封装', '构建', '规范'],
  },
]
</script>

<template>
  <div class="home">
    <h1>首页拿来做性能优化和首屏大数据量渲染</h1>
    <el-row :gutter="16">
      <el-col v-for="s in sections" :key="s.to" :span="8">
        <div class="card" @click="router.push(s.to)">
          <div class="card-head">
            <span class="card-icon">{{ s.icon }}</span>
            <h2>{{ s.name }}</h2>
          </div>
          <p class="desc">{{ s.desc }}</p>
          <div class="tags">
            <el-tag v-for="t in s.tags" :key="t" size="small" type="info" effect="plain">{{
              t
            }}</el-tag>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.home {
  max-width: 920px;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgb(0 0 0 / 6%);
  }

  .card-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;

    .card-icon {
      font-size: 22px;
    }

    h2 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
    }
  }

  .desc {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.7;
    margin: 0 0 12px;
  }

  .tags {
    display: flex;
    gap: 8px;
  }
}
</style>
