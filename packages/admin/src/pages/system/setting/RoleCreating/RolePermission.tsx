import React, { useState } from 'react'
import { useRequest } from 'umi'
import { getSchemas } from '@/services/schema'
import { getProjects } from '@/services/project'
import { Form, Space, Button, Select, Row, Col, message } from 'antd'
import { PlusOutlined, DeleteTwoTone } from '@ant-design/icons'
import { getWebhooks } from '@/services/webhook'

const RolePermission: React.FC<{
    creating: boolean
    initialValues: any
    onConfirm: (...args: any) => void
    onPrevious: () => void
}> = ({ creating, initialValues, onConfirm, onPrevious }) => {
    const [permissionType, setPermissionType] = useState('project')
    const [formValue, setFormValue] = useState<any>({})

    // 加载项目
    const { data: projects = [], loading: projectLoading } = useRequest(() => getProjects(), {
        cacheKey: 'setting-role-project',
    })

    return (
        <Form
            layout="vertical"
            initialValues={initialValues}
            onFinish={(v = {}) => {
                onConfirm(v)
            }}
            onValuesChange={(_: any, v: any) => {
                v.permissions
                    ?.filter((_: any) => _)
                    .forEach((item: any) => {
                        if (item.projectId === '*' || item.service === '*') {
                            item.resource = ['*']
                        }
                    })
                setFormValue(v)
            }}
        >
            <Form.Item label="权限类型" required>
                <Select
                    style={{ width: 200 }}
                    defaultValue={permissionType}
                    onChange={(v: string) => {
                        setPermissionType(v)
                    }}
                >
                    <Select.Option disabled value="system">
                        系统权限 - 暂不支持
                    </Select.Option>
                    <Select.Option value="project">项目权限</Select.Option>
                </Select>
            </Form.Item>
            <Form.Item label="权限规则" required>
                <Form.List name="permissions">
                    {(fields, { add, remove }) => {
                        return (
                            <div>
                                {fields?.map((field, index) => {
                                    const permission = formValue?.permissions?.[field.name]
                                    return (
                                        <Form.Item key={index}>
                                            <Row gutter={24} align="middle">
                                                <Col flex="1 1 auto">
                                                    <Form.Item
                                                        noStyle
                                                        name={[field.name, 'projectId']}
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: '请选择用户角色！',
                                                            },
                                                        ]}
                                                    >
                                                        <Select
                                                            loading={projectLoading}
                                                            placeholder="项目"
                                                        >
                                                            <Select.Option key="all" value="*">
                                                                全部项目
                                                            </Select.Option>
                                                            {projects?.map((project: any) => (
                                                                <Select.Option
                                                                    key={project._id}
                                                                    value={project._id}
                                                                >
                                                                    {project.name}
                                                                </Select.Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                                <Col flex="1 1 auto">
                                                    <Form.Item
                                                        noStyle
                                                        name={[field.name, 'action']}
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: '请选择操作权限！',
                                                            },
                                                        ]}
                                                    >
                                                        <Select mode="multiple" placeholder="操作">
                                                            <Select.Option value="*">
                                                                全部操作
                                                            </Select.Option>
                                                            <Select.Option value="get">
                                                                查询
                                                            </Select.Option>
                                                            <Select.Option value="create">
                                                                创建
                                                            </Select.Option>
                                                            <Select.Option value="update">
                                                                修改
                                                            </Select.Option>
                                                            <Select.Option value="delete">
                                                                删除
                                                            </Select.Option>
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                                <Col flex="0 0 320px">
                                                    <Form.Item
                                                        noStyle
                                                        name={[field.name, 'service']}
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: '请选择项目服务！',
                                                            },
                                                        ]}
                                                    >
                                                        <Select placeholder="项目中的服务">
                                                            <Select.Option value="*">
                                                                全部服务
                                                            </Select.Option>
                                                            <Select.Option value="schema">
                                                                <h4>内容原型</h4>
                                                                <div>
                                                                    内容原型操作，如创建、修改原型等
                                                                </div>
                                                            </Select.Option>
                                                            <Select.Option value="content">
                                                                <h4>内容集合</h4>
                                                                <div>
                                                                    指定内容集合的管理，如创建、修改内容等
                                                                </div>
                                                            </Select.Option>
                                                            <Select.Option value="webhook">
                                                                <h4>Webhook</h4>
                                                                <div>
                                                                    Webhook 管理操作，如创建、修改
                                                                    Webhook 等
                                                                </div>
                                                            </Select.Option>
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                                <Col flex="1 1 auto">
                                                    <Form.Item
                                                        noStyle
                                                        name={[field.name, 'resource']}
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: '请选择内容集合！',
                                                            },
                                                        ]}
                                                    >
                                                        <ResourceSelect
                                                            service={permission?.service}
                                                            projectId={permission?.projectId}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col flex="0 0 auto">
                                                    <DeleteTwoTone
                                                        className="dynamic-delete-button"
                                                        style={{ margin: '0 8px' }}
                                                        onClick={() => {
                                                            remove(field.name)
                                                        }}
                                                    />
                                                </Col>
                                            </Row>
                                        </Form.Item>
                                    )
                                })}
                                <Form.Item style={{ textAlign: 'center' }}>
                                    <Button
                                        type="dashed"
                                        onClick={() => {
                                            add()
                                        }}
                                        style={{ width: '60%' }}
                                    >
                                        <PlusOutlined /> 添加权限规则
                                    </Button>
                                </Form.Item>
                            </div>
                        )
                    }}
                </Form.List>
            </Form.Item>
            <Form.Item>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Button type="primary" onClick={() => onPrevious()}>
                        上一步
                    </Button>
                    <Button type="primary" htmlType="submit" loading={creating}>
                        创建
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    )
}

const ResourceSelect: React.FC<{
    value?: any
    projectId: string
    onChange?: (v: any) => void
    service: '*' | 'content' | 'schema' | 'webhook'
}> = ({ projectId, service, value, onChange }) => {
    // 当服务类型为全部时，无法选择指定的资源

    if (service === '*' || projectId === '*') {
        return (
            <Select
                mode="multiple"
                placeholder="资源"
                value={value}
                onChange={(v) => onChange?.(v)}
            >
                <Select.Option value="*">全部</Select.Option>
            </Select>
        )
    }

    const { data = [], loading } = useRequest(
        async () => {
            let data = []

            if (!service || !projectId) {
                return []
            }

            switch (service) {
                case 'schema':
                case 'content':
                    data = await getSchemas(projectId)
                    break

                case 'webhook':
                    data = await getWebhooks({
                        filter: {
                            projectId,
                        },
                    })
            }

            return data
        },
        {
            refreshDeps: [service, projectId],
        }
    )

    return (
        <Select
            mode="multiple"
            loading={loading}
            placeholder="资源"
            value={value}
            onChange={(v) => onChange?.(v)}
            onFocus={() => {
                if (!service) {
                    message.error('请选择服务')
                } else if (!projectId) {
                    message.error('请选择项目')
                }
            }}
        >
            <Select.Option value="*">全部</Select.Option>
            {data?.map((item: any) => {
                switch (service) {
                    case 'schema':
                        return (
                            <Select.Option key={item._id} value={item._id}>
                                {item.displayName}
                            </Select.Option>
                        )
                    case 'content':
                        return (
                            <Select.Option key={item._id} value={item.collectionName}>
                                {item.displayName}
                            </Select.Option>
                        )
                    case 'webhook':
                        return (
                            <Select.Option key={item._id} value={item._id}>
                                {item.name}
                            </Select.Option>
                        )
                    default:
                        return (
                            <Select.Option key="index" value="">
                                空
                            </Select.Option>
                        )
                }
            })}
        </Select>
    )
}

export default RolePermission
