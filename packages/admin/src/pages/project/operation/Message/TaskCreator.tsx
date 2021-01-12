import React from 'react'
import { useParams, useRequest, history, useModel } from 'umi'
import ProCard from '@ant-design/pro-card'
import { PageContainer } from '@ant-design/pro-layout'
import { LeftCircleTwoTone } from '@ant-design/icons'
import { Form, message, Space, Button, Row, Col, Modal, notification, Input } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import { useSetState } from 'react-use'
import { getWxCloudApp } from '@/utils'
import { createBatchTask } from '@/services/operation'
import { useConcent } from 'concent'
import { GlobalCtx } from 'typings/store'
import { IConnectEditor } from './Connect'
import { ActivityField } from './columns'

interface Task {
  content: string
  activityId: string
  phoneNumbers: string
}

const MessageTask: React.FC = () => {
  const { projectId } = useParams<any>()
  const { initialState } = useModel('@@initialState')
  const globalCtx = useConcent<{}, GlobalCtx>('global')
  const { setting } = globalCtx.state || {}
  const [{ visible, task }, setState] = useSetState<{
    task: any
    totalNumber: number
    visible: boolean
  }>({
    task: {},
    totalNumber: 0,
    visible: false,
  })

  if (!setting?.enableOperation) {
    history.push(`/${projectId}/operation`)
    return <span />
  }

  // 创建发送任务
  const { run, loading } = useRequest(
    async (payload: any) => {
      const { currentUser } = initialState || {}
      const wxCloudApp = await getWxCloudApp(setting)
      // 记录创建用户信息
      const { taskId, token } = await createBatchTask(projectId, {
        ...payload,
        createdUser: currentUser,
      })

      try {
        const { result } = await wxCloudApp.callFunction({
          name: 'wx-ext-cms-sms',
          data: {
            token,
            taskId,
          },
        })

        // 失败
        if (result.code) {
          message.error(`下发短信失败: ${result.message}`)
          notification.error({
            message: result.code,
            description: `${result.code}: ${result.message}`,
          })
        } else {
          message.success('下发短信成功')
          // 返回
          history.goBack()
        }
      } catch (e) {
        console.log(e)
        message.error(`下发短信失败`)
        notification.error({
          message: '下发短信失败',
          description: e.message,
        })
      } finally {
        setState({ visible: false })
      }
    },
    {
      manual: true,
      onError: (e) => {
        console.error(e)
        // 创建任务，生成 token 失败
        message.error(`创建任务失败 ${e.message}`)
      },
    }
  )

  return (
    <PageContainer title="创建【发送短信】任务">
      <Row>
        <Col
          md={{ span: 24, offset: 0 }}
          lg={{ span: 20, offset: 2 }}
          xl={{ span: 18, offset: 3 }}
          xxl={{ span: 16, offset: 4 }}
        >
          <div style={{ cursor: 'pointer' }} onClick={() => history.goBack()}>
            <Space align="center" style={{ marginBottom: '10px' }}>
              <LeftCircleTwoTone style={{ fontSize: '20px' }} />
              <h3 style={{ marginBottom: '0.25rem' }}>返回</h3>
            </Space>
          </div>
          <ProCard>
            <Form
              name="basic"
              layout="vertical"
              onFinish={(
                v: Task = {
                  content: '',
                  activityId: '',
                  phoneNumbers: '',
                }
              ) => {
                // 任务信息
                const { phoneNumbers, content, activityId } = v

                if (phoneNumbers.includes('\n') && phoneNumbers.includes(',')) {
                  message.error('请勿混用换行和英文分号 ,')
                  return
                }

                let phoneNumberList: string[] = [phoneNumbers]

                if (phoneNumbers.includes('\n')) {
                  phoneNumberList = phoneNumbers
                    .split('\n')
                    .filter((_) => _)
                    .map((num) => num.trim())
                }
                if (phoneNumbers.includes(',')) {
                  phoneNumberList = phoneNumbers
                    .split(',')
                    .filter((_) => _)
                    .map((num) => num.trim())
                }

                if (!phoneNumberList?.length) {
                  message.error('号码不能为空')
                  return
                }

                if (phoneNumberList?.length > 1000) {
                  message.error('最大支持 1000 条号码')
                  return
                }

                // 去重
                phoneNumberList = phoneNumberList.filter(
                  (num, i, arr) => arr.findIndex((_) => _ === num) === i
                )

                setState({
                  visible: true,
                  task: {
                    content,
                    activityId,
                    phoneNumberList,
                  },
                })
              }}
            >
              <Form.Item
                label="短信内容"
                name="content"
                extra="短信内容最长支持 30 个字符。发送样例：【小程序名称】【内容】，点击 【云开发静态网站 URL】 打开【小程序名称】小程序，回T退订。"
                rules={[
                  {
                    required: true,
                    message: '请填写短信内容',
                  },
                  {
                    message: '短信内容最长支持 30 个字符',
                    max: 30,
                  },
                ]}
              >
                <TextArea placeholder="短信内容" />
              </Form.Item>

              <Form.Item
                required
                label="手机号码"
                name="phoneNumbers"
                extra="仅支持国内号码，如 12345678900。多个手机号码，每行一个号码，或使用英文逗号 , 分隔，目前最大支持 1000 个手机号码。"
                rules={[
                  {
                    required: true,
                    message: '请填写短信号码',
                  },
                  {
                    pattern: /^(1[0-9]\d{9}(\n|,)?)+$/,
                    message: '仅支持国内号码，仅支持换行或英文分号 , 分隔',
                  },
                ]}
              >
                <TextArea placeholder="短信号码列表" />
              </Form.Item>

              <Form.Item
                label="活动"
                name="activityId"
                extra="关联的活动"
                rules={[
                  {
                    required: true,
                    message: '请选择关联的活动',
                  },
                ]}
              >
                <IConnectEditor field={ActivityField} />
              </Form.Item>

              <Form.Item>
                <Row>
                  <Col flex="1 1 auto" style={{ textAlign: 'right' }}>
                    <Space size="large">
                      <Button
                        onClick={() => {
                          history.goBack()
                        }}
                      >
                        取消
                      </Button>
                      <Button type="primary" htmlType="submit">
                        创建
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Form.Item>
            </Form>
          </ProCard>
          <Modal
            centered
            visible={visible}
            title="创建发送短信任务"
            onOk={() => run(task)}
            okButtonProps={{ loading }}
            onCancel={() => setState({ visible: false })}
          >
            共计 {task?.phoneNumberList?.length || 0} 个号码，是否创建发送任务？
          </Modal>
        </Col>
      </Row>
    </PageContainer>
  )
}

export default MessageTask
