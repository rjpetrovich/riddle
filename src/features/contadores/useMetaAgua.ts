import { useEffect, useState } from 'react'

const CLAVE = 'comomecae:meta-agua'
export const META_AGUA_POR_DEFECTO = 8

/**
 * La meta diaria de vasos vive en el dispositivo, no en la base.
 *
 * Es una preferencia, no un dato de salud: guardarla en el servidor pediría
 * otra migración a mano por algo que no se consulta ni se analiza. La contra es
 * que no se sincroniza entre dispositivos, aceptable para un número que se
 * elige una vez.
 */
export function useMetaAgua() {
  const [meta, setMeta] = useState<number>(() => {
    const guardado = Number(localStorage.getItem(CLAVE))
    return Number.isFinite(guardado) && guardado > 0 ? guardado : META_AGUA_POR_DEFECTO
  })

  useEffect(() => {
    localStorage.setItem(CLAVE, String(meta))
  }, [meta])

  return { meta, setMeta }
}
