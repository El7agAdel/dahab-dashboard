import type { AppLocale } from '@/types/locale'

import { intlLocale } from './locale'

export type GreetingKey = 'greeting.morning' | 'greeting.afternoon' | 'greeting.evening'

// "Saturday, October 10" / "السبت، 10 أكتوبر": the page header's date.
export function formatPageDate(date: Date, locale: AppLocale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

// Morning 05:00–11:59, afternoon 12:00–16:59, evening otherwise (plan D11).
export function greetingKey(date: Date): GreetingKey {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return 'greeting.morning'
  if (hour >= 12 && hour < 17) return 'greeting.afternoon'
  return 'greeting.evening'
}
