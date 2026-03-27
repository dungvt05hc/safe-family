import { useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import {
  Badge, Button, LoadingState, Alert, NoDevicesEmpty,
  TableContainer, Table, Thead, Tbody, Th, Tr, Td,
} from '@/components/ui'
import type { BadgeVariant } from '@/components/ui'
import { useDevices } from '../hooks/useDevices'
import { useArchiveDevice } from '../hooks/useDeviceMutations'
import { AddDeviceModal } from '../components/AddDeviceModal'
import { EditDeviceModal } from '../components/EditDeviceModal'
import { useFamilyMembers } from '@/features/families/hooks/useFamilyMembers'
import { ApiError } from '@/types/api'
import type { Device, DeviceFilters, DeviceType, SupportStatus } from '../devices.types'
import { DEVICE_TYPES, DEVICE_TYPE_LABELS, SUPPORT_STATUSES, SUPPORT_STATUS_LABELS } from '../devices.types'

function supportVariant(status: SupportStatus): BadgeVariant {
  if (status === 'Supported') return 'success'
  if (status === 'EndOfLife') return 'danger'
  if (status === 'NoLongerReceivingUpdates') return 'warning'
  return 'neutral'
}

function BoolIcon({ value }: { value: boolean }) {
  return value
    ? <span className="text-green-600 font-bold" title="Enabled">✓</span>
    : <span className="text-gray-300" title="Disabled">✗</span>
}

const selectClass =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
const inputClass =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

export function DevicesPage() {
  const { data: members = [] } = useFamilyMembers()
  const [filters, setFilters] = useState<DeviceFilters>({})
  const { data: devices, isLoading, isError, error } = useDevices(filters)
  const { mutate: archive } = useArchiveDevice()
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState<Device | null>(null)

  function memberName(memberId: string | null) {
    if (!memberId) return null
    return members.find((m) => m.id === memberId)?.displayName ?? null
  }

  function handleArchive(id: string) {
    if (!confirm('Archive this device? It will be hidden but not permanently deleted.')) return
    archive(id)
  }

  return (
    <PageLayout
      title="Devices"
      description="Track family devices and their security configuration."
      action={<Button onClick={() => setShowAdd(true)}>+ Add device</Button>}
    >
      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={filters.memberId ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, memberId: e.target.value || undefined }))}
          className={selectClass}
        >
          <option value="">All members</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.displayName}</option>
          ))}
        </select>

        <select
          value={filters.deviceType ?? ''}
          onChange={(e) =>
            setFilters((f) => ({ ...f, deviceType: (e.target.value || undefined) as DeviceType | undefined }))
          }
          className={selectClass}
        >
          <option value="">All types</option>
          {DEVICE_TYPES.map((t) => (
            <option key={t} value={t}>{DEVICE_TYPE_LABELS[t]}</option>
          ))}
        </select>

        <select
          value={filters.supportStatus ?? ''}
          onChange={(e) =>
            setFilters((f) => ({ ...f, supportStatus: (e.target.value || undefined) as SupportStatus | undefined }))
          }
          className={selectClass}
        >
          <option value="">All statuses</option>
          {SUPPORT_STATUSES.map((s) => (
            <option key={s} value={s}>{SUPPORT_STATUS_LABELS[s]}</option>
          ))}
        </select>

        <input
          type="search"
          placeholder="Search brand, model, OS…"
          value={filters.search ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
          className={inputClass}
        />

        {(filters.memberId || filters.deviceType || filters.supportStatus || filters.search) && (
          <button
            type="button"
            onClick={() => setFilters({})}
            className="text-sm text-gray-500 underline hover:text-gray-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {isLoading && <LoadingState />}

      {isError && (
        <Alert variant="error">
          {error instanceof ApiError ? error.message : 'Failed to load devices.'}
        </Alert>
      )}

      {!isLoading && !isError && devices && devices.length === 0 && (
        <NoDevicesEmpty onAdd={() => setShowAdd(true)} />
      )}

      {!isLoading && !isError && devices && devices.length > 0 && (
        <>
          {/* Desktop table */}
          <TableContainer className="hidden md:block">
            <Table>
              <Thead>
                <tr>
                  <Th>Type</Th>
                  <Th>Device</Th>
                  <Th>Member</Th>
                  <Th>OS</Th>
                  <Th>Support</Th>
                  <Th align="center" title="Screen lock">🔒</Th>
                  <Th align="center" title="Biometric">👆</Th>
                  <Th align="center" title="Backup">☁</Th>
                  <Th align="center" title="Find my device">📍</Th>
                  <Th />
                </tr>
              </Thead>
              <Tbody>
                {devices.map((device) => (
                  <Tr key={device.id}>
                    <Td className="whitespace-nowrap font-medium text-gray-900">
                      {DEVICE_TYPE_LABELS[device.deviceType]}
                    </Td>
                    <Td>{device.brand} {device.model}</Td>
                    <Td className="text-gray-600">
                      {memberName(device.memberId) ?? <span className="text-gray-400 italic">Unassigned</span>}
                    </Td>
                    <Td className="whitespace-nowrap text-gray-600">{device.osName} {device.osVersion}</Td>
                    <Td className="whitespace-nowrap">
                      <Badge variant={supportVariant(device.supportStatus)}>
                        {SUPPORT_STATUS_LABELS[device.supportStatus]}
                      </Badge>
                    </Td>
                    <Td align="center"><BoolIcon value={device.screenLockEnabled} /></Td>
                    <Td align="center"><BoolIcon value={device.biometricEnabled} /></Td>
                    <Td align="center"><BoolIcon value={device.backupEnabled} /></Td>
                    <Td align="center"><BoolIcon value={device.findMyDeviceEnabled} /></Td>
                    <Td align="right" className="whitespace-nowrap">
                      <Button variant="ghost" size="sm" onClick={() => setEditTarget(device)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 text-red-600 hover:text-red-700"
                        onClick={() => handleArchive(device.id)}
                      >
                        Archive
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          {/* Mobile card list */}
          <ul className="space-y-3 md:hidden">
            {devices.map((device) => (
              <li
                key={device.id}
                className="rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {device.brand} {device.model}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {DEVICE_TYPE_LABELS[device.deviceType]} · {device.osName} {device.osVersion}
                    </p>
                    {memberName(device.memberId) && (
                      <p className="mt-0.5 text-sm text-gray-500">{memberName(device.memberId)}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant={supportVariant(device.supportStatus)}>
                        {SUPPORT_STATUS_LABELS[device.supportStatus]}
                      </Badge>
                      {device.screenLockEnabled && <Badge variant="info">Screen lock</Badge>}
                      {device.biometricEnabled && <Badge variant="info">Biometric</Badge>}
                      {device.backupEnabled && <Badge variant="info">Backup</Badge>}
                      {device.findMyDeviceEnabled && <Badge variant="info">Find my device</Badge>}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditTarget(device)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleArchive(device.id)}
                    >
                      Archive
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {showAdd && <AddDeviceModal onClose={() => setShowAdd(false)} />}
      {editTarget && (
        <EditDeviceModal device={editTarget} onClose={() => setEditTarget(null)} />
      )}
    </PageLayout>
  )
}
