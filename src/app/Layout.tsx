import { Outlet } from 'react-router-dom'
import { BottomNav } from '../components/ui/BottomNav'
import { FabAddButton } from '../components/ui/FabAddButton'

export function Layout() {
  return (
    <div className="mx-auto min-h-dvh max-w-lg bg-slate-50 dark:bg-slate-950">
      <Outlet />
      <FabAddButton />
      <BottomNav />
    </div>
  )
}
