import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthProvider'
import { fetchComidasSinSensacion, type ComidaPendiente } from './remindersApi'

/**
 * Recién comido no hay nada que reportar: los efectos digestivos aparecen más
 * tarde. Se espera este mínimo antes de pedir el registro, para no convertir el
 * recordatorio en una molestia que se aprende a ignorar.
 */
export const HORAS_MINIMAS_PARA_RECORDAR = 2
const VENTANA_HORAS = 12

export function useComidasPendientes() {
  const { user } = useAuth()
  const query = useQuery({
    queryKey: ['comidas-pendientes', user?.id],
    queryFn: () => fetchComidasSinSensacion(user!.id, VENTANA_HORAS),
    enabled: !!user,
    // Al volver a la app queremos el estado fresco: es el momento en que el
    // recordatorio tiene sentido.
    refetchOnWindowFocus: true,
    staleTime: 60_000,
  })

  const ahora = Date.now()
  const pendientes = (query.data ?? []).filter((c) => horasDesde(c, ahora) >= HORAS_MINIMAS_PARA_RECORDAR)

  return { pendientes, isLoading: query.isLoading }
}

export function horasDesde(comida: ComidaPendiente, ahora = Date.now()) {
  return (ahora - new Date(comida.fechaHora).getTime()) / (1000 * 60 * 60)
}
