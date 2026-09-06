import { Card, Typography } from 'antd'

const { Paragraph } = Typography

export default function FallbackDemoPage() {
  return (
    <Card title="兜底策略" style={{ maxWidth: 920 }}>
      <Paragraph type="secondary">
        容灾与降级：错误边界、三态兜底、降级数据（建设中）。
      </Paragraph>
    </Card>
  )
}
