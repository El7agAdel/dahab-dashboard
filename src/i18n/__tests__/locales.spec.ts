import { expect, it } from 'vitest'

import ar from '@/i18n/locales/ar.json'
import en from '@/i18n/locales/en.json'

const flatKeys = (obj: object, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([key, value]: [string, unknown]) =>
    typeof value === 'object' && value !== null
      ? flatKeys(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  )

it('ar.json and en.json have the same keys', () => {
  expect(flatKeys(ar).sort()).toEqual(flatKeys(en).sort())
})
