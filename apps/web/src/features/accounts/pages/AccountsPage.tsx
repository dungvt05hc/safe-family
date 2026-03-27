import { useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import {
  Badge, Button, LoadingState, Alert, NoAccountsEmpty,
  TableContainer, Table, Thead, Tbody, Th, Tr, Td,
} from '@/components/ui'
import type { BadgeVariant } from '@/components/ui'
import { useAccounts } from '../hooks/useAccounts'
import { useArchiveAccount } from '../hooks/useAccountMutations'
import { AddAccountModal } from '../components/AddAccountModal'
import { EditAccountModal } from '../components/EditAccountModal'
import { useFamilyMembers } from '@/features/families/hooks/useFamilyMembers'
import { ApiError } from '@/types/api'
import type { Account, AccountType, AccountFilters } from '../accounts.types'
import { ACCOUNT_TYPES, ACCOUNT_TYPE_LABELS, TWO_FACTOR_LABELS, RECOVERY_LABELS } from '../accounts.types'

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

const selectClass =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
const inputClass =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

export function AccountsPage() {
  const { data: members = [] } = useFamilyMembers()
  const [filters, setFilters] = useState<AccountFilters>({})
  const { data: accounts, isLoading, isError, error } = useAccounts(filters)
  const { mutate: archive } = useArchiveAccount()
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState<Account | null>(null)

  function memberName(memberId: string | null) {
    if (!memberId) return null
    return members.find((m) => m.id === memberId)?.displayName ?? null
  }

  function handleArchive(id: string) {
    if (!confirm('Archive this account? It will be hidden but not permanently deleted.')) return
    archive(id)
  }

  return (
    <PageLayout
      title="Accounts"
      description="Track family accounts and their security status."
      action={<Button onClick={() => setShowAdd(true)}>+ Add account</Button>}
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
          value={filters.accountType ?? ''}
          onChange={(e) =>
            setFilters((f) => ({ ...f, accountType: (e.target.value || undefined) as AccountType | undefined }))
          }
          className={selectClass}
        >
          <option value="">All types</option>
          {ACCOUNT_TYPES.map((t) => (
            <option key={t} value={t}>{ACCOUNT_TYPE_LABELS[t]}</option>
          ))}
        </select>

        <input
          type="search"
          placeholder="Search identifier or notes…"
          value={filters.search ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
          className={inputClass}
        />

        {(filters.memberId || filters.accountType || filters.search) && (
          <button
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
                  <Th>Member</Th>
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
                    <Td className="whitespace-nowrap text-gray-500 text-sm">
                      {memberName(account.memberId) ?? <span className="text-gray-300">—</span>}
                    </Td>
                    <Td className="whitespace-nowrap font-medium text-gray-900">
                      {ACCOUNT_TYPE_LABELS[account.accountType]}
                    </Td>
                    <Td>{account.maskedIdentifier}</Td>
                    <Td className="whitespace-nowrap">
                      <Badge variant={twoFactorVariant(account.twoFactorStatus)}>
                        {TWO_FACTOR_LABELS[account.twoFactorStatus]}
                      </Badge>
                    </Td>
                    <Td className="whitespace-nowrap">
                      <Badge variant={recoveryVariant(account.recoveryEmailStatus)}>
                        {RECOVERY_LABELS[account.recoveryEmailStatus]}
                      </Badge>
                    </Td>
                    <Td className="whitespace-nowrap">
                      <Badge variant={recoveryVariant(account.recoveryPhoneStatus)}>
                        {RECOVERY_LABELS[account.recoveryPhoneStatus]}
                      </Badge>
                    </Td>
                    <Td className="whitespace-nowrap">
                      {account.suspiciousActivityFlag
                        ? <Badge variant="danger">⚠ Yes</Badge>
                        : <span className="text-gray-400">—</span>}
                    </Td>
                    <Td align="right" className="whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditTarget(account)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleArchive(account.id)}
                          className="text-red-500 hover:text-red-700">
                          Archive
                        </Button>
                      </div>
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
                    {memberName(account.memberId) && (
                      <p className="text-xs text-gray-500 mb-0.5">{memberName(account.memberId)}</p>
                    )}
                    <p className="font-medium text-gray-900">
                      {ACCOUNT_TYPE_LABELS[account.accountType]}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500">{account.maskedIdentifier}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant={twoFactorVariant(account.twoFactorStatus)}>
                        {TWO_FACTOR_LABELS[account.twoFactorStatus]}
                      </Badge>
                      <Badge variant={recoveryVariant(account.recoveryEmailStatus)}>
                        {RECOVERY_LABELS[account.recoveryEmailStatus]}
                      </Badge>
                      {account.suspiciousActivityFlag && (
                        <Badge variant="danger">⚠ Suspicious</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setEditTarget(account)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleArchive(account.id)}
                      className="text-red-500 hover:text-red-700">
                      Archive
                    </Button>
                  </div>
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

