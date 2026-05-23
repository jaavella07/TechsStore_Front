import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserX } from 'lucide-react'
import { usersApi } from '@/api/users'
import { useUiStore } from '@/stores/uiStore'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { formatDate } from '@/lib/utils'
import type { User, UserRole } from '@/types'

const ROLE_OPTIONS = [
  { label: 'CLIENT', value: 'CLIENT' },
  { label: 'ADMIN',  value: 'ADMIN'  },
]

export function AdminUsersPage() {
  const qc = useQueryClient()
  const { toast } = useUiStore()
  const [page, setPage] = useState(1)
  const [deactivateUser, setDeactivateUser] = useState<User | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => usersApi.getUsers({ page, limit: 15 }),
  })

  const roleMut = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => usersApi.updateRole(id, role),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Role updated') },
    onError: () => toast.error('Failed to update role'),
  })

  const deactivateMut = useMutation({
    mutationFn: (id: string) => usersApi.deactivate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User deactivated')
      setDeactivateUser(null)
    },
    onError: () => toast.error('Failed to deactivate user'),
  })

  const totalPages = data ? Math.ceil(data.total / 15) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-text">Users</h1>
        {data && <p className="text-text-dim text-sm mt-1">{data.total} total</p>}
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : !data?.data.length ? (
          <p className="text-text-dim text-sm text-center py-12">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['User', 'Joined', 'Status', 'Role', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-text-dim uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.data.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-text">{user.name}</p>
                        <p className="text-xs text-text-dim">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-text-dim">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-3">
                      <Badge variant={user.isActive ? 'success' : 'error'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Select
                        options={ROLE_OPTIONS}
                        value={user.role}
                        onChange={(e) => roleMut.mutate({ id: user.id, role: e.target.value as UserRole })}
                        className="w-28 py-1 text-xs"
                      />
                    </td>
                    <td className="px-5 py-3">
                      {user.isActive && (
                        <button
                          onClick={() => setDeactivateUser(user)}
                          title="Deactivate user"
                          className="p-1.5 text-text-dim hover:text-coral hover:bg-coral-dim rounded transition-colors"
                        >
                          <UserX className="size-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</Button>
          <span className="flex items-center px-3 text-sm text-text-muted">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next →</Button>
        </div>
      )}

      <Modal isOpen={!!deactivateUser} onClose={() => setDeactivateUser(null)} title="Deactivate User" size="sm">
        <p className="text-sm text-text-muted mb-2">
          Deactivate <span className="text-text font-medium">{deactivateUser?.name}</span>?
        </p>
        <p className="text-xs text-text-dim mb-5">They won't be able to log in.</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDeactivateUser(null)} className="flex-1">Cancel</Button>
          <Button
            variant="danger"
            isLoading={deactivateMut.isPending}
            onClick={() => deactivateUser && deactivateMut.mutate(deactivateUser.id)}
            className="flex-1"
          >
            Deactivate
          </Button>
        </div>
      </Modal>
    </div>
  )
}
