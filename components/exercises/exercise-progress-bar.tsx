import type { ExerciseStatus } from '@/lib/db'

interface ExerciseProgressBarProps {
  status: ExerciseStatus
  height?: number
}

const STATUS_COLOR: Record<ExerciseStatus, string> = {
  not_started: '',
  in_progress: 'bg-amber-400',
  completed: 'bg-green-500',
}

const STATUS_WIDTH: Record<ExerciseStatus, string> = {
  not_started: '0%',
  in_progress: '50%',
  completed: '100%',
}

export function ExerciseProgressBar({ status, height = 3 }: ExerciseProgressBarProps) {
  if (status === 'not_started') return null

  return (
    <div
      className="w-full bg-slate-100 rounded-full overflow-hidden"
      style={{ height: `${height}px` }}
    >
      <div
        className={`${STATUS_COLOR[status]} h-full rounded-full transition-all`}
        style={{ width: STATUS_WIDTH[status] }}
      />
    </div>
  )
}
