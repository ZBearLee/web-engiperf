import { Suspense, useState } from 'react'
import { DeploymentUnitOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Layout, Menu, Spin, theme } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { buildBreadcrumb, buildMenuItems } from '@/router/menu'

const { Header, Sider, Content } = Layout

/** 对标 vue-app 的 layouts/BasicLayout.vue：可折叠侧边栏 + 面包屑 + 内容区 */
export default function BasicLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const {
    token: { colorBgContainer, colorBgLayout, borderRadiusLG },
  } = theme.useToken()

  const items = buildMenuItems()
  const crumbs = buildBreadcrumb(pathname)
  // 当前路径所在的一级菜单，用于默认展开对应子菜单
  const openKeys = crumbs[0]?.path ? [crumbs[0].path] : []

  return (
    // 整页固定一屏，不外溢滚动
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      {/* 侧边栏固定，菜单过长时自身滚动 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={200}
        style={{ height: '100vh', overflow: 'auto', borderRight: 0 }}
      >
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 8,
            padding: collapsed ? 0 : '0 16px',
            color: '#fff',
            fontWeight: 600,
            fontSize: 15,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          <DeploymentUnitOutlined style={{ fontSize: 20, flexShrink: 0 }} />
          {!collapsed && <span>web-engiperf</span>}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          items={items}
          selectedKeys={[pathname]}
          defaultOpenKeys={openKeys}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      {/* 右侧列固定一屏，仅内容区滚动 */}
      <Layout style={{ background: colorBgLayout, height: '100vh', overflow: 'hidden' }}>
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '0 12px',
            height: 56,
            lineHeight: '56px',
            background: colorBgContainer,
            borderBottom: '1px solid rgba(5, 5, 5, 0.06)',
          }}
        >
          <Button
            type="text"
            aria-label={collapsed ? '展开菜单' : '收起菜单'}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ width: 40, height: 40, fontSize: 16 }}
          />
          <Breadcrumb items={crumbs.map((c) => ({ title: c.title }))} />
        </Header>

        <Content style={{ padding: 16, overflow: 'auto', flex: 1 }}>
          <div
            style={{
              padding: 20,
              minHeight: '100%',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
            }}
          >
            <Suspense
              fallback={
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <Spin />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
