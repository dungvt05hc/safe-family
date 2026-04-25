import { useMemo, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Alert, EmptyState, LoadingState, PremiumLockedState, UpgradeCTACard } from '@/components/ui'
import { useApiError } from '@/lib/i18n/useApiError'
import { useEntitlements } from '@/features/entitlements/EntitlementProvider'
import {
  DEFAULT_TASK_FILTERS,
  type SafetyTask,
  type SafetyTaskFilters,
  type TaskPhase,
} from './safety-tasks.types'
import { useSafetyTasks } from './safety-tasks.hooks'
import { ChecklistFilters } from './components/ChecklistFilters'
import { ChecklistSummaryCards } from './components/ChecklistSummaryCards'
import { ChecklistTaskGroup } from './components/ChecklistTaskGroup'

// ── Constants ─────────────────────────────────────────────────────────────────

/** Phase display order — most urgent first. */
const PHASE_ORDER: TaskPhase[] = [
  'Immediate',
  'Next7Days',
  'Next30Days',
  'Ongoing',
  'Recurring',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupByPhase(tasks: SafetyTask[]): Partial<Record<TaskPhase, SafetyTask[]>> {
  const result: Partial<Record<TaskPhase, SafetyTask[]>> = {}
  for (const task of tasks) {
    if (!result[task.phase]) result[task.phase] = []
    result[task.phase]!.push(task)
  }
  return result
}

// ── Empty states ──────────────────────────────────────────────────────────────

function NoTasks() {
  return (
    <EmptyState
      icon={ShieldCheck}
      title="No safety tasks yet"
      description="SafeFamily generates tasks from your assessment, accounts, devices, and active plans. Complete an assessment to get started."
      iconColor="bg-blue-50 text-blue-500"
    />
  )
}

function NoResults() {
  return (
    <EmptyState
      icon={ShieldCheck}
      title="No matching tasks"
      description="Try adjusting your filters or search to find what you're looking for."
      iconColor="bg-gray-100 text-gray-400"
    />
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function PremiumChecklistPage() {
  const { hasEntitlement, isLoading: entitlementsLoading } = useEntitlements()
  const { data: tasks = [], isLoading, isError, error } = useSafetyTasks()
  const loadError = useApiError(error, 'load.tasks')
  const [filters, setFilters] = useState<SafetyTaskFilters>(DEFAULT_TASK_FILTERS)

  // ── Premium gate ────────────────────────────────────────────────────────────
  // Grant access if the user has PremiumChecklistAccess OR FamilySafetyPlanAccess
  // (any active plan with safety task generation should unlock this view).
  const hasPremiumAccess =
    hasEntitlement('PremiumChecklistAccess') ||
    hasEntitlement('FamilySafetyPlanAccess')

  if (!entitlementsLoading && !hasPremiumAccess) {
    return (
      <PageLayout
        title="Premium Checklist"
        description="Your personalised, prioritised safety action list."
      >
        <PremiumLockedState product="PremiumChecklist" />
      </PageLayout>
    )
  }

  // ── Client-side filtering ───────────────────────────────────────────────────

  const filteredTasks = useMemo(() => {
    const search = filters.search.toLowerCase().trim()

    return tasks.filter((task) => {
      if (filters.status   !== 'All' && task.status   !== filters.status)   return false
      if (filters.priority !== 'All' && task.priority !== filters.priority) return false
      if (filters.phase    !== 'All' && task.phase    !== filters.phase)    return false
      if (filters.category !== 'All' && task.category !== filters.category) return false
      if (search && !task.title.toLowerCase().includes(search) &&
                    !task.description.toLowerCase().includes(search)) return false
      return true
    })
  }, [tasks, filters])

  const grouped = useMemo(() => groupByPhase(filteredTasks), [filteredTasks])

  const visibleGroupCount = PHASE_ORDER.filter((p) => (grouped[p]?.length ?? 0) > 0).length

  const isFiltered =
    filters.search   !== '' ||
    filters.status   !== 'All' ||
    filters.priority !== 'All' ||
    filters.phase    !== 'All' ||
    filters.category !== 'All'

  return (
    <PageLayout
      title="Premium Checklist"
      description="Your personalised, prioritised safety action list — grouped by urgency."
    >
      {/* Loading skeleton */}
      {(isLoading || entitlementsLoading) && <LoadingState />}

      {/* Error */}
      {isError && !isLoading && (
        <Alert variant="error">
          {loadError}
        </Alert>
      )}

      {/* Content */}
      {!isLoading && !entitlementsLoading && !isError && (
        <div className="flex flex-col gap-6">
          {/* Summary stat cards */}
          <ChecklistSummaryCards />

          {/* Annual Plan upgrade nudge for users without subscription */}
          {!hasEntitlement('AnnualPlanSubscription') && (
            <UpgradeCTACard
              product="AnnualPlan"
              pitchOverride="Unlock recurring annual safety tasks and yearly security check-ins for your family."
              dismissible
            />
          )}

          {/* Filters */}
          <ChecklistFilters
            filters={filters}
            onChange={setFilters}
            itemCount={filteredTasks.length}
          />

          {/* Grouped task list */}
          {tasks.length === 0 ? (
            <NoTasks />
          ) : visibleGroupCount === 0 ? (
            <NoResults />
          ) : (
            <div className="flex flex-col gap-1">
              {PHASE_ORDER.map((phase, i) =>
                (grouped[phase]?.length ?? 0) > 0 ? (
                  <ChecklistTaskGroup
                    key={phase}
                    phase={phase}
                    tasks={grouped[phase]!}
                    index={isFiltered ? 0 : i}
                  />
                ) : null,
              )}
            </div>
          )}
        </div>
      )}
    </PageLayout>
  )
}
