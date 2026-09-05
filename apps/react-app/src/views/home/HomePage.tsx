import { Button, Card, Empty, Space, Tag, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { buildMenuTree } from '@/router/menu'
import type { MenuNode } from '@/router/menu'
import { useCounterStore } from '@/stores/useCounterStore'

const { Title, Paragraph, Text } = Typography

const techStack = ['Vite 8', 'React 19', 'TypeScript 6', 'React Router 7', 'Zustand', 'Ant Design']

/**
 * 首页：项目说明 + 状态管理演示（Zustand 对标 Pinia）+ 菜单/路由总览。
 * 菜单内容直接取自路由配置（buildMenuTree），不手写任何列表。
 */
export default function HomePage() {
  const navigate = useNavigate()
  const menu = buildMenuTree()
  const { count, increment, reset } = useCounterStore()

  const renderItem = (node: MenuNode) => (
    <div key={node.key} style={{ marginBottom: 8 }}>
      <Space size={8} wrap>
        <Tag
          color="blue"
          style={{ cursor: 'pointer', marginInlineEnd: 0 }}
          onClick={() => navigate(node.key)}
        >
          {node.title}
        </Tag>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {node.key}
        </Text>
      </Space>
      {node.desc && (
        <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginTop: 2 }}>{node.desc}</div>
      )}
    </div>
  )

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Title level={4} style={{ marginTop: 0 }}>
          React 子应用
        </Title>
        <Paragraph style={{ marginBottom: 12 }}>
          位于 <code>apps/react-app</code>，与 <code>apps/vue-app</code> 目录结构对称，用于做 Vue 与
          React 的实现对比。
        </Paragraph>
        <Space wrap size={[8, 8]}>
          {techStack.map((item) => (
            <Tag key={item}>{item}</Tag>
          ))}
        </Space>
      </Card>

      <Card title="状态管理演示 · Zustand（对标 vue-app 的 Pinia）">
        <Space size="large" align="center" wrap>
          <Title level={2} style={{ margin: 0, minWidth: 48 }}>
            {count}
          </Title>
          <Button type="primary" onClick={increment}>
            increment +1
          </Button>
          <Button onClick={reset}>reset</Button>
        </Space>
        <Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>
          全局 store 通过 <code>useCounterStore()</code> hook 消费，无需 Provider 包裹；与 Pinia 的{' '}
          <code>storeToRefs</code> 写法相似，但 React 侧直接解构即可。
        </Paragraph>
      </Card>

      <Card title="菜单与路由">
        {menu.length === 0 ? (
          <Empty description="暂无菜单" />
        ) : (
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            {menu.map((group) => (
              <div key={group.key}>
                <Space size={6} style={{ marginBottom: 6 }}>
                  {group.icon}
                  <Text strong>{group.title}</Text>
                </Space>
                {group.children.length > 0 ? (
                  group.children.map(renderItem)
                ) : (
                  <div>{renderItem(group)}</div>
                )}
              </div>
            ))}
          </Space>
        )}
      </Card>
    </Space>
  )
}
