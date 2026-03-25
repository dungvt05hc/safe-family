import { useAdminCustomers } from '../hooks/useAdminQueries'

export function AdminCustomersPage() {
  const { data, isLoading, isError } = useAdminCustomers()

  if (isLoading) return <p className="p-6 text-gray-500">Loading…</p>
  if (isError || !data) return <p className="p-6 text-red-500">Failed to load customers.</p>

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 font-medium text-gray-600">Role</th>
              <th className="px-4 py-3 font-medium text-gray-600">Families</th>
              <th className="px-4 py-3 font-medium text-gray-600">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No customers yet.</td>
              </tr>
            )}
            {data.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.displayName}</td>
                <td className="px-4 py-3 text-gray-700">{c.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                      c.role === 'Admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {c.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{c.familyCount}</td>
                <td className="px-4 py-3 text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
