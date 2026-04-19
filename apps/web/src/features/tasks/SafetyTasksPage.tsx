import { useMemo, useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Alert, LoadingState } from '@/components/ui'
import { ApiError } from '@/types/api'
import { DEFAULT_TASK_FILTERS, type SafetyTaskFilters } from './safety-tasks.types'
import { useSafetyTasks } from './safety-tasks.hooks'
import { SafetyTaskSummaryCards } from './components/SafetyTaskSummaryCards'
import { SafetyTaskFilters as SafetyTaskFilterBar } from './components/SafetyTaskFilters'
import { SafetyTaskList } from './components/SafetyTaskList'

export function SafetyTasksPage() {
  const { data: tasks = [], isLoading, isError, error } = useSafetyTasks()

  const [filters, setFilters] = useState<SafetyTaskFilters>(DEFAULT_TASK_FILTERS)

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

  const isFiltered =
    filters.search   !== '' ||
    filters.status   !== 'All' ||
    filters.priority !== 'All' ||
    filters.phase    !== 'All' ||
    filters.category !== 'All'

  return (
    <PageLayout
      title="Safety Tasks"
      description="Actionable steps to improve your family's digital safety."
    >
      {/* Loading */}
      {isLoading && <LoadingState />}

      {/* Error */}
      {isError && (
        <Alert variant="error">
          {error instanceof ApiError ? error.message : 'Failed to load your safety tasks.'}
        </Alert>
      )}

      {!isLoading && !isError && (
        <div className="flex flex-col gap-6">
          {/* Summary cards */}
          <SafetyTaskSummaryCards tasks={tasks} />

          {/* Filters */}
          <SafetyTaskFilterBar
            filters={filters}
            onChange={setFilters}
            itemCount={filteredTasks.length}
          />

          {/* Task list */}
          <SafetyTaskList tasks={filteredTasks} isFiltered={isFiltered} />
        </div>
      )}
    </PageLayout>
  )
}
