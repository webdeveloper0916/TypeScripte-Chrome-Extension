export const ActivitySchema: any = {
  fields: [
    {
      description: '活动名称',
      displayName: '活动名',
      id: 'rvyvosiqb73plli67zcupa2o9nhr2dwi',
      isRequired: true,
      name: 'activityName',
      order: 0,
      type: 'String',
    },
    {
      defaultValue: true,
      description: '活动开启后，在指定的时间范围区间内可供跳转',
      displayName: '活动开启',
      id: 'l4ikt6y8wus4u9xt9zr3ww23m0o3qb72',
      isRequired: true,
      name: 'isActivityOpen',
      order: 1,
      type: 'Boolean',
    },
    {
      dateFormatType: 'timestamp-ms',
      description: '开始时间后，才允许跳转',
      displayName: '活动开始时间',
      id: 'fmpx6prjehenfvl0v0amzo58ckwf7kqb',
      isRequired: true,
      name: 'startTime',
      order: 2,
      type: 'DateTime',
    },
    {
      dateFormatType: 'timestamp-ms',
      description: '活动结束后，不允许跳转',
      displayName: '活动结束时间',
      id: 'dzapdx6alta68er1j4ptxnaoe6ols6fl',
      isRequired: true,
      name: 'endTime',
      order: 3,
      type: 'DateTime',
    },
    {
      description: '上传的图片将作为跳转中间页展示',
      displayName: '跳转中间页图片',
      id: 'n70yz0jorghsx05vc9y1sha7ywhxhd9f',
      isRequired: false,
      name: 'jumpImg',
      order: 4,
      resourceLinkType: 'https',
      type: 'Image',
    },
    {
      description:
        '要跳转到的小程序的页面路径，如：/pages/index/index。请填写合法的路径，否则会导致无法跳转',
      displayName: '小程序页面路径',
      placeholder: '/pages/index/index',
      id: 'jfdtuq306rdh0k6bleuckmmvg0joig7p',
      name: 'appPath',
      order: 5,
      type: 'String',
    },
    {
      description: '通过 scheme 码进入小程序时的 query',
      displayName: '小程序页面 query',
      id: 'jfdtuq306rdh0k6bleuckmmvg0joig7p',
      name: 'appPathQuery',
      order: 5,
      type: 'String',
    },
  ],
  collectionName: 'wx-ext-cms-sms-activities',
  displayName: '营销活动',
  _id: 'b45a21d55ff939720430e24e0f94cb12',
}
