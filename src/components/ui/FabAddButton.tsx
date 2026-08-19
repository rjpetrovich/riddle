import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Se esconde al bajar y reaparece al subir.
 *
 * Al estar fijo sobre el contenido, tapaba controles que quedaran a su misma
 * altura: los +/− de los contadores y los íconos de editar y borrar de cada
 * tarjeta, que también van pegados al borde derecho. Ocultarlo mientras se
 * recorre la lista libera esa zona sin sacar el acceso rápido a agregar.
 */
export function FabAddButton() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(true)
  const ultimoScroll = useRef(0)

  useEffect(() => {
    function alScrollear() {
      const y = window.scrollY
      const bajando = y > ultimoScroll.current
      // El umbral evita que tiemble con micro-movimientos del dedo.
      if (Math.abs(y - ultimoScroll.current) > 8) {
        setVisible(!bajando || y < 80)
        ultimoScroll.current = y
      }
    }
    window.addEventListener('scroll', alScrollear, { passive: true })
    return () => window.removeEventListener('scroll', alScrollear)
  }, [])

  return (
    <button
      onClick={() => navigate('/comida/nueva')}
      aria-label="Agregar comida"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-3xl leading-none text-white shadow-lg transition-all duration-200 active:scale-95 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-24 opacity-0'
      }`}
    >
      +
    </button>
  )
}
