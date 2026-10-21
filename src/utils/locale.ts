import type { AppLocale } from '@/types/locale'

// Arabic keeps English digits everywhere (spec 6.3), hence the Latin numbering system.
export function intlLocale(locale: AppLocale): 'en-US' | 'ar-EG-u-nu-latn' {
  return locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US'
}
