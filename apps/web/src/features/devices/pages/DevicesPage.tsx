import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { useApiError } from '@/lib/i18n/useApiError'
import type { Device, DeviceFilters, SupportStatus } from '../devices.types'
import { SUPPORT_STATUSES } from '../devices.types'
import { useDeviceTypes } from '../deviceCatalog.hooks'

function supportVariant(status: SupportStatus): BadgeVariant {
  if (status === 'Supported') return 'success'
  if (status === 'EndOfLife') return 'danger'
  if (status === 'NoLongerReceivingUpdates') return 'warning'
  return 'neutral'
}

function BoolIcon({ value, labelOn, labelOff }: { value: boolean; labelOn: string; labelOff: string }) {
  return value
    ? <span className="text-green-600 font-bold" title={labelOn}>✓</span>
    : <span className="text-gray-300" title={labelOff}>✗</span>
}

const selectClass =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
const inputClass =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

export function DevicesPage() {
  const { data: members = [] } = useFamilyMembers()
  const { data: catalogTypes = [] } = useDeviceTypes()
  const [filters, setFilters] = useState<DeviceFilters>({})
  const { data: devices, isLoading, isError, error } = useDevices(filters)
  const { mutate: archive } = useArchiveDevice()
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState<Device | null>(null)
  const { t } = useTranslation('devices')
  const loadError = useApiError(error, 'load.devices')

  function memberName(memberId: string | null) {
    if (!memberId) return null
    return members.find((m) => m.id === memberId)?.displayName ?? null
  }

  function handleArchive(id: string) {
    if (!confirm(t('archiveConfirm'))) return
    archive(id)
  }

  return (
    <PageLayout
      title={t('pageTitle')}
      description={t('pageDescription')}
      action={<Button onClick={() => setShowAdd(true)}>{t('addDevice')}</Button>}
    >
      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={filters.memberId ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, memberId: e.target.value || undefined }))}
          className={selectClass}
        >
          <option value="">{t('filter.allMembers')}</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.displayName}</option>
          ))}
        </select>

        <select
          value={filters.deviceTypeCode ?? ''}
          onChange={(e) =>
            setFilters((f) => ({ ...f, deviceTypeCode: e.target.value || undefined }))
          }
          className={selectClass}
        >
          <option value="">{t('filter.allTypes')}</option>
          {catalogTypes.map((t) => (
            <option key={t.code} value={t.code}>{t.name}</option>
          ))}
        </select>

        <select
          value={filters.supportStatus ?? ''}
          onChange={(e) =>
            setFilters((f) => ({ ...f, supportStatus: (e.target.value || undefined) as SupportStatus | undefined }))
          }
          className={selectClass}
        >
          <option value="">{t('filter.allStatuses')}</option>
          {SUPPORT_STATUSES.map((s) => (
            <option key={s} value={s}>{t(`supportStatus.${s}` as const)}</option>
          ))}
        </select>

        <input
          type="search"
          placeholder={t('filter.searchPlaceholder')}
          value={filters.search ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
          className={inputClass}
        />

        {(filters.memberId || filters.deviceTypeCode || filters.supportStatus || filters.search) && (
          <button
            type="button"
            onClick={() => setFilters({})}
            className="text-sm text-gray-500 underline hover:text-gray-700"
          >
            {t('filter.clearFilters')}
          </button>
        )}
      </div>

      {isLoading && <LoadingState />}

      {isError && (
        <Alert variant="error">
          {loadError}
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
                  <Th>{t('col.type')}</Th>
                  <Th>{t('col.device')}</Th>
                  <Th>{t('col.member')}</Th>
                  <Th>{t('col.os')}</Th>
                  <Th>{t('col.support')}</Th>
                  <Th align="center" title={t('col.screenLock')}>🔒</Th>
                  <Th align="center" title={t('col.biometric')}>👆</Th>
                  <Th align="center" title={t('col.backup')}>☁</Th>
                  <Th align="center" title={t('col.findMyDevice')}>📍</Th>
                  <Th />
                </tr>
              </Thead>
              <Tbody>
                {devices.map((device) => (
                  <Tr key={device.id}>
                    <Td className="whitespace-nowrap font-medium text-gray-900">
                      {device.deviceTypeName}
                    </Td>
                    <Td>{device.brandName} {device.modelName}</Td>
                    <Td className="text-gray-600">
                      {memberName(device.memberId) ?? <span className="text-gray-400 italic">{t('unassigned')}</span>}
                    </Td>
                    <Td className="whitespace-nowrap text-gray-600">{device.osFamilyName} {device.osVersionName}</Td>
                    <Td className="whitespace-nowrap">
                      <Badge variant={supportVariant(device.supportStatus)}>
                        {t(`supportStatus.${device.supportStatus}` as const)}
                      </Badge>
                    </Td>
                    <Td align="center"><BoolIcon value={device.screenLockEnabled} labelOn={t('securityEnabled')} labelOff={t('securityDisabled')} /></Td>
                    <Td align="center"><BoolIcon value={device.biometricEnabled} labelOn={t('securityEnabled')} labelOff={t('securityDisabled')} /></Td>
                    <Td align="center"><BoolIcon value={device.backupEnabled} labelOn={t('securityEnabled')} labelOff={t('securityDisabled')} /></Td>
                    <Td align="center"><BoolIcon value={device.findMyDeviceEnabled} labelOn={t('securityEnabled')} labelOff={t('securityDisabled')} /></Td>
                    <Td align="right" className="whitespace-nowrap">
                      <Button variant="ghost" size="sm" onClick={() => setEditTarget(device)}>
                        {t('action.edit')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 text-red-600 hover:text-red-700"
                        onClick={() => handleArchive(device.id)}
                      >
                        {t('action.archive')}
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
                      {device.brandName} {device.modelName}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {device.deviceTypeName} · {device.osFamilyName} {device.osVersionName}
                    </p>
                    {memberName(device.memberId) && (
                      <p className="mt-0.5 text-sm text-gray-500">{memberName(device.memberId)}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant={supportVariant(device.supportStatus)}>
                        {t(`supportStatus.${device.supportStatus}` as const)}
                      </Badge>
                      {device.screenLockEnabled && <Badge variant="info">{t('badge.screenLock')}</Badge>}
                      {device.biometricEnabled && <Badge variant="info">{t('badge.biometric')}</Badge>}
                      {device.backupEnabled && <Badge variant="info">{t('badge.backup')}</Badge>}
                      {device.findMyDeviceEnabled && <Badge variant="info">{t('badge.findMyDevice')}</Badge>}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditTarget(device)}>
                      {t('action.edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleArchive(device.id)}
                    >
                      {t('action.archive')}
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
