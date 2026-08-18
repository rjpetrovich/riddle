import type { Valoracion } from '../../types/domain'

const config: Record<Valoracion, { label: string; classes: string; emoji: string }> = {
  bien: {
    label: 'Bien',
    emoji: '🙂',
    classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400',
  },
  neutro: {
    label: 'Neutro',
    emoji: '😐',
    classes: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400',
  },
  mal: {
    label: 'Mal',
    emoji: '☹️',
    classes: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400',
  },
}

export function ValoracionBadge({ valoracion }: { valoracion: Valoracion }) {
  const { label, classes, emoji } = config[valoracion]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}>
      <span aria-hidden>{emoji}</span>
      {label}
    </span>
  )
}
