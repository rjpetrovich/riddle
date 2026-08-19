import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { TextArea } from '../../components/ui/TextArea'
import { PageHeader } from '../../components/ui/PageHeader'
import { Spinner } from '../../components/ui/Spinner'
import { nowLocalInputValue } from '../../lib/dateUtils'
import { TIPOS_COMIDA, type TipoComida } from '../../types/domain'
import { IngredientesInput, type IngredientesInputHandle } from './IngredientesInput'
import { useActualizarComida, useComidaPorId, useCrearComida } from './useMeals'

export function AddMealPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const esEdicion = !!id
  const { data: comidaExistente, isLoading: cargandoComida } = useComidaPorId(id)
  const crearComida = useCrearComida()
  const actualizarComida = useActualizarComida()

  const [nombre, setNombre] = useState('')
  const [fechaHora, setFechaHora] = useState(nowLocalInputValue())
  const [tipoComida, setTipoComida] = useState<TipoComida>('almuerzo')
  const [ingredientes, setIngredientes] = useState<string[]>([])
  const [notas, setNotas] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
  const ingredientesRef = useRef<IngredientesInputHandle>(null)

  useEffect(() => {
    if (!comidaExistente) return
    setNombre(comidaExistente.nombre)
    setFechaHora(comidaExistente.fechaHora.slice(0, 16))
    setTipoComida(comidaExistente.tipoComida)
    setIngredientes(comidaExistente.alimentos.map((a) => a.nombre))
    setNotas(comidaExistente.notas ?? '')
  }, [comidaExistente])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // Toma también el ingrediente que quedó escrito sin confirmar con Enter.
    const ingredientesFinal = ingredientesRef.current?.flush() ?? ingredientes
    try {
      if (esEdicion && id) {
        await actualizarComida.mutateAsync({
          id,
          input: {
            nombre,
            fechaHora: new Date(fechaHora).toISOString(),
            tipoComida,
            ingredientes: ingredientesFinal,
            notas,
            foto,
          },
        })
      } else {
        await crearComida.mutateAsync({
          nombre,
          fechaHora: new Date(fechaHora).toISOString(),
          tipoComida,
          ingredientes: ingredientesFinal,
          notas,
          foto,
        })
      }
      navigate('/')
    } catch {
      // el error ya queda expuesto vía crearComida.error / actualizarComida.error
    }
  }

  if (esEdicion && cargandoComida) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </div>
    )
  }

  const guardando = crearComida.isPending || actualizarComida.isPending

  return (
    <div className="pb-24">
      <PageHeader title={esEdicion ? 'Editar comida' : 'Agregar comida'} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4">
        <Input
          label="¿Qué comiste?"
          placeholder="ej: ensalada con pollo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          autoFocus
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Hora"
            type="datetime-local"
            value={fechaHora}
            onChange={(e) => setFechaHora(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo</label>
            <select
              value={tipoComida}
              onChange={(e) => setTipoComida(e.target.value as TipoComida)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {TIPOS_COMIDA.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <IngredientesInput ref={ingredientesRef} value={ingredientes} onChange={setIngredientes} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {esEdicion ? 'Cambiar foto (opcional)' : 'Foto (opcional)'}
          </label>
          {esEdicion && comidaExistente?.fotoUrl && !foto && (
            <img
              src={comidaExistente.fotoUrl}
              alt="Foto actual"
              className="mb-1 h-20 w-20 rounded-xl object-cover"
            />
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
            className="text-sm text-slate-600 dark:text-slate-400"
          />
        </div>

        <TextArea
          label="Notas (opcional)"
          placeholder="algo que quieras recordar..."
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
        />

        {(crearComida.error || actualizarComida.error) && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
            {(crearComida.error ?? actualizarComida.error)?.message ??
              'No se pudo guardar. Probá de nuevo.'}
          </p>
        )}

        <div className="mt-2 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={guardando || !nombre}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </div>
  )
}
