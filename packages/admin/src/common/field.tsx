import React from 'react'

export const FieldTypes = [
    // 字符串：单行
    {
        type: 'String',
        name: '单行字符串',
        icon: <i className="gg-format-color" />,
    },
    // 字符串：多行
    {
        type: 'MultiLineString',
        name: '多行字符串',
        icon: <i className="gg-format-justify" />,
    },
    // 数字：整形、浮点型
    {
        name: '数字',
        type: 'Number',
        icon: <i className="gg-math-percent" />,
    },
    // 布尔值
    {
        type: 'Boolean',
        name: '布尔值',
        icon: <i className="gg-check" />,
    },
    // **枚举类型**
    // 时间
    {
        type: 'DateTime',
        name: '日期',
        icon: <i className="gg-calendar-dates" />,
    },
    // **颜色：Color**
    // 文件：File
    {
        type: 'File',
        name: '文件',
        icon: <i className="gg-file" />,
    },
    // 图片：Image
    {
        type: 'Image',
        name: '图片',
        icon: <i className="gg-image" />,
    },
    // 邮箱地址
    {
        type: 'Email',
        name: '邮箱地址',
        icon: <i className="gg-mail" />,
    },
    // 电话号码
    {
        type: 'Tel',
        name: '电话号码',
        icon: <i className="gg-phone" />,
    },
    // 网址
    {
        type: 'Url',
        name: '网址',
        icon: <i className="gg-link" />,
    },
    // 富文本
    {
        type: 'RichText',
        name: '富文本',
        icon: <i className="gg-file-document" />,
    },
    // Markdown
    {
        type: 'Markdown',
        name: 'Markdown',
        icon: <i className="gg-chevron-double-down-o" />,
    },
    {
        type: 'Connect',
        name: '关联',
        icon: <i className="gg-arrow-top-right-r" />,
    },
    {
        type: 'Array',
        name: '数组',
        icon: <i className="gg-list" />,
    },
    // 数组：`Array<Value>`
    // 内容关联（外键）：分组与搜索，多层弹窗？
]
