import { render } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'

import { useDocumentLocale } from '@/composables/common/useDocumentLocale'
import { i18n } from '@/i18n'
import { useLocaleStore } from '@/stores/locale'

beforeEach(() => setActivePinia(createPinia()))

it('switches html dir/lang and i18n with the store', async () => {
  const Host = defineComponent({
    setup() {
      useDocumentLocale()
      return () => null
    },
  })
  render(Host, { global: { plugins: [i18n] } })

  useLocaleStore().setLocale('ar')
  await nextTick()

  expect(document.documentElement.dir).toBe('rtl')
  expect(document.documentElement.lang).toBe('ar')
  expect(i18n.global.locale.value).toBe('ar')
})
