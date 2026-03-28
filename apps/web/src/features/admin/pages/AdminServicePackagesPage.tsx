import { useMemo, useState } from 'react'
import { Package, Plus, Pencil, Eye, EyeOff, Power, PowerOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ApiError } from '@/types/api'
import { AdminSpinner, AdminError, AdminEmpty } from '../components/AdminStateViews'
import { AddServicePackageModal } from '../servicePackages/AddServicePackageModal'
import { EditServicePackageModal } from '../servicePackages/EditServicePackageModal'
import {
  useAdminServicePackagesList,
  useUpdateAdminServicePackageStatus,
} from '../servicePackages/adminServicePackages.hooks'
import type { AdminServicePackage } from '../servicePackages/adminServicePackages.types'

function formatMoney(price: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  } catch {
    return `${currency.toUpperCase()} ${price.toFixed(2)}`
  }
}

function packageStatusLabel(item: AdminServicePackage) {
  return item.isActive ? 'Active' : 'Inactive'
}

export function AdminServicePackagesPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [statusBusyId, setStatusBusyId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const { data: packages = [], isLoading, isFetching, isError, refetch } = useAdminServicePackagesList()
  const statusMutation = useUpdateAdminServicePackageStatus()

  const editingPackage = useMemo(
    () => packages.find((item) => item.id === editingId) ?? null,
    [packages, editingId],
  )

  function toggleStatus(item: AdminServicePackage) {
    setStatusMessage(null)
    setStatusBusyId(item.id)
    statusMutation.mutate(
      { id: item.id, isActive: !item.isActive },
      {
        onSuccess: (updated) => {
          setStatusMessage(`${updated.title} is now ${updated.isActive ? 'active' : 'inactive'}.`)
        },
        onError: (error) => {
          setStatusMessage((error as ApiError).message)
        },
        onSettled: () => setStatusBusyId(null),
      },
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Packages</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage available packages, pricing, and active visibility.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setStatusMessage(null)
            setShowCreate(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add package
        </button>
      </div>

      <p className="sr-only" aria-live="polite">{statusMessage ?? ''}</p>

      {isFetching && !isLoading && (
        <p className="text-xs text-gray-500" role="status" aria-live="polite">Refreshing service packages…</p>
      )}

      {statusMutation.isError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {(statusMutation.error as ApiError).message}
        </p>
      )}

      <div
        className={cn('rounded-xl border border-gray-200 bg-white overflow-hidden', statusMutation.isPending && 'opacity-90')}
        aria-busy={isLoading || statusMutation.isPending}
      >
        {isLoading && <AdminSpinner />}

        {isError && (
          <AdminError
            message="Failed to load service packages."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && packages.length === 0 && (
          <div className="space-y-3 py-8">
            <AdminEmpty
              icon={<Package className="w-10 h-10" />}
              message="No service packages found. Create one to get started."
            />
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
              >
                <Plus className="h-4 w-4" />
                Add first package
              </button>
            </div>
          </div>
        )}

        {!isLoading && !isError && packages.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Service packages table">
              <caption className="sr-only">Service packages available for booking and administration</caption>
              <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th scope="col" className="text-left font-medium px-4 py-3">Package</th>
                  <th scope="col" className="text-left font-medium px-4 py-3">Code</th>
                  <th scope="col" className="text-left font-medium px-4 py-3">Price</th>
                  <th scope="col" className="text-left font-medium px-4 py-3">Currency</th>
                  <th scope="col" className="text-left font-medium px-4 py-3">Duration</th>
                  <th scope="col" className="text-left font-medium px-4 py-3">Status</th>
                  <th scope="col" className="text-right font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 align-top">
                    <th scope="row" className="px-4 py-3 min-w-64 text-left">
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</div>
                    </th>
                    <td className="px-4 py-3 text-gray-700 font-mono text-xs">{item.code}</td>
                    <td className="px-4 py-3 text-gray-700">{formatMoney(item.price, item.currency)}</td>
                    <td className="px-4 py-3 text-gray-700">{item.currency}</td>
                    <td className="px-4 py-3 text-gray-700">{item.durationMinutes} min</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          'inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium',
                          item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700',
                        )}>
                          {packageStatusLabel(item)}
                        </span>
                        <span className={cn(
                          'inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                          item.isVisible ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500',
                        )}>
                          {item.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {item.isVisible ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setStatusMessage(null)
                            setEditingId(item.id)
                          }}
                          aria-label={`Edit ${item.title}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={statusBusyId === item.id}
                          onClick={() => toggleStatus(item)}
                          aria-label={`${item.isActive ? 'Deactivate' : 'Activate'} ${item.title}`}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                            item.isActive
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200',
                            statusBusyId === item.id && 'opacity-50 cursor-not-allowed',
                          )}
                        >
                          {item.isActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                          {statusBusyId === item.id ? 'Updating...' : item.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddServicePackageModal open={showCreate} onClose={() => setShowCreate(false)} />

      <EditServicePackageModal
        open={!!editingPackage}
        packageItem={editingPackage}
        onClose={() => setEditingId(null)}
      />
    </div>
  )
}
