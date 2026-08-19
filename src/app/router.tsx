import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthProvider'
import { Spinner } from '../components/ui/Spinner'
import { LoginPage } from '../features/auth/LoginPage'
import { Layout } from './Layout'
import { TimelinePage } from '../features/timeline/TimelinePage'

// Comidas es la pantalla de entrada y se carga con la app. El resto se trae
// recién al visitarlas: en un celular con datos móviles, abrir la app no
// debería costar el peso de los gráficos ni el del exportador a CSV.
const AddMealPage = lazy(() =>
  import('../features/meals/AddMealPage').then((m) => ({ default: m.AddMealPage })),
)
const AddFeelingPage = lazy(() =>
  import('../features/feelings/AddFeelingPage').then((m) => ({ default: m.AddFeelingPage })),
)
const FoodsListPage = lazy(() =>
  import('../features/foods/FoodsListPage').then((m) => ({ default: m.FoodsListPage })),
)
const FoodDetailPage = lazy(() =>
  import('../features/foods/FoodDetailPage').then((m) => ({ default: m.FoodDetailPage })),
)
const StatsPage = lazy(() =>
  import('../features/stats/StatsPage').then((m) => ({ default: m.StatsPage })),
)
const SettingsPage = lazy(() =>
  import('../features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)

function Cargando() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <Spinner />
    </div>
  )
}

export function AppRouter() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    )
  }

  return (
    <Suspense fallback={<Cargando />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<TimelinePage />} />
          <Route path="/comida/nueva" element={<AddMealPage />} />
          <Route path="/comida/:id/editar" element={<AddMealPage />} />
          <Route path="/sensacion/nueva" element={<AddFeelingPage />} />
          <Route path="/sensacion/:id/editar" element={<AddFeelingPage />} />
          <Route path="/ingredientes" element={<FoodsListPage />} />
          <Route path="/ingredientes/:id" element={<FoodDetailPage />} />
          <Route path="/estadisticas" element={<StatsPage />} />
          <Route path="/ajustes" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
