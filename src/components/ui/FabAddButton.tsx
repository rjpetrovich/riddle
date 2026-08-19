import { useNavigate } from 'react-router-dom'

export function FabAddButton() {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/comida/nueva')}
      aria-label="Agregar comida"
      className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-3xl leading-none text-white shadow-lg transition-transform active:scale-95"
    >
      +
    </button>
  )
}
