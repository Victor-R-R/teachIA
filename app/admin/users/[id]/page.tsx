import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getUserDetail } from '@/lib/admin-db'
import { Badge } from '@/components/ui/badge'

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const detail = await getUserDetail(id)
  if (!detail) notFound()

  const { user, profile, stats } = detail
  const successRate =
    stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0

  const domainLabels: Record<string, string> = {
    level_langue: 'Langue',
    level_civi: 'Civilisation',
    level_didactique: 'Didactique',
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
      >
        ← Retour aux utilisateurs
      </Link>

      {/* Header card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? user.email}
              width={56}
              height={56}
              className="rounded-full"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-slate-200 flex items-center justify-center text-lg font-semibold text-slate-600">
              {(user.name ?? user.email).charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-slate-900">{user.name ?? '—'}</h1>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={user.role === 'superadmin' ? 'default' : 'secondary'}>
              {user.role}
            </Badge>
            {user.blocked ? (
              <Badge variant="destructive">Bloqué</Badge>
            ) : (
              <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                Actif
              </Badge>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR')}
        </p>
      </div>

      {/* Profile card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Profil</h2>
        {profile ? (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">XP total</span>
              <span className="font-medium text-slate-900">{profile.xp}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">XP niveau</span>
              <span className="font-medium text-slate-900">{profile.level_xp}</span>
            </div>
            {(['level_langue', 'level_civi', 'level_didactique'] as const).map((key) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-slate-500">{domainLabels[key]}</span>
                <span className="font-medium text-slate-900">
                  {profile[key] ?? '—'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Aucun profil configuré.</p>
        )}
      </div>

      {/* Stats card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Statistiques</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-xs text-slate-500 mt-1">Tentatives</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{stats.correct}</p>
            <p className="text-xs text-slate-500 mt-1">Correctes</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{successRate}%</p>
            <p className="text-xs text-slate-500 mt-1">Réussite</p>
          </div>
        </div>
      </div>
    </div>
  )
}
