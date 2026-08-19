import { forwardRef, useImperativeHandle, useState, type KeyboardEvent } from 'react'
import { useFoodAutocomplete } from './useFoodAutocomplete'

export interface IngredientesInputHandle {
  /**
   * Devuelve la lista final incluyendo lo que el usuario dejó escrito sin
   * confirmar con Enter, y sincroniza ese texto pendiente al estado del form.
   * El submit debe usar el valor retornado: el setState de acá no llega a
   * verse en el mismo tick.
   */
  flush: () => string[]
}

interface Props {
  value: string[]
  onChange: (value: string[]) => void
}

function normalizar(nombre: string) {
  return nombre.trim().replace(/\s+/g, ' ')
}

export const IngredientesInput = forwardRef<IngredientesInputHandle, Props>(
  function IngredientesInput({ value, onChange }, ref) {
    const [texto, setTexto] = useState('')
    const sugerencias = useFoodAutocomplete(texto).filter((s) => !value.includes(s.nombre))

    function conPendiente(): string[] {
      const limpio = normalizar(texto)
      if (!limpio) return value
      if (value.some((v) => v.toLowerCase() === limpio.toLowerCase())) return value
      return [...value, limpio]
    }

    useImperativeHandle(ref, () => ({
      flush() {
        const completos = conPendiente()
        if (completos !== value) {
          onChange(completos)
          setTexto('')
        }
        return completos
      },
    }))

    function agregar(nombre: string) {
      const limpio = normalizar(nombre)
      if (!limpio) return
      if (value.some((v) => v.toLowerCase() === limpio.toLowerCase())) {
        setTexto('')
        return
      }
      onChange([...value, limpio])
      setTexto('')
    }

    function quitar(nombre: string) {
      onChange(value.filter((v) => v !== nombre))
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        agregar(texto)
      } else if (e.key === 'Backspace' && texto === '' && value.length > 0) {
        quitar(value[value.length - 1])
      }
    }

    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Ingredientes
        </label>
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
          {value.map((nombre) => (
            <span
              key={nombre}
              className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"
            >
              {nombre}
              <button
                type="button"
                onClick={() => quitar(nombre)}
                aria-label={`Quitar ${nombre}`}
                className="text-emerald-600 dark:text-emerald-400"
              >
                ×
              </button>
            </span>
          ))}
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            // Ojo: no confirmar el texto en onBlur. Al tocar "Guardar", el blur
            // agregaba el chip y el alto del contenedor crecía, corriendo el
            // botón ~34px justo entre el touchstart y el touchend: el toque
            // caía al vacío y el formulario no se enviaba. Lo pendiente lo
            // recoge flush() en el submit, sin mover nada de lugar.
            placeholder={value.length === 0 ? 'ej: pollo, palta, tomate' : 'agregar otro...'}
            className="min-w-[120px] flex-1 bg-transparent p-1 text-sm outline-none dark:text-slate-100"
          />
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Separalos con coma o Enter. Son los que la app usa para encontrar patrones.
        </p>
        {sugerencias.length > 0 && texto && (
          <div className="flex flex-wrap gap-1.5">
            {sugerencias.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => agregar(s.nombre)}
                className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                + {s.nombre}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  },
)
