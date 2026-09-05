import { NodeIndexOutlined, RightOutlined } from '@ant-design/icons'
import { Card, List, Space, Tag, Typography } from 'antd'

const { Title, Paragraph } = Typography

const highlights = [
  '嵌套路由 + 布局路由：本页挂在 BasicLayout 的 Outlet 下，切换菜单布局不重挂载',
  '路由按模块拆分：architecture.tsx / engineering.tsx 各自维护，总入口只负责组装',
  '菜单与面包屑由路由 handle 自动生成，不手写重复配置',
  '路由级懒加载：本页已用 React.lazy 拆成独立 chunk（性能优化演示）',
]

/** 路由专题：对标 vue-app 的 RouteDemo.vue */
export default function RouteDemoPage() {
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Space align="center" size={10}>
          <NodeIndexOutlined style={{ fontSize: 22, color: '#1677ff' }} />
          <Title level={4} style={{ margin: 0 }}>
            路由专题
          </Title>
          <Tag color="blue">对标 vue-app</Tag>
        </Space>
        <Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
          演示路由按模块拆分、嵌套路由与菜单自动生成。当前已落地的能力：
        </Paragraph>
      </Card>

      <Card title="已落地 / 计划">
        <List
          size="small"
          dataSource={highlights}
          renderItem={(item) => (
            <List.Item>
              <Space size={8}>
                <RightOutlined style={{ fontSize: 12, color: 'rgba(0,0,0,0.25)' }} />
                <span>{item}</span>
              </Space>
            </List.Item>
          )}
        />
      </Card>
    </Space>
  )
}
