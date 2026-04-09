'use server'

import { revalidatePath } from 'next/cache'
import { updateAppSetting } from '@/lib/admin-db'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export async function saveSettingsAction(formData: FormData) {
  const session = await getSession()
  if (session.user.role !== 'superadmin') redirect('/')

  const keys = [
    'xp_gain_A',
    'xp_gain_B',
    'xp_gain_C',
    'xp_decay_per_day',
    'default_daily_goal_min',
  ]

  for (const key of keys) {
    const value = formData.get(key)
    if (value !== null) {
      await updateAppSetting(key, String(value))
    }
  }

  revalidatePath('/admin/settings')
}
