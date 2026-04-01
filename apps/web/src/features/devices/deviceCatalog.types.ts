// ── Catalog API shapes (match CatalogDtos.cs) ──────────────────────────────

/** Matches CatalogItemDto — used by device types, brands, OS families, OS versions */
export interface CatalogItem {
  id: string
  code: string
  name: string
}

/** Matches CatalogModelDto — includes the default OS family for auto-selection */
export interface CatalogModel {
  id: string
  code: string
  name: string
  defaultOsFamilyId: string | null
  defaultOsFamilyCode: string | null
}

/** Matches CatalogFormOptionsDto — aggregated response from /form-options */
export interface CatalogFormOptions {
  deviceTypes: CatalogItem[]
  brands: CatalogItem[]
  models: CatalogModel[]
  osFamilies: CatalogItem[]
  osVersions: CatalogItem[]
}
