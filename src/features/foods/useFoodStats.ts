import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthProvider'
import { fetchDatosParaPatrones } from './foodsApi'
import {
  calcularStatsPorAlimento,
  detectarParesInseparables,
  ocurrenciasDeAlimento,
  resumenSemanal,
  type AlimentoStats,
} from '../stats/patternDetection'

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

export function useResumenSemanal(desdeISO: string) {
  const { data } = useDatosCrudos()
  if (!data) return null
  return resumenSemanal(data.comidas, data.sensaciones, desdeISO, (id) =>
    data.nombresPorAlimentoId.get(id) ?? '',
  )
}

export function useParesInseparables() {
  const { data } = useDatosCrudos()
  if (!data) return []

  return detectarParesInseparables(data.comidas, data.sensaciones).map((p) => ({
    ...p,
    nombreA: data.nombresPorAlimentoId.get(p.alimentoA) ?? '',
    nombreB: data.nombresPorAlimentoId.get(p.alimentoB) ?? '',
  }))
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
