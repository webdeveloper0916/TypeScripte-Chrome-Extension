import { getSettings, updateSetting } from '@/services/global'
import { getCloudBaseApp } from '@/utils'

interface GlobalState {
  setting: GlobalSetting
}

const state: GlobalState = {
  setting: {},
}

export default {
  state,
  reducer: {
    // 更新设置信息
    async updateSetting(setting: GlobalSetting, state: GlobalState) {
      await updateSetting(setting)

      return {
        setting: {
          ...state.setting,
          ...setting,
        },
      }
    },
  },
  init: async () => {
    try {
      // 校验是否登录
      const app = await getCloudBaseApp()
      const loginState = await app.auth({ persistence: 'local' }).getLoginState()
      if (!loginState) return {}

      // 获取全局设置
      const { data = {} } = await getSettings()
      return {
        setting: data,
      }
    } catch (error) {
      console.log(error)
      return {}
    }
  },
}
