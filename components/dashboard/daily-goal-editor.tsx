'use client'

import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { setDailyGoal } from '@/app/(dashboard)/actions'

export function DailyGoalEditor({ currentGoal }: { currentGoal: number }) {
  const [value, setValue] = useState(String(currentGoal))
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSave() {
    const minutes = parseInt(value, 10)
    if (isNaN(minutes) || minutes < 10 || minutes > 240) return
    setPending(true)
    await setDailyGoal(minutes)
    setPending(false)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="text-xs text-violet-600 hover:underline cursor-pointer">
        Modifier
      </PopoverTrigger>
      <PopoverContent className="w-48 p-3">
        <p className="text-xs text-slate-500 mb-2">Objectif (10–240 min)</p>
        <Input
          type="number"
          min={10}
          max={240}
          value={value}
          onChange={e => setValue(e.target.value)}
          className="mb-2 h-8 text-sm"
        />
        <Button
          size="sm"
          className="w-full bg-violet-600 hover:bg-violet-700"
          onClick={handleSave}
          disabled={pending}
        >
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </PopoverContent>
    </Popover>
  )
}
