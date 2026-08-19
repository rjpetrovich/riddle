import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '../components/ui/BottomNav'
import { FabAddButton } from '../components/ui/FabAddButton'

const RUTAS_SIN_NAV = [/^\/comida\//, /^\/sensacion\//]

export function Layout() {
  const location = useLocation()
  const ocultarNav = RUTAS_SIN_NAV.some((re) => re.test(location.pathname))

  return (
    <div className="mx-auto min-h-dvh max-w-lg bg-slate-50 dark:bg-slate-950">
      <Outlet />
      {!ocultarNav && (
        <>
          <FabAddButton />
          <BottomNav />
        </>
      )}
    </div>
  )
}
