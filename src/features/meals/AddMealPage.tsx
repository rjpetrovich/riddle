import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { TextArea } from '../../components/ui/TextArea'
import { PageHeader } from '../../components/ui/PageHeader'
import { Spinner } from '../../components/ui/Spinner'
import { nowLocalInputValue } from '../../lib/dateUtils'
import { TIPOS_COMIDA, type TipoComida } from '../../types/domain'
import { IngredientesInput } from './IngredientesInput'
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
    if (esEdicion && id) {
      await actualizarComida.mutateAsync({
        id,
        input: { nombre, fechaHora: new Date(fechaHora).toISOString(), tipoComida, ingredientes, notas },
      })
    } else {
      await crearComida.mutateAsync({
        nombre,
        fechaHora: new Date(fechaHora).toISOString(),
        tipoComida,
        ingredientes,
        notas,
        foto,
      })
    }
    navigate('/')
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

        <IngredientesInput value={ingredientes} onChange={setIngredientes} />

        {!esEdicion && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Foto (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
              className="text-sm text-slate-600 dark:text-slate-400"
            />
          </div>
        )}

        <TextArea
          label="Notas (opcional)"
          placeholder="algo que quieras recordar..."
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
        />

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
