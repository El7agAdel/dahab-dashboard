import { watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

import { useLocaleStore } from '@/stores/locale'

// Keeps vue-i18n and <html lang dir> in step with the locale store. Called once, in App.vue.
export function useDocumentLocale(): void {
  const store = useLocaleStore()
  const { locale } = useI18n({ useScope: 'global' })
  watchEffect(() => {
    locale.value = store.locale
    document.documentElement.lang = store.locale
    document.documentElement.dir = store.dir
  })
}
