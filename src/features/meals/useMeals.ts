import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthProvider'
import { invalidarDatosDeRegistro } from '../../lib/invalidar'
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
    onSuccess: () => invalidarDatosDeRegistro(queryClient),
  })
}

export function useActualizarComida() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ComidaInput }) =>
      actualizarComida(id, user!.id, input),
    onSuccess: () => invalidarDatosDeRegistro(queryClient),
  })
}

export function useEliminarComida() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => eliminarComida(id),
    onSuccess: () => invalidarDatosDeRegistro(queryClient),
  })
}
