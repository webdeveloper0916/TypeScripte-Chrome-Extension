import React from 'react'
import { useConcent } from 'concent'
import { Layout, Row, Col, Spin, Button, Empty, Space, Typography } from 'antd'
import { SchmeaCtx } from 'typings/store'

import SchemaToolbar from './SchemaToolbar'
import FieldEditorModal from './FieldEditor'
import FieldDeleteModal from './FieldDelete'
import SchemaFieldPicker from './SchemaFieldPicker'
import SchemaFields from './SchemaFields'

const { Content } = Layout

export interface TableListItem {
  key: number
  name: string
  status: string
  updatedAt: number
  createdAt: number
  progress: number
  money: number
}

const SchemaContent: React.FC = () => {
  const ctx = useConcent<{}, SchmeaCtx>('schema')
  const {
    state: { currentSchema, loading, deleteFieldVisible, editFieldVisible },
  } = ctx

  return (
    <>
      <Content className="full-height schema-layout-content">
        {currentSchema?._id ? (
          <Row>
            <Col flex="1 1 auto" />
            <Col flex="0 1 600px">
              <Space className="schema-layout-header">
                <Typography.Title level={3}>{currentSchema.displayName}</Typography.Title>
                <SchemaToolbar />
              </Space>
              <Content>
                <SchemaFields />
              </Content>
            </Col>
            <Col flex="1 1 auto" />
          </Row>
        ) : loading ? (
          <div className="schema-empty">
            <Spin tip="加载中" />
          </div>
        ) : (
          <div className="schema-empty">
            <Empty description="创建你的模型，开始使用 CMS">
              <Button
                type="primary"
                onClick={() => {
                  ctx.mr.createSchema()
                }}
              >
                创建模型
              </Button>
            </Empty>
          </div>
        )}
      </Content>
      <SchemaFieldPicker />

      <FieldEditorModal
        visible={editFieldVisible}
        onClose={() => ctx.setState({ editFieldVisible: false })}
      />

      <FieldDeleteModal
        visible={deleteFieldVisible}
        onClose={() => ctx.setState({ deleteFieldVisible: false })}
      />
    </>
  )
}

export default SchemaContent
