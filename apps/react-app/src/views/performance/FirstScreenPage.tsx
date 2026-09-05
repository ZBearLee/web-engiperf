import { Card, Typography } from 'antd'

const { Title, Paragraph } = Typography

export default function FirstScreenPage() {
  return (
    <Card>
      <Title level={4} style={{ marginTop: 0 }}>
        首屏渲染
      </Title>
      <Paragraph style={{ marginBottom: 0 }}>
        这是「前端性能优化」下的子菜单，直接在 performance 路由模块里加一项生成的。
      </Paragraph>
    </Card>
  )
}
