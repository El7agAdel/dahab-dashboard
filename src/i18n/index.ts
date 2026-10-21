import { createI18n } from 'vue-i18n'

import type { AppLocale } from '@/types/locale'

import ar from './locales/ar.json'
import en from './locales/en.json'

export type MessageSchema = typeof en

export const i18n = createI18n<[MessageSchema], AppLocale, false>({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, ar },
})
