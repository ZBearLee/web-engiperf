<script setup lang="ts">
import DemoBlock from '@/components/DemoBlock.vue'
import CodeBlock from '@/components/CodeBlock.vue'

/**
 * 说明篇：剩余路由知识点以文字讲解为主（不是每个知识点都值得完整实践）。
 * 核心是"讲清楚是什么、什么时候用、坑在哪"，代码只给关键片段。
 */
const rbacCode = `// 守卫里：未添加过动态路由才添加（否则死循环）
router.beforeEach(async (to) => {
  const userStore = useUserStore()
  if (!userStore.role) return { path: '/login', query: { redirect: to.fullPath } }
  if (!userStore.routesAdded) {
    // 按角色过滤后端返回的路由表，逐条注册
    filterRoutesByRole(asyncRoutes, userStore.role).forEach((r) => router.addRoute('layout', r))
    userStore.routesAdded = true
    return to.fullPath // 重新进入本次导航，让新路由生效
  }
})`

const metaCode = `meta: {
  title: '商品列表',
  keepAlive: true,   // 配合 <KeepAlive :include="cachedViews"> 缓存页面
  roles: ['admin'],  // 与 RBAC 结合：标识可访问角色
  transition: 'slide-right', // 与过渡动画结合：控制切换方向
}`

const transitionCode = `<RouterView v-slot="{ Component }">
  <Transition :name="route.meta.transition ?? 'fade'" mode="out-in">
    <component :is="Component" />
  </Transition>
</RouterView>`

const scrollCode = `const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition        // 前进/后退：还原历史位置
    if (to.hash) return { el: to.hash, top: 70 }   // 锚点：滚到目标并留出顶栏高度
    return { top: 0 }                              // 全新导航：回到顶部
  },
})`

const piniaCode = `// 守卫：记录用户想去哪
if (!userStore.token) return { path: '/login', query: { redirect: to.fullPath } }
// 登录页：成功后送回去
router.push(String(route.query.redirect ?? '/'))`
</script>

<template>
  <div>
    <DemoBlock title="① 路由权限控制（RBAC 模型）">
      <div class="doc">
        <p>
          <strong>经典方案（页面级权限）</strong>：登录后拿到用户角色（role），在
          <code>router.beforeEach</code> 中根据角色<strong>动态生成路由表</strong>，用
          <code>router.addRoute()</code> 添加：
        </p>
        <CodeBlock :code="rbacCode" />
        <p>
          <strong>进阶方案（按钮级权限）</strong
          >：路由只控制"页面能不能进"；页面内的操作按钮（删除/审核/导出）由后端返回的
          <strong>权限码数组</strong
          >控制渲染：<code>v-if="perms.includes('product:delete')"</code>，或封装成
          <code>&lt;PermitButton code="product:delete"&gt;</code>
          组件。核心认知：<strong>前端权限只是体验优化，真正的安全校验必须在后端做</strong>——前端藏掉按钮拦不住直接调接口的人。
        </p>
        <p>
          <strong>实践难点（高频考点）</strong
          >：动态路由存在内存里，<strong>刷新页面后路由表被重置</strong>（router.addRoute
          的结果不持久化），用户会白屏或 404。解法就是上面代码的
          <code>routesAdded</code> 标记：刷新后守卫发现标记丢失（store 也被重置），重新走一遍"拉角色
          → 加路由 → return to.fullPath 重进"的流程。另一个细节：登出时要
          <code>router.removeRoute()</code> 清掉动态路由或直接刷新页面。
        </p>
      </div>
    </DemoBlock>

    <DemoBlock title="② 路由元信息 meta：路由的「配置面板」">
      <div class="doc">
        <p>
          meta
          是挂在路由上的自定义数据，路由表驱动的一切都靠它。本项目已经在用：<code>title</code>（菜单/面包屑/页签）、
          <code>order</code
          >（菜单排序）、<code>hidden</code>（不进菜单）、<code>icon</code>。常见的还有：
        </p>
        <CodeBlock :code="metaCode" />
        <p>
          <strong>keepAlive 的典型收益</strong>：列表页滚动到第 5 页 → 点进详情 → 返回，列表停留在第
          5 页且不重新请求。 注意 <code>&lt;KeepAlive&gt;</code> 的 include 匹配的是<strong
            >组件的 name</strong
          >而非路由 name—— <code>&lt;script setup&gt;</code> 组件默认没有 name，必须用
          <code>defineOptions({ name: 'ProductList' })</code> 声明，这是头号大坑。
        </p>
      </div>
    </DemoBlock>

    <DemoBlock title="③ 路由过渡动画">
      <div class="doc">
        <p>App.vue 里用插槽写法接管组件渲染，套上 Transition：</p>
        <CodeBlock :code="transitionCode" />
        <p>
          <strong>进阶</strong>：用 <code>route.meta.transition</code> 动态指定动画名——详情页设
          <code>slide-right</code>（从右滑入）、返回时设
          <code>slide-left</code>，就有"前进/后退"的方向感。方向可以在
          <code>beforeEach</code> 里对比 to/from 的层级深度自动推断。
          <code>mode="out-in"</code> 让旧页先出再进新页，避免两个页面同时占位导致跳动。
        </p>
      </div>
    </DemoBlock>

    <DemoBlock title="④ 懒加载的进阶：预加载策略">
      <div class="doc">
        <p>
          懒加载解决"首屏不加载所有页面"，代价是<strong>切页时要现场下载 chunk</strong
          >（弱网下白屏等一下）。预加载 = 空闲时提前下载用户可能要去的页面：
        </p>
        <ul class="list">
          <li>
            <strong>Vite/现代构建</strong>：入口 chunk 的依赖会被注入
            <code>&lt;link rel="modulepreload"&gt;</code>，浏览器空闲即预取。也可在模板里写
            <code>&lt;RouterLink :to="..."&gt;</code>（vue-router 会在 hover/出现在视口时通过
            <code>prefetch</code> 提前加载目标 chunk）
          </li>
          <li>
            <strong>webpack 时代</strong>：魔法注释
            <code>import(/* webpackPrefetch: true */ './X.vue')</code>，生成
            <code>&lt;link rel="prefetch"&gt;</code>
          </li>
          <li>
            <strong>数据预取</strong>：<code>router.beforeResolve</code>
            里等异步接口返回再进入页面（进入即可见，无 loading
            闪烁）——本质是把"页面内等数据"前移到"导航中等数据"
          </li>
        </ul>
        <p>
          权衡：预加载太多浪费流量（移动端敏感），策略通常是<strong>只预取一级菜单的落地页</strong>。
        </p>
      </div>
    </DemoBlock>

    <DemoBlock title="⑤ 滚动行为 scrollBehavior">
      <div class="doc">
        <p>
          SPA 切页默认<strong>继承上一个页面的滚动位置</strong>（因为滚动容器没换）。在 createRouter
          里配置：
        </p>
        <CodeBlock :code="scrollCode" />
        <p>
          <code>savedPosition</code> 只在浏览器前进/后退时有值（来自 history 栈），配合 KeepAlive
          就是完整的"返回列表还在原位"体验。 注意：若组件没缓存（keepAlive
          没开），滚动位置还原了但数据重新请求，体验照样断裂——所以滚动行为和缓存必须一起设计。
        </p>
      </div>
    </DemoBlock>

    <DemoBlock title="⑥ 路由与 Pinia 联动">
      <div class="doc">
        <p>两个经典模式：</p>
        <p>
          <strong>守卫里用 store</strong>：必须在守卫回调<strong>内部</strong>调用
          <code>useUserStore()</code>（Pinia 在 app.use(pinia) 之前 router/index.ts 被
          import，顶层调用会报 "no active Pinia"）。这也是为什么守卫要拆成
          <code>setupGuards(router)</code> 延迟注册——模块加载顺序问题在大型项目里是真实痛点。
        </p>
        <p><strong>登录后跳回原页</strong>：守卫发现未登录，把目标存进 query 或 store：</p>
        <CodeBlock :code="piniaCode" />
        <p>
          用 query 存的好处：登录页刷新后 redirect 不丢（store 会丢，除非配 pinia 持久化插件）。
        </p>
      </div>
    </DemoBlock>

    <DemoBlock title="⑦ 应用级导航：TagsView 多标签（概念）">
      <div class="doc">
        <p>管理系统的顶栏一排可关闭页签（访问过的页面都在）。四个要点：</p>
        <ul class="list">
          <li>
            <strong>数据结构</strong>：Pinia 存 <code>visitedTabs</code> 数组，watch route
            去重入列；首页 tab 固定不可关
          </li>
          <li>
            <strong>缓存策略</strong>：tab 未关闭 = KeepAlive include 里有它；关 tab =
            移出缓存销毁组件
          </li>
          <li>
            <strong>动态参数聚合</strong>：<code>user/1</code>、<code>user/2</code> 必须合并成一个
            tab（按路由 name 判重而非 fullPath），否则 tab 爆炸
          </li>
          <li>
            <strong>组件 name 规范</strong>：KeepAlive 依赖组件 name，与路由 name
            保持一致是最省心的约定
          </li>
        </ul>
      </div>
    </DemoBlock>
  </div>
</template>

<style scoped lang="scss">
.doc {
  font-size: 13px;
  line-height: 1.9;
  color: #374151;

  p {
    margin: 0 0 10px;
  }

  strong {
    color: #1f2937;
  }

  .list {
    margin: 0 0 10px;
    padding-left: 18px;

    li {
      margin-bottom: 6px;
    }
  }
}
</style>
