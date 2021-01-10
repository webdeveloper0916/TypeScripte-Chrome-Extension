import { getSettings } from '@/services/global'

interface SettingState {
  enableOperation?: boolean
}

interface GlobalState {
  setting: SettingState
}

const state: GlobalState = {
  setting: {
    enableOperation: false,
  },
}

export default {
  state,
  init: async () => {
    const { data = {} } = await getSettings()
    return {
      setting: data,
    }
  },
}
