import { useMemo, useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Alert, LoadingState } from '@/components/ui'
import { ApiError } from '@/types/api'
import { DEFAULT_FILTERS, type ChecklistFilters } from './checklist.types'
import { useChecklistItems } from './checklist.hooks'
import { ChecklistSummary } from './components/ChecklistSummary'
import { ChecklistFilters as ChecklistFilterBar } from './components/ChecklistFilters'
import { ChecklistList } from './components/ChecklistList'

// ── Component ─────────────────────────────────────────────────────────────────

export function ChecklistPage() {
  const { data: items = [], isLoading, isError, error } = useChecklistItems()

  const [filters, setFilters] = useState<ChecklistFilters>(DEFAULT_FILTERS)

  // Derive filtered list — memoised so the heavy filter pass only runs when
  // items or filters actually change.
  const filteredItems = useMemo(() => {
    const search = filters.search.toLowerCase().trim()

    return items.filter((item) => {
      if (filters.priority !== 'All' && item.priority !== Number(filters.priority)) return false
      if (filters.status   !== 'All' && item.status   !== filters.status)   return false
      if (filters.category !== 'All' && item.category !== filters.category) return false
      if (search && !item.title.toLowerCase().includes(search) &&
                    !item.description.toLowerCase().includes(search)) return false
      return true
    })
  }, [items, filters])

  const isFiltered =
    filters.search   !== '' ||
    filters.priority !== 'All' ||
    filters.status   !== 'All' ||
    filters.category !== 'All'

  return (
    <PageLayout
      title="Checklist"
      description="Track the most important actions to improve your family's digital safety."
    >
      {/* Loading */}
      {isLoading && <LoadingState />}

      {/* Error */}
      {isError && (
        <Alert variant="error">
          {error instanceof ApiError ? error.message : 'Failed to load your checklist.'}
        </Alert>
      )}

      {/* Content — shown once data is available */}
      {!isLoading && !isError && (
        <div className="flex flex-col gap-5">
          {/* Summary cards */}
          <ChecklistSummary items={items} />

          {/* Filters */}
          <ChecklistFilterBar
            filters={filters}
            onChange={setFilters}
            itemCount={filteredItems.length}
          />

          {/* Item list */}
          <ChecklistList items={filteredItems} isFiltered={isFiltered} />
        </div>
      )}
    </PageLayout>
  )
}
