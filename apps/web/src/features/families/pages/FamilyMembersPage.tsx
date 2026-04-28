import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '@/components/layout/PageLayout'
import { Badge, Button, LoadingState, Alert, NoFamilyMembersEmpty } from '@/components/ui'
import { useFamilyMembers, FAMILY_MEMBERS_KEY } from '../hooks/useFamilyMembers'
import { useMyFamily } from '../hooks/useMyFamily'
import { useCreateFamily } from '../hooks/useCreateFamily'
import { useArchiveFamilyMember } from '../hooks/useFamilyMemberMutations'
import { AddMemberModal } from '../components/AddMemberModal'
import { EditMemberModal } from '../components/EditMemberModal'
import { FamilyCreateForm } from '../components/FamilyCreateForm'
import type { FamilyMember } from '../families.types'
import { queryClient } from '@/lib/queryClient'
import { Users } from 'lucide-react'

export function FamilyMembersPage() {
  const { t } = useTranslation('families')
  const { data: family, isLoading: familyLoading } = useMyFamily()
  const { data: members, isLoading: membersLoading, isError } = useFamilyMembers()
  const archive = useArchiveFamilyMember()
  const createFamily = useCreateFamily()

  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<FamilyMember | null>(null)
  const [archivingId, setArchivingId] = useState<string | null>(null)

  const isLoading = familyLoading || membersLoading
  const hasNoFamily = !familyLoading && !family

  function handleArchive(member: FamilyMember) {
    if (!confirm(t('archiveConfirm', { name: member.displayName }))) return
    setArchivingId(member.id)
    archive.mutate(member.id, {
      onSettled: () => setArchivingId(null),
    })
  }

  // ── No-family guard ──────────────────────────────────────────────────────────
  if (hasNoFamily) {
    return (
      <PageLayout
        title={t('pageTitle')}
        description={t('pageDescription')}
      >
        <div className="mx-auto max-w-md">
          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-700">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <Users className="h-4 w-4 shrink-0" />
              {t('createFamilyFirst.title')}
            </div>
            <p className="text-blue-600">
              {t('createFamilyFirst.body')}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-gray-800">{t('createFamilyFirst.formTitle')}</h2>
            <FamilyCreateForm
              isSubmitting={createFamily.isPending}
              error={createFamily.error}
              onSubmit={(values) =>
                createFamily.mutate(values, {
                  onSuccess: () => {
                    // Unlock the members page — invalidate so the list re-fetches cleanly
                    queryClient.invalidateQueries({ queryKey: FAMILY_MEMBERS_KEY })
                  },
                })
              }
            />
          </div>
        </div>
      </PageLayout>
    )
  }
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <PageLayout
        title={t('pageTitle')}
        description={t('pageDescription')}
        action={<Button onClick={() => setShowAdd(true)}>{t('addMember')}</Button>}
      >
        {isLoading && <LoadingState />}

        {isError && (
          <Alert variant="error">{t('loadError')}</Alert>
        )}

        {!isLoading && !isError && members?.length === 0 && (
          <NoFamilyMembersEmpty onAdd={() => setShowAdd(true)} />
        )}

        {members && members.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Desktop table */}
            <table className="hidden w-full text-left text-sm sm:table">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3">{t('col.name')}</th>
                  <th className="px-4 py-3">{t('col.relationship')}</th>
                  <th className="px-4 py-3">{t('col.ageGroup')}</th>
                  <th className="px-4 py-3">{t('col.ecosystem')}</th>
                  <th className="px-4 py-3">{t('col.primaryContact')}</th>
                  <th className="px-4 py-3 text-right">{t('col.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{m.displayName}</td>
                    <td className="px-4 py-3 text-gray-600">{t(`relationship.${m.relationship}` as const, { defaultValue: m.relationship })}</td>
                    <td className="px-4 py-3 text-gray-600">{t(`ageGroup.${m.ageGroup}` as const, { defaultValue: m.ageGroup })}</td>
                    <td className="px-4 py-3 text-gray-600">{m.primaryEcosystem ? t(`ecosystem.${m.primaryEcosystem}` as const, { defaultValue: m.primaryEcosystem }) : '—'}</td>
                    <td className="px-4 py-3">
                      {m.isPrimaryContact
                        ? <Badge variant="success">{t('primaryContact.yes')}</Badge>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <MemberActions
                        member={m}
                        onEdit={() => setEditing(m)}
                        onArchive={() => handleArchive(m)}
                        isArchiving={archivingId === m.id}
                        t={t}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile card list */}
            <ul className="divide-y divide-gray-100 sm:hidden">
              {members.map((m) => (
                <li key={m.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">{m.displayName}</p>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {t(`relationship.${m.relationship}` as const, { defaultValue: m.relationship })} · {t(`ageGroup.${m.ageGroup}` as const, { defaultValue: m.ageGroup })}
                      </p>
                      {m.primaryEcosystem && (
                        <p className="mt-0.5 text-xs text-gray-400">{t(`ecosystem.${m.primaryEcosystem}` as const, { defaultValue: m.primaryEcosystem })}</p>
                      )}
                      {m.isPrimaryContact && (
                        <Badge variant="success" className="mt-1">{t('primaryContact.badge')}</Badge>
                      )}
                    </div>
                    <MemberActions
                      member={m}
                      onEdit={() => setEditing(m)}
                      onArchive={() => handleArchive(m)}
                      isArchiving={archivingId === m.id}
                      t={t}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </PageLayout>

      {showAdd && <AddMemberModal onClose={() => setShowAdd(false)} />}
      {editing && <EditMemberModal member={editing} onClose={() => setEditing(null)} />}
    </>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

interface MemberActionsProps {
  member: FamilyMember
  onEdit: () => void
  onArchive: () => void
  isArchiving: boolean
  t: (key: string) => string
}

function MemberActions({ onEdit, onArchive, isArchiving, t }: MemberActionsProps) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button variant="ghost" size="sm" onClick={onEdit}>
        {t('action.edit')}
      </Button>
      <Button variant="danger" size="sm" onClick={onArchive} loading={isArchiving}>
        {isArchiving ? '' : t('action.archive')}
      </Button>
    </div>
  )
}
