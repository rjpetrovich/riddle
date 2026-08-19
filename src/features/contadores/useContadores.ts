import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthProvider'
import { claveDiaLocal } from '../../lib/dateUtils'
import {
  CONTADORES_VACIOS,
  fetchContadores,
  fetchContarBano,
  guardarContadores,
  guardarContarBano,
  type ContadoresDia,
  type TipoContador,
} from './contadoresApi'

export function useContadores(dia: Date) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const clave = ['contadores', user?.id, claveDiaLocal(dia)]

  const { data = CONTADORES_VACIOS, error: errorLectura } = useQuery({
    queryKey: clave,
    queryFn: () => fetchContadores(user!.id, dia),
    enabled: !!user,
  })

  const mutacion = useMutation({
    mutationFn: (nuevos: ContadoresDia) => guardarContadores(user!.id, dia, nuevos),
    // Sumar un vaso tiene que verse al instante: esperar la ida y vuelta al
    // servidor haría que el número saltara tarde y se sintiera trabado.
    onMutate: async (nuevos) => {
      await queryClient.cancelQueries({ queryKey: clave })
      const previos = queryClient.getQueryData<ContadoresDia>(clave)
      queryClient.setQueryData(clave, nuevos)
      return { previos }
    },
    onError: (_err, _nuevos, contexto) => {
      // Si falló, se vuelve al valor anterior para no mostrar algo que no se
      // guardó.
      if (contexto?.previos) queryClient.setQueryData(clave, contexto.previos)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: clave })
    },
  })

  function ajustar(tipo: TipoContador, delta: number) {
    const nuevos: ContadoresDia = { ...data, [tipo]: Math.max(0, data[tipo] + delta) }
    mutacion.mutate(nuevos)
  }

  // Si la lectura falla, el contador mostraría 0 como si no hubiera nada
  // registrado, ocultando el problema. Se expone junto al de guardado.
  return { contadores: data, ajustar, error: mutacion.error ?? errorLectura }
}

export function useContarBano() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const clave = ['contar-bano', user?.id]

  const { data = false } = useQuery({
    queryKey: clave,
    queryFn: () => fetchContarBano(user!.id),
    enabled: !!user,
  })

  const mutacion = useMutation({
    mutationFn: (activo: boolean) => guardarContarBano(user!.id, activo),
    onMutate: async (activo) => {
      await queryClient.cancelQueries({ queryKey: clave })
      const previo = queryClient.getQueryData<boolean>(clave)
      queryClient.setQueryData(clave, activo)
      return { previo }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previo !== undefined) queryClient.setQueryData(clave, ctx.previo)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: clave }),
  })

  return { activo: data, cambiar: mutacion.mutate }
}
