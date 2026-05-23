import cloudbase from '@cloudbase/js-sdk'

const ENV_ID = 'your-env-id'

let app: cloudbase.app.App | null = null

export function initCloudBase(envId?: string): cloudbase.app.App {
  if (!app) {
    app = cloudbase.init({
      env: envId || ENV_ID,
    })
  }
  return app
}

function getApp(): cloudbase.app.App {
  if (!app) {
    return initCloudBase()
  }
  return app
}

export function db() {
  return getApp().database()
}

export function storage() {
  return getApp().storage
}

export interface CloudFunctionResult<T = unknown> {
  code: number
  data: T
  message?: string
}

export interface PageResult<T = unknown> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export async function callFunction<T = unknown>(
  name: string,
  data?: Record<string, unknown>,
): Promise<CloudFunctionResult<T>> {
  try {
    const result = await getApp().callFunction({
      name,
      data: data || {},
    })
    return result.result as CloudFunctionResult<T>
  } catch (error) {
    console.error(`云函数调用失败 [${name}]:`, error)
    throw error
  }
}

export async function request<T = unknown>(
  name: string,
  data?: Record<string, unknown>,
): Promise<T> {
  try {
    const result = await callFunction<T>(name, data)
    if (result.code !== 0) {
      throw new Error(result.message || '请求失败')
    }
    return result.data
  } catch (error) {
    if (error instanceof Error && error.message !== '请求失败') {
      throw error
    }
    console.error(`请求失败 [${name}]:`, error)
    throw error
  }
}
