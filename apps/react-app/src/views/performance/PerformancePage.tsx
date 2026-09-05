import { Card, Typography } from 'antd'

const { Title, Paragraph } = Typography

// 前端性能优化 → 性能概览页
// 这个菜单项是在 router/modules/performance.tsx 加一条路由 + 填 handle 后自动生成的，没有手写任何菜单代码。
export default function PerformancePage() {
  return (
    <Card>
      <Title level={4} style={{ marginTop: 0 }}>
        前端性能优化
      </Title>
      <Paragraph style={{ marginBottom: 0 }}>
        这是你新加的菜单。它只出现在路由配置里，侧边栏和面包屑都由 <code>router/modules</code> 的{' '}
        <code>handle</code> 自动生成——你不用碰任何菜单代码。
      </Paragraph>
    </Card>
  )
}
