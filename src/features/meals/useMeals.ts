import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthProvider'
import { queryKeys } from '../../lib/queryKeys'
import {
  actualizarComida,
  crearComida,
  eliminarComida,
  fetchComidaPorId,
  fetchComidasRango,
  type ComidaInput,
} from './mealsApi'

export function useComidaPorId(id: string | undefined) {
  return useQuery({
    queryKey: ['comida', id],
    queryFn: () => fetchComidaPorId(id!),
    enabled: !!id,
  })
}

export function useComidasRango(desdeISO: string, hastaISO: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: queryKeys.comidasRango(user?.id ?? '', desdeISO, hastaISO),
    queryFn: () => fetchComidasRango(user!.id, desdeISO, hastaISO),
    enabled: !!user,
  })
}

export function useCrearComida() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ComidaInput) => crearComida(user!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comidas'] })
      queryClient.invalidateQueries({ queryKey: ['alimentos'] })
    },
  })
}

export function useActualizarComida() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Omit<ComidaInput, 'foto'> }) =>
      actualizarComida(id, user!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comidas'] })
      queryClient.invalidateQueries({ queryKey: ['alimentos'] })
    },
  })
}

export function useEliminarComida() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => eliminarComida(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comidas'] })
      queryClient.invalidateQueries({ queryKey: ['alimentos'] })
    },
  })
}
