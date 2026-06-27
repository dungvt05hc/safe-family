import 'react-i18next'
import type en_common from './locales/en/common'
import type en_nav from './locales/en/nav'
import type en_topbar from './locales/en/topbar'
import type en_dashboard from './locales/en/dashboard'
import type en_auth from './locales/en/auth'
import type en_emptyStates from './locales/en/emptyStates'
import type en_bookings from './locales/en/bookings'
import type en_checklist from './locales/en/checklist'
import type en_plans from './locales/en/plans'
import type en_reports from './locales/en/reports'
import type en_validation from './locales/en/validation'
import type en_errors from './locales/en/errors'
import type en_footer from './locales/en/footer'
import type en_info from './locales/en/info'

// Augment react-i18next with strongly-typed resources for key autocomplete
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof en_common
      nav: typeof en_nav
      topbar: typeof en_topbar
      dashboard: typeof en_dashboard
      auth: typeof en_auth
      emptyStates: typeof en_emptyStates
      bookings: typeof en_bookings
      checklist: typeof en_checklist
      plans: typeof en_plans
      reports: typeof en_reports
      validation: typeof en_validation
      errors: typeof en_errors
      footer: typeof en_footer
      info: typeof en_info
    }
  }
}
