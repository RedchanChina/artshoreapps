import cloudbase from '@cloudbase/js-sdk'

const ENV_ID = 'moreart-d9gb4c4ig54ef6812'

let app: cloudbase.app.App | null = null
let initPromise: Promise<cloudbase.app.App> | null = null

export async function initCloudBase(envId?: string): Promise<cloudbase.app.App> {
  if (app) return app
  if (initPromise) return initPromise

  initPromise = new Promise((resolve, reject) => {
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
          resolve(app)
        })
        .catch((err: any) => {
          console.warn('CloudBase 匿名登录失败，尝试无认证模式', err)
          app = instance
          resolve(app)
        })
    } catch (err) {
      console.warn('CloudBase 初始化失败', err)
      reject(err)
    }
  })

  return initPromise
}

async function getApp(): Promise<cloudbase.app.App> {
  if (app) return app
  return initCloudBase()
}

export async function db() {
  const instance = await getApp()
  return instance.database()
}

export async function storage() {
  const instance = await getApp()
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
  try {
    const instance = await getApp()
    const result = await instance.callFunction({
      name,
      data: data || {},
    })
    return result.result as CloudFunctionResult<T>
  } catch (error) {
    console.warn(`云函数调用失败 [${name}]:`, error)
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
    console.warn(`请求失败 [${name}]:`, error)
    throw error
  }
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
