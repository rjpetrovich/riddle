import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthProvider'
import { fetchDatosParaPatrones } from './foodsApi'
import { calcularStatsPorAlimento, ocurrenciasDeAlimento, type AlimentoStats } from '../stats/patternDetection'

export function useDatosCrudos() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['datos-patrones', user?.id],
    queryFn: () => fetchDatosParaPatrones(user!.id),
    enabled: !!user,
  })
}

export function useAlimentosStats(): { data: AlimentoStats[]; isLoading: boolean } {
  const { data, isLoading } = useDatosCrudos()
  if (!data) return { data: [], isLoading }

  const stats = calcularStatsPorAlimento(data.comidas, data.sensaciones).map((s) => ({
    ...s,
    nombre: data.nombresPorAlimentoId.get(s.alimentoId) ?? '(sin nombre)',
  }))

  return { data: stats, isLoading }
}

export function useAlimentosStatsEnRango(
  desdeISO: string,
  hastaISO: string,
): { data: AlimentoStats[]; isLoading: boolean } {
  const { data, isLoading } = useDatosCrudos()
  if (!data) return { data: [], isLoading }

  const comidasEnRango = data.comidas.filter(
    (c) => c.fechaHora >= desdeISO && c.fechaHora <= hastaISO,
  )
  const stats = calcularStatsPorAlimento(comidasEnRango, data.sensaciones).map((s) => ({
    ...s,
    nombre: data.nombresPorAlimentoId.get(s.alimentoId) ?? '(sin nombre)',
  }))

  return { data: stats, isLoading }
}

export function useFoodDetail(alimentoId: string | undefined) {
  const { data, isLoading } = useDatosCrudos()

  if (!data || !alimentoId) {
    return { nombre: '', ocurrencias: [], isLoading }
  }

  const ocurrencias = ocurrenciasDeAlimento(alimentoId, data.comidas, data.sensaciones).map((o) => {
    const comida = data.comidas.find((c) => c.id === o.comidaId)
    const otros = (comida?.alimentoIds ?? [])
      .filter((id) => id !== alimentoId)
      .map((id) => data.nombresPorAlimentoId.get(id))
      .filter((n): n is string => !!n)
    return { ...o, otrosIngredientes: otros }
  })

  return {
    nombre: data.nombresPorAlimentoId.get(alimentoId) ?? '',
    ocurrencias,
    isLoading,
  }
}
