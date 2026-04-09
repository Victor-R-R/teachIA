import Image from 'next/image'
import Link from 'next/link'
import { listUsers } from '@/lib/admin-db'
import { Badge } from '@/components/ui/badge'
import { blockUserAction, unblockUserAction, deleteUserAction } from './actions'
import { ImpersonateButton } from './impersonate-button'
import { DeleteUserButton } from './delete-user-button'

export default async function AdminUsersPage() {
  const users = await listUsers()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Utilisateurs</h1>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">XP</th>
              <th className="px-4 py-3">Inscription</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                {/* User */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name ?? user.email}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                        {(user.name ?? user.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900">{user.name ?? '—'}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="px-4 py-3">
                  <Badge variant={user.role === 'superadmin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  {user.blocked ? (
                    <Badge variant="destructive">Bloqué</Badge>
                  ) : (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                      Actif
                    </Badge>
                  )}
                </td>

                {/* XP */}
                <td className="px-4 py-3 text-slate-700">
                  {user.xp ?? '—'}
                </td>

                {/* Joined */}
                <td className="px-4 py-3 text-slate-500">
                  {new Date(user.created_at).toLocaleDateString('fr-FR')}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {/* View detail */}
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Détail
                    </Link>

                    {/* Block / Unblock */}
                    <form
                      action={async () => {
                        'use server'
                        if (user.blocked) {
                          await unblockUserAction(user.id)
                        } else {
                          await blockUserAction(user.id)
                        }
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50"
                      >
                        {user.blocked ? 'Débloquer' : 'Bloquer'}
                      </button>
                    </form>

                    {/* Impersonate */}
                    <ImpersonateButton userId={user.id} email={user.email ?? ''} />

                    {/* Delete */}
                    <DeleteUserButton userId={user.id} email={user.email ?? ''} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-slate-500">Aucun utilisateur trouvé.</p>
        )}
      </div>
    </div>
  )
}
