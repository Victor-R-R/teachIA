'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { blockUser, unblockUser, deleteUser } from '@/lib/admin-db'
import { getSession } from '@/lib/session'

async function requireSuperadmin() {
  const session = await getSession()
  if (session.user.role !== 'superadmin') redirect('/')
}

export async function blockUserAction(userId: string) {
  await requireSuperadmin()
  await blockUser(userId)
  revalidatePath('/admin/users')
}

export async function unblockUserAction(userId: string) {
  await requireSuperadmin()
  await unblockUser(userId)
  revalidatePath('/admin/users')
}

export async function deleteUserAction(userId: string) {
  await requireSuperadmin()
  await deleteUser(userId)
  revalidatePath('/admin/users')
  redirect('/admin/users')
}
