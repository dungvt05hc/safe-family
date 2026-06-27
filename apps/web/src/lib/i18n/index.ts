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
import en_settings from './locales/en/settings'
import en_assessments from './locales/en/assessments'
import en_incidents from './locales/en/incidents'

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
import vi_settings from './locales/vi/settings'
import vi_assessments from './locales/vi/assessments'
import vi_incidents from './locales/vi/incidents'
import en_families from './locales/en/families'
import en_accounts from './locales/en/accounts'
import en_devices from './locales/en/devices'
import en_tasks from './locales/en/tasks'
import en_payments from './locales/en/payments'
import vi_families from './locales/vi/families'
import vi_accounts from './locales/vi/accounts'
import vi_devices from './locales/vi/devices'
import vi_tasks from './locales/vi/tasks'
import vi_payments from './locales/vi/payments'
import en_footer from './locales/en/footer'
import vi_footer from './locales/vi/footer'
import en_info from './locales/en/info'
import vi_info from './locales/vi/info'

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
        settings: en_settings,
        assessments: en_assessments,
        incidents: en_incidents,
        families: en_families,
        accounts: en_accounts,
        devices: en_devices,
        tasks: en_tasks,
        payments: en_payments,
        footer: en_footer,
        info: en_info,
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
        settings: vi_settings,
        assessments: vi_assessments,
        incidents: vi_incidents,
        families: vi_families,
        accounts: vi_accounts,
        devices: vi_devices,
        tasks: vi_tasks,
        payments: vi_payments,
        footer: vi_footer,
        info: vi_info,
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
