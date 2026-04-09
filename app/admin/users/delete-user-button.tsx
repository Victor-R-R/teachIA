'use client'

import { deleteUserAction } from './actions'

export function DeleteUserButton({ userId, email }: { userId: string; email: string }) {
  async function handleDelete() {
    if (!confirm(`Supprimer ${email} ? Cette action est irréversible.`)) return
    await deleteUserAction(userId)
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
    >
      Supprimer
    </button>
  )
}
