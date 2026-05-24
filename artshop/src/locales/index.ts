import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

const STORAGE_KEY = 'artshop_language'

function getDefaultLanguage(): string {
  try {
    const cached = uni.getStorageSync(STORAGE_KEY)
    if (cached && ['zh-CN', 'en-US'].includes(cached)) {
      return cached
    }
  } catch (e) {}
  
  try {
    const systemInfo = uni.getSystemInfoSync()
    const language = systemInfo.language || ''
    if (language.startsWith('zh')) {
      return 'zh-CN'
    }
  } catch (e) {}
  
  return 'zh-CN'
}

export function setLanguage(lang: 'zh-CN' | 'en-US') {
  try {
    uni.setStorageSync(STORAGE_KEY, lang)
  } catch (e) {}
}

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLanguage(),
  fallbackLocale: 'zh-CN',
  messages,
  globalInjection: true,
})

export default i18n
