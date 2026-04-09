import { getAdminStats } from '@/lib/admin-db'

export default async function AdminPage() {
  const stats = await getAdminStats()

  const correctRate =
    stats.totalAttempts > 0
      ? Math.round((stats.correctAttempts / stats.totalAttempts) * 100)
      : 0

  const cards = [
    { label: 'Utilisateurs', value: stats.totalUsers },
    { label: 'Inscrits aujourd\'hui', value: stats.activeToday },
    { label: 'Tentatives totales', value: stats.totalAttempts },
    { label: 'Taux de réussite', value: `${correctRate}%` },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Administration</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
