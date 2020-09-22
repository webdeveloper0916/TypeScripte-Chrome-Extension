import React, { useState } from 'react'
import { useParams, useRequest } from 'umi'
import { Button, Modal, Space, message, Form, Input, Select, Checkbox } from 'antd'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { createWebhook, updateWebhook } from '@/services/webhook'
import { getSchemas } from '@/services/schema'

const EventMap = {
    create: '创建内容',
    delete: '删除内容',
    update: '更新内容',
    updateMany: '更新内容[批量]',
    deleteMany: '删除内容[批量]',
}

interface Webhook {
    _id: string
    name: string
    url: string
    method: string
    event: string[]
    collections: any[]
    triggerType: string | 'all'
    headers: { [key: string]: string }[]
}

export const WebhookModal: React.FC<{
    visible: boolean
    action: 'create' | 'edit'
    selectedWebhook?: Webhook
    onClose: () => void
    onSuccess: () => void
}> = ({ visible, onClose, onSuccess, action, selectedWebhook }) => {
    const { projectId } = useParams()
    const [formValue, setFormValue] = useState<any>()
    const { run, loading } = useRequest(
        async (data: Webhook) => {
            if (action === 'create') {
                await createWebhook({
                    payload: data,
                    filter: {
                        projectId,
                    },
                })
            }

            if (action === 'edit') {
                await updateWebhook({
                    filter: {
                        projectId,
                        _id: data._id,
                    },
                    payload: data,
                })
            }

            onSuccess()
        },
        {
            manual: true,
            onError: () => message.error('创建 Webhook 失败'),
            onSuccess: () => message.success('创建 Webhook 成功'),
        }
    )

    // 加载数据库集合
    const { data: schmeas = [], loading: schemaLoading } = useRequest<{ data: SchemaV2[] }>(() =>
        getSchemas(projectId)
    )

    const eventOptions = Object.keys(EventMap).map((key) => ({
        value: key,
        label: EventMap[key],
    }))

    // 复制 webhook
    const initialWebhook = {
        ...selectedWebhook,
        collections: selectedWebhook?.collections.map((_) => _._id),
    }

    return (
        <Modal
            centered
            destroyOnClose
            width={700}
            footer={null}
            title={action === 'create' ? '创建 Webhook' : '编辑 Webhook'}
            visible={visible}
            onOk={() => onClose()}
            onCancel={() => onClose()}
        >
            <Form
                name="basic"
                layout="vertical"
                labelAlign="left"
                labelCol={{ span: 6 }}
                initialValues={action === 'edit' ? initialWebhook : {}}
                onFinish={(v: any = {}) => {
                    v.event = v.triggerType ? [] : v.event
                    v.triggerType = v.triggerType ? 'all' : 'filter'
                    v.collections = schmeas.filter((_) => v.collections.includes(_._id))
                    run(v)
                }}
                onValuesChange={(_, v) => {
                    console.log(v)
                    setFormValue(v)
                }}
            >
                <Form.Item
                    label="Webhook 名称"
                    name="name"
                    rules={[{ required: true, message: '请输入 Webhook 名称！' }]}
                >
                    <Input placeholder="Webhook 名称，如更新通知" />
                </Form.Item>

                <Form.Item label="Webhook 描述" name="description">
                    <Input placeholder="Webhook 描述，如数据更新通知" />
                </Form.Item>

                <Form.Item
                    label="触发 URL"
                    name="url"
                    rules={[{ required: true, message: '请输入 Webhook 触发 URL！' }]}
                >
                    <Input placeholder="Webhook 触发 URL，如 https://cloud.tencent.com" />
                </Form.Item>

                <Form.Item
                    label="监听内容"
                    name="collections"
                    rules={[{ required: true, message: '请选择监听内容！' }]}
                >
                    <Select mode="multiple" loading={schemaLoading}>
                        {schmeas?.map((schema: any) => (
                            <Select.Option key={schema._id} value={schema._id}>
                                {schema.displayName}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    label="触发事件"
                    name="triggerType"
                    valuePropName="checked"
                    rules={[{ required: formValue?.triggerType, message: '请选择触发类型！' }]}
                >
                    <Checkbox>全部事件</Checkbox>
                </Form.Item>
                {((action === 'create' && !formValue?.triggerType) ||
                    (action === 'edit' && selectedWebhook?.triggerType === 'filter')) && (
                    <Form.Item
                        name="event"
                        rules={[{ required: true, message: '请选择触发事件！' }]}
                    >
                        <Checkbox.Group options={eventOptions} />
                    </Form.Item>
                )}

                <Form.Item label="HTTP 方法" name="method">
                    <Select>
                        <Select.Option value="GET">GET</Select.Option>
                        <Select.Option value="POST">POST</Select.Option>
                        <Select.Option value="UPDATE">UPDATE</Select.Option>
                        <Select.Option value="DELETE">DELETE</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item label="HTTP Headers">
                    <Form.List name="headers">
                        {(fields, { add, remove }) => {
                            return (
                                <div>
                                    {fields?.map((field, index) => {
                                        console.log(field)
                                        return (
                                            <Form.Item key={index}>
                                                <Form.Item
                                                    noStyle
                                                    name={[field.name, 'key']}
                                                    validateTrigger={['onChange', 'onBlur']}
                                                >
                                                    <Input
                                                        placeholder="Header Key"
                                                        style={{ width: '40%' }}
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    noStyle
                                                    name={[field.name, 'value']}
                                                    validateTrigger={['onChange', 'onBlur']}
                                                >
                                                    <Input
                                                        placeholder="Header Value"
                                                        style={{ marginLeft: '5%', width: '40%' }}
                                                    />
                                                </Form.Item>
                                                <MinusCircleOutlined
                                                    className="dynamic-delete-button"
                                                    style={{ margin: '0 8px' }}
                                                    onClick={() => {
                                                        remove(field.name)
                                                    }}
                                                />
                                            </Form.Item>
                                        )
                                    })}
                                    <Form.Item>
                                        <Button
                                            type="dashed"
                                            onClick={() => {
                                                add()
                                            }}
                                            style={{ width: '60%' }}
                                        >
                                            <PlusOutlined /> 添加字段
                                        </Button>
                                    </Form.Item>
                                </div>
                            )
                        }}
                    </Form.List>
                </Form.Item>

                <Form.Item>
                    <Space size="large" style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button onClick={() => onClose()}>取消</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            创建
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    )
}
