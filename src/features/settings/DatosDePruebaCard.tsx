import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../auth/AuthProvider'
import { invalidarDatosDeRegistro } from '../../lib/invalidar'
import { mensajeDeError } from '../../lib/mensajeDeError'
import { borrarDatosDePrueba, contarDatosDePrueba, sembrarDatosDePrueba } from './datosDePrueba'

/**
 * Cargar dos semanas de ejemplo con un toque.
 *
 * Existe porque la app recién se entiende cuando Patrones tiene algo que
 * mostrar, y llegar ahí a mano son ~40 comidas. Todo lo que crea queda marcado
 * y se borra desde el mismo lugar, así probar no ensucia el historial real.
 */
export function DatosDePruebaCard() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false)

  const { data: cantidad = 0 } = useQuery({
    queryKey: ['datos-prueba', user?.id],
    queryFn: () => contarDatosDePrueba(user!.id),
    enabled: !!user,
  })

  function alTerminar() {
    queryClient.invalidateQueries({ queryKey: ['datos-prueba'] })
    invalidarDatosDeRegistro(queryClient)
  }

  const sembrar = useMutation({
    mutationFn: () => sembrarDatosDePrueba(user!.id),
    onSuccess: alTerminar,
  })

  const borrar = useMutation({
    mutationFn: () => borrarDatosDePrueba(user!.id),
    onSuccess: () => {
      setConfirmandoBorrado(false)
      alTerminar()
    },
  })

  const trabajando = sembrar.isPending || borrar.isPending
  const error = sembrar.error ?? borrar.error

  return (
    <Card>
      <h2 className="mb-1 font-medium text-slate-900 dark:text-slate-100">Datos de ejemplo</h2>
      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
        {cantidad > 0
          ? `Tenés ${cantidad} comidas de ejemplo cargadas. Aparecen marcadas con "${'['}prueba]" en las notas.`
          : 'Carga dos semanas de comidas ficticias para ver cómo se comporta Patrones sin esperar a juntar registros. Se pueden borrar cuando quieras.'}
      </p>

      {cantidad === 0 ? (
        <Button variant="secondary" onClick={() => sembrar.mutate()} disabled={trabajando}>
          {sembrar.isPending ? 'Cargando...' : 'Cargar 2 semanas de ejemplo'}
        </Button>
      ) : confirmandoBorrado ? (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setConfirmandoBorrado(false)}
            disabled={trabajando}
          >
            Cancelar
          </Button>
          <Button className="flex-1" onClick={() => borrar.mutate()} disabled={trabajando}>
            {borrar.isPending ? 'Borrando...' : 'Sí, borrar'}
          </Button>
        </div>
      ) : (
        <Button
          variant="secondary"
          onClick={() => setConfirmandoBorrado(true)}
          disabled={trabajando}
        >
          Borrar los datos de ejemplo
        </Button>
      )}

      {confirmandoBorrado && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Solo se borra lo marcado como ejemplo. Tus registros reales quedan intactos.
        </p>
      )}

      {error && (
        <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          {mensajeDeError(error)}
        </p>
      )}
    </Card>
  )
}
