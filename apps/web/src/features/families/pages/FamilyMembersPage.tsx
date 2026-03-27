import { useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Badge, Button, LoadingState, Alert, NoFamilyMembersEmpty } from '@/components/ui'
import { useFamilyMembers, FAMILY_MEMBERS_KEY } from '../hooks/useFamilyMembers'
import { useMyFamily } from '../hooks/useMyFamily'
import { useCreateFamily } from '../hooks/useCreateFamily'
import { useArchiveFamilyMember } from '../hooks/useFamilyMemberMutations'
import { AddMemberModal } from '../components/AddMemberModal'
import { EditMemberModal } from '../components/EditMemberModal'
import { FamilyCreateForm } from '../components/FamilyCreateForm'
import type { FamilyMember, Relationship, PrimaryEcosystem } from '../families.types'
import { RELATIONSHIP_LABEL, ECOSYSTEM_LABEL } from '../families.types'
import { queryClient } from '@/lib/queryClient'
import { Users } from 'lucide-react'

export function FamilyMembersPage() {
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
    if (!confirm(`Archive ${member.displayName}? They will be hidden from this list.`)) return
    setArchivingId(member.id)
    archive.mutate(member.id, {
      onSettled: () => setArchivingId(null),
    })
  }

  // ── No-family guard ──────────────────────────────────────────────────────────
  if (hasNoFamily) {
    return (
      <PageLayout
        title="Family Members"
        description="Manage the people in your family."
      >
        <div className="mx-auto max-w-md">
          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-700">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <Users className="h-4 w-4 shrink-0" />
              Create your family first
            </div>
            <p className="text-blue-600">
              You need to set up a family profile before you can add family members.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-gray-800">Create your family</h2>
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
        title="Family Members"
        description="Manage the people in your family."
        action={<Button onClick={() => setShowAdd(true)}>+ Add member</Button>}
      >
        {isLoading && <LoadingState />}

        {isError && (
          <Alert variant="error">Failed to load family members. Please refresh.</Alert>
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
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Relationship</th>
                  <th className="px-4 py-3">Age group</th>
                  <th className="px-4 py-3">Ecosystem</th>
                  <th className="px-4 py-3">Primary contact</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{m.displayName}</td>
                    <td className="px-4 py-3 text-gray-600">{RELATIONSHIP_LABEL[m.relationship as Relationship] ?? m.relationship}</td>
                    <td className="px-4 py-3 text-gray-600">{m.ageGroup}</td>
                    <td className="px-4 py-3 text-gray-600">{m.primaryEcosystem ? (ECOSYSTEM_LABEL[m.primaryEcosystem as PrimaryEcosystem] ?? m.primaryEcosystem) : '—'}</td>
                    <td className="px-4 py-3">
                      {m.isPrimaryContact
                        ? <Badge variant="success">Yes</Badge>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <MemberActions
                        member={m}
                        onEdit={() => setEditing(m)}
                        onArchive={() => handleArchive(m)}
                        isArchiving={archivingId === m.id}
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
                        {RELATIONSHIP_LABEL[m.relationship as Relationship] ?? m.relationship} · {m.ageGroup}
                      </p>
                      {m.primaryEcosystem && (
                        <p className="mt-0.5 text-xs text-gray-400">{ECOSYSTEM_LABEL[m.primaryEcosystem as PrimaryEcosystem] ?? m.primaryEcosystem}</p>
                      )}
                      {m.isPrimaryContact && (
                        <Badge variant="success" className="mt-1">Primary contact</Badge>
                      )}
                    </div>
                    <MemberActions
                      member={m}
                      onEdit={() => setEditing(m)}
                      onArchive={() => handleArchive(m)}
                      isArchiving={archivingId === m.id}
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
}

function MemberActions({ onEdit, onArchive, isArchiving }: MemberActionsProps) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button variant="ghost" size="sm" onClick={onEdit}>
        Edit
      </Button>
      <Button variant="danger" size="sm" onClick={onArchive} loading={isArchiving}>
        {isArchiving ? '' : 'Archive'}
      </Button>
    </div>
  )
}
