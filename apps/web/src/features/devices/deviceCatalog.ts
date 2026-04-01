/**
 * @deprecated This static catalog is replaced by backend-driven data.
 * Use deviceCatalog.api.ts, deviceCatalog.hooks.ts, and deviceCatalog.types.ts instead.
 * This file can be safely deleted once the migration is fully verified.
 */

// ── Catalog types ───────────────────────────────────────────────────────────

export interface CatalogModel {
  name: string
  /** Default OS family for this model (auto-suggested when selected). */
  defaultOs?: string
}

export interface CatalogBrand {
  name: string
  /** Which device types this brand offers. */
  deviceTypes: string[]
  models: CatalogModel[]
  /** OS families this brand typically uses. */
  osNames: string[]
}

export interface OsVersionEntry {
  os: string
  versions: string[]
}

// ── Helper: sentinel for user-typed custom values ───────────────────────────

export const OTHER_VALUE = '__other__'

// ── Brand + Model catalog ───────────────────────────────────────────────────

export const BRAND_CATALOG: CatalogBrand[] = [
  // ─── Apple ────────────────────────────────────────────────────────────────
  {
    name: 'Apple',
    deviceTypes: ['Smartphone', 'Tablet', 'Laptop', 'Desktop', 'SmartWatch'],
    models: [
      // Smartphones
      { name: 'iPhone 15', defaultOs: 'iOS' },
      { name: 'iPhone 15 Plus', defaultOs: 'iOS' },
      { name: 'iPhone 15 Pro', defaultOs: 'iOS' },
      { name: 'iPhone 15 Pro Max', defaultOs: 'iOS' },
      { name: 'iPhone 16', defaultOs: 'iOS' },
      { name: 'iPhone 16 Plus', defaultOs: 'iOS' },
      { name: 'iPhone 16 Pro', defaultOs: 'iOS' },
      { name: 'iPhone 16 Pro Max', defaultOs: 'iOS' },
      // Tablets
      { name: 'iPad Air', defaultOs: 'iPadOS' },
      { name: 'iPad Pro', defaultOs: 'iPadOS' },
      { name: 'iPad mini', defaultOs: 'iPadOS' },
      // Laptops
      { name: 'MacBook Air', defaultOs: 'macOS' },
      { name: 'MacBook Pro', defaultOs: 'macOS' },
      // Desktops
      { name: 'iMac', defaultOs: 'macOS' },
      { name: 'Mac mini', defaultOs: 'macOS' },
      // Smartwatches
      { name: 'Apple Watch Series 9', defaultOs: 'watchOS' },
      { name: 'Apple Watch Ultra 2', defaultOs: 'watchOS' },
    ],
    osNames: ['iOS', 'iPadOS', 'macOS', 'watchOS'],
  },

  // ─── Samsung ──────────────────────────────────────────────────────────────
  {
    name: 'Samsung',
    deviceTypes: ['Smartphone', 'Tablet', 'SmartWatch'],
    models: [
      { name: 'Galaxy S23', defaultOs: 'Android' },
      { name: 'Galaxy S23+', defaultOs: 'Android' },
      { name: 'Galaxy S23 Ultra', defaultOs: 'Android' },
      { name: 'Galaxy S24', defaultOs: 'Android' },
      { name: 'Galaxy S24+', defaultOs: 'Android' },
      { name: 'Galaxy S24 Ultra', defaultOs: 'Android' },
      { name: 'Galaxy A54', defaultOs: 'Android' },
      { name: 'Galaxy A55', defaultOs: 'Android' },
      { name: 'Galaxy Z Flip 5', defaultOs: 'Android' },
      { name: 'Galaxy Z Fold 5', defaultOs: 'Android' },
      { name: 'Galaxy Tab S9', defaultOs: 'Android' },
      { name: 'Galaxy Watch 6', defaultOs: 'Wear OS' },
    ],
    osNames: ['Android', 'One UI', 'Wear OS'],
  },

  // ─── Google ───────────────────────────────────────────────────────────────
  {
    name: 'Google',
    deviceTypes: ['Smartphone', 'Tablet', 'SmartWatch'],
    models: [
      { name: 'Pixel 8', defaultOs: 'Android' },
      { name: 'Pixel 8 Pro', defaultOs: 'Android' },
      { name: 'Pixel 9', defaultOs: 'Android' },
      { name: 'Pixel 9 Pro', defaultOs: 'Android' },
      { name: 'Pixel 9 Pro XL', defaultOs: 'Android' },
      { name: 'Pixel Tablet', defaultOs: 'Android' },
      { name: 'Pixel Watch 2', defaultOs: 'Wear OS' },
      { name: 'Pixel Watch 3', defaultOs: 'Wear OS' },
    ],
    osNames: ['Android', 'Wear OS'],
  },

  // ─── Microsoft ────────────────────────────────────────────────────────────
  {
    name: 'Microsoft',
    deviceTypes: ['Laptop', 'Desktop', 'Tablet'],
    models: [
      { name: 'Surface Laptop 5', defaultOs: 'Windows' },
      { name: 'Surface Laptop 6', defaultOs: 'Windows' },
      { name: 'Surface Pro 9', defaultOs: 'Windows' },
      { name: 'Surface Pro 10', defaultOs: 'Windows' },
      { name: 'Surface Studio 2+', defaultOs: 'Windows' },
    ],
    osNames: ['Windows'],
  },

  // ─── Dell ─────────────────────────────────────────────────────────────────
  {
    name: 'Dell',
    deviceTypes: ['Laptop', 'Desktop'],
    models: [
      { name: 'XPS 13', defaultOs: 'Windows' },
      { name: 'XPS 15', defaultOs: 'Windows' },
      { name: 'Inspiron 14', defaultOs: 'Windows' },
      { name: 'Inspiron 15', defaultOs: 'Windows' },
      { name: 'Latitude 5440', defaultOs: 'Windows' },
      { name: 'Latitude 7440', defaultOs: 'Windows' },
    ],
    osNames: ['Windows', 'Ubuntu'],
  },

  // ─── HP ───────────────────────────────────────────────────────────────────
  {
    name: 'HP',
    deviceTypes: ['Laptop'],
    models: [
      { name: 'Spectre x360', defaultOs: 'Windows' },
      { name: 'Envy x360', defaultOs: 'Windows' },
      { name: 'Pavilion 14', defaultOs: 'Windows' },
      { name: 'Pavilion 15', defaultOs: 'Windows' },
      { name: 'EliteBook 840', defaultOs: 'Windows' },
    ],
    osNames: ['Windows'],
  },

  // ─── Lenovo ───────────────────────────────────────────────────────────────
  {
    name: 'Lenovo',
    deviceTypes: ['Laptop'],
    models: [
      { name: 'ThinkPad X1 Carbon', defaultOs: 'Windows' },
      { name: 'ThinkPad T14', defaultOs: 'Windows' },
      { name: 'Yoga 7', defaultOs: 'Windows' },
      { name: 'IdeaPad Slim 5', defaultOs: 'Windows' },
    ],
    osNames: ['Windows'],
  },

  // ─── Asus ─────────────────────────────────────────────────────────────────
  {
    name: 'Asus',
    deviceTypes: ['Laptop'],
    models: [
      { name: 'Zenbook 14', defaultOs: 'Windows' },
      { name: 'Vivobook 15', defaultOs: 'Windows' },
      { name: 'ROG Zephyrus G14', defaultOs: 'Windows' },
    ],
    osNames: ['Windows'],
  },

  // ─── Acer ─────────────────────────────────────────────────────────────────
  {
    name: 'Acer',
    deviceTypes: ['Laptop'],
    models: [
      { name: 'Swift 3', defaultOs: 'Windows' },
      { name: 'Aspire 5', defaultOs: 'Windows' },
      { name: 'Nitro 5', defaultOs: 'Windows' },
    ],
    osNames: ['Windows'],
  },

  // ─── Xiaomi ───────────────────────────────────────────────────────────────
  {
    name: 'Xiaomi',
    deviceTypes: ['Smartphone', 'Tablet', 'SmartWatch'],
    models: [
      { name: 'Redmi Note 13', defaultOs: 'Android' },
      { name: 'Xiaomi 14', defaultOs: 'Android' },
      { name: 'Pad 6', defaultOs: 'Android' },
      { name: 'Watch 2', defaultOs: 'Wear OS' },
    ],
    osNames: ['Android', 'HyperOS', 'Wear OS'],
  },
]

// ─── OS version catalog ─────────────────────────────────────────────────────

export const OS_VERSION_CATALOG: OsVersionEntry[] = [
  { os: 'iOS', versions: ['18', '17', '16'] },
  { os: 'iPadOS', versions: ['18', '17', '16'] },
  { os: 'macOS', versions: ['Sequoia', 'Sonoma', 'Ventura'] },
  { os: 'watchOS', versions: ['11', '10', '9'] },
  { os: 'Android', versions: ['15', '14', '13', '12'] },
  { os: 'Windows', versions: ['11', '10'] },
  { os: 'Ubuntu', versions: ['24.04', '22.04', '20.04'] },
  { os: 'Wear OS', versions: ['5', '4', '3'] },
  { os: 'One UI', versions: ['6', '5'] },
  { os: 'HyperOS', versions: ['2', '1'] },
]

// ── Derived helpers ─────────────────────────────────────────────────────────

/** Get brands that offer a specific device type. */
export function getBrandsForDeviceType(deviceType: string): CatalogBrand[] {
  return BRAND_CATALOG.filter((b) => b.deviceTypes.includes(deviceType))
}

/** Get models for a given brand name, optionally filtered by device type heuristic. */
export function getModelsForBrand(brandName: string): CatalogModel[] {
  const brand = BRAND_CATALOG.find((b) => b.name === brandName)
  return brand?.models ?? []
}

/** Get OS names for a given brand. */
export function getOsNamesForBrand(brandName: string): string[] {
  const brand = BRAND_CATALOG.find((b) => b.name === brandName)
  return brand?.osNames ?? []
}

/** Get OS versions for a given OS name. */
export function getOsVersions(osName: string): string[] {
  const entry = OS_VERSION_CATALOG.find((e) => e.os === osName)
  return entry?.versions ?? []
}

/** Look up the default OS for a specific model of a brand. */
export function getDefaultOsForModel(brandName: string, modelName: string): string | undefined {
  const brand = BRAND_CATALOG.find((b) => b.name === brandName)
  const model = brand?.models.find((m) => m.name === modelName)
  return model?.defaultOs
}
