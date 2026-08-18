import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

const toneByValoracion: Record<Valoracion, 'bien' | 'neutro' | 'mal'> = {
  bien: 'bien',
  neutro: 'neutro',
  mal: 'mal',
}

export function AddFeelingPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const esEdicion = !!id
  const { data: sensacionExistente, isLoading: cargandoSensacion } = useSensacionPorId(id)
  const { data: sintomas = [] } = useSintomas()
  const { data: comidasRecientes = [] } = useComidasRecientes()
  const crearSensacion = useCrearSensacion()
  const actualizarSensacion = useActualizarSensacion()

  const [fechaHora, setFechaHora] = useState(nowLocalInputValue())
  const [comidaId, setComidaId] = useState<string | null>(null)
  const [valoracion, setValoracion] = useState<Valoracion>('bien')
  const [sintomaIds, setSintomaIds] = useState<string[]>([])
  const [intensidad, setIntensidad] = useState<number | null>(null)
  const [notas, setNotas] = useState('')

  useEffect(() => {
    if (!sensacionExistente) return
    setFechaHora(sensacionExistente.fechaHora.slice(0, 16))
    setComidaId(sensacionExistente.comidaId)
    setValoracion(sensacionExistente.valoracion)
    setSintomaIds(sensacionExistente.sintomaIds)
    setIntensidad(sensacionExistente.intensidad)
    setNotas(sensacionExistente.notas ?? '')
  }, [sensacionExistente])

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
    if (esEdicion && id) {
      await actualizarSensacion.mutateAsync({ id, input })
    } else {
      await crearSensacion.mutateAsync(input)
    }
    navigate('/')
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

        {comidasRecientes.length > 0 && (
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
              {comidasRecientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {formatHora(c.fecha_hora)} · {c.nombre}
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
