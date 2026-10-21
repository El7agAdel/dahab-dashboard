import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { AppLocale } from '@/types/locale'

const storageKey = (userId: string) => `dahab.locale.${userId}` // MOCK: M14 until the backend accepts `ar`

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<AppLocale>('en') // the login page is English until sign-in (spec 5.1 rule 9)
  const dir = computed(() => (locale.value === 'ar' ? 'rtl' : 'ltr'))
  let userId: string | null = null
  let chosenWhileSignedOut: AppLocale | null = null

  function setLocale(next: AppLocale) {
    locale.value = next
    if (userId) {
      localStorage.setItem(storageKey(userId), next) // MOCK: M14
    } else {
      chosenWhileSignedOut = next
    }
  }

  // After sign-in: a language picked on the login page wins; otherwise the account's saved one; new accounts get Arabic.
  function applyAccountLocale(id: string) {
    userId = id
    const saved = localStorage.getItem(storageKey(id)) // MOCK: M14
    setLocale(chosenWhileSignedOut ?? (saved === 'ar' || saved === 'en' ? saved : 'ar'))
    chosenWhileSignedOut = null
  }

  function resetToLoginLocale() {
    userId = null
    chosenWhileSignedOut = null
    locale.value = 'en'
  }

  return { locale, dir, setLocale, applyAccountLocale, resetToLoginLocale }
})
