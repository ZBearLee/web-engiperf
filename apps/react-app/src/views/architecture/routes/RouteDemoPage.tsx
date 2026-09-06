import { RightOutlined } from '@ant-design/icons'
import { Button, Card, Divider, Space, Typography } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'

const { Paragraph, Text } = Typography

// 代码块统一样式
const code = (src: string) => (
  <pre
    style={{
      background: '#f6f8fa',
      padding: 12,
      borderRadius: 6,
      fontSize: 12.5,
      lineHeight: 1.6,
      overflowX: 'auto',
      margin: '8px 0 0',
    }}
  >
    <code>{src}</code>
  </pre>
)

/**
 * 路由专题：总结 react-app 用到的 React Router v7 知识点，并对照 vue-app 的 vue-router 差异。
 * 对标 vue-app 的 RouteDemo.vue（那边是 基础/守卫/进阶 三个 tab 面板）。
 */
export default function RouteDemoPage() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card title="0 · 核心理念：配置式 vs 组件式">
        <Paragraph style={{ marginBottom: 0 }}>
          Vue Router 像一张中央配置表，集中声明 URL 与组件的映射；React Router 本质是 React 组件，用组件树构建路由。
          但 v6.4+ 起 React Router 也提供 <Text code>useRoutes()</Text> 钩子，能用配置式数组（和 Vue 几乎一样）——
          <Text strong>本项目用的就是 useRoutes</Text>。两条路殊途同归。
        </Paragraph>
        {code(`// vue-app：集中配置表
const routes = [{ path: '/user/:id', component: User, name: 'user' }]

// react-app：本项目用 useRoutes 配置式
export const routes: AppRoute[] = [
  { path: '/', element: <BasicLayout />, children: [/* ... */] },
]
// App.tsx: useRoutes(routes)`)}
      </Card>

      <Card title="1 · 路由表与渲染">
        <Paragraph style={{ marginBottom: 0 }}>
          没有“router 实例对象”，路由表是一份普通数组，由 <Text code>useRoutes(routes)</Text> 声明式渲染（见
          App.tsx）。各模块 <Text code>satisfies AppRoute[]</Text> 聚合到{' '}
          <Text code>modules/index.tsx</Text>。
        </Paragraph>
        {code(`// router/modules/index.tsx
export const routes: AppRoute[] = [
  { path: '/', element: <BasicLayout />, children: [
    { index: true, element: <Navigate to="/home" replace /> },
    { path: 'home', element: <HomePage />,
      handle: { title: '首页', icon: <HomeOutlined />, order: 0 } },
    ...architecture, ...engineering, ...performance,
  ]},
]

// App.tsx
import { useRoutes } from 'react-router-dom'
const App = () => useRoutes(routes)`)}
      </Card>

      <Card title="2 · 布局路由与 Outlet">
        <Paragraph style={{ marginBottom: 0 }}>
          父路由挂 <Text code>{'<BasicLayout />'}</Text>，子页渲染到布局里的 <Text code>{'<Outlet />'}</Text>
          （Vue 对应 <Text code>{'<RouterView />'}</Text>）。react-app 只在根 <Text code>/</Text> 挂一次布局，
          各模块只写 children，切换菜单时布局不重挂载。
        </Paragraph>
        {code(`// layouts/BasicLayout.tsx
<Content>
  <Suspense fallback={<Spin />}>
    <Outlet />            {/* 子路由页面渲染在这里 */}
  </Suspense>
</Content>`)}
      </Card>

      <Card title="3 · 菜单从哪来：handle">
        <Paragraph style={{ marginBottom: 0 }}>
          侧边栏、面包屑都由 <Text code>handle</Text> 派生，不手写第二份菜单配置（Vue 对应{' '}
          <Text code>meta</Text>）。<Text code>menu.ts</Text> 递归遍历 routes，把带{' '}
          <Text code>title</Text> 的 handle 变成菜单项。
        </Paragraph>
        {code(`// 路由里只声明一次
handle: { title: '路由专题', icon: <NodeIndexOutlined />, order: 1 }

// menu.ts 自动算菜单项
function buildTree(list) {
  return list.filter(r => r.handle?.title)
    .map(r => ({ key: joinPath(r), title: r.handle.title, icon: r.handle.icon, ... }))
}`)}
      </Card>

      <Card title="4 · 重定向与默认子页">
        <Paragraph style={{ marginBottom: 0 }}>
          没有 <Text code>redirect</Text> 字段，用 <Text code>{'<Navigate>'}</Text> 组件；访问父路径时的默认子页用{' '}
          <Text code>index: true</Text> 路由（Vue 对应 <Text code>path: ''</Text> 空子路由）。
        </Paragraph>
        {code(`{ path: '/', element: <BasicLayout />, children: [
  { index: true, element: <Navigate to="/home" replace /> }, // 访问 / 跳 /home
  { path: 'home', element: <HomePage /> },
] }`)}
      </Card>

      <Card title="5 · 路由级懒加载">
        <Paragraph style={{ marginBottom: 0 }}>
          用 <Text code>React.lazy</Text> 包动态 import，再放进 <Text code>element</Text>；
          <Text strong>必须</Text>配合 <Text code>{'<Suspense>'}</Text> 兜底（Vue 的异步组件不需要这步）。本页自身就是独立 chunk。
        </Paragraph>
        {code(`const RouteDemoPage = lazy(() => import('@/views/architecture/routes/RouteDemoPage'))
// 路由里
{ path: 'routes', element: <RouteDemoPage /> }
// 布局里（兜底）
<Suspense fallback={<Spin />}><Outlet /></Suspense>`)}
      </Card>

      <Card title="6 · 动态参数、传参与监听">
        <Paragraph style={{ marginBottom: 0 }}>
          路径写 <Text code>:id</Text>，组件内用 <Text code>useParams()</Text> 取。注意 React{' '}
          <Text strong>没有</Text> <Text code>props: true</Text> 自动注入——Vue 能把参数注入组件 prop，React 只能 hook 取。
        </Paragraph>
        {code(`// 路由
{ path: 'user/:id', element: <UserDetailPage /> }
// 组件内
const { id } = useParams()`)}

        <Paragraph style={{ marginBottom: 0, marginTop: 12 }}>
          两者都支持 History / Hash 模式。但传参行为不同：React Router 用{' '}
          <Text code>navigate</Text> 携带 <Text code>{'{ state }'}</Text> 的{' '}
          <Text code>state</Text> 在 History 模式下刷新不丢；而 Vue Router 的{' '}
          <Text code>params</Text> 刷新会丢失。
        </Paragraph>
        {code(`// React：state 传参，刷新不丢
navigate('/user/1', { state: { from: 'list' } })
const { state } = useLocation()

// Vue：params 刷新会丢
router.push({ name: 'user', params: { id: 1 } })`)}

        <Paragraph style={{ marginBottom: 0, marginTop: 12 }}>
          监听参数变化：两者都复用组件，动态路由参数变了需手动响应。Vue 推荐{' '}
          <Text code>watch</Text> 或 <Text code>beforeRouteUpdate</Text>；React 函数组件用{' '}
          <Text code>useEffect</Text> 监听 <Text code>useParams()</Text>。
        </Paragraph>
        {code(`// React
const { id } = useParams()
useEffect(() => {
  // id 变化时重新拉数据
}, [id])

// Vue
watch(() => route.params.id, (id) => { /* ... */ })
// 或 beforeRouteUpdate`)}
      </Card>

      <Card title="7 · 编程式导航">
        <Paragraph style={{ marginBottom: 0 }}>
          <Text code>useNavigate()</Text> 跳转、<Text code>useLocation()</Text> 取当前路径（Vue 对应{' '}
          <Text code>useRouter() / useRoute()</Text>）。下面这个面板实时反映当前路由，点按钮即编程式跳转：
        </Paragraph>
        <Divider style={{ margin: '12px 0' }} />
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Text>
            当前路径：<Text code>{pathname}</Text>
          </Text>
          <Space wrap>
            <Button onClick={() => navigate('/engineering/component-design')}>
              去 /engineering/component-design
            </Button>
            <Button onClick={() => navigate('/performance/first-screen')}>
              去 /performance/first-screen
            </Button>
            <Button onClick={() => navigate('/architecture/routes')}>回到本页</Button>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            跳转时左侧布局不重挂载，仅 Outlet 内容替换——这就是布局路由的效果。
          </Text>
        </Space>
        {code(`const navigate = useNavigate()
const { pathname } = useLocation()
navigate('/engineering/component-design')`)}
      </Card>

      <Card title="8 · 路由守卫">
        <Paragraph style={{ marginBottom: 0 }}>
          <Text code>{'<BrowserRouter>'}</Text> + <Text code>useRoutes</Text> 这套没有内置{' '}
          <Text code>beforeEnter / beforeEach</Text>（Vue 有完整守卫体系）。受保护页的等价做法是在{' '}
          <Text code>element</Text> 外面包一层判断组件：
        </Paragraph>
        {code(`// 思路（本项目尚未实现）：登录/权限拦截
element: <RequireAuth><SecretPage /></RequireAuth>
// RequireAuth 内部用 useNavigate() 在条件不满足时拦截`)}
      </Card>

      <Card title="与 vue-app 的关键差异（速查）">
        <Space direction="vertical" size={6} style={{ width: '100%' }}>
          <Space size={8}>
            <RightOutlined style={{ fontSize: 12, color: 'rgba(0,0,0,0.25)' }} />
            <Text>
              <Text code>meta</Text> → <Text code>handle</Text>（菜单元信息）
            </Text>
          </Space>
          <Space size={8}>
            <RightOutlined style={{ fontSize: 12, color: 'rgba(0,0,0,0.25)' }} />
            <Text>
              <Text code>{'<RouterView />'}</Text> → <Text code>{'<Outlet />'}</Text>
            </Text>
          </Space>
          <Space size={8}>
            <RightOutlined style={{ fontSize: 12, color: 'rgba(0,0,0,0.25)' }} />
            <Text>
              <Text code>redirect</Text> → <Text code>{'<Navigate>'}</Text> + <Text code>index</Text> 路由
            </Text>
          </Space>
          <Space size={8}>
            <RightOutlined style={{ fontSize: 12, color: 'rgba(0,0,0,0.25)' }} />
            <Text>
              <Text code>{'() => import()'}</Text> → <Text code>lazy()</Text> + <Text code>{'<Suspense>'}</Text>
            </Text>
          </Space>
        </Space>
        <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 12, marginBottom: 0 }}>
          更完整的对照见 myDocs/09-React路由与Vue路由对照.md。
        </Paragraph>
      </Card>
    </Space>
  )
}
