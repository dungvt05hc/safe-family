import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AdminUserRow } from './adminUsers.types'
import { USER_ROLE_COLORS, USER_STATUS_COLORS, formatDate } from './adminUsers.utils'

interface Props {
  users: AdminUserRow[]
}

export function AdminUsersTable({ users }: Props) {
  return (
    <table className="w-full text-sm" aria-label="Users">
      <thead className="bg-gray-50 text-left">
        <tr>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Name</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Email</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Role</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Status</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Verified</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Joined</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Last login</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">Family</th>
          <th scope="col" className="px-4 py-3 font-medium text-gray-600">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {users.map((user) => (
          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
              {user.displayName}
            </td>
            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{user.email}</td>
            <td className="px-4 py-3 whitespace-nowrap">
              <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', USER_ROLE_COLORS[user.role])}>
                {user.role}
              </span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', USER_STATUS_COLORS[user.status])}>
                {user.status}
              </span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              {user.emailVerified ? (
                <span role="img" aria-label="Email verified">
                  <CheckCircle className="w-4 h-4 text-green-500" aria-hidden="true" />
                </span>
              ) : (
                <span role="img" aria-label="Email not verified">
                  <XCircle className="w-4 h-4 text-gray-300" aria-hidden="true" />
                </span>
              )}
            </td>
            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(user.createdAt)}</td>
            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
              {user.lastLoginAt ? formatDate(user.lastLoginAt) : <span className="text-gray-300">—</span>}
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              {user.family ? (
                <span className="text-gray-700 text-xs">
                  {user.family.familyName}
                  <span className="ml-1 text-gray-400">({user.family.familyMemberRole})</span>
                </span>
              ) : (
                <span className="text-gray-300 text-xs">—</span>
              )}
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              <Link
                to={`/admin/users/${user.id}`}
                className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium"
              >
                View <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
