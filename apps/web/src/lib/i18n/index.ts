import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en_common from './locales/en/common'
import en_nav from './locales/en/nav'
import en_topbar from './locales/en/topbar'
import en_dashboard from './locales/en/dashboard'
import en_auth from './locales/en/auth'
import en_emptyStates from './locales/en/emptyStates'
import en_bookings from './locales/en/bookings'
import en_checklist from './locales/en/checklist'
import en_plans from './locales/en/plans'
import en_reports from './locales/en/reports'
import en_validation from './locales/en/validation'
import en_errors from './locales/en/errors'

import vi_common from './locales/vi/common'
import vi_nav from './locales/vi/nav'
import vi_topbar from './locales/vi/topbar'
import vi_dashboard from './locales/vi/dashboard'
import vi_auth from './locales/vi/auth'
import vi_emptyStates from './locales/vi/emptyStates'
import vi_bookings from './locales/vi/bookings'
import vi_checklist from './locales/vi/checklist'
import vi_plans from './locales/vi/plans'
import vi_reports from './locales/vi/reports'
import vi_validation from './locales/vi/validation'
import vi_errors from './locales/vi/errors'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
] as const

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code']

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: en_common,
        nav: en_nav,
        topbar: en_topbar,
        dashboard: en_dashboard,
        auth: en_auth,
        emptyStates: en_emptyStates,
        bookings: en_bookings,
        checklist: en_checklist,
        plans: en_plans,
        reports: en_reports,
        validation: en_validation,
        errors: en_errors,
      },
      vi: {
        common: vi_common,
        nav: vi_nav,
        topbar: vi_topbar,
        dashboard: vi_dashboard,
        auth: vi_auth,
        emptyStates: vi_emptyStates,
        bookings: vi_bookings,
        checklist: vi_checklist,
        plans: vi_plans,
        reports: vi_reports,
        validation: vi_validation,
        errors: vi_errors,
      },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'sf-language',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already escapes output
    },
  })

export default i18n
