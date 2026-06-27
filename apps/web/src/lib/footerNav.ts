/**
 * footerNav.ts — centralized footer navigation config.
 *
 * This file is the single source of truth for every link that appears in
 * the application footer. It is intentionally separate from company.ts so
 * that navigation structure can evolve independently from company contact data.
 *
 * ── Adding a new link ─────────────────────────────────────────────────────────
 * 1. Add the key to the `FooterNavKey` union below.
 * 2. Add a `FooterNavLink` entry to `footerNav`.
 * 3. Add a matching `footer.links.<key>` entry to every i18n locale file.
 *
 * ── Hiding a link without deleting it ────────────────────────────────────────
 * Set `visible: false`. The link stays in the config for auditing purposes but
 * is excluded from all rendered outputs.
 *
 * ── Grouping ──────────────────────────────────────────────────────────────────
 * Each link belongs to exactly one `FooterNavGroup`. The footer component uses
 * `footerLinksByGroup()` to drive the Legal column. The flat bottom-bar nav
 * strip uses `visibleFooterLinks()` (all visible links in declaration order).
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Logical section a footer link belongs to.
 * Extend as new sections are introduced.
 */
export type FooterNavGroup = 'company' | 'legal' | 'support'

/**
 * Keys that map to `footer.links.<key>` translation entries.
 * Must match the keys present in each locale's `footer.links` object.
 */
export type FooterNavKey = 'about' | 'contact' | 'privacy' | 'terms' | 'help'

export interface FooterNavLink {
  /** i18n lookup key — resolves to `footer.links.{key}` for the link label. */
  key: FooterNavKey
  /** Absolute internal path (e.g. '/privacy') or full external URL. */
  path: string
  /** Logical grouping used to render footer columns and filter subsets. */
  group: FooterNavGroup
  /**
   * Controls whether this link is rendered.
   * Set `false` to hide without removing the entry.
   */
  visible: boolean
  /**
   * When `true` the link opens in a new tab with rel="noopener noreferrer".
   * Defaults to `false` for internal paths.
   */
  external?: boolean
}

// ── Config ────────────────────────────────────────────────────────────────────

/**
 * Master footer navigation config.
 * Rendered order matches declaration order within each group.
 */
export const footerNav: FooterNavLink[] = [
  // company group
  { key: 'about',   path: '/about',   group: 'company', visible: true  },
  // support group
  { key: 'contact', path: '/contact', group: 'support', visible: true  },
  { key: 'help',    path: '/help',    group: 'support', visible: true  },
  // legal group
  { key: 'privacy', path: '/privacy', group: 'legal',   visible: true  },
  { key: 'terms',   path: '/terms',   group: 'legal',   visible: true  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns all visible links in declaration order. */
export function visibleFooterLinks(): FooterNavLink[] {
  return footerNav.filter((link) => link.visible)
}

/** Returns visible links belonging to a specific group, in declaration order. */
export function footerLinksByGroup(group: FooterNavGroup): FooterNavLink[] {
  return footerNav.filter((link) => link.visible && link.group === group)
}
