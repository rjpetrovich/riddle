import { claveDiaLocal } from '../../lib/dateUtils'
import type { Valoracion } from '../../types/domain'

export interface ResumenDia {
  comidas: number
  /** La peor valoración del día, o null si no se registró ninguna. */
  valoracion: Valoracion | null
}

export interface RegistroDia {
  fechaHora: string
}

export interface SensacionDia {
  fechaHora: string
  valoracion: Valoracion
}

const PRIORIDAD: Record<Valoracion, number> = { mal: 2, neutro: 1, bien: 0 }

/**
 * Los días de la grilla del mes, empezando en lunes y completando con los días
 * vecinos hasta cerrar semanas enteras, para que la grilla no quede con huecos.
 */
export function construirGrillaMes(mes: Date): Date[] {
  const primero = new Date(mes.getFullYear(), mes.getMonth(), 1)
  // getDay() da 0 para domingo; se corre para que la semana arranque el lunes.
  const desplazamiento = (primero.getDay() + 6) % 7
  const inicio = new Date(primero)
  inicio.setDate(primero.getDate() - desplazamiento)

  const dias: Date[] = []
  // 6 semanas cubren cualquier mes, incluido el peor caso de 31 días que
  // empieza domingo.
  for (let i = 0; i < 42; i++) {
    const d = new Date(inicio)
    d.setDate(inicio.getDate() + i)
    dias.push(d)
  }

  // Se recortan las semanas finales que no tocan el mes, para no dejar una
  // fila entera del mes siguiente.
  while (dias.length > 28) {
    const ultimaSemana = dias.slice(-7)
    if (ultimaSemana.some((d) => d.getMonth() === mes.getMonth())) break
    dias.splice(-7)
  }

  return dias
}

/**
 * Resume cada día: cuántas comidas tuvo y cómo cayó.
 *
 * Se queda con la peor valoración del día por el mismo motivo que en la
 * detección de patrones: un buen momento posterior no borra que algo cayó mal.
 */
export function resumirPorDia(
  comidas: RegistroDia[],
  sensaciones: SensacionDia[],
): Map<string, ResumenDia> {
  const resumen = new Map<string, ResumenDia>()

  const asegurar = (clave: string) => {
    if (!resumen.has(clave)) resumen.set(clave, { comidas: 0, valoracion: null })
    return resumen.get(clave)!
  }

  for (const c of comidas) {
    asegurar(claveDiaLocal(c.fechaHora)).comidas += 1
  }

  for (const s of sensaciones) {
    const dia = asegurar(claveDiaLocal(s.fechaHora))
    if (!dia.valoracion || PRIORIDAD[s.valoracion] > PRIORIDAD[dia.valoracion]) {
      dia.valoracion = s.valoracion
    }
  }

  return resumen
}

export function mismoDia(a: Date, b: Date): boolean {
  return claveDiaLocal(a) === claveDiaLocal(b)
}

export function rangoDelMes(mes: Date): { desde: string; hasta: string } {
  const dias = construirGrillaMes(mes)
  const desde = new Date(dias[0])
  desde.setHours(0, 0, 0, 0)
  const hasta = new Date(dias[dias.length - 1])
  hasta.setHours(23, 59, 59, 999)
  return { desde: desde.toISOString(), hasta: hasta.toISOString() }
}
