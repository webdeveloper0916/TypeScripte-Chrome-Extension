import { callWxOpenAPI, tcbRequest } from '@/utils'

export async function enableOperationService(projectId: string, data: any = {}) {
  return tcbRequest(`/projects/${projectId}/operation/enableOperationService`, {
    method: 'POST',
    data,
  })
}

export async function createBatchTask(projectId: string, data: any = {}) {
  return tcbRequest(`/projects/${projectId}/operation/createBatchTask`, {
    method: 'POST',
    data,
  })
}

export async function enableNonLogin(projectId: string) {
  return tcbRequest(`/projects/${projectId}/operation/enableNonLogin`, {
    method: 'POST',
  })
}

export async function getAnalyticsData(data: { activityId: string; metricName?: string }) {
  return callWxOpenAPI('getAnalyticsData', data)
}
