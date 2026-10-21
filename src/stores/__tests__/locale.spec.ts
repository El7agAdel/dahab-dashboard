import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, it } from 'vitest'

import { useLocaleStore } from '@/stores/locale'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

it('starts in English for the login page', () => {
  const store = useLocaleStore()
  expect(store.locale).toBe('en')
  expect(store.dir).toBe('ltr')
})

it('gives a new account Arabic', () => {
  const store = useLocaleStore()
  store.applyAccountLocale('u1')
  expect(store.locale).toBe('ar')
  expect(store.dir).toBe('rtl')
})

it('saves a language chosen on the login page to the account', () => {
  const store = useLocaleStore()
  store.setLocale('en') // picked on the login page; a new account would otherwise get Arabic
  store.applyAccountLocale('u1')
  expect(store.locale).toBe('en')

  store.resetToLoginLocale()
  store.applyAccountLocale('u1')
  expect(store.locale).toBe('en')
})

it('keeps an account’s saved English', () => {
  const store = useLocaleStore()
  store.applyAccountLocale('u1')
  store.setLocale('en')
  store.resetToLoginLocale()
  store.applyAccountLocale('u1')
  expect(store.locale).toBe('en')
})

it('ignores a corrupted saved value', () => {
  localStorage.setItem('dahab.locale.u1', 'fr')
  const store = useLocaleStore()
  store.applyAccountLocale('u1')
  expect(store.locale).toBe('ar')
})

it('returns to English after sign-out', () => {
  const store = useLocaleStore()
  store.applyAccountLocale('u1')
  store.resetToLoginLocale()
  expect(store.locale).toBe('en')
})
