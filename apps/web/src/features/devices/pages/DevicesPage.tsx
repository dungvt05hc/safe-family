import { useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import {
  Badge, Button, LoadingState, Alert, NoDevicesEmpty,
  TableContainer, Table, Thead, Tbody, Th, Tr, Td,
} from '@/components/ui'
import type { BadgeVariant } from '@/components/ui'
import { useDevices } from '../hooks/useDevices'
import { AddDeviceModal } from '../components/AddDeviceModal'
import { EditDeviceModal } from '../components/EditDeviceModal'
import { ApiError } from '@/types/api'
import type { Device } from '../devices.types'

function supportVariant(status: string): BadgeVariant {
  if (status === 'Supported') return 'success'
  if (status === 'EndOfLife') return 'danger'
  if (status === 'NoLongerReceivingUpdates') return 'warning'
  return 'neutral'
}

function supportLabel(status: string): string {
  if (status === 'EndOfLife') return 'End of life'
  if (status === 'NoLongerReceivingUpdates') return 'No updates'
  return status
}

function BoolIcon({ value }: { value: boolean }) {
  if (value) {
    return <span className="text-green-600" title="Enabled">✓</span>
  }
  return <span className="text-gray-300" title="Disabled">✗</span>
}

export function DevicesPage() {
  const { data: devices, isLoading, isError, error } = useDevices()
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState<Device | null>(null)

  return (
    <PageLayout
      title="Devices"
      description="Track family devices and their security configuration."
      action={<Button onClick={() => setShowAdd(true)}>+ Add device</Button>}
    >
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
                    <Td className="whitespace-nowrap font-medium text-gray-900">{device.deviceType}</Td>
                    <Td>{device.brand} {device.model}</Td>
                    <Td className="whitespace-nowrap text-gray-600">{device.osName} {device.osVersion}</Td>
                    <Td className="whitespace-nowrap">
                      <Badge variant={supportVariant(device.supportStatus)}>
                        {supportLabel(device.supportStatus)}
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
                      {device.deviceType} · {device.osName} {device.osVersion}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant={supportVariant(device.supportStatus)}>
                        {supportLabel(device.supportStatus)}
                      </Badge>
                      {device.screenLockEnabled && (
                        <Badge variant="info">Screen lock</Badge>
                      )}
                      {device.biometricEnabled && (
                        <Badge variant="info">Biometric</Badge>
                      )}
                      {device.backupEnabled && (
                        <Badge variant="info">Backup</Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setEditTarget(device)} className="shrink-0">
                    Edit
                  </Button>
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
