import { redirect } from 'next/navigation'
import { LogOut, Mail, User } from 'lucide-react'
import { auth, signOut } from '@/lib/auth'
import { deleteUser } from '@/lib/db'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { DeleteAccountButton } from './delete-account-button'

export default async function ComptePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { id: userId, name, email, image } = session.user
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : (email?.[0] ?? 'U').toUpperCase()

  async function signOutAction() {
    'use server'
    await signOut({ redirectTo: '/login' })
  }

  async function deleteAccountAction() {
    'use server'
    const s = await auth()
    if (!s?.user?.id) return
    await deleteUser(s.user.id)
    await signOut({ redirectTo: '/login' })
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Mon compte</h1>

      {/* Profil */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={image ?? undefined} alt={name ?? 'Avatar'} />
            <AvatarFallback className="bg-violet-100 text-violet-700 text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-slate-900 text-lg">{name ?? '—'}</p>
            <p className="text-sm text-slate-500">Connexion via Google</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Nom complet</p>
              <p className="text-sm text-slate-700">{name ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Adresse e-mail</p>
              <p className="text-sm text-slate-700">{email ?? '—'}</p>
            </div>
          </div>
        </div>

        <p className="mt-5 text-xs text-slate-400">
          Les informations de votre compte sont gérées par Google. Pour les modifier,
          rendez-vous dans les paramètres de votre compte Google.
        </p>
      </div>

      {/* Actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-medium text-slate-700">Actions</h2>
        <Separator />

        <div className="flex flex-col gap-3">
          {/* Déconnexion */}
          <form action={signOutAction}>
            <Button type="submit" variant="outline" className="w-full justify-start">
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </form>

          {/* Suppression */}
          <DeleteAccountButton action={deleteAccountAction} />
        </div>
      </div>
    </div>
  )
}
