import { useParams } from 'umi'
import { useConcent } from 'concent'
import ProTable from '@ant-design/pro-table'
import { Button, Modal, message } from 'antd'
import React, { MutableRefObject, useState } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { getContents, deleteContent } from '@/services/content'
import { getTableColumns } from './columns'
import { ContentTableSearch } from './components'
import './index.less'

export const ContentTable: React.FC<{
    tableRef: MutableRefObject<any>
    setModalVisible: (visible: boolean) => void
}> = (props) => {
    const { setModalVisible, tableRef } = props
    const { projectId } = useParams()
    const ctx = useConcent('content')
    const {
        state: { currentSchema },
    } = ctx

    const [searchParams, setSearchParams] = useState<any>()

    const columns = getTableColumns(currentSchema?.fields)

    // 表格请求
    const tableRequest = async (
        params: { pageSize: number; current: number; [key: string]: any },
        sort: any,
        filter: any
    ) => {
        const { pageSize, current } = params
        const resource = currentSchema.collectionName

        // 搜索参数
        const fuzzyFilter = searchParams
            ? Object.keys(searchParams)
                  .filter((key) =>
                      currentSchema.fields?.some((field: SchemaFieldV2) => field.name === key)
                  )
                  .reduce(
                      (prev, key) => ({
                          ...prev,
                          [key]: searchParams[key],
                      }),
                      {}
                  )
            : {}

        try {
            const { data = [], total } = await getContents(projectId, resource, {
                sort,
                filter,
                pageSize,
                fuzzyFilter,
                page: current,
            })

            return {
                data,
                total,
                success: true,
            }
        } catch (error) {
            console.log('内容请求错误', error)
            return {
                data: [],
                total: 0,
                success: true,
            }
        }
    }

    return (
        <>
            <ContentTableSearch
                schema={currentSchema}
                onSearch={(params) => {
                    setSearchParams(params)
                    tableRef.current.reload(true)
                }}
            />
            <ProTable
                rowKey="_id"
                search={false}
                actionRef={tableRef}
                dateFormatter="string"
                scroll={{ x: 1000 }}
                pagination={{
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '30', '50'],
                }}
                columns={[
                    ...columns,
                    {
                        title: '操作',
                        width: 150,
                        align: 'center',
                        fixed: 'right',
                        valueType: 'option',
                        render: (text, row: any) => [
                            <Button
                                size="small"
                                type="primary"
                                key="edit"
                                onClick={() => {
                                    ctx.setState({
                                        contentAction: 'edit',
                                        selectedContent: row,
                                    })

                                    setModalVisible(true)
                                }}
                            >
                                编辑
                            </Button>,
                            <Button
                                danger
                                size="small"
                                key="delete"
                                type="primary"
                                onClick={() => {
                                    const modal = Modal.confirm({
                                        title: '确认删除此内容？',
                                        onCancel: () => {
                                            modal.destroy()
                                        },
                                        onOk: async () => {
                                            try {
                                                await deleteContent(
                                                    projectId,
                                                    currentSchema.collectionName,
                                                    row._id
                                                )
                                                tableRef?.current?.reloadAndRest()
                                                message.success('删除内容成功')
                                            } catch (error) {
                                                message.error('删除内容失败')
                                            }
                                        },
                                    })
                                }}
                            >
                                删除
                            </Button>,
                        ],
                    },
                ]}
                request={tableRequest}
                toolBarRender={() => [
                    <Button
                        type="primary"
                        key="button"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            ctx.setState({
                                contentAction: 'create',
                                selectedContent: null,
                            })
                            setModalVisible(true)
                        }}
                    >
                        新建
                    </Button>,
                ]}
            />
        </>
    )
}
