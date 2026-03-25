import { useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import {
  Badge, Button, LoadingState, Alert, NoAccountsEmpty,
  TableContainer, Table, Thead, Tbody, Th, Tr, Td,
} from '@/components/ui'
import type { BadgeVariant } from '@/components/ui'
import { useAccounts } from '../hooks/useAccounts'
import { AddAccountModal } from '../components/AddAccountModal'
import { EditAccountModal } from '../components/EditAccountModal'
import { ApiError } from '@/types/api'
import type { Account } from '../accounts.types'

function twoFactorVariant(status: string): BadgeVariant {
  if (status === 'Enabled') return 'success'
  if (status === 'Disabled') return 'danger'
  return 'neutral'
}

function recoveryVariant(status: string): BadgeVariant {
  if (status === 'Set') return 'success'
  if (status === 'NotSet') return 'warning'
  return 'neutral'
}

function recoveryLabel(status: string): string {
  if (status === 'NotSet') return 'Not set'
  return status
}

export function AccountsPage() {
  const { data: accounts, isLoading, isError, error } = useAccounts()
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState<Account | null>(null)

  return (
    <PageLayout
      title="Accounts"
      description="Track family accounts and their security status."
      action={<Button onClick={() => setShowAdd(true)}>+ Add account</Button>}
    >
      {isLoading && <LoadingState />}

      {isError && (
        <Alert variant="error">
          {error instanceof ApiError ? error.message : 'Failed to load accounts.'}
        </Alert>
      )}

      {!isLoading && !isError && accounts && accounts.length === 0 && (
        <NoAccountsEmpty onAdd={() => setShowAdd(true)} />
      )}

      {!isLoading && !isError && accounts && accounts.length > 0 && (
        <>
          {/* Desktop table */}
          <TableContainer className="hidden md:block">
            <Table>
              <Thead>
                <tr>
                  <Th>Type</Th>
                  <Th>Identifier</Th>
                  <Th>2FA</Th>
                  <Th>Recovery email</Th>
                  <Th>Recovery phone</Th>
                  <Th>Suspicious</Th>
                  <Th />
                </tr>
              </Thead>
              <Tbody>
                {accounts.map((account) => (
                  <Tr key={account.id}>
                    <Td className="whitespace-nowrap font-medium text-gray-900">{account.accountType}</Td>
                    <Td>{account.maskedIdentifier}</Td>
                    <Td className="whitespace-nowrap">
                      <Badge variant={twoFactorVariant(account.twoFactorStatus)}>
                        {account.twoFactorStatus}
                      </Badge>
                    </Td>
                    <Td className="whitespace-nowrap">
                      <Badge variant={recoveryVariant(account.recoveryEmailStatus)}>
                        {recoveryLabel(account.recoveryEmailStatus)}
                      </Badge>
                    </Td>
                    <Td className="whitespace-nowrap">
                      <Badge variant={recoveryVariant(account.recoveryPhoneStatus)}>
                        {recoveryLabel(account.recoveryPhoneStatus)}
                      </Badge>
                    </Td>
                    <Td className="whitespace-nowrap">
                      {account.suspiciousActivityFlag
                        ? <Badge variant="danger">⚠ Yes</Badge>
                        : <span className="text-gray-400">—</span>}
                    </Td>
                    <Td align="right" className="whitespace-nowrap">
                      <Button variant="ghost" size="sm" onClick={() => setEditTarget(account)}>
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
            {accounts.map((account) => (
              <li
                key={account.id}
                className="rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{account.accountType}</p>
                    <p className="mt-0.5 text-sm text-gray-500">{account.maskedIdentifier}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant={twoFactorVariant(account.twoFactorStatus)}>
                        {account.twoFactorStatus}
                      </Badge>
                      <Badge variant={recoveryVariant(account.recoveryEmailStatus)}>
                        {recoveryLabel(account.recoveryEmailStatus)}
                      </Badge>
                      {account.suspiciousActivityFlag && (
                        <Badge variant="danger">⚠ Suspicious</Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setEditTarget(account)} className="shrink-0">
                    Edit
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {showAdd && <AddAccountModal onClose={() => setShowAdd(false)} />}
      {editTarget && (
        <EditAccountModal account={editTarget} onClose={() => setEditTarget(null)} />
      )}
    </PageLayout>
  )
}
