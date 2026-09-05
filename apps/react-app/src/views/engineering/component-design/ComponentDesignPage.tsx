import { AppstoreOutlined, RightOutlined } from '@ant-design/icons'
import { Card, List, Space, Tag, Typography } from 'antd'

const { Title, Paragraph, Text } = Typography

const plans = [
  '用 React + TSX 复刻「表单 / 列表 / 弹窗」三个基础组件',
  '对比 vue-app 的 <BaseForm /> 写法差异（v-model 双向绑定 vs 受控组件）',
  '抽公共 hooks（useRequest / useTable）对标 vue-app 的 composables',
  '主题与样式方案（Sass 变量 / mixins 对标 vue-app 的 _variables.scss）',
]

/** 对标 vue-app 的 /engineering/component-design，用 React 实现同一套内容做对比 */
export default function ComponentDesignPage() {
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Space align="center" size={10}>
          <AppstoreOutlined style={{ fontSize: 22, color: '#1677ff' }} />
          <Title level={4} style={{ margin: 0 }}>
            组件封装
          </Title>
          <Tag color="blue">对标 vue-app</Tag>
        </Space>
        <Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
          这一页对标 <Text code>/engineering/component-design</Text>，目标是用 React
          实现同一套内容，做 Vue 与 React 的写法对比。
        </Paragraph>
      </Card>

      <Card title="计划清单（待实现）">
        <List
          size="small"
          dataSource={plans}
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
