/**
 * company.ts — centralized company / contact information.
 *
 * Update values here only; never hardcode them in components.
 *
 * Localization note: the shape below intentionally separates static facts
 * (name, addresses, urls) from UI strings. If you need translated labels
 * (e.g. "Liên hệ chúng tôi") keep them in i18n locale files and use the
 * values here only for the data they wrap (e.g. the email address itself).
 *
 * Footer navigation links are defined separately in @/lib/footerNav.ts.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CompanyAddress {
  /** Street / building line, e.g. "123 Main Street, Suite 100" */
  street: string
  /** City, state/province, postal code, e.g. "Ho Chi Minh City, 700000" */
  cityLine: string
  /** ISO 3166-1 alpha-2 country code, e.g. "VN" */
  countryCode: string
  /** Human-readable country name */
  country: string
}

export interface CompanyInfo {
  /** Short product / brand name shown in UI (e.g. nav headers, footers) */
  name: string
  /** Full legal / registered entity name */
  legalName: string
  /** One-sentence tagline or short description */
  tagline: string
  /** Primary support e-mail address */
  supportEmail: string
  /** Primary contact phone number (international format) */
  phone: string
  /** Public-facing website URL (no trailing slash) */
  website: string
  /** Primary registered address */
  address: CompanyAddress
  /**
   * Returns the copyright line for the current (or provided) year.
   * @example company.copyright() → "© 2026 SafeFamily Pte. Ltd."
   */
  copyright: (year?: number) => string
}

// ── Config ────────────────────────────────────────────────────────────────────

export const company: CompanyInfo = {
  name: 'SafeFamily',
  legalName: 'SafeFamily Pte. Ltd.',
  tagline: 'Protecting families, one device at a time.',
  supportEmail: 'support@safefamily.app',
  phone: '+84 28 1234 5678',
  website: 'https://safefamily.app',
  address: {
    street: '123 Nguyen Hue Boulevard, District 1',
    cityLine: 'Ho Chi Minh City, 700000',
    countryCode: 'VN',
    country: 'Vietnam',
  },
  copyright: (year?: number) =>
    `© ${year ?? new Date().getFullYear()} ${company.legalName}`,
}
