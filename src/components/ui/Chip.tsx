interface ChipProps {
  label: string
  selected?: boolean
  onClick?: () => void
  tone?: 'default' | 'bien' | 'neutro' | 'mal'
}

const toneClasses: Record<NonNullable<ChipProps['tone']>, string> = {
  default: 'border-slate-300 dark:border-slate-700',
  bien: 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  neutro: 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  mal: 'border-red-500 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
}

export function Chip({ label, selected = false, onClick, tone = 'default' }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
        selected
          ? toneClasses[tone] || toneClasses.default
          : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
      }`}
    >
      {label}
    </button>
  )
}
