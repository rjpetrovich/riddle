import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthProvider'
import { queryKeys } from '../../lib/queryKeys'
import {
  actualizarSensacion,
  crearSensacion,
  eliminarSensacion,
  fetchComidasRecientes,
  fetchSensacionesRango,
  fetchSensacionPorId,
  fetchSintomas,
  type SensacionInput,
} from './feelingsApi'

export function useSensacionPorId(id: string | undefined) {
  return useQuery({
    queryKey: ['sensacion', id],
    queryFn: () => fetchSensacionPorId(id!),
    enabled: !!id,
  })
}

export function useActualizarSensacion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SensacionInput }) =>
      actualizarSensacion(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sensaciones'] })
    },
  })
}

export function useSensacionesRango(desdeISO: string, hastaISO: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: queryKeys.sensacionesRango(user?.id ?? '', desdeISO, hastaISO),
    queryFn: () => fetchSensacionesRango(user!.id, desdeISO, hastaISO),
    enabled: !!user,
  })
}

export function useSintomas() {
  const { user } = useAuth()
  return useQuery({
    queryKey: queryKeys.sintomas(user?.id ?? ''),
    queryFn: () => fetchSintomas(user!.id),
    enabled: !!user,
  })
}

export function useComidasRecientes(horas = 8) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['comidas-recientes', user?.id, horas],
    queryFn: () => fetchComidasRecientes(user!.id, horas),
    enabled: !!user,
  })
}

export function useCrearSensacion() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SensacionInput) => crearSensacion(user!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sensaciones'] })
    },
  })
}

export function useEliminarSensacion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => eliminarSensacion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sensaciones'] })
    },
  })
}
