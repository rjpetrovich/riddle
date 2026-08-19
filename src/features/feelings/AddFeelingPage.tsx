import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { TextArea } from '../../components/ui/TextArea'
import { Chip } from '../../components/ui/Chip'
import { PageHeader } from '../../components/ui/PageHeader'
import { Spinner } from '../../components/ui/Spinner'
import { nowLocalInputValue, formatHora } from '../../lib/dateUtils'
import { VALORACIONES, type Valoracion } from '../../types/domain'
import {
  useActualizarSensacion,
  useComidasRecientes,
  useCrearSensacion,
  useSensacionPorId,
  useSintomas,
} from './useFeelings'
import { useComidaPorId } from '../meals/useMeals'

const toneByValoracion: Record<Valoracion, 'bien' | 'neutro' | 'mal'> = {
  bien: 'bien',
  neutro: 'neutro',
  mal: 'mal',
}

export function AddFeelingPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const esEdicion = !!id
  const { data: sensacionExistente, isLoading: cargandoSensacion } = useSensacionPorId(id)
  const { data: sintomas = [] } = useSintomas()
  const { data: comidasRecientes = [] } = useComidasRecientes()
  const crearSensacion = useCrearSensacion()
  const actualizarSensacion = useActualizarSensacion()

  const [fechaHora, setFechaHora] = useState(nowLocalInputValue())
  // Al entrar desde "¿Cómo te cayó?" en una comida, viene preseleccionada.
  const [comidaId, setComidaId] = useState<string | null>(() => searchParams.get('comida'))
  const [valoracion, setValoracion] = useState<Valoracion>('bien')
  const [sintomaIds, setSintomaIds] = useState<string[]>([])
  const [intensidad, setIntensidad] = useState<number | null>(null)
  const [notas, setNotas] = useState('')

  const { data: comidaAsociada } = useComidaPorId(comidaId ?? undefined)

  useEffect(() => {
    if (!sensacionExistente) return
    setFechaHora(sensacionExistente.fechaHora.slice(0, 16))
    setComidaId(sensacionExistente.comidaId)
    setValoracion(sensacionExistente.valoracion)
    setSintomaIds(sensacionExistente.sintomaIds)
    setIntensidad(sensacionExistente.intensidad)
    setNotas(sensacionExistente.notas ?? '')
  }, [sensacionExistente])

  // La lista de recientes cubre las últimas horas; si la sensación quedó
  // asociada a una comida más vieja (al editar, o al venir desde "¿Cómo te
  // cayó?" de una comida de la mañana), la agregamos para no perder el vínculo.
  //
  // Siempre tiene que existir una opción con el comidaId seleccionado: si no,
  // el <select> cae en la opción vacía y muestra "No, es independiente" cuando
  // en realidad la asociación está puesta y se va a guardar. Además, al estar
  // ya mostrada esa opción, elegirla no dispara onChange y el vínculo no se
  // podría quitar. Mientras la comida carga se usa una etiqueta provisoria.
  const opcionesComida = useMemo(() => {
    if (!comidaId || comidasRecientes.some((c) => c.id === comidaId)) return comidasRecientes
    const asociada = comidaAsociada
      ? { id: comidaAsociada.id, nombre: comidaAsociada.nombre, fecha_hora: comidaAsociada.fechaHora }
      : { id: comidaId, nombre: 'Comida seleccionada', fecha_hora: null }
    return [asociada, ...comidasRecientes]
  }, [comidaId, comidasRecientes, comidaAsociada])

  // Los efectos de una comida (digestión, hinchazón, energía) tardan horas en
  // aparecer. Registrar la sensación al minuto de comer anota cómo estabas
  // antes de que la comida hiciera efecto, y eso ensucia todos los patrones.
  const avisoTemporal = useMemo(() => {
    if (!comidaAsociada) return null
    const horas = (new Date(fechaHora).getTime() - new Date(comidaAsociada.fechaHora).getTime()) / 3_600_000
    if (Number.isNaN(horas)) return null
    if (horas < 0) return 'Esta hora es anterior a la de la comida.'
    if (horas < 1)
      return 'Acabás de comer. Los efectos suelen notarse entre 2 y 6 horas después, así que quizá convenga registrar esto más tarde.'
    const redondeado = Math.round(horas)
    return `Pasaron ${redondeado} ${redondeado === 1 ? 'hora' : 'horas'} desde esta comida.`
  }, [comidaAsociada, fechaHora])

  function toggleSintoma(sid: string) {
    setSintomaIds((prev) => (prev.includes(sid) ? prev.filter((s) => s !== sid) : [...prev, sid]))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const input = {
      fechaHora: new Date(fechaHora).toISOString(),
      comidaId,
      valoracion,
      intensidad: valoracion === 'mal' ? intensidad : null,
      notas,
      sintomaIds,
    }
    try {
      if (esEdicion && id) {
        await actualizarSensacion.mutateAsync({ id, input })
      } else {
        await crearSensacion.mutateAsync(input)
      }
      navigate('/')
    } catch {
      // el error ya queda expuesto vía crearSensacion.error / actualizarSensacion.error
    }
  }

  if (esEdicion && cargandoSensacion) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </div>
    )
  }

  const guardando = crearSensacion.isPending || actualizarSensacion.isPending

  return (
    <div className="pb-24">
      <PageHeader title={esEdicion ? 'Editar sensación' : '¿Cómo te sentís?'} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Valoración general
          </label>
          <div className="flex gap-2">
            {VALORACIONES.map((v) => (
              <Chip
                key={v.value}
                label={v.label}
                tone={toneByValoracion[v.value]}
                selected={valoracion === v.value}
                onClick={() => setValoracion(v.value)}
              />
            ))}
          </div>
        </div>

        <Input
          label="Hora"
          type="datetime-local"
          value={fechaHora}
          onChange={(e) => setFechaHora(e.target.value)}
          required
        />

        {avisoTemporal && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
            {avisoTemporal}
          </p>
        )}

        {opcionesComida.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              ¿Asociado a alguna comida reciente?
            </label>
            <select
              value={comidaId ?? ''}
              onChange={(e) => setComidaId(e.target.value || null)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">No, es independiente</option>
              {opcionesComida.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fecha_hora ? `${formatHora(c.fecha_hora)} · ${c.nombre}` : c.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {sintomas.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Síntomas (opcional)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {sintomas.map((s) => (
                <Chip
                  key={s.id}
                  label={s.nombre}
                  selected={sintomaIds.includes(s.id)}
                  onClick={() => toggleSintoma(s.id)}
                />
              ))}
            </div>
          </div>
        )}

        {valoracion === 'mal' && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Intensidad del malestar (opcional)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setIntensidad(intensidad === n ? null : n)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm ${
                    intensidad === n
                      ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                      : 'border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        <TextArea
          label="Notas (opcional)"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
        />

        {(crearSensacion.error || actualizarSensacion.error) && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
            {(crearSensacion.error ?? actualizarSensacion.error)?.message ??
              'No se pudo guardar. Probá de nuevo.'}
          </p>
        )}

        <div className="mt-2 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </div>
  )
}
