import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function FabAddButton() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="fixed bottom-20 right-4 z-30 flex flex-col items-end gap-2">
      {open && (
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => navigate('/sensacion/nueva')}
            className="rounded-full bg-slate-800 px-4 py-2.5 text-sm font-medium text-white shadow-lg dark:bg-slate-700"
          >
            Cómo me siento
          </button>
          <button
            onClick={() => navigate('/comida/nueva')}
            className="rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg"
          >
            Agregar comida
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Agregar registro"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white shadow-lg active:scale-95"
      >
        {open ? '×' : '+'}
      </button>
    </div>
  )
}
