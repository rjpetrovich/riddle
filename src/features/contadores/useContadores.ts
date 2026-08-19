import { useEffect, useRef } from 'react'
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
  const claveDia = claveDiaLocal(dia)
  const clave = ['contadores', user?.id, claveDia]

  const {
    data = CONTADORES_VACIOS,
    error: errorLectura,
    isSuccess: cargado,
  } = useQuery({
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

  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendiente = useRef<ContadoresDia | null>(null)

  // Al cambiar de día o salir de la pantalla puede haber texto escrito que
  // todavía no se guardó. Descartarlo perdería lo último tipeado sin aviso, así
  // que se guarda en el acto, contra el día al que pertenece (el de este
  // render, no el nuevo).
  const usuarioId = user?.id
  useEffect(() => {
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current)
      if (pendiente.current && usuarioId) {
        guardarContadores(usuarioId, dia, pendiente.current).catch(() => {
          // Sin interfaz donde mostrarlo: el componente ya se desmontó.
        })
        pendiente.current = null
      }
    }
    // claveDia y no el objeto Date: cambia solo cuando cambia el día mirado.
  }, [usuarioId, claveDia]) // eslint-disable-line react-hooks/exhaustive-deps

  function ajustar(tipo: TipoContador, delta: number) {
    const nuevos: ContadoresDia = { ...data, [tipo]: Math.max(0, data[tipo] + delta) }
    mutacion.mutate(nuevos)
  }

  // Las observaciones se escriben letra por letra: guardar en cada tecla sería
  // una petición por carácter. Se espera a que la escritura se detenga.
  function escribirObservaciones(texto: string) {
    // A propósito no se toca la caché acá: si el textarea tomara su valor del
    // dato remoto, cada tecla esperaría un re-render y al escribir rápido React
    // devolvería el campo al valor viejo, comiéndose caracteres. El texto que se
    // ve lo maneja el componente con estado local; esto solo agenda el guardado.
    if (temporizador.current) clearTimeout(temporizador.current)
    pendiente.current = { ...data, observaciones: texto }
    temporizador.current = setTimeout(() => {
      const aGuardar = pendiente.current
      pendiente.current = null
      if (aGuardar) mutacion.mutate(aGuardar)
    }, 800)
  }

  // Si la lectura falla, el contador mostraría 0 como si no hubiera nada
  // registrado, ocultando el problema. Se expone junto al de guardado.
  return {
    contadores: data,
    cargado,
    ajustar,
    escribirObservaciones,
    guardando: mutacion.isPending,
    error: mutacion.error ?? errorLectura,
  }
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
