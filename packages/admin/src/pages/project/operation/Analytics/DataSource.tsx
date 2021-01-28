import React from 'react'
import { Space, Spin } from 'antd'
import ProCard from '@ant-design/pro-card'
import { PieChartTwoTone } from '@ant-design/icons'

const cardStyle = {
  height: '480px',
}

/**
 * 获取 metric 对应的数据
 */
const DataSource: React.FC<{ data: any; title: string; loading: boolean }> = ({
  title,
  children,
  data,
  loading,
}) => {
  // 获取统计数据

  // 加载中
  if (loading || !data || data === -1) {
    return (
      <ProCard title={title} style={cardStyle}>
        <div className="flex justify-center items-center h-full">
          <Space direction="vertical" align="center" size="large">
            <PieChartTwoTone style={{ fontSize: '48px' }} />
            {loading ? (
              <Spin />
            ) : (
              <p className="text-xl">{data === -1 ? '数据为空' : '加载中...'}</p>
            )}
          </Space>
        </div>
      </ProCard>
    )
  }

  // set data
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { data })
    }
    return child
  })

  return <ProCard title={title}>{childrenWithProps}</ProCard>
}

export default DataSource
