import { expect, it } from 'vitest'

import { formatPageDate, greetingKey } from '@/utils/dates'

const evening = new Date(2026, 9, 10, 20, 0) // Saturday 10 October 2026, 8 pm

it('formats the page date in English', () => {
  expect(formatPageDate(evening, 'en')).toBe('Saturday, October 10')
})

it('formats the page date in Arabic with English digits', () => {
  expect(formatPageDate(evening, 'ar')).toBe('السبت، 10 أكتوبر')
})

it.each([
  [5, 0, 'greeting.morning'],
  [11, 59, 'greeting.morning'],
  [12, 0, 'greeting.afternoon'],
  [16, 59, 'greeting.afternoon'],
  [17, 0, 'greeting.evening'],
  [4, 59, 'greeting.evening'],
])('%i:%i → %s', (hour, minute, key) => {
  expect(greetingKey(new Date(2026, 9, 10, hour, minute))).toBe(key)
})
