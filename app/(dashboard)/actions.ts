'use server'

import { revalidatePath } from 'next/cache'
import { updateDailyGoal } from '@/lib/db'

export async function setDailyGoal(minutes: number): Promise<void> {
  const clamped = Math.min(240, Math.max(10, minutes))
  await updateDailyGoal(clamped)
  revalidatePath('/')
}
