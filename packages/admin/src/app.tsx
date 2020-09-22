import React from 'react'
import { run } from 'concent'
import { notification, message } from 'antd'
import { ResponseError } from 'umi-request'
import { history, RequestConfig, Link } from 'umi'
import { setTwoToneColor } from '@ant-design/icons'
import HeaderTitle from '@/components/HeaderTitle'
import RightContent from '@/components/RightContent'
import { codeMessage } from '@/constants'
import { BasicLayoutProps, Settings as LayoutSettings } from '@ant-design/pro-layout'
import { queryCurrent } from './services/user'
import defaultSettings from '../config/defaultSettings'
import { getCloudBaseApp, isDevEnv } from './utils'
import * as models from './models'

run(models)

setTwoToneColor('#0052d9')

export async function getInitialState(): Promise<{
    currentUser?: API.CurrentUser
    settings?: LayoutSettings
    menu?: any[]
}> {
    let app
    let loginState

    try {
        app = await getCloudBaseApp()
        // 获取登录态
        loginState = await app
            .auth({
                persistence: 'local',
            })
            .getLoginState()
    } catch (error) {
        console.log(error)
        message.error(`CloudBase JS SDK 初始化失败，${error.message}`)
    }

    // 没有登录，重新登录
    if (!isDevEnv() && !loginState) {
        history.push('/login')
        return {}
    }

    // 如果是登录页面，不执行
    if (history.location.pathname !== '/login') {
        try {
            const currentUser = await queryCurrent()
            return {
                currentUser,
                settings: defaultSettings,
            }
        } catch (error) {
            return {}
        }
    } else {
        let currentUser = {} as any
        try {
            currentUser = await queryCurrent()
        } catch (e) {
            console.log(e)
        }
        return {
            currentUser,
            settings: defaultSettings,
        }
    }
}

export const layout = ({
    initialState,
}: {
    initialState: { settings?: LayoutSettings; currentUser?: API.CurrentUser }
}): BasicLayoutProps => {
    return {
        theme: 'light',
        navTheme: 'light',
        headerHeight: 64,
        disableContentMargin: false,
        onPageChange: () => {
            // 如果没有登录，重定向到 login
            if (!initialState?.currentUser?._id && history.location.pathname !== '/login') {
                history.push('/login')
            }
        },
        rightContentRender: () => <RightContent />,
        menuItemRender: (menuItemProps, defaultDom) => {
            const paths = history.location.pathname.split('/').filter((_: string) => _)
            const projectId = paths[0]

            if (menuItemProps.isUrl || menuItemProps.children) {
                return defaultDom
            }

            if (menuItemProps.path) {
                return (
                    <Link to={menuItemProps.path.replace(':projectId', projectId)}>
                        {defaultDom}
                    </Link>
                )
            }

            return defaultDom
        },
        headerTitleRender: ({ collapsed }) => <HeaderTitle collapsed={Boolean(collapsed)} />,
        ...initialState?.settings,
    }
}

/**
 * 请求异常处理
 */
const errorHandler = (error: ResponseError) => {
    const { response } = error

    if (response?.status) {
        const errorText = codeMessage[response.status] || response.statusText
        const { status, url } = response

        notification.error({
            message: `请求错误 ${status}: ${url}`,
            description: errorText,
        })
    }

    // if (!response) {
    //     notification.error({
    //         description: '您的网络发生异常，无法连接服务器',
    //         message: '网络异常'
    //     })
    // }

    throw error
}

/**
 * 全局 request 配置
 */
export const request: RequestConfig = {
    prefix: isDevEnv() ? '/api' : `https://${window.TcbCmsConfig.cloudAccessPath}/api`,
    errorHandler,
    errorConfig: {
        adaptor: (resData) => {
            return {
                ...resData,
                success: !resData.code,
                errorMessage: resData.message,
            }
        },
    },
    responseInterceptors: [
        async (response, options) => {
            const data = await response.clone().json()
            if (data.code) {
                notification.error({
                    message: data.message || data.code,
                    description: data.requestId
                        ? `${data.code}\n[requestId]${data.requestId}`
                        : data.code,
                })
            }

            return response
        },
    ],
}
