import cloudbase from '@cloudbase/js-sdk'

const ENV_ID = 'moreart-d9gb4c4ig54ef6812'

let app: cloudbase.app.App | null = null
let initPromise: Promise<cloudbase.app.App | null> | null = null
let cloudAvailable = false

export async function initCloudBase(envId?: string): Promise<cloudbase.app.App | null> {
  if (app) return app
  if (initPromise) return initPromise

  initPromise = new Promise((resolve) => {
    try {
      const instance = cloudbase.init({
        env: envId || ENV_ID,
      })
      instance
        .auth()
        .anonymousAuthProvider()
        .signIn()
        .then(() => {
          app = instance
          cloudAvailable = true
          resolve(app)
        })
        .catch(() => {
          app = instance
          cloudAvailable = false
          resolve(app)
        })
    } catch () {
      cloudAvailable = false
      resolve(null)
    }
  })

  return initPromise
}

async function getApp(): Promise<cloudbase.app.App | null> {
  if (app) return app
  return initCloudBase()
}

export function isCloudAvailable(): boolean {
  return cloudAvailable
}

export async function db() {
  const instance = await getApp()
  if (!instance) throw new Error('CloudBase 不可用')
  return instance.database()
}

export async function storage() {
  const instance = await getApp()
  if (!instance) throw new Error('CloudBase 不可用')
  return instance.storage
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
  const instance = await getApp()
  if (!instance) {
    return { code: -1, data: null as T, message: 'CloudBase 不可用' }
  }
  try {
    const result = await instance.callFunction({
      name,
      data: data || {},
    })
    return result.result as CloudFunctionResult<T>
  } catch (error) {
    return { code: -1, data: null as T, message: '云函数调用失败' }
  }
}

export async function request<T = unknown>(
  name: string,
  data?: Record<string, unknown>,
): Promise<T> {
  const result = await callFunction<T>(name, data)
  if (result.code !== 0) {
    throw new Error(result.message || '请求失败')
  }
  return result.data
}

export type ActionModule =
  | 'user'
  | 'artwork'
  | 'artist'
  | 'order'
  | 'payment'
  | 'community'
  | 'store'
  | 'admin'

export async function callAction<T = unknown>(
  module: ActionModule,
  action: string,
  data?: Record<string, unknown>,
): Promise<T> {
  return request<T>(module, { action, ...data })
}
