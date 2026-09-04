<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { routes } from '@/router/routes'

const route = useRoute()
const menuRef = ref() // el-menu 实例引用

/** 菜单节点 */
interface MenuNode {
  index: string
  title: string
  icon?: string
  children: MenuNode[]
}

/** 拼接完整路径（子路由空 path = 父路径本身） */
const resolvePath = (base: string, p: string) =>
  p.startsWith('/') ? p : `${base}/${p}`.replace(/\/{2,}/g, '/')

/**
 * 路由表 → 菜单树（递归归一化），规则：
 * - hidden 的不进菜单（动态参数页 / 404）
 * - 无 title 的中间层（如空 path 默认子页）直接上提其子级
 * - 深层动态页（user/:id）天然被 hidden 过滤，菜单只展示到 demo 页一级
 */
function buildMenu(records: RouteRecordRaw[], base = ''): MenuNode[] {
  return [...records]
    .sort((a, b) => Number(a.meta?.order ?? 99) - Number(b.meta?.order ?? 99))
    .flatMap((r) => {
      if (r.meta?.hidden) return []
      const index = resolvePath(base, r.path)
      const kids = buildMenu(r.children ?? [], index).filter((k) => k.title)
      const title = String(r.meta?.title ?? '')
      if (!title) return kids
      return [{ index, title, icon: String(r.meta?.icon ?? '') || undefined, children: kids }]
    })
}

const menu = computed(() => buildMenu(routes))

// 当前激活菜单（动态参数页归到所属 demo 页，如 /architecture/routes/user/42 → /architecture/routes）
const activeIndex = computed(() => {
  if (route.path === '/') return '/'
  const items = menu.value.flatMap((m) => [m, ...m.children].map((n) => n.index))
  const hit = items
    .filter((i) => route.path === i || route.path.startsWith(`${i}/`))
    .sort((a, b) => b.length - a.length)[0]
  return hit ?? route.path
})
// 默认展开当前所属分类
const opened = computed(() => {
  const top = menu.value.find((m) => m.children.some((c) => c.index === activeIndex.value))
  return top ? [top.index] : []
})
// 导航变化时展开所属分类（default-openeds 只在挂载时生效，路由跳转需手动 open）
watch(
  opened,
  ([top]) => {
    if (top) menuRef.value?.open(top)
  },
  { immediate: true },
)
</script>

<template>
  <aside class="sidebar">
    <RouterLink to="/" class="brand">
      <span class="logo">we</span>
      <span class="name">web-engiperf</span>
    </RouterLink>

    <el-menu
      ref="menuRef"
      :default-active="activeIndex"
      :default-openeds="opened"
      :unique-opened="true"
      router
      class="menu"
    >
      <template v-for="item in menu" :key="item.index">
        <el-sub-menu v-if="item.children.length" :index="item.index">
          <template #title>
            <span class="icon">{{ item.icon }}</span>
            <span class="text">{{ item.title }}</span>
          </template>
          <el-menu-item v-for="c in item.children" :key="c.index" :index="c.index">
            {{ c.title }}
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item v-else :index="item.index">
          <span class="icon">{{ item.icon }}</span>
          <span class="text">{{ item.title }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </aside>
</template>

<style scoped lang="scss">
/* 浅色侧边栏：高度与右侧内容区同处 100vh，底边天然对齐 */
.sidebar {
  width: 208px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #ebeef2;
  flex-shrink: 0;

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 50px; /* 与顶栏同高，下边框横线对齐 */
    padding: 0 16px;
    text-decoration: none;
    border-bottom: 1px solid #ebeef2;
    flex-shrink: 0;

    .logo {
      width: 26px;
      height: 26px;
      border-radius: 6px;
      background: linear-gradient(135deg, #409eff, #42b883);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      display: grid;
      place-items: center;
    }

    .name {
      font-weight: 600;
      font-size: 14px;
      color: #1f2937;
    }
  }

  .menu {
    border-right: none;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 8px;
    box-sizing: border-box;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    /* 收紧菜单项高度（默认 56px 太松） */
    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      height: 38px;
      line-height: 38px;
      border-radius: 6px;
      margin-bottom: 2px;

      &:hover {
        background: #f5f7fa;
      }
    }

    :deep(.el-menu-item.is-active) {
      background: #ecf5ff;
      color: #409eff;
    }

    :deep(.el-sub-menu .el-menu .el-menu-item) {
      padding-left: 44px !important;
      min-width: auto;
      height: 34px;
      line-height: 34px;
    }

    .icon {
      margin-right: 8px;
      font-size: 14px;
    }

    .text {
      font-size: 13.5px;
    }
  }
}
</style>
