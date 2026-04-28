import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { useApiError } from '@/lib/i18n/useApiError'
import type { Account, AccountType, AccountFilters } from '../accounts.types'
import { ACCOUNT_TYPES } from '../accounts.types'

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
  const { t } = useTranslation('accounts')
  const loadError = useApiError(error, 'load.accounts')

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
      action={<Button onClick={() => setShowAdd(true)}>{t('addAccount')}</Button>}
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
          value={filters.accountType ?? ''}
          onChange={(e) =>
            setFilters((f) => ({ ...f, accountType: (e.target.value || undefined) as AccountType | undefined }))
          }
          className={selectClass}
        >
          <option value="">{t('filter.allTypes')}</option>
          {ACCOUNT_TYPES.map((type) => (
            <option key={type} value={type}>{t(`accountType.${type}` as const)}</option>
          ))}
        </select>

        <input
          type="search"
          placeholder={t('filter.searchPlaceholder')}
          value={filters.search ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
          className={inputClass}
        />

        {(filters.memberId || filters.accountType || filters.search) && (
          <button
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
                  <Th>{t('col.member')}</Th>
                  <Th>{t('col.type')}</Th>
                  <Th>{t('col.identifier')}</Th>
                  <Th>{t('col.twoFactor')}</Th>
                  <Th>{t('col.recoveryEmail')}</Th>
                  <Th>{t('col.recoveryPhone')}</Th>
                  <Th>{t('col.suspicious')}</Th>
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
                      {t(`accountType.${account.accountType}` as const)}
                    </Td>
                    <Td>{account.maskedIdentifier}</Td>
                    <Td className="whitespace-nowrap">
                      <Badge variant={twoFactorVariant(account.twoFactorStatus)}>
                        {t(`twoFactor.${account.twoFactorStatus}` as const)}
                      </Badge>
                    </Td>
                    <Td className="whitespace-nowrap">
                      <Badge variant={recoveryVariant(account.recoveryEmailStatus)}>
                        {t(`recovery.${account.recoveryEmailStatus}` as const)}
                      </Badge>
                    </Td>
                    <Td className="whitespace-nowrap">
                      <Badge variant={recoveryVariant(account.recoveryPhoneStatus)}>
                        {t(`recovery.${account.recoveryPhoneStatus}` as const)}
                      </Badge>
                    </Td>
                    <Td className="whitespace-nowrap">
                      {account.suspiciousActivityFlag
                        ? <Badge variant="danger">{t('suspiciousYes')}</Badge>
                        : <span className="text-gray-400">—</span>}
                    </Td>
                    <Td align="right" className="whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditTarget(account)}>
                          {t('action.edit')}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleArchive(account.id)}
                          className="text-red-500 hover:text-red-700">
                          {t('action.archive')}
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
                      {t(`accountType.${account.accountType}` as const)}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500">{account.maskedIdentifier}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant={twoFactorVariant(account.twoFactorStatus)}>
                        {t(`twoFactor.${account.twoFactorStatus}` as const)}
                      </Badge>
                      <Badge variant={recoveryVariant(account.recoveryEmailStatus)}>
                        {t(`recovery.${account.recoveryEmailStatus}` as const)}
                      </Badge>
                      {account.suspiciousActivityFlag && (
                        <Badge variant="danger">{t('suspiciousBadge')}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setEditTarget(account)}>
                      {t('action.edit')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleArchive(account.id)}
                      className="text-red-500 hover:text-red-700">
                      {t('action.archive')}
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

