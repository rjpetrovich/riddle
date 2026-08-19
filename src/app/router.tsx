import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthProvider'
import { Spinner } from '../components/ui/Spinner'
import { LoginPage } from '../features/auth/LoginPage'
import { Layout } from './Layout'
import { TimelinePage } from '../features/timeline/TimelinePage'
import { AddMealPage } from '../features/meals/AddMealPage'
import { AddFeelingPage } from '../features/feelings/AddFeelingPage'
import { FoodsListPage } from '../features/foods/FoodsListPage'
import { FoodDetailPage } from '../features/foods/FoodDetailPage'
import { StatsPage } from '../features/stats/StatsPage'
import { SettingsPage } from '../features/settings/SettingsPage'

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
  )
}
