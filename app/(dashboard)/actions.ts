'use server'

import { revalidatePath } from 'next/cache'
import { updateDailyGoal } from '@/lib/db'
import { getEffectiveUserId } from '@/lib/session'

export async function setDailyGoal(minutes: number): Promise<void> {
  const userId = await getEffectiveUserId()
  const clamped = Math.min(240, Math.max(10, minutes))
  await updateDailyGoal(userId, clamped)
  revalidatePath('/')
}
