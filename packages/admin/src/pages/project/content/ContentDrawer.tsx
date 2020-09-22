import React from 'react'
import { useParams, useRequest } from 'umi'
import { useConcent } from 'concent'
import { Form, message, Space, Button, Drawer, Row } from 'antd'
import { createContent, updateContent } from '@/services/content'
import { getFieldFormItem } from './Components'

export const ContentDrawer: React.FC<{
    visible: boolean
    schema: SchemaV2
    onClose: () => void
    onOk: () => void
}> = ({ visible, onClose, onOk, schema }) => {
    const { projectId } = useParams()
    const ctx = useConcent('content')
    const { currentSchema, selectedContent, contentAction } = ctx.state

    const hasLargeContent = schema?.fields?.find(
        (_) => _.type === 'RichText' || _.type === 'Markdown'
    )

    const drawerWidth = hasLargeContent ? '80%' : '40%'

    const initialValues =
        contentAction === 'create'
            ? schema?.fields?.reduce(
                  (prev, field) => ({
                      ...prev,
                      [field.name]: field.defaultValue,
                  }),
                  {}
              )
            : selectedContent

    const { run, loading } = useRequest(
        async (payload: any) => {
            if (contentAction === 'create') {
                await createContent(projectId, currentSchema?.collectionName, payload)
            }

            if (contentAction === 'edit') {
                await updateContent(projectId, currentSchema?.collectionName, payload._id, payload)
            }
        },
        {
            manual: true,
            onError: () => {
                onClose()
                message.error(contentAction === 'create' ? '创建内容失败' : '编辑内容失败')
            },
            onSuccess: () => {
                onOk()
                message.success(contentAction === 'create' ? '创建内容成功' : '更新内容成功')
            },
        }
    )

    console.log(initialValues)

    return (
        <Drawer
            destroyOnClose
            footer={null}
            visible={visible}
            onClose={onClose}
            width={drawerWidth}
            title={`新建【${schema?.displayName}】`}
        >
            <Form
                name="basic"
                layout="vertical"
                initialValues={initialValues}
                onFinish={(v = {}) => run(v)}
            >
                <Row gutter={[24, 24]}>
                    {schema?.fields?.map((filed, index) => getFieldFormItem(filed, index))}
                </Row>

                <Form.Item>
                    <Space size="large">
                        <Button onClick={onClose}>取消</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            确定
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Drawer>
    )
}
