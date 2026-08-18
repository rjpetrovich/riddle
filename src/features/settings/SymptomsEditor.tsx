import { useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthProvider'
import { useSintomas } from '../feelings/useFeelings'
import { actualizarSintoma, crearSintoma, eliminarSintoma } from '../feelings/feelingsApi'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export function SymptomsEditor() {
  const { user } = useAuth()
  const { data: sintomas = [] } = useSintomas()
  const queryClient = useQueryClient()
  const [nuevoNombre, setNuevoNombre] = useState('')

  function refrescar() {
    queryClient.invalidateQueries({ queryKey: ['sintomas'] })
  }

  async function handleAgregar(e: FormEvent) {
    e.preventDefault()
    if (!nuevoNombre.trim() || !user) return
    await crearSintoma(user.id, nuevoNombre.trim(), 'sintoma')
    setNuevoNombre('')
    refrescar()
  }

  async function handleEliminar(id: string) {
    await eliminarSintoma(id)
    refrescar()
  }

  async function handleToggleActivo(id: string, activo: boolean) {
    await actualizarSintoma(id, { activo: !activo })
    refrescar()
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-1.5">
        {sintomas.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-800"
          >
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={s.activo}
                onChange={() => handleToggleActivo(s.id, s.activo)}
              />
              <span className={s.activo ? '' : 'text-slate-400 line-through'}>{s.nombre}</span>
            </label>
            <button
              onClick={() => handleEliminar(s.id)}
              className="text-xs text-slate-400 hover:text-red-500"
              aria-label={`Eliminar ${s.nombre}`}
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAgregar} className="flex gap-2">
        <Input
          placeholder="Agregar síntoma o sensación..."
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="secondary">
          Agregar
        </Button>
      </form>
    </div>
  )
}
