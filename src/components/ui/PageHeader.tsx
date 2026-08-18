import type { ReactNode } from 'react'

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <header className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-3">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
      {action}
    </header>
  )
}
